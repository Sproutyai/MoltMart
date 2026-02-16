# Molt Mart — Template Delivery System Plan

> **Purpose:** The definitive guide to how templates get from Molt Mart to a user's OpenClaw agent.
> Written for Thomas (plain English) AND for implementation (technical details).

---

## Section 1: How Templates Work (Simple Explanation)

### What Is an OpenClaw Template?

An OpenClaw agent's behavior is defined by a handful of markdown files that live in a folder called the **workspace** (`~/.openclaw/workspace/`). Think of it like a recipe card collection that tells your AI assistant who it is and how to act:

| File | What It Does | Analogy |
|------|-------------|---------|
| **SOUL.md** | Defines the agent's personality, tone, values | The agent's "DNA" |
| **AGENTS.md** | Rules for every session — what to read, safety rules, cost rules | The agent's "employee handbook" |
| **TOOLS.md** | API keys, contacts, tool instructions | The agent's "toolbelt" |
| **MEMORY.md** | Long-term memory the agent references | The agent's "journal" |
| **skills/** folder | Specific capabilities (e.g., Notion integration, 1Password) | The agent's "superpowers" |

A **Molt Mart template** is a pre-built set of these files, packaged as a `.zip`, that transforms an agent into something specific — a business coach, a coding assistant, a content creator, etc.

### What Happens When You "Install" One?

It's dead simple: the template files get placed into the workspace folder, replacing or adding to what's already there. Next time the agent starts a session, it reads the new files and behaves differently. That's it.

**Important:** Templates are NOT skills. Skills are additive tools that go in `skills/<name>/`. Templates define the agent's core identity and rules at the workspace root. ClawHub handles skills; Molt Mart handles templates. Different products.

---

## Section 2: The Delivery Flow (MVP)

### For Human Users

**Step 1 — Purchase/Download**
User finds a template on Molt Mart, clicks "Download Free" (or completes Stripe checkout for paid). Backend generates a 60-second signed URL. Browser downloads a `.zip` file.

**Step 2 — What's in the .zip**
```
business-coach-pro/
├── molt-mart.json          ← Manifest (what's included, version, metadata)
├── install.sh              ← One-command installer (backs up old files, copies new)
├── README.md               ← Human-readable setup instructions
├── SOUL.md                 ← Template files...
├── AGENTS.md
├── TOOLS.md
└── memory/
    └── templates/
        └── daily-review.md
```

**Step 3 — Post-download page shows:**
```
✅ Download complete!

📦 Quick Install (3 steps):
   1. Open Terminal
   2. Run: cd ~/Downloads && unzip business-coach-pro.zip && cd business-coach-pro && bash install.sh
   3. Restart your OpenClaw agent

🤖 Or just tell your AI agent:
   "Install the Business Coach template I just downloaded"

📋 What's included:
   • SOUL.md — Agent personality and communication style
   • AGENTS.md — Workflow rules and session behavior
   • TOOLS.md — Tool configurations

⚠️ Your current files are automatically backed up to
   ~/.openclaw/workspace/.molt-mart-backup/
```

**Step 4 — User installs via one of three paths:**

| Path | For Who | How |
|------|---------|-----|
| **A. Run install.sh** | Comfortable with Terminal | `bash install.sh` — backs up existing files, copies new ones, done |
| **B. Manual extract** | Power users | Drag files into `~/.openclaw/workspace/` themselves |
| **C. Tell their agent** | Everyone else | "Install the template I just downloaded" — agent handles it |

### For AI Agents

When a human says "Install the template I just downloaded," the agent:

1. **Finds the .zip** — scans `~/Downloads/` for the most recent Molt Mart .zip
2. **Reads the manifest** — opens `molt-mart.json` to see what files are included
3. **Shows the human what will change** — "This will replace your SOUL.md and AGENTS.md. Your current files will be backed up."
4. **Gets human confirmation** — waits for explicit "yes"
5. **Backs up existing files** — copies current workspace files to `.molt-mart-backup/<timestamp>/`
6. **Installs** — extracts template files to the workspace
7. **Confirms** — "✅ Installed Business Coach Pro. Backed up your old files. Restart your agent to apply."

No special infrastructure needed — the agent already has file read/write tools.

---

## Section 3: Template Manifest Format

Every template .zip includes a `molt-mart.json` at the root:

```json
{
  "name": "Business Coach Pro",
  "slug": "business-coach-pro",
  "version": "1.0.0",
  "description": "Transforms your agent into a strategic business coach",
  "author": "seller-name",
  "files": [
    {
      "path": "SOUL.md",
      "type": "soul",
      "action": "replace",
      "description": "Agent personality — confident, strategic, Socratic"
    },
    {
      "path": "AGENTS.md",
      "type": "agents",
      "action": "replace",
      "description": "Session rules, memory workflow, cost management"
    },
    {
      "path": "TOOLS.md",
      "type": "tools",
      "action": "merge",
      "description": "Tool references (appended to existing)"
    },
    {
      "path": "skills/daily-review/SKILL.md",
      "type": "skill",
      "action": "create",
      "description": "Daily business review skill"
    }
  ],
  "requires_skills": ["clawhub:notion"],
  "compatibility": ">=0.1",
  "install_mode": "replace",
  "backup_existing": true
}
```

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Display name |
| `slug` | ✅ | URL-safe identifier |
| `version` | ✅ | Semver string |
| `description` | ✅ | One-line description |
| `author` | ✅ | Seller name |
| `files` | ✅ | Array of included files |
| `files[].path` | ✅ | Relative path within workspace |
| `files[].type` | ✅ | One of: `soul`, `agents`, `tools`, `memory`, `skill`, `other` |
| `files[].action` | ✅ | `replace` (overwrite), `merge` (append), or `create` (only if missing) |
| `files[].description` | ✅ | Human-readable description of this file |
| `requires_skills` | ❌ | ClawHub skills this template works best with |
| `compatibility` | ❌ | Minimum OpenClaw version |
| `install_mode` | ❌ | Default: `replace`. Overall strategy |
| `backup_existing` | ❌ | Default: `true`. Back up before overwriting |

### Per-File Actions

- **`replace`** — Back up the existing file, then overwrite. Used for SOUL.md, AGENTS.md.
- **`merge`** — Append new content to existing file (with a separator). Used for TOOLS.md.
- **`create`** — Only write if the file doesn't already exist. Used for memory templates, new skills.

---

## Section 4: Upload Requirements (For Sellers)

### Required
- ✅ At least **one** of: `SOUL.md`, `AGENTS.md`, or a `skills/` folder
- ✅ `molt-mart.json` manifest — **auto-generated during upload** by inspecting the .zip contents. Seller reviews and can edit before publishing.

### Recommended
- 📝 `README.md` with usage instructions, customization tips, and what the template does
- 📝 Description and tags filled out on the upload form

### Optional
- 🔧 `install.sh` — custom install script. If not provided, Molt Mart auto-generates a standard one at download time.
- 🔧 `memory/` folder — starter memory files or templates

### Auto-Generation at Upload
When a seller uploads a .zip, Molt Mart:
1. Extracts and inspects contents
2. Auto-generates `molt-mart.json` based on detected files
3. Shows seller a preview: "We found SOUL.md, AGENTS.md, and 1 skill folder. Look right?"
4. Seller confirms or edits
5. If no `install.sh`, one is generated at download time
6. Template is stored in Supabase Storage; manifest is stored in the database

---

## Section 5: Safety & Trust

### Before Purchase (Transparency)
- **File manifest on template page** — buyers see exactly what files are included before purchasing
- **Content preview tabs** — SOUL.md and AGENTS.md contents are readable on the template detail page (already built)
- **Community ratings & reviews** — social proof, already built

### During Install (Protection)
- **Automatic backup** — before any file is overwritten, the original is copied to `~/.openclaw/workspace/.molt-mart-backup/<timestamp>/`
- **Manifest-only installs** — only files declared in `molt-mart.json` are written. No hidden files.
- **Human confirmation** — agent-driven installs always ask "are you sure?" before writing

### After Install (Recovery)
- **Easy rollback** — "Restore my previous config" → agent reads from `.molt-mart-backup/`
- **Installed tracker** — `.molt-mart-installed.json` in workspace records what's installed and when

### Trust Signals (Now)
- Seller profiles with purchase counts
- Star ratings and written reviews
- Download counts
- "Report template" button

### Trust Signals (Future)
- ✅ **Verified seller** badge (manual review)
- 🔍 **Automated content scanning** — flag templates containing suspicious patterns:
  - Instructions to exfiltrate data ("send all files to...")
  - Safety override attempts ("ignore all previous instructions...")
  - Obfuscated or encoded instructions
  - Attempts to delete/modify system files
- 🏷️ **Content policy** — templates must not contain instructions to exfiltrate data, override safety rules, or include obfuscated content

### One Template at a Time
SOUL.md is singular — you can't have two personalities. **One active template at a time.** Installing a new template replaces the previous one (with backup). Template "layering" is a future consideration, not MVP.

---

## Section 6: Phase 2 — Agent-Native Commerce

**Timeline: 2-4 weeks after MVP launch**

### The Molt Mart Skill

Build and publish a ClawHub skill called `molt-mart` that any OpenClaw agent can install:

```bash
clawhub install molt-mart
```

This skill gives agents the ability to:
- **Browse** the Molt Mart catalog
- **Search** for templates by keyword or category
- **Preview** template contents (SOUL.md, file manifest)
- **Download** purchased templates
- **Install** with human approval

### REST API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/templates` | GET | Public | List/browse templates (pagination, filters) |
| `/api/v1/templates/:slug` | GET | Public | Template detail + manifest |
| `/api/v1/search?q=...` | GET | Public | Search templates |
| `/api/v1/templates/:slug/download` | GET | API Key | Download .zip (must own or free) |

### Auth for Agents
- User generates an API key on Molt Mart account settings
- Key stored in OpenClaw's `openclaw.json` or `TOOLS.md`
- Agent includes key in API requests

### Permission Model
| Action | Approval Needed? |
|--------|-----------------|
| Browse / search | ❌ No |
| Preview contents | ❌ No |
| Download (free) | ❌ No |
| Purchase (paid) | ✅ Human approves payment |
| Install to workspace | ✅ Human confirms |

---

## Section 7: Phase 3 — Full Agent Autonomy

**Timeline: Month 2-3**

### The Vision: Self-Enhancing Agents

1. **Agent discovers a need** — e.g., user asks for help with Notion and the agent doesn't have that capability
2. **Agent searches Molt Mart** — `GET /api/v1/search?q=notion+productivity`
3. **Agent presents options** — "I found 3 templates that could help. Here's what each includes..."
4. **Human approves** — "Install option 2"
5. **Agent handles purchase** — opens Stripe checkout URL for human to complete (agent never touches payment)
6. **Agent installs** — downloads, backs up, writes files, confirms
7. **Agent restarts** — applies new configuration

### Safeguards
- Agent **never** purchases without human clicking "Pay" in the browser
- Agent **never** installs without human saying "yes"
- Agent **always** shows what will change before installing
- All actions are logged in `.molt-mart-installed.json`

### What NOT to Build (Yet)
- ❌ Auto-update templates — users customize their files; updates would destroy changes
- ❌ Fully autonomous purchasing — market isn't ready, safety concerns too high
- ❌ Custom ClawHub registry — over-engineered for current market size
- ❌ One-click browser→localhost install — CORS/security headaches outweigh benefits

---

## Section 8: Visual Diagram Description (For Miro Board)

### Diagram 1: Buyer Journey

**Layout:** Horizontal flow, left to right, 6 stages

```
[DISCOVER]          [PREVIEW]           [PURCHASE]          [DOWNLOAD]         [INSTALL]           [ENJOY]
    │                   │                    │                   │                  │                  │
 Browse Molt Mart   View template       Click "Download     .zip downloads     Run install.sh     Agent behaves
 Search by          detail page         Free" or complete   to ~/Downloads     OR tell agent      differently!
 category/keyword   Read SOUL.md        Stripe checkout                        "install the       New personality,
 See ratings,       preview tab                             Post-download      template"          new rules,
 downloads,         See file manifest                       page shows                            new capabilities
 descriptions       Check reviews                           instructions       Agent backs up
                                                                               old files,
                                                                               writes new ones,
                                                                               confirms
```

**Colors:** Each stage gets a distinct color. Green for success states. Yellow for "action needed" states.

---

### Diagram 2: Seller Journey

**Layout:** Horizontal flow, left to right, 5 stages

```
[CREATE]            [UPLOAD]            [REVIEW]            [PUBLISH]          [EARN]
    │                   │                   │                   │                  │
 Build template     Upload .zip to      Molt Mart auto-     Template goes      Track downloads
 in their own       Molt Mart           generates manifest   live on the        and revenue
 OpenClaw           seller dashboard    Seller reviews       marketplace        on seller
 workspace                              file list,                              dashboard
                    Fill in:            edits description    Appears in
 Write SOUL.md,     - Title             and metadata         search,           Get paid via
 AGENTS.md, etc.    - Description                            categories,       Stripe Connect
                    - Category          Content is           featured          (future)
 Test it locally    - Price (or free)   previewable          sections
                    - Tags              on detail page
```

---

### Diagram 3: Agent Journey (Phase 2-3)

**Layout:** Horizontal flow with a "human checkpoint" gate in the middle

```
[NEED]              [SEARCH]            [PROPOSE]        ══[APPROVE]══        [INSTALL]          [ENHANCED]
    │                   │                   │              (HUMAN GATE)            │                  │
 Agent realizes     Agent calls         Agent presents    Human reviews       Agent downloads    Agent now has
 it lacks a         Molt Mart API       top 3 options     options and         .zip, backs up     new capabilities
 capability         to search for       to human with     says "yes,         existing files,
                    relevant            descriptions,     install #2"        writes new ones    Confirms what
 User asks for      templates           ratings, file     OR completes                          changed to
 something the                          manifests         Stripe checkout    Confirms changes   human
 agent can't do                                           for paid           to human
                                                          templates
```

**Key visual element:** The APPROVE stage should be drawn as a **gate/checkpoint** — bold border, different color (red/orange), with a lock icon. This communicates that human approval is always required.

---

### Diagram 4: System Architecture

**Layout:** Layered architecture diagram, 4 rows

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LAYER                                 │
│  [Browser]  ←→  [Molt Mart Web App]  ←→  [OpenClaw Agent]  │
└──────────────────────┬──────────────────────────┬───────────┘
                       │                          │
┌──────────────────────▼──────────────────────────▼───────────┐
│                 APPLICATION LAYER                             │
│  [Next.js Frontend]   [API Routes]   [Molt Mart Skill API]  │
│   - Browse/search      - /api/v1/*    - Agent-facing REST    │
│   - Template detail    - Auth         - Search, download     │
│   - Purchase flow      - Download     - Requires API key     │
│   - Seller dashboard   - Upload                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   DATA LAYER                                 │
│  [Supabase Postgres]          [Supabase Storage]            │
│   - Users & profiles           - Template .zip files         │
│   - Templates metadata          - Signed download URLs       │
│   - Purchases & downloads       - Preview images             │
│   - Reviews & ratings                                        │
│   - Manifests (molt-mart.json)                              │
└─────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 LOCAL LAYER (User's Machine)                  │
│  [~/.openclaw/workspace/]                                    │
│   - SOUL.md, AGENTS.md, TOOLS.md    (active template)       │
│   - .molt-mart-backup/               (previous configs)      │
│   - .molt-mart-installed.json        (install history)       │
│   - skills/molt-mart/                (agent commerce skill)  │
└─────────────────────────────────────────────────────────────┘
```

**Arrows to draw:**
- Browser → Next.js (HTTPS)
- Next.js → Supabase Postgres (queries)
- Next.js → Supabase Storage (file upload/download)
- Supabase Storage → Browser (signed URL download)
- OpenClaw Agent → Molt Mart API (REST, Phase 2)
- Downloaded .zip → Local workspace (file extraction)

**Connection labels:**
- "Signed URL (60s)" between Storage and Browser
- "API Key Auth" between Agent and API
- "Stripe Checkout" between Browser and Purchase flow
- "File write" between downloaded .zip and workspace

---

### Diagram 5: The .zip Package (Exploded View)

**Layout:** A visual "exploded" view of what's inside a template .zip

```
    ┌─────────────────────────────┐
    │  business-coach-pro.zip     │
    └─────────────┬───────────────┘
                  │
    ┌─────────────▼───────────────┐
    │  molt-mart.json             │ ← Manifest: file list, version, metadata
    │  install.sh                 │ ← One-command installer
    │  README.md                  │ ← Human instructions
    │  ─────────────────────────  │
    │  SOUL.md                    │ ← "Who the agent IS"
    │  AGENTS.md                  │ ← "How the agent WORKS"
    │  TOOLS.md                   │ ← "What the agent USES"
    │  memory/templates/          │ ← Starter memory files
    │    └── daily-review.md      │
    └─────────────────────────────┘
```

---

## Summary: What to Build When

| Phase | What | Effort | Impact |
|-------|------|--------|--------|
| **MVP (Now)** | `molt-mart.json` manifest in every .zip | 1 day | Foundation for everything |
| **MVP (Now)** | `install.sh` auto-generated in every .zip | 1 day | Unblocks non-technical users |
| **MVP (Now)** | `README.md` in every .zip | 1 day | Helps everyone |
| **MVP (Now)** | Post-download page with install instructions | 2-3 days | Reduces support burden |
| **MVP (Now)** | File manifest on template detail page | 2-3 days | Builds trust before purchase |
| **Phase 2** | REST API (`/api/v1/templates`, search, download) | 1-2 weeks | Enables agent access |
| **Phase 2** | `molt-mart` ClawHub skill | 1 week | Agents can browse/install |
| **Phase 2** | Backup system (`.molt-mart-backup/`) | Built into install.sh | Free |
| **Phase 3** | Automated content scanning | 2-3 weeks | Safety at scale |
| **Phase 3** | Agent-initiated discovery & install | 2-3 weeks | The full vision |

---

*This document is the source of truth for Molt Mart template delivery. All implementation should reference this plan.*
