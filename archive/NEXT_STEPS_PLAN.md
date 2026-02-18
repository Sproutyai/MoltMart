# Molt Mart — Next Steps Build Plan

*Critical review by Agent 2 — Feb 16, 2026*

## Agent 1's Analysis: What's Right and What's Wrong

Agent 1 correctly identified the re-engagement gap. But the analysis is biased toward building a **mature marketplace** when we have **zero users**. Half the proposals solve problems that don't exist yet.

### Feature-by-Feature Critique

| Feature | Agent 1 Says | My Take |
|---------|-------------|---------|
| **Version updates/notifications** | Must-have | **Premature.** Zero templates exist. No one is updating anything. Build when sellers actually ship updates. |
| **Wishlists/bookmarks** | Must-have | **Yes, but for demo polish.** Makes the site feel like a real marketplace. Dead simple to build. |
| **Seller analytics** | Should-have | **Not now.** Analytics with zero data is a sad empty dashboard. Wait for real traffic. |
| **Template versioning** | Must-have | **Premature.** Same reason as updates. There's nothing to version. |
| **One-click install** | Must-have | **Yes — but the delivery system plan already covers this.** Build the .zip manifest approach from DELIVERY_SYSTEM_PLAN.md. This IS the core UX promise. |
| **File preview** | Should-have | **YES. Best bang-for-buck feature.** preview_data already exists, just needs UI. Makes templates feel transparent and trustworthy. |
| **Q&A / comments** | Should-have | **Not now.** Zero users = zero questions. Build after launch. |
| **Email notifications** | Must-have | **Not now.** You need users to email. Premature optimization. Set up Resend after launch. |
| **Bundles** | Should-have | **Not now.** You need multiple templates first. |
| **Community/social** | Should-have | **Not now.** |
| **Similar templates** | Quick win | **Yes.** Makes browse pages feel rich even with few templates. |
| **Weekly digest** | Quick win | **Not now.** Digest of what? Zero activity? |

### The Real Question: What Makes This Look Ready?

A first-time visitor (potential seller or buyer) needs to see:
1. **Professional, complete-feeling UI** — ✅ already good after homepage overhaul
2. **Clear value prop for sellers** — sell page exists, but upload → what happens?
3. **Trustworthy download experience** — the actual .zip delivery + install flow
4. **Template pages that sell** — file previews, similar templates, polished detail page
5. **Basic interactivity** — wishlists, a reason to create an account

What they DON'T need to see: version history, changelogs, analytics dashboards, email preferences, Q&A threads, bundles. All of that screams "we built features for users we don't have."

---

## FINAL BUILD PLAN: 6 Features, 2 Chunks

### Priority Order

1. **Wishlist/Bookmarks** — makes site feel interactive, gives reason to sign up
2. **Template File Preview** — biggest trust builder, data already exists
3. **Similar Templates** — makes browse feel rich
4. **Download Delivery (ZIP manifest)** — the actual product delivery mechanism
5. **Seller "What to Expect" flow polish** — after upload, what happens? Confirmation, preview of listing
6. **Seed/Demo Templates** — create 3-5 real example templates so the site isn't empty

---

### CHUNK 1: Browse & Discovery Polish (Features 1-3)

**Goal:** Make browsing feel like a real, interactive marketplace.

#### Feature 1: Wishlist/Bookmarks
- **DB:** New table `bookmarks` (`id`, `user_id`, `template_id`, `created_at`) with unique constraint on (user_id, template_id)
- **API:** `POST/DELETE /api/bookmarks` — toggle bookmark
- **API:** `GET /api/bookmarks` — list user's bookmarks
- **UI:** Heart icon on every template card (filled when bookmarked, outline when not). Click toggles. Optimistic UI update.
- **Page:** `/dashboard/bookmarks` — grid of bookmarked templates, reuse existing template card component
- **Nav:** Add "Bookmarks" to dashboard sidebar
- **Files to create:** `src/app/api/bookmarks/route.ts`, `src/app/dashboard/bookmarks/page.tsx`, `src/components/BookmarkButton.tsx`
- **Files to modify:** Template card component (add heart icon), dashboard layout (add nav item)

