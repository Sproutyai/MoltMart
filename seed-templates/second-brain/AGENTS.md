# AGENTS.md — Second Brain Memory System

## Session Start

1. Read `memory/preferences.md` (always)
2. Read today's `memory/YYYY-MM-DD.md` if it exists
3. Scan the last 3 daily notes for relevant context
4. If the user mentions a project by name, read `memory/projects/<name>.md` if it exists
5. Read `MEMORY.md` for long-term consolidated context

Do this silently. Never announce "I'm loading my memory files."

## During a Session

### Capture Preferences (Immediately)

When the user expresses a preference, write it to `memory/preferences.md` right away. Don't wait for session end.

**Triggers — capture when the user says:**
- "I like / prefer / always want / use X"
- "I don't like / hate / never want / stop doing Y"
- "My [name/email/timezone/stack/etc] is Z"
- "From now on, do X"
- "Remember that..."
- Any correction of your behavior ("No, I meant..." implies a preference)

**Format in `memory/preferences.md`:**
```markdown
## Communication
- Prefers concise answers, not verbose
- Likes code comments but not excessive ones

## Tech Stack
- Frontend: React + Tailwind
- Backend: Node.js + Postgres
- Deploys to Vercel

## Personal
- Name: Alex
- Timezone: US/Eastern
- Works at Acme Corp

## Workflow
- Prefers trunk-based development
- Wants tests written alongside features
- Uses conventional commits
```

Group by category. Update in-place — don't duplicate entries. If a preference contradicts an older one, replace it.

### Capture Project Context (When Significant)

When working on a named project, maintain `memory/projects/<name>.md`.

**Write to project files when:**
- A new project is introduced (create the file)
- Architecture decisions are made
- Key technical choices are locked in
- Important context that future sessions will need

**Format in `memory/projects/<name>.md`:**
```markdown
# Project: <Name>

## Overview
One-liner description. Started YYYY-MM-DD.

## Key Decisions
- Using PostgreSQL over MongoDB (user preference, 2024-01-10)
- Auth via Clerk (decided 2024-01-12)

## Architecture
- Monorepo with Turborepo
- API in /apps/api, frontend in /apps/web

## Current Status
What's in progress, what's blocked, what's next.

## Notes
Anything else worth remembering.
```

### What NOT to Capture

Not everything is worth remembering. **Skip:**
- Throwaway questions ("What time is it?")
- One-off tasks with no future relevance ("Convert this CSV to JSON")
- Anything the user explicitly says is temporary
- Debugging sessions (unless they reveal a recurring issue)
- Generic chitchat

**Rule of thumb:** Would this be useful if the user came back in 2 weeks? If no, skip it.

## Session End

At the end of a meaningful session (not a quick one-off), append a summary to `memory/YYYY-MM-DD.md`.

**What counts as "meaningful":**
- Worked on a project for 10+ minutes
- Made decisions or had a substantive discussion
- User shared new context about themselves or their work

**Daily note format (`memory/YYYY-MM-DD.md`):**
```markdown
## Session — HH:MM

**Topic:** Brief description
**What happened:**
- Built the login page with email + OAuth
- Decided to use Resend for transactional emails
- User wants error messages to be friendly, not technical

**Follow-ups:**
- Need to add password reset flow
- User mentioned wanting dark mode eventually
```

Multiple sessions in one day get appended to the same file under separate `## Session` headings.

## Weekly Consolidation

Every Monday (or when the agent notices 7+ days of unconsolidated notes):

1. Read all daily notes from the past week
2. Extract anything with lasting value
3. Append a weekly summary to `MEMORY.md`
4. Move processed daily notes to `memory/archive/` (don't delete)

**MEMORY.md format:**
```markdown
# Long-Term Memory

## Week of 2024-01-08
- Started Project Phoenix — React + Supabase app for inventory management
- User prefers functional components, no class components
- Deployed staging environment to Vercel
- User mentioned upcoming vacation Jan 20-27

## Week of 2024-01-01
- Set up workspace, established coding conventions
- User works at Acme Corp, building internal tools
```

Keep MEMORY.md concise. It's a curated highlight reel, not a transcript. Prune entries that are no longer relevant (e.g., "upcoming vacation" after it's passed).

## Memory Hygiene

- **Contradictions:** Newer info wins. Update the old entry, don't keep both.
- **Staleness:** During weekly consolidation, remove things that are clearly outdated.
- **Size:** If `preferences.md` exceeds ~100 lines, consolidate or remove low-value entries.
- **Privacy:** Never store passwords, API keys, or secrets in memory files. If the user shares one, use it but don't persist it.
