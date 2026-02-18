# Molt Mart — Listings Feature Analysis

> Generated 2025-02-15 by Listings Planning Agent (1/3)

---

## A. Current State Assessment

### What Exists
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | text | ✅ | |
| description | text | ✅ | Short, single line |
| long_description | text | ❌ | Plain text, no markdown rendering |
| category | text | ✅ | 8 fixed categories |
| tags | text[] | ❌ | Comma-separated input |
| price_cents | integer | ✅ | Free/paid radio, paid not functional yet |
| file (.zip) | file | ✅ | Max 10MB, extracts SOUL.md + AGENTS.md previews |
| compatibility | text | auto | Hardcoded to "openclaw" on upload |
| preview_data | jsonb | auto | soul_md, agents_md, file_list from zip |
| status | text | auto | draft/published/archived |

### What's Good
- Clean upload flow with slug auto-generation
- Automatic zip preview extraction (SOUL.md, AGENTS.md, file list) — unique differentiator
- Review/rating system in place
- Download count tracking
- "More by this seller" section on detail page
- Install command shown on detail page

### What's Lacking
1. **No images/screenshots** — biggest gap. Buyers can't visually evaluate templates
2. **No setup instructions** — buyers don't know what's needed to use the template
3. **No model compatibility info** — critical for AI templates (Claude-only? GPT-4 compatible?)
4. **No version tracking** — no way to update a template or show changelog
5. **Long description has no markdown support** — just renders as `<p>` text
6. **Categories too narrow** — missing "Other" (Thomas requested), Education, Finance, etc.
7. **No requirements/prerequisites field** — API keys? Tools? Node access?
8. **No license info** — important for commercial use
9. **No demo video support** — video links would help showcase complex agents
10. **Price not passed in upload API** — `price_cents` hardcoded to 0 in route.ts despite form support

---

## B. Recommended New Fields

### Must-Have (MVP)

| Field | DB Column | Type | Required | Description |
|-------|-----------|------|----------|-------------|
| **Screenshots** | `screenshots` | `text[]` | ❌ | Array of Supabase storage URLs. Up to 5 images. First = hero image on cards. |
| **Setup Difficulty** | `difficulty` | `text` | ✅ | `beginner` / `intermediate` / `advanced`. Helps buyers self-select. |
| **AI Models** | `ai_models` | `text[]` | ❌ | e.g. `['claude-sonnet', 'gpt-4o']`. Which models the template is designed for. |
| **Requirements** | `requirements` | `text` | ❌ | Markdown text. API keys needed, tools required, etc. |
| **Version** | `version` | `text` | ❌ | Semver string, e.g. `1.0.0`. Default `1.0.0`. |
| **License** | `license` | `text` | ❌ | `MIT` / `Apache-2.0` / `Commercial` / `Custom`. Default `MIT`. |
| **Demo Video URL** | `demo_video_url` | `text` | ❌ | YouTube/Loom link. Embedded on detail page. |
| **Markdown Long Desc** | *(existing `long_description`)* | — | — | Render as markdown instead of plain text. No schema change needed. |

### Nice-to-Have (Post-MVP)

| Field | DB Column | Type | Description |
|-------|-----------|------|-------------|
| **Changelog** | `changelog` | `jsonb` | Array of `{version, date, notes}` objects. |
| **Setup Instructions** | `setup_instructions` | `text` | Separate markdown field for step-by-step setup. |
| **FAQ** | `faq` | `jsonb` | Array of `{question, answer}` pairs. |
| **Support URL** | `support_url` | `text` | Link to docs, Discord, GitHub issues. |
| **Language Support** | `languages` | `text[]` | e.g. `['en', 'es', 'fr']` for multi-language agents. |
| **Featured** | `is_featured` | `boolean` | Admin-curated spotlight. |
| **OpenClaw Version** | `openclaw_version` | `text` | Minimum OpenClaw version, e.g. `>=0.2.0`. Replace current `compatibility`. |

---

## C. Recommended New Categories

```typescript
export const CATEGORIES = [
  'Productivity',
  'Coding',
  'Writing',
  'Research',
  'Communication',
  'Automation',
  'Security',
  'Personality',
  'Education',
  'Finance',
  'Data Science',
  'DevOps',
  'Entertainment',
  'Other',          // ← Thomas requested this
] as const
```

Keep it flat (no sub-categories) for MVP. Tags handle specificity.

---

## D. UI/UX Recommendations

### Upload Form — Multi-Section Layout

Reorganize from single scroll into collapsible sections (NOT wizard steps — too annoying for power users):

