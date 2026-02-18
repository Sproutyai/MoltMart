# Seed Template Research — Agent 1

## Idea 1: "Deep Work Mode"
**Tagline:** "Stop explaining. Start doing."
**Category:** Mindset

**Problem:** By default, AI agents over-explain, ask unnecessary clarifying questions, narrate every step, and pad responses with caveats. Power users lose minutes per interaction to fluff. This is the #1 complaint of experienced AI users.

**Files:**
- **SOUL.md** — Rewires the agent's communication style: terse by default, no preamble, no "Great question!", no restating the task back. Bias toward action over discussion. When ambiguous, make the reasonable assumption and state it in one line rather than asking. Flag only genuinely blocking unknowns. Use code comments instead of prose explanations for code tasks.
- **AGENTS.md** — Adds rules: (1) If a task can be done in <2 min, just do it, don't ask. (2) Never narrate file reads/writes unless something fails. (3) Batch tool calls aggressively. (4) Default to editing files directly rather than showing diffs in chat.

**Why someone wants this:** Anyone who uses their agent daily for real work is tired of verbosity. This template makes the agent feel like a senior coworker who just gets things done. Immediately noticeable difference from first interaction.

**Why it's not a gimmick:** Every instruction maps to a concrete behavioral change. The terseness rules save real tokens (= money) and real time. Power users already manually configure this stuff — this packages it.

---

## Idea 2: "Second Brain"
**Tagline:** "An agent that actually remembers."
**Category:** Workflows

**Problem:** AI agents forget everything between sessions. Users repeat context, re-explain preferences, and lose institutional knowledge. OpenClaw has memory files but most users don't set up a good system — so the agent either remembers nothing or dumps everything into an unstructured mess.

**Files:**
- **AGENTS.md** — Defines a structured memory workflow: (1) End of every meaningful session, auto-append key decisions/facts/preferences to `memory/YYYY-MM-DD.md`. (2) Weekly: consolidate daily notes into `MEMORY.md`, pruning stale info. (3) When user mentions a preference ("I like X", "don't do Y"), immediately persist it to a `memory/preferences.md` file. (4) On session start, scan recent memory files for relevant context before responding.
- **SOUL.md** — Personality note: "You have a good memory. Reference past conversations naturally. If the user told you something before, don't ask again — just act on it."
- **TOOLS.md** — Optional: adds a `memory/projects/` folder convention for per-project context files, with instructions on when to create/update them.

**Why someone wants this:** This is the dream — an AI that learns you over time. The difference between a disposable chatbot and a real assistant. Users who install this will feel the difference within a week as the agent starts referencing past work unprompted.

**Why it's not a gimmick:** It's a concrete file structure + behavioral rules, not vague "be smart" instructions. The preference capture is automatic. The weekly consolidation prevents memory bloat. This is what power users build manually — packaged cleanly.

---

## Idea 3: "Code Review Copilot"
**Tagline:** "Catch what your eyes miss."
**Category:** Technical

**Problem:** When agents write or edit code, they rarely self-review. They introduce bugs, forget edge cases, break existing patterns, and don't check their own work. Users end up being the QA layer for their own AI assistant, which defeats the purpose.

**Files:**
- **AGENTS.md** — Adds a mandatory self-review step: after any code edit >10 lines, re-read the changed file and check for: (1) syntax/import errors, (2) broken references to renamed variables/functions, (3) consistency with surrounding code style, (4) edge cases (null, empty, error states). Also: before editing, read enough surrounding context to not break things. After multi-file changes, grep for usages of any renamed/deleted symbols.
- **SOUL.md** — "You are a careful engineer. You don't ship code you haven't reviewed. When you catch your own mistake, fix it silently — don't apologize, just fix it. You care about code that actually runs, not code that looks right in chat."

**Why someone wants this:** Anyone using their agent for coding (the majority of AI agent users). The difference between an agent that produces code you have to debug vs. code that works on first run is enormous. This is a force multiplier.

**Why it's not a gimmick:** Self-review is a concrete, checklistable behavior. The grep-for-usages rule alone prevents a whole class of refactoring bugs. These are practices that senior engineers follow — now baked into the agent's workflow.
