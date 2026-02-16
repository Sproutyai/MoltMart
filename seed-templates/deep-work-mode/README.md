# Deep Work Mode

**Stop explaining. Start doing.**

A SOUL.md + AGENTS.md configuration that transforms your OpenClaw agent from a polite assistant into a focused executor. Less talking, more shipping.

---

## What This Does

Most AI assistants are trained to be helpful, harmless, and *verbose*. They narrate every action, ask permission for obvious tasks, and wrap every response in pleasantries.

Deep Work Mode strips all of that out. Your agent becomes:

- **Action-biased** — executes instead of discussing
- **Terse** — answers in sentences, not paragraphs
- **Autonomous** — makes reasonable assumptions instead of asking 12 clarifying questions
- **Silent** — tool calls happen without narration, self-review happens without announcement

## Before & After

### Before (default behavior):
> **You:** "Add a loading spinner to the dashboard"
>
> **Agent:** "Sure! I'd be happy to help you add a loading spinner to the dashboard. Let me first take a look at your current dashboard component to understand the structure. I'll then identify the best approach for implementing a loading state. Here are a few options we could consider:
>
> 1. A full-page spinner...
> 2. A skeleton loader...
> 3. An inline spinner...
>
> Which approach would you prefer? Also, do you have a preferred spinner library, or should I use a CSS-based solution?"

### After (Deep Work Mode):
> **You:** "Add a loading spinner to the dashboard"
>
> **Agent:** *[reads component, adds spinner using project's existing UI library, updates state logic]*
>
> "Done. Added loading state to `Dashboard.tsx` — shows spinner during data fetch, skeleton for individual cards."

---

## Install

Copy both files to your OpenClaw workspace root:

```bash
cp SOUL.md AGENTS.md ~/.openclaw/workspace/
```

If you already have a `SOUL.md` or `AGENTS.md`, merge the contents — or back up your originals first:

```bash
# Backup existing files
cp ~/.openclaw/workspace/SOUL.md ~/.openclaw/workspace/SOUL.md.backup
cp ~/.openclaw/workspace/AGENTS.md ~/.openclaw/workspace/AGENTS.md.backup

# Install Deep Work Mode
cp SOUL.md AGENTS.md ~/.openclaw/workspace/
```

Restart your session. The agent picks up the new config automatically.

## Compatibility

- **OpenClaw:** v0.1+ (any version with SOUL.md/AGENTS.md support)
- **Models:** Works with all supported models. Best results with Claude Sonnet 4/Opus.
- **Stacks with:** Other SOUL.md configurations — merge sections as needed. Deep Work Mode is additive; it won't conflict with domain-specific instructions.

## Customization

These files are yours to tweak. Common modifications:

- Adjust the "do-it threshold" in AGENTS.md if you want more/less autonomy
- Add domain-specific assumptions to SOUL.md (e.g., "always use TypeScript")
- Tune the tone — some people want even terser, some want slightly warmer

## License

MIT. Do whatever you want with it.
