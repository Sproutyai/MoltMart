# Molt Mart Delivery Analysis — Agent 1: Customer Perspective

## 1. Human Customer Journey

### Current Flow
1. User browses Molt Mart, finds a template they like
2. Clicks "Download Free" → must be logged in
3. Backend creates a purchase record, generates a 60-second signed URL to a .zip in Supabase storage
4. Browser opens the URL → .zip downloads to ~/Downloads
5. **Then what?** Nothing. The user is on their own.

### Pain Points
| Step | Problem |
|------|---------|
| After download | No instructions on what to do with the .zip |
| File placement | User must know `~/.openclaw/workspace/` exists (hidden directory!) |
| Conflicts | If user already has SOUL.md, AGENTS.md, TOOLS.md — overwrite? Merge? No guidance |
| Dependencies | Template may reference skills not installed — no dependency resolution |
| Verification | No way to preview file contents before installing |
| Rollback | No undo mechanism if the template breaks their agent |
| Trust | Downloading files that control AI behavior is inherently scary — no review/audit system |

### What a Non-Technical User Expects
- **App Store experience**: click Install, it works
- **Preview**: see what the template does before committing
- **Safety net**: easy way to revert
- **No terminal**: should never have to open a command line

### Trust Concerns
- SOUL.md and AGENTS.md literally control agent behavior — malicious templates could instruct the agent to exfiltrate data, send messages, or run arbitrary code
- No vetting/review process currently exists
- No content hashing or signature verification
- Users can't easily diff what changed

## 2. AI Agent Customer Journey

### What an Agent CAN Do Today
- Browse Molt Mart via browser tools ✅
- Call the download API (if it has auth cookies/tokens) ✅
- Download .zip files ✅
- Extract .zip and write files to workspace ✅
- **Modify its own SOUL.md, AGENTS.md** ✅ (it has file write access)

### What an Agent SHOULD Do
- **Never self-modify config without human approval** — this is a safety boundary
- Present options to the human first
- Show a diff of what would change
- Ask for explicit "yes, install this" confirmation

