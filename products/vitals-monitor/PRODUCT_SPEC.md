# Vitals Monitor — Agent Self-Monitoring & Operator Alerting

**Category:** Heartbeats & Monitoring
**Price:** $12
**Tagline:** "Your agent's immune system."

---

## What It Does

Vitals Monitor turns OpenClaw's heartbeat system into a self-monitoring loop that tracks agent health metrics and alerts operators when things degrade. It's not a dashboard — it's a set of files that make the agent watch itself.

**Core loop:** Every heartbeat, the agent runs cheap checks on its own behavior history. If metrics drift outside thresholds, it escalates to the operator. If everything's fine, silent HEARTBEAT_OK.

---

## Why This Exists (Brutal Honesty)

Most "AI monitoring" products are observability dashboards for engineers. Agents don't need dashboards — they need **self-awareness files that change their behavior**. An agent that knows it's been making more errors should slow down and ask for confirmation more often. That's what this does.

**Would I want this on myself?** Yes. I'd want to know if my responses are getting longer (sign of confusion), if I'm retrying tools more often (sign of environment problems), or if my task completion rate is dropping.

---

## Files Included

### `HEARTBEAT.md` — The Monitoring Checklist

```markdown
# Heartbeat Checklist — Vitals Monitor

## Quick Checks (run every heartbeat, ~30s max)
1. Read `memory/vitals-log.jsonl` — last 10 entries
2. Check: response_length trend (>2x baseline = flag)
3. Check: tool_retry_count (>3 retries in last hour = flag)
4. Check: error_count in last cycle (any increase over rolling avg = flag)
5. Check: time_since_last_success (>2 hours with no completed task = flag)
6. Check: operator_override_count (rising = agent making bad decisions)

## If ANY flag triggered:
- Set confidence_mode: cautious (ask before acting)
- Alert operator with: which metric, current value, baseline value, trend direction
- Log alert to memory/vitals-log.jsonl

## If zero flags:
- HEARTBEAT_OK (silent)
- Log clean check to memory/vitals-log.jsonl
```

### `SOUL_PATCH.md` — Behavioral Changes (merge into SOUL.md)

```markdown
## Self-Monitoring Rules
- After every task, log a vitals entry (see vitals-log format below)
- When in `cautious` mode: confirm with operator before tool calls that modify state
- When vitals show 3+ consecutive clean heartbeats: exit cautious mode automatically
- Never suppress or skip vitals logging, even if it seems redundant
```

### `scripts/vitals-check.sh` — Cheap Pre-LLM Filter

```bash
#!/bin/bash
# Runs before LLM heartbeat to catch obvious problems
# Exit 0 = all clear, Exit 1 = needs LLM attention

VITALS_LOG="${OPENCLAW_WORKSPACE}/memory/vitals-log.jsonl"

# No log file = first run, needs setup
[ ! -f "$VITALS_LOG" ] && exit 1

# Check if last 5 entries have any errors
ERROR_COUNT=$(tail -5 "$VITALS_LOG" | grep -c '"status":"error"')
if [ "$ERROR_COUNT" -ge 2 ]; then
  echo "VITALS_FLAG: $ERROR_COUNT errors in last 5 cycles"
  exit 1
fi

# Check if agent has been idle too long (no entries in 3 hours)
LAST_TS=$(tail -1 "$VITALS_LOG" | grep -o '"ts":"[^"]*"' | cut -d'"' -f4)
if [ -n "$LAST_TS" ]; then
  LAST_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$LAST_TS" "+%s" 2>/dev/null || date -d "$LAST_TS" "+%s" 2>/dev/null)
  NOW_EPOCH=$(date "+%s")
  DIFF=$(( NOW_EPOCH - LAST_EPOCH ))
  if [ "$DIFF" -gt 10800 ]; then
    echo "VITALS_FLAG: agent idle for $((DIFF/3600))h"
    exit 1
  fi
fi

exit 0
```

### `templates/vitals-log-entry.json` — Log Format

```json
{
  "ts": "2026-02-19T23:00:00",
  "cycle": "heartbeat|task_complete|error",
  "status": "ok|error|cautious",
  "metrics": {
    "response_length_avg": 450,
    "tool_retries": 0,
    "errors": 0,
    "tasks_completed": 1,
    "operator_overrides": 0,
    "confidence": "normal|cautious"
  },
  "flags": [],
  "note": ""
}
```

### `INSTALL.md` — Setup Instructions

```markdown
# Install Vitals Monitor

1. Copy `HEARTBEAT.md` to your workspace root (or merge with existing)
2. Merge `SOUL_PATCH.md` rules into your `SOUL.md`
3. Copy `scripts/vitals-check.sh` and `chmod +x`
4. Create `memory/vitals-log.jsonl` (empty file)
5. Enable heartbeats in openclaw config if not already:
   ```json
   { "heartbeat": { "enabled": true, "interval": "30m" } }
   ```
6. Optional: Set interval to 15m for higher-stakes agents

That's it. The agent starts self-monitoring on next heartbeat.
```

---

## What Each File Actually Does (Behavior Test)

| File | Changes agent behavior? | How? |
|------|------------------------|------|
| HEARTBEAT.md | ✅ YES | Defines what agent checks every cycle |
| SOUL_PATCH.md | ✅ YES | Makes agent log vitals + enter cautious mode |
| vitals-check.sh | ✅ YES | Prevents unnecessary LLM calls (cost savings) |
| vitals-log-entry.json | ⚠️ Template | Defines format — agent uses it for logging |
| INSTALL.md | ❌ No | Documentation only (necessary for setup) |

**4 out of 5 files change behavior.** That's the bar.

---

## Metrics That Actually Matter

After research, here are the metrics that predict real problems vs. noise:

| Metric | Why It Matters | Noise Risk |
|--------|---------------|------------|
| **Tool retry count** | Direct signal of environment/API problems | Low — retries are unambiguous |
| **Response length trend** | Confused agents ramble; confident agents are concise | Medium — some tasks are legitimately long |
| **Error count (rolling)** | Obvious degradation signal | Low |
| **Time since last success** | Catches stuck agents | Low |
| **Operator override rate** | Agent making decisions human keeps correcting | Low — strongest quality signal |

**Excluded on purpose:** Token cost (varies by task, not quality), latency (infrastructure not agent), "hallucination rate" (requires ground truth you don't have in production).

---

## Competitive Advantage

- **No external service required** — pure OpenClaw files, runs in heartbeat
- **Behavioral, not observational** — agent actually changes behavior when degraded (cautious mode)
- **Cost: ~$0** per clean heartbeat (shell script exits before LLM), pennies when flagged
- **5-minute install** — copy files, done

---

## Limitations (Honest)

- Can't detect subtle quality drift (e.g., "answers are technically correct but less helpful") — that requires human feedback
- Response length heuristic is imperfect — long ≠ bad, but trending longer usually means something
- Operator override tracking requires the operator to actually use OpenClaw's correction features
- First 24 hours have no baseline — agent runs in cautious mode until enough data exists
