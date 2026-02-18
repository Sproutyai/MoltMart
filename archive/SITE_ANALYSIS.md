# Molt Mart — Site Analysis Report
**Date:** 2026-02-15  
**Analyst:** Site Analysis Agent

---

## A. Current State Summary

### Pages & Routes
| Route | Type | Description |
|-------|------|-------------|
| `/` | Server | Hero + featured templates (top 6 by downloads) + how-it-works + categories |
| `/templates` | Server | Browse all published templates with search (ilike title) + category filter |
| `/templates/[slug]` | Server | Template detail: description, preview (SOUL.md/AGENTS.md/files), reviews, download sidebar |
| `/login` | Client | Email/password login via Supabase Auth |
| `/signup` | Client | Email/password signup (username = email prefix) |
| `/dashboard` | Server | Buyer's download history (requires auth) |
| `/dashboard/seller` | Client | Seller dashboard: stats + template list, "Become a Seller" CTA |
| `/dashboard/seller/upload` | Client | Upload form: title, description, category, tags, .zip file |

### API Routes
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/templates/upload` | POST | Upload .zip, extract preview data, store in Supabase Storage |
| `/api/templates/[id]/download` | POST | Create purchase record, increment counter, return signed URL |
| `/api/profile/become-seller` | POST | Set `is_seller = true` on profile |
| `/api/reviews` | POST | Submit/upsert review (requires prior purchase) |

### Auth Flow
- Email/password via Supabase Auth (client-side `signInWithPassword` / `signUp`)
- Middleware refreshes auth cookies on every request
- Dashboard layout redirects unauthenticated users to `/login`
- Signup sends username in `raw_user_meta_data`; DB trigger creates profile row

### Data Model
- **profiles**: id, username, display_name, bio, avatar_url, is_seller
- **templates**: full metadata + file_path + preview_data (jsonb) + stats
- **purchases**: buyer_id + template_id (unique constraint, essentially "downloaded" record)
- **reviews**: buyer_id + template_id + rating + comment (requires purchase via RLS)
- RLS enabled on all tables. Storage bucket `templates` is private with folder-based auth.

### Current UI/UX Quality
- Clean, minimal design using shadcn/ui + Tailwind
- Dark mode NOT implemented (despite `next-themes` being installed)
- No logo/branding — just "Molt Mart" text
- No images/screenshots anywhere — entirely text-based cards
- Functional but feels like a prototype/skeleton

---

## B. Critical Issues (Must Fix)

### B1. Broken Navbar Links
The dropdown menu links are **wrong**:
- "My Downloads" → links to `/downloads` (should be `/dashboard`)
- "Seller Dashboard" → links to `/seller/dashboard` (should be `/dashboard/seller`)
- **These are 404s.** Users who log in and try to navigate via the dropdown get lost.

### B2. Download API Bug — RPC Parameter Name
The download API calls `supabase.rpc("increment_download_count", { template_id: id })` but the SQL function parameter is named `tid`:
```sql
create or replace function public.increment_download_count(tid uuid)
```
This will **silently fail** — download counts never increment.

### B3. No Email Confirmation Flow
Supabase signup likely requires email confirmation by default. There's no:
- Confirmation page ("check your email")
- Auth callback route (`/auth/callback`) for magic links
- Configuration to disable email confirmation
- Users may sign up and never get activated.

### B4. Empty Homepage on Fresh Deploy
The homepage shows "Featured Templates" only if templates exist in DB. On a fresh deploy with no data, the homepage shows just a hero and categories — looks broken/empty. **No seed data exists.**

### B5. Search Only Matches Title
`query.ilike("title", `%${q}%`)` — doesn't search description, tags, or long_description. Practically useless for discovery.

### B6. No Sorting Options
Templates are always sorted by `download_count DESC`. No way to sort by newest, rating, or alphabetical.

### B7. ReviewForm Not Rendered on Detail Page
The `ReviewForm` component exists but is **never imported or rendered** on the template detail page. Users can't actually leave reviews through the UI.

### B8. No Error Boundary
No `error.tsx` files anywhere. Any server error shows the default Next.js error page.

### B9. Seller Template Row Has No Actions
The seller dashboard shows templates but there's no way to:
- Edit a template
- Delete/archive a template
- View template detail from the dashboard
- It's a dead-end list.

---

## C. Missing Features for a Real Marketplace

### Discovery & Browsing
- [ ] **Full-text search** (description, tags, long_description — not just title)
- [ ] **Sort options**: newest, most downloaded, highest rated, recently updated
- [ ] **Pagination** — currently loads ALL templates at once
- [ ] **Featured/trending algorithm** — currently just download_count
- [ ] **"New" badge** for recently uploaded templates
- [ ] **Related templates** on detail page

### User Profiles
- [ ] **Public profile page** (`/u/[username]`) — avatar, bio, social links, templates list
- [ ] **Profile editing** — currently no way to change display_name, bio, avatar
- [ ] **Avatar upload** — avatar_url column exists but no upload mechanism
- [ ] **Social links** — not in schema at all

### Seller Experience
- [ ] **Edit template** — no edit functionality exists
- [ ] **Delete/archive template** — no way to remove published templates
- [ ] **Seller analytics** — basic stats exist but no charts, no time series, no per-template detail
- [ ] **Commission display** — "you earn 88%" type messaging
- [ ] **Seller verification/badges** — no trust indicators
- [ ] **Template versioning** — no way to push updates
- [ ] **Changelog/update notes** — buyers don't know when templates update

### Template Quality
- [ ] **Screenshots/images** — no visual preview at all, just code
- [ ] **Video demos** — for complex templates
- [ ] **README/documentation tab** — long_description is just a text field
- [ ] **Markdown rendering** — descriptions should support markdown
- [ ] **Live preview/sandbox** — aspirational but valuable
- [ ] **Compatibility badges** — "compatibility" field exists but unused meaningfully

### Payments (Future)
- [ ] **Stripe integration** — price_cents column exists but everything is hardcoded to free
- [ ] **Pricing tiers** — free, paid, premium
- [ ] **Seller payouts**
- [ ] **Purchase receipts**

### Trust & Safety
- [ ] **Report/flag system** — no way to report bad templates
- [ ] **Content moderation** — templates auto-publish with no review
- [ ] **Terms of service** page
- [ ] **Privacy policy** page
- [ ] **DMCA/takedown process**

### Social Features
- [ ] **Favorites/wishlist** — no way to save templates for later
- [ ] **Collections/lists** — curated template bundles
- [ ] **Follow sellers** — notifications for new templates
- [ ] **Share buttons** — social sharing

### SEO & Marketing
- [ ] **Per-page meta tags** — only root layout has metadata
- [ ] **OG images** — none configured
- [ ] **Sitemap** — none
- [ ] **robots.txt** — none
- [ ] **Structured data** (JSON-LD) for templates

---

## D. UI/UX Improvements Needed

### D1. Hero Section
- Generic text, no visual impact
- No illustration, animation, or product screenshot
- No social proof (e.g., "500+ templates, 2000+ downloads")
- CTA is just "Browse Templates" — could be more compelling

### D2. Template Cards
- No images/thumbnails — all cards look identical except text
- No hover effects beyond shadow
- "Free" badge is redundant on every card when everything is free
- Should show last-updated date

### D3. Template Detail Page
- No breadcrumbs
- Long description is rendered as plain `<p>` — no markdown support
- Preview section shows raw text — should have syntax highlighting
- Review form is missing (component exists but not used)
- No "share" button
- No "report" button
- Install command is great but should have a copy button

### D4. Navigation
- No mobile hamburger menu (sidebar is `hidden md:block` in dashboard, but main nav has no mobile menu)
- Navbar search is always visible — takes up space on mobile
- No breadcrumbs anywhere

### D5. Dashboard
- Sidebar is hidden on mobile with no alternative navigation
- No way to navigate between dashboard sections on mobile
- Seller stats cards are minimal — no sparklines or trends
- No "getting started" guide for new sellers

### D6. Branding
- No logo (just text "Molt Mart")
- No favicon (default Next.js)
- No brand colors beyond defaults
- Footer is a single line — feels unfinished

### D7. Dark Mode
- `next-themes` is installed but not used
- No theme toggle in the UI
- Site is light-only

### D8. Loading & Error States
- Root `loading.tsx` exists (spinner) — good
- No page-specific loading states
- No error.tsx files at any level
- No skeleton loaders for content

### D9. Empty States
- Templates page shows "No templates found" — adequate
- Dashboard shows empty state with link — good
- Homepage has no empty state for featured section

---

## E. Technical Debt

### E1. Type Safety
- Multiple `any` casts (purchases map, template detail)
- Repeated type assertions for joined queries (`as Template & { seller: ... }`)
- Should create proper joined types

### E2. Security Concerns
- **Slug injection**: Upload form trusts client-generated slug — could overwrite existing templates
- **No rate limiting** on any API routes
- **No CSRF protection** beyond Supabase's built-in
- **become-seller has no validation** — any user can become a seller instantly with one POST
- **File validation is minimal** — only checks `.zip` extension and size, no content scanning
- Storage policies use `auth.uid()::text = (storage.foldername(name))[1]` — correct but fragile

### E3. Performance
- Homepage makes a DB query on every request (no caching/ISR)
- Template detail page makes 3 sequential DB queries (template + reviews + purchase check)
- No `revalidate` or caching strategy
- No image optimization (because there are no images)
- All templates loaded at once on `/templates` — no pagination

### E4. Hardcoded Values
- `compatibility: "openclaw"` hardcoded in upload
- Price always 0 — "Free" displayed everywhere
- No environment-based configuration for limits

### E5. Missing Infrastructure
- No tests (unit, integration, or e2e)
- No CI/CD pipeline visible
- No monitoring/error tracking (Sentry, etc.)
- No analytics (PostHog, GA, etc.)
- No logging beyond console

### E6. Code Organization
- API routes handle both auth + business logic + storage — should be separated
- No shared validation between client forms and API routes
- `slugify` is defined in both `utils.ts` and `upload-form.tsx`

---

## F. Priority Action Items

### Tier 1 — Fix Broken Things (Day 1)
1. Fix navbar dropdown links (`/downloads` → `/dashboard`, `/seller/dashboard` → `/dashboard/seller`)
2. Fix `increment_download_count` RPC parameter name (`template_id` → `tid`)
3. Add ReviewForm to template detail page
4. Add auth callback route for email confirmation
5. Add error.tsx files

### Tier 2 — Make It Usable (Week 1)
6. Add seed data / sample templates
7. Full-text search (title + description + tags)
8. Sorting options on browse page
9. Pagination
10. Template edit/delete for sellers
11. Profile editing page
12. Mobile navigation (hamburger menu)
13. Dark mode toggle
14. Markdown rendering for descriptions
15. Copy button for install command

### Tier 3 — Make It Competitive (Month 1)
16. Template screenshots/images
17. Public profile pages
18. Favorites/wishlist
19. Per-page SEO meta tags + OG images
20. Sitemap + robots.txt
21. Template versioning
22. Seller analytics with charts
23. Logo + brand identity
24. Terms of service + privacy policy
25. Report/flag system

### Tier 4 — Scale (Quarter 1)
26. Stripe payments integration
27. Seller payouts
28. Content moderation queue
29. Email notifications
30. Analytics dashboard
31. API rate limiting
32. E2E tests
33. Error tracking (Sentry)

---

*This analysis covers the complete codebase as of 2026-02-15. The foundation is solid — Supabase auth, RLS, proper schema design, clean component structure. The main gaps are: broken navigation links, missing features expected in any marketplace, and no visual content (images/screenshots) to make templates appealing.*
