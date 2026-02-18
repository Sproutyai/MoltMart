# Molt Mart Delivery Analysis — Agent 2: Exploratory Research

## 1. ClawHub Deep Dive

### What ClawHub Actually Is
ClawHub is a **skill registry** at clawhub.com with a CLI (`npm i -g clawhub`, currently v0.5.0). It's essentially npm for OpenClaw skills.

**Key mechanics:**
- `clawhub install <slug>` → downloads to `./skills/<slug>/` (relative to workdir, default = OpenClaw workspace)
- `clawhub publish <path>` → uploads a folder with `--slug`, `--name`, `--version`
- Has versioning, tags, lockfile (`.clawhub-lock.json`), hash-based update detection
- Registry URL is configurable via `CLAWHUB_REGISTRY` env var or `--registry` flag
- Auth via `clawhub login` (opens browser)
- Also has: search (vector search!), inspect, explore, star, sync

### How Molt Mart Relates to ClawHub

**Critical insight: ClawHub is for SKILLS, not templates.**

Skills = tools/capabilities (1password CLI wrapper, Apple Notes integration, etc.). Each skill lives in `skills/<slug>/` and has a `SKILL.md` with metadata.

Molt Mart templates = workspace-level configuration (SOUL.md, AGENTS.md, TOOLS.md, memory files). These are fundamentally different:
- Skills are **additive** — install alongside existing skills
- Templates are **replacive** — they define the agent's personality, rules, workflow

**This means ClawHub is NOT a direct fit for template delivery.** You can't `clawhub install` a SOUL.md because ClawHub installs into `skills/` subdirectory, not the workspace root.

### Can We Still Use ClawHub?

Three options:
1. **Publish templates as "skills"** — hacky but possible. Template would live at `skills/molt-mart-business-coach/` and include a setup script or README saying "copy these files up." Bad UX.
2. **Fork/extend ClawHub** — registry is configurable. We could run our own registry that handles workspace-level files. Significant engineering.
3. **Don't use ClawHub at all** — build our own lightweight delivery. Probably the right call for MVP.

**Verdict: ClawHub is a red herring for templates. It solves a different problem (skill distribution). Molt Mart templates need their own delivery mechanism.**

## 2. Answers to Agent 1's Open Questions

### Q1: Template format spec / manifest.json?
**Answer:** Yes, every template .zip should include a `molt-mart.json` manifest:
```json
{
  "name": "Business Coach Pro",
  "version": "1.0.0",
  "slug": "business-coach-pro",
  "files": [
    {"path": "SOUL.md", "action": "replace"},
    {"path": "AGENTS.md", "action": "replace"},
    {"path": "TOOLS.md", "action": "merge"},
    {"path": "memory/templates/daily-review.md", "action": "create"}
  ],
  "description": "Transforms your agent into a business strategy coach",
  "requires_skills": ["clawhub:notion"],
  "conflicts_with": []
}
```

### Q2: Conflict resolution (existing SOUL.md)?
**Answer:** Three strategies, user picks:
1. **Replace** (default for most files) — backup old to `.molt-mart-backup/`
2. **Merge** (for TOOLS.md) — append new entries, skip duplicates
3. **Skip** — don't touch if exists

The manifest declares the default action per file. User can override.

### Q3: ClawHub integration?
**Answer:** Not for templates. BUT — if a template requires skills (e.g., "this coaching template works best with the Notion skill"), we can tell the user to `clawhub install notion` as a dependency. So ClawHub is a **dependency resolver**, not a delivery mechanism.

### Q4: Gateway API for external install triggers?
**Answer:** OpenClaw gateway runs locally and has APIs (`skills.status`, `skills.install`). But these are for skills, not arbitrary file writes. No current endpoint for "write these files to workspace." An agent CAN do this via its own file-write capabilities though.

### Q5: Versioning / updates?
**Answer:** Store installed template + version in a `.molt-mart-installed.json` in the workspace. Molt Mart can check this via API and notify of updates. But honestly — templates aren't like software packages. People customize them. Updates would overwrite customizations. **Version 1.0 should be install-only, no auto-update.**

### Q6: Dependencies?
**Answer:** `molt-mart.json` manifest lists `requires_skills`. Post-install, show: "This template works best with: Notion (not installed) — run `clawhub install notion`"

