# ClawHub vs Molt Mart — Competitive Feature Gap Analysis

**Date:** 2026-02-20  
**Author:** Lead Planning Agent

---

## 1. ClawHub Feature Inventory

ClawHub (clawhub.ai) is the official free skill registry for OpenClaw agents. Key features discovered:

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Vector/Semantic Search** | Embeddings-powered search via `clawhub search` — natural language queries, not just keyword matching |
| 2 | **CLI Tool** | Full CLI (`clawhub` npm package) for install, update, publish, search, explore, inspect, sync, star |
| 3 | **Semantic Versioning** | Semver for all skills, changelogs, `latest` tag, version pinning on install/update |
| 4 | **Hash-Based Update Detection** | CLI hashes local files to detect changes and determine upgrade path |
| 5 | **Moderation System** | hide/delete/ban commands, user reporting (auto-hide after 3 reports, max 20 active reports per user) |
| 6 | **Star/Highlight System** | `clawhub star <slug>` to bookmark/highlight skills |
| 7 | **Skill Inspection** | `clawhub inspect <slug>` — view metadata and files without installing |
| 8 | **Bulk Sync/Publish** | `clawhub sync` scans local skills and auto-publishes new/updated ones |
| 9 | **GitHub Account Auth** | GitHub-based login with minimum 1-week account age for spam prevention |
| 10 | **700+ Skills Catalog** | Large community-contributed skill ecosystem |
| 11 | **Free/Open Model** | All skills are free, open platform |
| 12 | **Tags System** | Skills tagged for discovery (e.g., `latest=0.1.2`) |
| 13 | **Explore/Browse** | `clawhub explore` to browse latest updated skills |
| 14 | **Admin/Moderator Roles** | Distinct moderator commands (delete, hide, undelete, unhide, ban-user) |

**Notable Absence:** ClawHub does NOT have VirusTotal integration. They rely on community reporting + moderator review. VirusTotal has independently analyzed OpenClaw skills for malware but this is external, not built-in.

---

## 2. Molt Mart Current Feature Inventory

Molt Mart is a **paid marketplace** for OpenClaw agent templates (not just free skills). Current features:

| Feature | Status |
|---------|--------|
| Auth (Supabase — email/password, magic link) | ✅ |
| Browse & search templates by category | ✅ (keyword search) |
| Seller uploads (.zip packages) | ✅ |
| Buyer downloads (purchased templates) | ✅ |
| Reviews & ratings | ✅ |
| Seller dashboard + analytics | ✅ |
| Stripe payments/checkout | ✅ |
| Affiliate program | ✅ |
| Bookmarks | ✅ |
| Seller profiles + follow system | ✅ |
| Social linking (seller trust) | ✅ |
| Promoted listings (paid placement) | ✅ |
| Basic zip scanning (regex-based) | ✅ (local `scan-zip.ts`) |
| Seller payouts | ✅ |
| Transaction history + export | ✅ |
| DMCA/reporting | ✅ |
| Screenshots for listings | ✅ |
| Categories & tags (DB schema) | ✅ |
| Draft/published/archived status | ✅ |
| Compatibility field | ✅ (basic string) |

---

## 3. Feature Gap Analysis

| ClawHub Feature | Molt Mart Has? | Importance | Difficulty | Implement? |
|----------------|---------------|------------|------------|------------|
| **VirusTotal / Malware Scanning** | Partial (basic regex only) | 🔴 Critical | Medium | **YES — Priority 1** |
| **Semantic/Vector Search** | No (keyword only) | 🔴 Critical | Medium | **YES — Priority 2** |
| **CLI Install Integration** | No | 🟡 Important | Hard | **Later** |
| **Semantic Versioning + Changelogs** | No | 🟡 Important | Medium | **YES — Priority 3** |
| **Hash-Based Update Detection** | No | 🟢 Nice-to-have | Hard | **Later** (needs CLI) |
| **Skill/Template Inspection** | Partial (detail page) | 🟢 Nice-to-have | Easy | **Later** |
| **Bulk Sync/Publish** | No | 🟢 Nice-to-have | Hard | **No** (different model) |
| **Auto-Hide on 3 Reports** | No (manual reports exist) | 🟡 Important | Easy | **YES — Priority 4** |
| **GitHub Account Auth** | No (email-based) | 🟢 Nice-to-have | Medium | **Later** |
| **Publisher Verification Badges** | No | 🟡 Important | Easy | **YES — Priority 4** |
| **Explore/Trending Feed** | Partial (homepage carousels) | 🟢 Nice-to-have | Easy | **Later** |

### Why These Priorities?

1. **VirusTotal Scanning** — Thomas specifically flagged this. Molt Mart handles money, so trust/safety is table stakes. Current regex scan is rudimentary.
2. **Semantic Search** — ClawHub's killer differentiator. As catalog grows, keyword search won't cut it. Supabase supports pgvector natively.
3. **Versioning** — Sellers need to ship updates. Buyers need changelogs. Currently no version history at all.
4. **Auto-moderation + Verification** — Quick wins that dramatically improve trust.

---

## 4. Prioritized Implementation Plan — Agent Teams

### 🔴 CHUNK 1: VirusTotal / Advanced Malware Scanning (PRIORITY 1)
**Goal:** Scan every uploaded .zip with VirusTotal API before publishing. Show scan badge on listings.