**Section 1: Basics** (expanded by default)
- Title, Short Description, Category, Tags

**Section 2: Details** (expanded)
- Long Description (markdown editor with preview toggle)
- Setup Difficulty selector (3 icons: 🟢 Beginner / 🟡 Intermediate / 🔴 Advanced)
- AI Models (multi-select checkboxes: Claude, GPT-4, Gemini, Llama, Other)
- Requirements (textarea)

**Section 3: Media** (expanded)
- Screenshots (drag-and-drop, up to 5, with reorder)
- Demo Video URL

**Section 4: File & Pricing** (expanded)
- .zip upload
- Free/Paid toggle + price
- Version number
- License dropdown

### Detail Page Enhancements

```
┌─────────────────────────────────────┐  ┌──────────────┐
│ [Screenshot carousel / hero image]  │  │ Price: Free   │
│                                     │  │ [Download]    │
│ Category · Tags                     │  │               │
│ Title                               │  │ Difficulty: 🟢│
│ by @seller                          │  │ Models: Claude│
│ ★★★★☆ 4.2 (15 reviews)            │  │ Version: 1.2  │
│                                     │  │ License: MIT  │
│ ── Description (markdown) ───       │  │ Downloads: 42 │
│ ...                                 │  │ Updated: ...  │
│                                     │  │               │
│ ── Requirements ───                 │  │ ── Install ── │
│ - OpenRouter API key                │  │ openclaw ...  │
│ - Node.js 18+                       │  │               │
│                                     │  └──────────────┘
│ ── Preview (SOUL.md / file list) ── │
│ ── Demo Video (embedded) ────────── │
│ ── Reviews ───                      │
│ ── More by seller ───               │
└─────────────────────────────────────┘
```

Key changes:
- Screenshot carousel at top (biggest visual impact)
- Markdown rendered long_description
- Requirements section before preview
- Difficulty + AI models in sidebar
- Embedded video player if demo_video_url present

---

## E. Database Changes Needed

### Migration SQL

```sql
-- New columns on templates table
ALTER TABLE public.templates
  ADD COLUMN screenshots text[] DEFAULT '{}',
  ADD COLUMN difficulty text DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  ADD COLUMN ai_models text[] DEFAULT '{}',
  ADD COLUMN requirements text,
  ADD COLUMN version text DEFAULT '1.0.0',
  ADD COLUMN license text DEFAULT 'MIT',
  ADD COLUMN demo_video_url text;

-- Storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload screenshots
CREATE POLICY "screenshots_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "screenshots_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'screenshots');
CREATE POLICY "screenshots_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### TypeScript Type Update

Add to `Template` interface:
```typescript
screenshots: string[]
difficulty: 'beginner' | 'intermediate' | 'advanced'
ai_models: string[]
requirements: string | null
version: string
license: string
demo_video_url: string | null
```

### Constants Update

```typescript
export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const
export const AI_MODELS = ['Claude', 'GPT-4', 'GPT-4o', 'Gemini', 'Llama', 'Mistral', 'Other'] as const
export const LICENSES = ['MIT', 'Apache-2.0', 'GPL-3.0', 'Commercial', 'Custom'] as const
```

---

## F. Priority Ranking

### 🔴 P0 — Must ship (MVP)
1. **Add "Other" category** — 5 min change, Thomas asked for it
2. **Markdown rendering for long_description** — swap `<p>` for a markdown renderer
3. **Screenshots upload + display** — biggest UX win, needs storage bucket + upload UI
4. **Fix price_cents in upload route** — currently hardcoded to 0, form already supports it
5. **Difficulty level** — simple dropdown, high buyer value
6. **AI Models field** — core info for an AI template marketplace

### 🟡 P1 — Should ship soon
7. **Requirements field** — textarea, easy to add
8. **Version number** — text input with default
9. **License selector** — dropdown
10. **Demo video URL** — text input + YouTube/Loom embed
11. **New categories** (Education, Finance, Data Science, DevOps, Entertainment)

### 🟢 P2 — Nice to have
12. **Changelog (jsonb)** — needs its own UI for managing entries
13. **Setup instructions** — separate markdown field
14. **FAQ section** — jsonb with Q&A pair editor
15. **Support URL**
16. **Language support tags**
17. **Featured/spotlight flag** — admin-only

### 🔵 P3 — Future
18. **Template bundles** — multiple templates in one listing
19. **Subscription model** — recurring access
20. **Template versioning** — upload new versions, buyers get updates
21. **A/B test different screenshots** — seller analytics