### Q7: Multiple templates?
**Answer:** Tricky. SOUL.md is singular — you can't have two personalities. Options:
- One active template at a time (simple, recommend this)
- Template "layers" that stack (complex, avoid for now)

### Q8: Namespace isolation?
**Answer:** Templates SHOULD NOT install to a subdirectory — they need to be at workspace root to work. That's the whole point. Isolation = backup the old files first.

### Q9: Pricing integration?
**Answer:** Purchase flow: Stripe checkout → success webhook → generate signed download URL → same delivery. No change to install mechanics for paid vs free.

### Q10: Analytics?
**Answer:** Track: downloads, install attempts (if CLI), support requests per template. But for manual .zip, we can only track downloads.

## 3. New Insights Agent 1 Missed

### Insight 1: Templates Are Not Skills — Stop Conflating Them
Agent 1's Option B (publish to ClawHub) won't work as described. ClawHub puts files in `skills/<slug>/`, but templates need files at workspace root. This is a fundamental mismatch.

### Insight 2: The Simplest Install Is a Shell Script
Forget CLI tools. Include an `install.sh` in the .zip:
```bash
#!/bin/bash
# Molt Mart Installer — Business Coach Pro
WORKSPACE="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
BACKUP="$WORKSPACE/.molt-mart-backup/$(date +%s)"
mkdir -p "$BACKUP"
cp "$WORKSPACE/SOUL.md" "$BACKUP/" 2>/dev/null
cp "$WORKSPACE/AGENTS.md" "$BACKUP/" 2>/dev/null
cp SOUL.md AGENTS.md TOOLS.md "$WORKSPACE/"
echo "✅ Installed! Backup at: $BACKUP"
echo "⚠️  Restart your OpenClaw agent to apply changes."
```
One command: `cd ~/Downloads && unzip template.zip && cd template && bash install.sh`

### Insight 3: The Agent IS the Installer
The most powerful insight: **OpenClaw agents can install templates on themselves.** The user says "I just bought the Business Coach template from Molt Mart" and the agent can:
1. Find the .zip in ~/Downloads
2. Extract it
3. Show the user what would change (diff)
4. Ask for confirmation
5. Write the files
6. Suggest restarting

We don't need any special infrastructure for this. The agent already has all the tools. We just need good README instructions.

