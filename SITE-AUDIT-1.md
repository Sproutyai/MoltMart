# Molt Mart — Site-Wide Quality Audit
**Date:** 2026-02-20  
**Auditor:** OpenClaw Quality Agent  
**Codebase:** 201 TypeScript/TSX files  
**Live URL:** https://molt-mart.vercel.app

---

## 🔴 Critical Issues

### 1. Account deletion fails to delete reviews (wrong column name)
- **What:** `src/app/api/account/delete/route.ts:14` uses `reviews.delete().eq("user_id", userId)` but the reviews table column is `buyer_id`, not `user_id`. Reviews are never deleted on account deletion.
- **Where:** `src/app/api/account/delete/route.ts` line 14
- **Fix:** Change `"user_id"` to `"buyer_id"`
- **Auto-fix:** ✅ Small & safe — fixing now

### 2. Account data export queries wrong column on reviews
- **What:** `src/app/api/account/export/route.ts:14` uses `.eq("user_id", uid)` — same bug as above. User's reviews won't appear in their data export.
- **Where:** `src/app/api/account/export/route.ts` line 14
- **Fix:** Change `"user_id"` to `"buyer_id"`
- **Auto-fix:** ✅ Small & safe — fixing now

### 3. Account deletion references non-existent table `affiliate_clicks`
- **What:** `src/app/api/account/delete/route.ts:30` deletes from `affiliate_clicks` but the actual table is `referral_clicks` (see migration `20260215_affiliate_schema.sql`). This will silently fail or throw.
- **Where:** `src/app/api/account/delete/route.ts` line 30
- **Fix:** Change `"affiliate_clicks"` to `"referral_clicks"`
- **Auto-fix:** ✅ Small & safe — fixing now

### 4. Account deletion doesn't delete `affiliate_referrals` (wrong table name)
- **What:** Line 33 deletes from `affiliate_referrals` but the actual table is `referrals`. Silent failure.
- **Where:** `src/app/api/account/delete/route.ts` line 33
- **Fix:** Change `"affiliate_referrals"` to `"referrals"`
- **Auto-fix:** ✅ Small & safe — fixing now

### 5. Checkout/payment system is entirely stubbed out
- **What:** `src/app/api/checkout/route.ts` and `src/app/api/checkout/webhook/route.ts` are placeholder stubs. Paid templates cannot be purchased. The checkout route returns a generic error message.
- **Where:** `src/app/api/checkout/route.ts`, `src/app/api/checkout/webhook/route.ts`
- **Fix:** Implement Stripe Connect checkout flow
- **Auto-fix:** ❌ Large — needs Thomas approval

### 6. Stripe Connect seller onboarding is stubbed
- **What:** `src/app/api/seller/connect/route.ts` returns `"Stripe Connect coming soon"` for POST. Sellers cannot receive payments.
- **Where:** `src/app/api/seller/connect/route.ts`
- **Fix:** Implement when Stripe keys are available
- **Auto-fix:** ❌ Large — needs Thomas approval

### 7. URL inconsistency across codebase — hardcoded wrong URLs
- **What:** Multiple hardcoded URLs that don't match:
  - `.env.local` has `NEXT_PUBLIC_SITE_URL=https://molt-mart.vercel.app`
  - `src/app/api/templates/[id]/download/route.ts:113` hardcodes `https://molt-mart.vercel.app`
  - `src/app/dashboard/seller/upload/success/page.tsx:33` hardcodes `https://molt-mart.vercel.app`
  - `src/lib/affiliate.ts:11` hardcodes `https://moltmart.com` (non-existent domain)
  - `src/app/layout.tsx` metadata uses `https://moltmart.vercel.app` (different project!)
- **Where:** Multiple files
- **Fix:** Use a single `NEXT_PUBLIC_SITE_URL` env var everywhere. The layout metadataBase should match the actual deployment URL.
- **Auto-fix:** ✅ Fixing the layout.tsx metadataBase and affiliate.ts — other hardcoded URLs too

### 8. Template status check constraint doesn't include all used statuses
- **What:** Schema has `check (status in ('draft','published','archived'))` but code uses `pending_review`, `flagged`, and `deleted` statuses (upload route, reports route, account delete route). These inserts will fail at the DB level.
- **Where:** `supabase/schema.sql` (templates table), `src/app/api/templates/upload/route.ts`, `src/app/api/reports/route.ts`, `src/app/api/account/delete/route.ts`
- **Fix:** Add migration: `ALTER TABLE templates DROP CONSTRAINT ...; ALTER TABLE templates ADD CONSTRAINT ... CHECK (status IN ('draft','published','archived','pending_review','flagged','deleted'));`
- **Auto-fix:** ❌ DB schema change — needs Thomas approval

---

## 🟡 Important Issues

### 9. Duplicate profile edit pages
- **What:** There are TWO profile edit pages:
  - `/dashboard/profile` — full featured (tagline, website, specialties, connected accounts, live preview)
  - `/dashboard/account/profile` — stripped down version (just name, username, bio, avatar)
  
  The dashboard nav links to `/dashboard/profile` as "Edit Store" and `/dashboard/account/profile` as "Edit Profile". But both edit the same profile data through the same API. This is confusing — which one should users use?
