# TOOLS.md — Second Brain Configuration

## Memory Folder Structure

```
memory/
├── preferences.md          # User preferences (auto-maintained)
├── projects/               # Per-project context
│   ├── project-alpha.md
│   └── website-redesign.md
├── archive/                # Processed daily notes
│   ├── 2024-01-01.md
│   └── 2024-01-02.md
├── 2024-01-08.md           # Today's daily note
└── 2024-01-09.md           # Recent daily notes
```

`MEMORY.md` lives in the workspace root (alongside SOUL.md, AGENTS.md).

## File Conventions

### `memory/preferences.md`
- Grouped by category with `## Category` headings
- One preference per bullet point
- Update in-place — never duplicate
- Categories to use: Communication, Tech Stack, Personal, Workflow, Tools, Design, Other

### `memory/projects/<name>.md`
- Filename: kebab-case project name (e.g., `my-saas-app.md`)
- Always include: Overview, Key Decisions, Current Status
- Optional sections: Architecture, Tech Stack, Notes, Links

### `memory/YYYY-MM-DD.md`
- One file per day, multiple session headings if needed
- Session headings include approximate time: `## Session — 14:30`
- Keep each session summary to 3-8 bullet points
- Include a **Follow-ups** section when there are open threads

### `MEMORY.md`
- Weekly summaries only — not a raw dump
- Most recent week at top
- Prune entries older than ~2 months unless still relevant
- Target: under 200 lines total

## Memory Operations

### Creating the memory folder
On first run, if `memory/` doesn't exist, create it along with an empty `preferences.md`:
```markdown
# Preferences

<!-- Auto-maintained by Second Brain. Categories are added as preferences are detected. -->
```

### Archiving daily notes
Move (don't copy) processed daily notes to `memory/archive/`. Preserve filenames.