| Agent | Role | Tasks |
|-------|------|-------|
| **Sub Agent 1** (Research) | VirusTotal API research | 1. Research VirusTotal API v3 (file upload, scan results, rate limits, pricing) 2. Analyze current `scan-zip.ts` flow 3. Determine where in upload pipeline to integrate 4. Document API contract and error handling |
| **Sub Agent 2** (Plan) | Architecture & DB plan | 1. Design `template_scans` table (template_id, vt_scan_id, status, results_json, scanned_at) 2. Plan async scanning flow (upload → pending → scan → published/flagged) 3. Design scan badge UI component 4. Write migration SQL + API route specs |
| **Sub Agent 3** (Implement) | Build it | 1. Add VirusTotal API client (`src/lib/virustotal.ts`) 2. Create `POST /api/templates/scan` route 3. Modify upload route to trigger VT scan 4. Add scan status to template detail page 5. Add `template_scans` table migration 6. Show "Scanned ✓" / "Pending Scan" / "Flagged ⚠️" badges |

**Estimated effort:** 2-3 days  
**Dependencies:** VirusTotal API key (free tier: 4 req/min, 500/day — sufficient for marketplace scale)

---

### 🔴 CHUNK 2: Semantic/Vector Search (PRIORITY 2)
**Goal:** Replace keyword search with embedding-based semantic search using Supabase pgvector.

| Agent | Role | Tasks |
|-------|------|-------|
| **Sub Agent 1** (Research) | Embedding strategy | 1. Research Supabase pgvector setup 2. Compare embedding models (OpenAI text-embedding-3-small vs alternatives) 3. Analyze current search implementation 4. Benchmark: how many templates exist? What fields to embed? |
| **Sub Agent 2** (Plan) | Architecture | 1. Design embedding column on templates table 2. Plan embedding generation pipeline (on publish + batch backfill) 3. Design search API with similarity threshold + hybrid (vector + keyword) 4. Write migration + API specs |
| **Sub Agent 3** (Implement) | Build it | 1. Enable pgvector extension in Supabase 2. Add `embedding vector(1536)` to templates 3. Create `match_templates` RPC function 4. Build embedding generation on upload/update 5. Update search API route 6. Update search UI to show relevance scores |

**Estimated effort:** 2-3 days  
**Dependencies:** OpenAI API key or alternative embedding provider

---

### 🟡 CHUNK 3: Version Management + Changelogs (PRIORITY 3)
**Goal:** Allow sellers to publish versioned updates with changelogs. Buyers see version history.

| Agent | Role | Tasks |
|-------|------|-------|
| **Sub Agent 1** (Research) | Requirements | 1. Analyze current template update flow 2. Research how ClawHub handles versions (semver parsing, tag system) 3. Survey seller needs — what metadata per version? 4. Look at how download route handles files |
| **Sub Agent 2** (Plan) | Architecture | 1. Design `template_versions` table (template_id, version, changelog, file_path, created_at) 2. Plan version upload flow (seller dashboard) 3. Design version history UI on template detail page 4. Migration SQL + route specs |
| **Sub Agent 3** (Implement) | Build it | 1. Create `template_versions` table + RLS 2. Add version upload form to seller dashboard 3. Modify download route to serve specific version 4. Add version history section to template detail page 5. Add `current_version` field to templates table |

**Estimated effort:** 2 days  
**Dependencies:** None

---

### 🟡 CHUNK 4: Trust & Safety Quick Wins (PRIORITY 4)
**Goal:** Auto-hide templates with 3+ reports. Add publisher verification badges.

| Agent | Role | Tasks |
|-------|------|-------|
| **Sub Agent 1** (Research) | Current state | 1. Analyze existing reports table/API 2. Check current report flow end-to-end 3. Research verification badge best practices |
| **Sub Agent 2** (Plan) | Design | 1. Plan auto-hide trigger (DB function on report insert) 2. Design verified seller criteria + badge 3. Plan admin review queue for flagged items |
| **Sub Agent 3** (Implement) | Build it | 1. Add DB trigger: auto-set `status='flagged'` when report_count >= 3 2. Add `is_verified` to profiles + badge component 3. Add admin route to verify sellers 4. Show badges on seller profiles and template cards |

**Estimated effort:** 1 day  
**Dependencies:** None

---

## 5. Key Strategic Differences

| Aspect | ClawHub | Molt Mart |
|--------|---------|-----------|
| **Model** | Free, open registry | Paid marketplace with Stripe |
| **Content** | Skills (SKILL.md bundles) | Templates (.zip packages) |
| **Discovery** | CLI-first + vector search | Web-first + keyword search |
| **Revenue** | None (community) | Commissions on sales |
| **Trust** | Community reports + mods | Should be stronger (handles money!) |
| **Install** | CLI one-command | Manual download |

**Molt Mart advantages over ClawHub:**
- Monetization for creators (Stripe payments)
- Affiliate program
- Promoted listings
- Seller analytics/dashboard
- Social linking/trust signals
- Bookmarks
- Screenshots/previews
- Review responses

**Molt Mart should NOT copy:**
- CLI-first approach (Molt Mart is web-first, different audience)
- Free-only model (paid marketplace is the differentiator)
- GitHub-only auth (email auth is fine for marketplace)

---

## 6. Recommended Execution Order

```
Week 1:  CHUNK 4 (Trust quick wins — 1 day) → CHUNK 1 (VirusTotal — 2-3 days)
Week 2:  CHUNK 2 (Semantic search — 2-3 days) → CHUNK 3 (Versioning — 2 days)
```

Total estimated effort: ~8 days of agent work.

---

## 7. Agent Deployment Command Reference

To kick off each chunk, spawn 3 sub-agents in sequence:
1. **Research agent** — gathers info, writes `CHUNK-X-RESEARCH.md`
2. **Planning agent** — reads research, writes `CHUNK-X-PLAN.md` with exact specs
3. **Implementation agent** — reads plan, writes code + migrations

Start with **Chunk 4** (quick win) then **Chunk 1** (Thomas's priority).