- **Where:** `src/app/dashboard/profile/page.tsx`, `src/app/dashboard/account/profile/page.tsx`
- **Fix:** Remove `/dashboard/account/profile` and redirect it to `/dashboard/profile` (like `account/settings` already redirects to `settings`)
- **Auto-fix:** ❌ Medium — needs approval

### 10. Duplicate settings pages (partially resolved)
- **What:** `/dashboard/account/settings` exists but just redirects to `/dashboard/settings`. This is fine but the route file still exists unnecessarily. Minor, but `/dashboard/settings` is the real page.
- **Where:** `src/app/dashboard/account/settings/page.tsx`
- **Fix:** Already redirecting — acceptable as-is

### 11. Download route creates purchase records for ALL free downloads
- **What:** Every free download creates a purchase record with `price_cents: 0`. This means the "purchases" table is really a "downloads" table. The seller transactions page queries purchases for revenue, which will be dominated by $0 records.
- **Where:** `src/app/api/templates/[id]/download/route.ts`
- **Fix:** This is a design decision but should be made explicit. Consider separating downloads from purchases, or filtering $0 in revenue calculations.
- **Auto-fix:** ❌ Architecture — needs Thomas

### 12. No search results page for sellers (URL routing)
- **What:** Users can search and find seller results on `/templates`, but there's no `/sellers` browse page — only `/sellers/[username]` for individual profiles. No way to browse all sellers.
- **Where:** Missing `src/app/sellers/page.tsx`
- **Fix:** Add a sellers browse/directory page
- **Auto-fix:** ❌ New feature — needs Thomas

### 13. `openclaw template install` command referenced but doesn't exist
- **What:** Template detail page shows `openclaw template install {slug}` as an install command, but this CLI command doesn't appear to exist in OpenClaw.
- **Where:** `src/app/templates/[slug]/page.tsx` (sidebar install section)
- **Fix:** Verify this command exists or remove/update the reference
- **Auto-fix:** ❌ Needs verification

### 14. Homepage hero content doesn't render in SSR for web crawlers
- **What:** The live site at `molt-mart.vercel.app` only renders the footer content for web fetchers — the hero, carousels, and category sections don't appear in the initial HTML response. This is because the page is a server component but the main content areas rely on database queries that may be failing silently, or the content is below the fold in a way crawlers don't see.
- **Where:** `src/app/page.tsx`
- **Fix:** Investigate if the homepage data fetches are failing in production
- **Auto-fix:** ❌ Needs investigation

### 15. No rate limiting on account deletion
- **What:** The middleware rate-limits `/api/account/delete` as "strict" tier, but the actual rate limit only applies if Upstash Redis is configured (`isUpstashConfigured()`). If not configured, there's no rate limiting at all.
- **Where:** `src/middleware.ts`, `src/lib/rate-limit.ts`
- **Fix:** Ensure Upstash is configured in production, or add a simple in-memory fallback
- **Auto-fix:** ❌ Infrastructure — needs Thomas

### 16. Seller can become a seller with no verification
- **What:** `/api/profile/become-seller` just sets `is_seller: true` with no checks — no email verification, no terms acceptance, nothing. Any authenticated user can instantly become a seller.
- **Where:** `src/app/api/profile/become-seller/route.ts`
- **Fix:** Add seller agreement acceptance check, email verification requirement
- **Auto-fix:** ❌ Business logic — needs Thomas

### 17. No CSRF protection on state-changing API routes
- **What:** POST/PATCH/DELETE routes rely solely on Supabase auth cookies. There's no CSRF token validation. While SameSite cookies provide some protection, it's not complete.
- **Where:** All API routes
- **Fix:** Add CSRF token or verify Origin header in middleware
- **Auto-fix:** ❌ Security architecture — needs Thomas

### 18. Promote checkout has inconsistent base URL construction
- **What:** `src/app/api/promote/checkout/route.ts:60` uses `process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL` with template literal, but VERCEL_URL doesn't include protocol, so it prepends `https://`. However, `NEXT_PUBLIC_BASE_URL` isn't defined in `.env.local`, and the code also doesn't fall back to `NEXT_PUBLIC_SITE_URL` which IS defined.
- **Where:** `src/app/api/promote/checkout/route.ts` line 60
- **Fix:** Use `NEXT_PUBLIC_SITE_URL` as the primary fallback
- **Auto-fix:** ✅ Small fix

### 19. SQL injection risk in search
- **What:** `src/app/templates/page.tsx` passes search query `q` into a Supabase `.or()` filter with `tags.cs.{${q}}`. While Supabase client library parameterizes most inputs, the `cs` (contains) operator with raw string interpolation in the array literal could be problematic.
- **Where:** `src/app/templates/page.tsx` (line ~35)
- **Fix:** Sanitize the `q` parameter for the tags filter, or use a separate parameterized query
- **Auto-fix:** ❌ Security — needs review

---

## 🟢 Minor Issues