### Insight 4: A Molt Mart "Skill" Could Automate Everything
Build a ClawHub skill (ironic, yes) called `molt-mart` that gives any OpenClaw agent the ability to:
- Browse Molt Mart catalog
- Download purchased templates
- Install with human approval
This IS a skill (it's a capability), not a template.

### Insight 5: The Market Is Tiny Right Now
OpenClaw is niche. The number of users who would pay for templates is probably in the hundreds, maybe low thousands. This matters for prioritization — don't over-engineer.

## 4. Reality Check

| Idea | Feasibility | Priority |
|------|------------|----------|
| Manual .zip download | Already works | ✅ Improve instructions |
| Install script in .zip | 1 day of work | ✅ Do immediately |
| File manifest on template page | 2-3 days | ✅ Do this week |
| Content preview on site | 2-3 days | ✅ Do this week |
| Backup before install | Built into install.sh | ✅ Free |
| ClawHub as delivery for templates | Doesn't fit the model | ❌ Don't pursue |
| Molt Mart ClawHub skill | 1 week | 🔜 Phase 2 |
| REST API for agents | 1-2 weeks | 🔜 Phase 2 |
| One-click browser install | Complex, security issues | 📅 Phase 3 |
| Automated safety scanning | Need to define what "safe" means | 📅 Phase 3 |
| Agent-to-agent commerce | Market too small | 📅 Future |

## 5. The Simplest Viable Delivery (Build NOW)

### What goes in the .zip:
```
business-coach-pro/
├── molt-mart.json          # Manifest (files, version, dependencies)
├── install.sh              # Mac/Linux installer
├── install.bat             # Windows installer (if needed)
├── README.md               # Human-readable instructions
├── SOUL.md                 # The actual template files
├── AGENTS.md
├── TOOLS.md
└── memory/
    └── templates/
        └── daily-review.md
```

### What goes on the website (post-purchase page):
```
✅ Download complete!

📦 Quick Install (Mac/Linux):
   cd ~/Downloads
   unzip business-coach-pro.zip
   cd business-coach-pro
   bash install.sh

🤖 Or tell your OpenClaw agent:
   "Install the Business Coach template I just downloaded"

📋 What's included:
   • SOUL.md — Agent personality and communication style
   • AGENTS.md — Workflow rules and session behavior
   • TOOLS.md — Tool configurations and API references
   
⚠️ Your current files will be backed up to ~/.openclaw/workspace/.molt-mart-backup/
```

### What goes in the README.md inside the .zip:
Clear instructions for three personas:
1. **"I know what I'm doing"** → `bash install.sh`
2. **"Walk me through it"** → Step-by-step with screenshots
3. **"My agent can do it"** → Tell your agent to install it

## 6. The Agent API Vision (Build NEXT)

### Phase 2: Molt Mart Skill
A ClawHub-published skill that any OpenClaw agent can install:
```bash
clawhub install molt-mart
```

This skill gives the agent these capabilities:
- `GET https://moltmart.com/api/v1/templates` — browse catalog
- `GET https://moltmart.com/api/v1/templates/:slug` — get details + manifest
- `GET https://moltmart.com/api/v1/templates/:slug/download` — download (requires auth token)
- Auth via API key stored in `openclaw.json` under `skills.entries.molt-mart.apiKey`

### Phase 3: Agent-Initiated Purchase
- Agent browses, finds template, presents to human
- Human approves purchase
- Agent calls Stripe checkout session API → returns URL
- Human completes payment in browser
- Agent detects purchase completion via webhook/polling
- Agent installs template with human confirmation

### The Permission Model
Templates are basically "executable instructions" — treat them like code:
- **Browse**: no approval needed
- **Preview**: no approval needed  
- **Install**: requires explicit human "yes"
- **Payment**: always requires human interaction (Stripe checkout)

## 7. Competitive Positioning

### Why Not Just Use ClawHub (Free)?
ClawHub doesn't sell templates. It distributes skills. Different product entirely.

### Why Would Someone Pay?
1. **Time savings** — a well-crafted SOUL.md takes hours of iteration to get right
2. **Expertise** — "I don't know how to prompt engineer, but this person does"
3. **Curation** — tested, reviewed, rated by community
4. **Bundling** — template + memory files + tool configs + setup script = complete transformation
5. **Updates** — template creator improves it over time (future feature)

### Who's the User?
**Right now:** Early OpenClaw adopters who want to customize their agent but don't want to write markdown from scratch. Tech-comfortable but not necessarily developers. Think "Notion template buyers" — people who could build it themselves but value someone else's structure.

**The honest truth:** The market is small today. OpenClaw is early. But being the first marketplace in the space = first-mover advantage. When the market grows 10x (and it will), Molt Mart is already there.

### Competitive Moat
- **Not ClawHub** — different product category
- **Network effects** — more sellers → more templates → more buyers → more sellers
- **Brand** — "the place" for OpenClaw templates
- **Curation** — quality reviews, ratings, verified sellers
- **Revenue share** — incentivizes creators to publish here vs giving away free

## 8. Recommendations

### Immediate (This Week)
1. **Add `install.sh` to every template .zip** — takes 1 hour to build a generator
2. **Add `molt-mart.json` manifest** — standardize template packaging
3. **Improve post-download page** — show install instructions, file manifest, content preview
4. **Add README.md** to every template .zip with clear install instructions for all skill levels

### Phase 2 (Next 2-4 Weeks)
1. **Build Molt Mart skill for ClawHub** — lets agents browse/install templates natively
2. **Build REST API** (`/api/v1/templates`) — for programmatic access
3. **Content preview on template pages** — show SOUL.md contents before purchase
4. **Backup system** — automatic before any install

### Phase 3 (Month 2-3)
1. **Safety scanning** — automated checks for injection attempts, data exfiltration instructions
2. **Community reviews/ratings** — social proof and quality signals
3. **Template versioning** — update notifications (carefully, since users customize)
4. **Seller verification** — trust badges

### What NOT to Build
- ❌ Custom ClawHub registry — over-engineered for current market size
- ❌ One-click browser install — too many security/CORS headaches for too few users
- ❌ Auto-update templates — users customize, updates would destroy their changes
- ❌ Agent-to-agent autonomous purchasing — market isn't ready, safety concerns too high

### The Bottom Line
**The delivery problem is simpler than Agent 1 suggested.** We don't need ClawHub integration or gateway APIs. We need:
1. A good install script in the .zip
2. Clear instructions on the website
3. A README that tells the user's agent how to install it

That's the 80/20. Everything else is Phase 2+.