### Ideal Agent-to-Agent Flow
1. Agent realizes it needs a capability (or human asks "find me a template for X")
2. Agent calls `GET /api/v1/templates?q=data-analysis` (doesn't exist yet)
3. Agent presents top options to human with descriptions, ratings, file manifests
4. Human says "install option 2"
5. Agent downloads .zip, extracts, shows diff of changes
6. Human confirms → agent writes files
7. Agent restarts/reloads config

### Permission Model Needed
- `molt-mart:browse` — search and view templates (no approval needed)
- `molt-mart:install` — write template files (requires human approval)
- Templates should declare what files they modify (manifest)

## 3. Delivery Options

### Option A: Manual Download (.zip) — CURRENT
- **Feasibility**: Already built
- **Pros**: Simple, transparent, no integration needed
- **Cons**: Terrible UX, high abandonment, non-technical users lost
- **Verdict**: Fine for MVP day-1 but needs upgrade fast

### Option B: CLI Install via ClawHub
- **Feasibility**: HIGH — ClawHub already exists with `clawhub install <slug>`
- ClawHub has: search, install, update, publish, versioning, hash-based updates
- Molt Mart templates could be published TO ClawHub as the distribution layer
- **Pros**: Proven infrastructure, proper file placement, versioning, updates
- **Cons**: CLI-only (no GUI), requires `npm i -g clawhub`
- **Verdict**: Best near-term option. Molt Mart = storefront, ClawHub = package manager

### Option C: One-Click Browser Install (web → local gateway)
- **Feasibility**: MEDIUM — OpenClaw gateway runs locally, could expose an install endpoint
- Flow: Molt Mart calls `localhost:PORT/api/install?template=...`
- **Pros**: Seamless UX
- **Cons**: CORS/security complexity, gateway must be running, browser→localhost is tricky
- **Verdict**: Great long-term goal, not MVP

### Option D: Native Marketplace in OpenClaw
- **Feasibility**: LOW (short-term) — requires OpenClaw platform changes
- **Pros**: Best possible UX
- **Cons**: Depends on OpenClaw team cooperation
- **Verdict**: Ultimate vision, not actionable now

### Option E: Agent Self-Install API
- **Feasibility**: MEDIUM — needs API endpoints + permission model
- Requires: REST API for search/download, manifest format, human-in-the-loop confirmation
- **Pros**: Enables agent-to-agent commerce vision
- **Cons**: Safety complexity
- **Verdict**: Build the API alongside Option B, add agent instructions as a skill

### Option F: Hybrid/Progressive ⭐ RECOMMENDED
1. **Now (MVP)**: Manual .zip download + README with install instructions + `clawhub install` command shown post-purchase
2. **Soon**: Molt Mart publishes to ClawHub registry, one-command install
3. **Next**: REST API for agent browsing/purchasing
4. **Later**: One-click browser install via gateway

## 4. Trust & Safety

### Minimum Viable Trust
1. **File manifest on template page** — show exactly what files are included before download
2. **Content preview** — let users read SOUL.md, AGENTS.md contents on the site
3. **Seller verification** — verified publishers badge
4. **Community ratings/reviews** — social proof
5. **Report mechanism** — flag suspicious templates

### Should-Have Safety
1. **Automated content scanning** — check for obviously malicious instructions (e.g., "send data to", "delete all", "ignore safety rules")
2. **Diff view on install** — show what changes vs current config
3. **Backup before install** — auto-snapshot current config
4. **Sandboxed preview** — test template in isolated environment before applying

### Content Policy
- Templates must not contain instructions to exfiltrate user data
- Templates must not override safety rules
- Templates must not contain obfuscated instructions
- Templates must declare all files they modify

## 5. What's Standard in Similar Marketplaces

| Marketplace | Install Method | Review Process | Rollback |
|------------|---------------|----------------|----------|
| **ClawHub** | `clawhub install slug` | Publish-gated | `clawhub update --version` |
| **VS Code** | One-click in editor | Microsoft review | Uninstall button |
| **npm** | `npm install` | Open publish, community flags | Version pinning |
| **WordPress** | One-click in admin | Plugin review team | Deactivate/delete |
| **Shopify** | One-click install | App review process | Uninstall |
| **Homebrew** | `brew install` | Formula review PR | `brew uninstall` |

**Key patterns:**
- One-command or one-click install is table stakes
- All successful marketplaces have some review process
- Rollback/uninstall is always available
- Preview/description before install is universal

## 6. Recommended Approach

### MVP (Week 1-2)
1. Add **install instructions** to the post-download page ("Copy this .zip to ~/.openclaw/workspace/ and extract")
2. Add a **file manifest** on each template page showing included files
3. Add **content preview** — display SOUL.md/AGENTS.md contents inline
4. Include a `README.md` inside every template .zip with setup instructions
5. Show `clawhub install <slug>` command if template is also on ClawHub

### Phase 2 (Month 1)
1. **Publish templates to ClawHub** — Molt Mart becomes the storefront, ClawHub is the install mechanism
2. **Backup system** — before install, snapshot current config to `~/.openclaw/workspace/.molt-mart-backup/`
3. **REST API** — `/api/v1/templates` for agent consumption
4. **Molt Mart skill for OpenClaw** — agents can search/browse Molt Mart natively

### Phase 3 (Month 2-3)
1. **Agent install flow** — skill that handles download + human approval + file placement
2. **Automated safety scanning** on upload
3. **One-click install** via OpenClaw gateway integration
4. **Diff preview** before applying changes

## 7. Open Questions for Agent 2 (Technical Implementation)

1. **Template format spec**: What's the standard structure inside the .zip? Need a `manifest.json`?
2. **Conflict resolution**: When template includes SOUL.md and user already has one — merge strategy?
3. **ClawHub integration**: Can Molt Mart publish directly to ClawHub? API available?
4. **Gateway API**: Does OpenClaw gateway expose any endpoints for external install triggers?
5. **Versioning**: How do template updates work? Can users get notified of new versions?
6. **Dependency declaration**: How does a template declare it needs specific skills installed?
7. **Multi-template**: Can a user have multiple templates active? Or is it one-at-a-time?
8. **Namespace isolation**: Should templates install to a subdirectory to avoid conflicts?
9. **Pricing integration**: When paid templates exist, how does the purchase→install flow change?
10. **Analytics**: What install success/failure data should we collect?