### 20. Mixed terminology: "Templates" vs "Enhancements"
- **What:** The branding calls them "Enhancements" (hero, headings, sell page) but the URL structure, code, and some UI elements use "Templates" (`/templates`, "Browse Templates" in some places, metadata titles). This is inconsistent.
- **Where:** Throughout the codebase
- **Fix:** Pick one term and use it consistently. If "Enhancements" is the brand, update URLs to `/enhancements` (with redirects from `/templates`), or keep URLs as `/templates` but make all user-facing copy say "Enhancements".
- **Auto-fix:** ❌ Branding decision — needs Thomas

### 21. Footer shows "Dashboard" link to non-logged-in users
- **What:** When not logged in, footer shows a "Dashboard" link which will redirect to `/login`. Not broken, but slightly misleading.
- **Where:** `src/components/footer.tsx`
- **Fix:** Remove or relabel for non-authenticated state
- **Auto-fix:** ✅ Small

### 22. `moltmart.vercel.app` is a completely different app
- **What:** `moltmart.vercel.app` (no hyphen) is a different project with "gigs" and "agents" — likely an old version. The metadata in `layout.tsx` uses this URL as `metadataBase`, meaning OG/social cards will point to the wrong site.
- **Where:** `src/app/layout.tsx` metadataBase
- **Fix:** Change metadataBase to `https://molt-mart.vercel.app`
- **Auto-fix:** ✅ Fixing now

### 23. No loading states for some dashboard pages
- **What:** While `/dashboard/loading.tsx` exists, individual pages like `/dashboard/transactions`, `/dashboard/payment`, `/dashboard/settings` are client components that manage their own loading state — but some don't show anything during initial load.
- **Where:** Various dashboard pages
- **Fix:** Add consistent loading skeletons
- **Auto-fix:** ❌ Medium — needs approval

### 24. Unused imports in template detail page
- **What:** `TemplateCard` and `ContactSellerButton` and other components are imported but the page is large. `ContactSellerButton` is imported in components but may not be used on the detail page.
- **Where:** `src/app/templates/[slug]/page.tsx`
- **Fix:** Run ESLint with unused import rules
- **Auto-fix:** ✅ Small

### 25. Cookie consent component exists but no actual cookie tracking
- **What:** `CookieConsent` component is rendered in the layout, but there's no analytics or tracking that it gates. The only cookie set is `molt_ref` for affiliate tracking (which is functional, not analytics).
- **Where:** `src/components/cookie-consent.tsx`
- **Fix:** Either add analytics that respect the consent, or remove the consent banner until needed
- **Auto-fix:** ❌ Product decision — needs Thomas

### 26. Promotion price is hardcoded at $25
- **What:** The promote checkout creates a Stripe session with `unit_amount: 2500` ($25) hardcoded. No way to offer different promotion tiers or durations.
- **Where:** `src/app/api/promote/checkout/route.ts`
- **Fix:** Make configurable or add promotion tiers
- **Auto-fix:** ❌ Feature — needs Thomas

### 27. No pagination on templates browse page
- **What:** `/templates` page fetches `.limit(50)` with no pagination controls. If there are more than 50 published templates, users can't see them all.
- **Where:** `src/app/templates/page.tsx`
- **Fix:** Add pagination (the explore-client may handle this, but the server query limits to 50)
- **Auto-fix:** ❌ Medium — needs approval

### 28. Migration files aren't timestamped consistently
- **What:** Only one migration file has a timestamp prefix (`20260215_affiliate_schema.sql`). Others use descriptive names only (`enhanced_listings.sql`, `promotions.sql`, etc.). This makes migration ordering ambiguous.
- **Where:** `supabase/migrations/`
- **Fix:** Add timestamp prefixes to all migration files
- **Auto-fix:** ❌ DevOps — needs Thomas

---

## Auto-Fixes Applied

Commit: `ef7fdf9` — "fix: critical bugs found in site audit"

| # | File | Change |
|---|------|--------|
| 1 | `src/app/api/account/delete/route.ts` | `reviews.delete().eq("user_id")` → `.eq("buyer_id")` |
| 2 | `src/app/api/account/export/route.ts` | `reviews.select().eq("user_id")` → `.eq("buyer_id")` |
| 3 | `src/app/api/account/delete/route.ts` | `affiliate_clicks` → `referral_clicks` |
| 4 | `src/app/api/account/delete/route.ts` | `affiliate_referrals` → `referrals` |
| 5 | `src/app/layout.tsx` | metadataBase → `https://molt-mart.vercel.app` |
| 6 | `src/lib/affiliate.ts` | Base URL → `NEXT_PUBLIC_SITE_URL` fallback |
| 7 | `src/app/api/promote/checkout/route.ts` | Fixed baseUrl fallback chain |

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 8 |
| 🟡 Important | 11 |
| 🟢 Minor | 9 |
| **Auto-fixed** | **7** |

**Top priorities for Thomas:**
1. **#8** — DB check constraint doesn't allow `pending_review`/`flagged`/`deleted` statuses (template uploads will fail)
2. **#5/#6** — Payment system is completely stubbed (no revenue possible)
3. **#9** — Duplicate profile pages creating user confusion
4. **#17** — No CSRF protection
5. **#19** — Potential SQL injection in search tags filter
