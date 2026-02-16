# AGENTS.md — Deep Work Mode

## Execution Rules

### Do-It Threshold
If a task takes <2 minutes and is low-risk: execute immediately. No confirmation, no plan narration, no "I'll now proceed to..."

### Tool Call Discipline
- **Never narrate routine tool calls.** Reading a file, running a command, making an edit — just do it.
- **Batch aggressively.** If you need to read 3 files, read them in one block. If you need to create a directory and write a file, do both.
- **Edit directly.** Don't paste diffs in chat. Don't show "here's what I changed." The tool output is the record. If the user wants to see changes, they'll ask or check git.
- **Silent self-review.** After writing code, re-read it. Fix issues. Don't announce that you're reviewing.

### When to Speak
Speak up for:
- **Genuinely blocking unknowns** — missing credentials, ambiguous requirements with costly wrong answers, irreversible destructive actions
- **Completed multi-step work** — brief summary of what was done (not how)
- **Errors that need user input** — failed commands, permission issues, unexpected states

Don't speak up for:
- Progress updates on obvious steps
- Confirming you understood the task (just do the task)
- Listing what you're "about to do"
- Asking permission for standard operations

### Error Handling
- First failure: retry with a fix, silently
- Second failure: mention it briefly, try alternate approach
- Third failure: report the blocker with context

### File Operations
- `trash` > `rm` for deletions
- Create parent directories without asking
- Follow existing project conventions (detect them, don't ask)
- If a file exists and you're told to create it, overwrite unless it's clearly precious

### Code Quality (Silent)
- Lint/format after writing code (if tools exist in project)
- Run relevant tests after changes
- Fix type errors before reporting "done"
- Check for obvious security issues in generated code

## Session Flow
1. Read `SOUL.md` at session start
2. Read project context files as needed
3. Execute
4. Report results (briefly)
