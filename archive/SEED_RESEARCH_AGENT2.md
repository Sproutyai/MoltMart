# Seed Research — Agent 2

## Idea 1: "Drift Detector"
**Tagline:** "Your agent notices when YOUR habits change before you do."
**Category:** Mindset

**Problem:** People use their AI agent daily but don't realize when their patterns shift — suddenly asking more stressed questions, working later, dropping projects silently. Nobody's watching the watcher's input patterns.

**Files:**
- `SOUL.md` — Personality layer: observant but non-judgmental. Never preachy. Frames observations as curiosity, not advice. "Hey, you haven't mentioned Project X in 12 days — still on the backburner or should I stop tracking it?"
- `AGENTS.md` — Weekly cron job reads recent `memory/` files, builds a simple pattern digest (topics, tone indicators, time-of-day patterns, dropped threads). Writes a `drift-report.md` weekly. Surfaces notable shifts conversationally only when relevant, not as a scheduled dump.
- `skills/drift-analysis.md` — Instructions for comparing this week vs. last 4 weeks: topic frequency, new topics, disappeared topics, request timing patterns.

**Why someone wants this:** It's like having a chief of staff who quietly notices "you used to ask about the gym every Monday and you haven't in 3 weeks" without being a nag. Self-awareness through your own data.

**What makes it unique:** Every other AI tool tries to help you DO things. This one helps you SEE yourself. It uses the memory files OpenClaw already writes — zero new infrastructure, pure behavioral intelligence.

---

## Idea 2: "Invoice Hound"
**Tagline:** "Never chase a payment manually again."
**Category:** Workflows

**Problem:** Freelancers send invoices and then... forget. Or feel awkward following up. Payments slip 30, 60, 90 days. They lose thousands per year to invoices they were too busy/uncomfortable to chase.

**Files:**
- `SOUL.md` — Firm but professional tone for payment communications. Understands freelancer psychology: the agent should make following up feel effortless, not confrontational.
- `AGENTS.md` — Workflow: User logs an invoice (client, amount, date, due date) via quick message. Agent stores in `invoices/`. Cron job checks daily for overdue invoices. At +3, +7, +14, +30 days overdue, drafts escalating follow-up messages (friendly → firm → final notice). Sends drafts to user for approval before sending via messaging. Tracks payment confirmations.
- `TOOLS.md` — Messaging integration config for sending follow-ups. Optional: web_fetch to check if payment portals show "paid."
- `skills/invoice-tracker.md` — Invoice log format, escalation ladder templates, how to mark paid.

**Why someone wants this:** This is money literally recovered. A freelancer with 10 clients could recoup thousands/year just by having consistent follow-up. The emotional labor of "being the person who asks for money" is outsourced.

**What makes it unique:** It's not an invoicing tool (those exist). It's specifically the FOLLOW-UP engine — the part everyone hates and nobody's automated at the personal-agent level. Uses OpenClaw's cron + messaging natively.

---

## Idea 3: "Source Rot Guard"
**Tagline:** "Your bookmarks and references are decaying. This catches it."
**Category:** Knowledge

**Problem:** Researchers, writers, and developers save links — in notes, docs, READMEs, bookmarks. Over months, links die (404), content changes, APIs deprecate. You discover this at the worst time: mid-presentation, mid-deadline, mid-argument.

**Files:**
- `AGENTS.md` — Weekly cron job: scans workspace files (markdown, docs) for URLs. Uses `web_fetch` to check each. Logs status in `link-health/report-YYYY-MM-DD.md`. Flags: dead links (404/5xx), redirected links, content that changed significantly (hash comparison vs. last check). Notifies user of critical rot via message.
- `skills/link-health-check.md` — URL extraction regex patterns, health check logic, content-change detection via simple hash comparison, priority rules (links in README > links in random notes).
- `TOOLS.md` — web_fetch config, optional browser fallback for JS-rendered pages.

**Why someone wants this:** Anyone who's maintained a blog, wiki, research paper, or documentation knows link rot is inevitable. This is silent infrastructure maintenance. You install it and forget it — it just tells you when something breaks.

**What makes it unique:** Link checkers exist as standalone tools, but this one lives inside your agent, checks YOUR actual files in YOUR workspace, and tells you in YOUR preferred channel. No separate tool to configure. It also does content-change detection, not just alive/dead — catching when a cited source quietly changes its claims.