#### Feature 2: Template File Preview
- **Where:** Template detail page (`src/app/templates/[slug]/page.tsx`)
- **What:** Tabbed viewer showing SOUL.md, AGENTS.md, TOOLS.md, and file tree from `preview_data`
- **UI:** Tabs below description, above reviews. Syntax-highlighted markdown/code rendering. If `preview_data` is empty, show "Preview not available" gracefully.
- **Library:** Use existing markdown renderer or add `react-syntax-highlighter` (lightweight)
- **Files to create:** `src/components/TemplatePreview.tsx`
- **Files to modify:** Template detail page

#### Feature 3: Similar Templates
- **Where:** Template detail page, below reviews
- **What:** "Similar Enhancements" section showing 4 templates from same category (excluding current), ordered by download_count desc
- **API:** Simple Supabase query — same category, limit 4, exclude current ID
- **UI:** Horizontal row of existing template cards
- **Files to create:** `src/components/SimilarTemplates.tsx`
- **Files to modify:** Template detail page

---

### CHUNK 2: Delivery & Content (Features 4-6)

**Goal:** Make the actual download work properly and ensure the site has content.

#### Feature 4: Download Delivery (ZIP with manifest)
- **Reference:** `DELIVERY_SYSTEM_PLAN.md` (already planned)
- **What:** When buyer clicks download, serve a .zip containing:
  - Template files (SOUL.md, AGENTS.md, etc.)
  - `molt-mart.json` manifest (template name, version, author, install path hints)
  - `install.sh` (simple script: copy files to ~/.openclaw/)
  - `README.md` (setup instructions)
- **API:** Modify `/api/templates/[id]/download/route.ts` to generate zip on-the-fly (use `archiver` or `jszip` package)
- **UI:** After download, show a modal/toast with "How to install" — 3 options (manual, script, tell your agent)
- **Files to modify:** Download API route, template detail page (post-download modal)
- **Files to create:** `src/lib/zip-builder.ts`, `src/components/InstallGuide.tsx`

#### Feature 5: Post-Upload Confirmation
- **What:** After seller uploads a template, show a confirmation page with:
  - Preview of how their listing looks
  - Link to their live listing
  - "Share on X" button
  - Tips for getting downloads (add screenshots, write good description)
- **Currently:** Upload probably just redirects to dashboard. That's anticlimactic.
- **Files to create:** `src/app/dashboard/seller/upload/success/page.tsx`
- **Files to modify:** Upload flow (redirect to success page with template ID)

#### Feature 6: Seed Templates
- **What:** Create 3-5 real, high-quality example templates that showcase what Molt Mart offers. NOT fake data — actual useful OpenClaw configurations.
- **Examples:**
  - "Professional Email Writer" (Mindset) — SOUL.md that makes your agent write polished emails
  - "Code Reviewer" (Technical) — AGENTS.md for thorough code review
  - "Research Assistant" (Knowledge) — Multi-file setup for research workflows
- **How:** Upload via the existing seller flow using Thomas's account (or a "Molt Mart Official" account)
- **This is content, not code** — but it's the most important thing for making the site not look empty

---

## What NOT to Build Yet

| Feature | Why Not |
|---------|---------|
| Template versioning/changelogs | Zero templates to version |
| Email notifications | Zero users to email |
| Seller analytics | Zero data to analyze |
| Q&A / comments | Zero users asking questions |
| Bundles | Need templates first |
| Community/social feed | Need community first |
| Search autocomplete | Need search volume first |
| Seller tiers/badges | Need sellers first |
| Template reporting | Need templates to report |

**Rule of thumb:** If the feature requires existing users/content to be useful, don't build it pre-launch.

---

## Summary

| Chunk | Features | Estimated Effort | Impact |
|-------|----------|-----------------|--------|
| **Chunk 1** | Bookmarks, File Preview, Similar Templates | 1 day | Site feels interactive and rich |
| **Chunk 2** | ZIP Delivery, Post-Upload Flow, Seed Templates | 1-2 days | Product actually works end-to-end |

**Total: 6 features, ~2-3 days, 2 sub-agent runs.**

After these are done, the site is a complete, polished marketplace that works end-to-end. THEN we launch, get users, and build the re-engagement features (email, versioning, analytics) when there's actual activity to engage with.
