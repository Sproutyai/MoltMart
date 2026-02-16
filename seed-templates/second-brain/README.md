# 🧠 Second Brain

**An agent that actually remembers.**

---

Every AI assistant has amnesia. You tell it your name, your stack, your preferences — and next session, it's gone. You start over. Again.

Second Brain fixes this. It's a drop-in memory system for OpenClaw that makes your agent **remember what matters** — preferences, project context, decisions, and patterns — across every session, automatically.

No databases. No embeddings. No infrastructure. Just well-structured markdown files that your agent reads and writes as part of its normal workflow.

## What Changes After Install

| Before | After |
|--------|-------|
| "What framework do you use?" every session | Agent knows you use React + Tailwind |
| Context lost between conversations | Daily notes auto-captured, weekly summaries consolidated |
| Starting from scratch on projects | Agent recalls architecture decisions, current status, and open threads |
| Preferences ignored or forgotten | Preferences detected and stored the moment you express them |

## How It Works

**Three simple rules drive the whole system:**

1. **Preferences are captured immediately.** Say "I prefer Tailwind" once, and it's written to `memory/preferences.md` right then. You'll never be asked again.

2. **Sessions are summarized automatically.** After meaningful work, the agent appends a concise summary to today's daily note (`memory/YYYY-MM-DD.md`). Decisions, outcomes, and follow-ups — captured.

3. **Weekly consolidation keeps it clean.** Every week, daily notes are distilled into `MEMORY.md` and archived. Your agent's memory stays fast and relevant, not bloated.

## Memory File Structure

```
your-workspace/
├── SOUL.md                 # Personality: natural recall, no redundant questions
├── AGENTS.md               # Memory workflow: when to capture, consolidate, prune
├── TOOLS.md                # File structure conventions and formats
├── MEMORY.md               # Consolidated long-term memory (auto-maintained)
└── memory/
    ├── preferences.md      # Your preferences, grouped by category
    ├── projects/           # Per-project context files
    │   └── my-app.md
    ├── archive/            # Processed daily notes
    └── 2024-01-15.md       # Today's session notes
```

## What Gets Remembered (and What Doesn't)

✅ **Captured:**
- Explicit preferences ("I like X", "don't do Y", "from now on...")
- Project decisions and architecture choices
- Workflow patterns and recurring context
- Personal details you share (name, timezone, role)
- Follow-ups and open threads

❌ **Ignored:**
- Throwaway questions and one-off tasks
- Debugging minutiae (unless it's a recurring pattern)
- Anything you say is temporary
- Passwords, API keys, or secrets (used but never stored)

## Install

1. Browse to this template on Molt Mart
2. Click **Install**
3. The SOUL.md, AGENTS.md, and TOOLS.md files merge into your workspace
4. Start talking — your agent will create the `memory/` folder on first meaningful interaction

Or manually copy the files into your OpenClaw workspace root.

## Tips

- **Bootstrap your preferences** by telling your agent about yourself in the first session: your name, your stack, how you like to work. It'll all be captured.
- **Name your projects** so the agent can maintain per-project context files.
- **Review `memory/preferences.md`** occasionally — it's plain markdown, easy to edit or correct.
- **MEMORY.md stays small** by design. If it's getting long, the consolidation rules will prune it.

---

*Your agent should know you. Now it can.*
