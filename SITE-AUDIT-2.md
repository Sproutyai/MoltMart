# 🔍 Molt Mart — Backend, API & Database Security Audit

**Date:** 2025-02-20
**Auditor:** Agent 2 (Backend/API/DB/Security)
**Scope:** All API routes, database schema, RLS policies, auth flows, Stripe integration, file handling

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 6 |
| 🟡 Important | 12 |
| 🟢 Minor | 9 |

---

## 🔴 Critical Issues

### C1: `promote/track` and `promote/track-batch` — No Authentication Required
**Files:** `src/app/api/promote/track/route.ts`, `src/app/api/promote/track-batch/route.ts`

These endpoints have **zero authentication**. Anyone can:
- Inflate impression/click counts for any template
- Call `increment_promotion_stat` RPC (which is `SECURITY DEFINER`) to manipulate stats

The `track-batch` endpoint additionally accepts an array of templateIds with no size limit, enabling bulk manipulation.

**Impact:** Promotion stats are completely untrustworthy. Sellers who pay $25 to promote get unfair results. Competitors can inflate their own stats or sabotage others (inflating clicks without conversions looks like fraud).

**Recommendation:** Add rate limiting per IP, CAPTCHA or signed tokens for legitimate frontend calls, and cap batch sizes.

---

### C2: `notification_prefs` — Arbitrary JSON Injection into Profile
**File:** `src/app/api/account/notifications/route.ts`

The PUT handler writes `await request.json()` directly into `profiles.notification_prefs` (a JSONB column) with **zero validation**. An authenticated user can store arbitrary JSON of unlimited size:
```js
const prefs = await request.json()
// No validation at all
await supabase.from("profiles").update({ notification_prefs: prefs }).eq("id", user.id)
```

**Impact:** Database bloat (store gigabytes in a single JSONB field), potential DoS, and stored XSS if this data is ever rendered without sanitization.

**Recommendation:** Validate against a strict schema (only boolean fields for known keys), reject unknown keys, enforce max size.

---

### C3: Account Deletion References Non-Existent Tables
**File:** `src/app/api/account/delete/route.ts`

The deletion code references `affiliate_clicks` and `affiliate_referrals` tables that **do not exist** in the database (confirmed: `Could not find the table`). The actual tables are `referral_clicks` and `referrals`.

```js
await supabase.from("affiliate_clicks").delete().in("affiliate_id", affiliateIds) // TABLE DOESN'T EXIST
await supabase.from("affiliate_referrals").delete().in("affiliate_id", affiliateIds) // TABLE DOESN'T EXIST
```

**Impact:** Account deletion silently fails to clean up referral clicks and referral records, leaving orphaned data. The Supabase client returns errors that are not checked.

**Recommendation:** Fix table names to `referral_clicks` and `referrals`. Also check all delete operation results for errors.

---

### C4: Download Route — No Purchase Verification for Free Templates
**File:** `src/app/api/templates/[id]/download/route.ts`

For published templates, **any authenticated user can download without a purchase check**. The route only checks purchases for non-published templates:

```js
if (template.status !== "published") {
  // Only checks purchase for unpublished templates
}
// Published templates: anyone can download
```

It then **creates a purchase record** (upsert with price_cents=0) for every download, meaning the purchases table doesn't actually reflect real purchases — just downloads.

**Impact:** When paid templates are implemented, this pattern will allow free downloads. Currently, download_count and purchase records are meaningless as metrics.

**Recommendation:** When paid templates launch, add purchase verification. For now, rename the table/concept to "downloads" to avoid confusion.

---

### C5: `increment_download_count` RPC — No Authorization
**File:** `supabase/schema.sql`

The `increment_download_count` function is `SECURITY DEFINER` with no internal auth checks. Any authenticated user can call:
```sql
SELECT increment_download_count('any-template-id');
```
to inflate any template's download count.

Similarly, `increment_promotion_stat` can be called directly by any authenticated user.

**Impact:** Download counts and promotion stats can be arbitrarily manipulated.

**Recommendation:** Add authorization checks inside the functions, or restrict callable RPCs via RLS/grants.

---

### C6: Checkout Webhook — No Signature Verification (Stub)
**File:** `src/app/api/checkout/webhook/route.ts`

The main checkout webhook is a **complete stub** with no Stripe signature verification. It currently just logs and returns `{received: true}`. If this endpoint is deployed, anyone can POST arbitrary data to it.

The promote webhook (`/api/promote/webhook/route.ts`) **does** properly verify signatures — good. But the main checkout webhook does not.

**Impact:** When checkout is implemented, if the stub pattern is kept, fake purchases could be injected.

**Recommendation:** Ensure Stripe signature verification is added before any purchase logic goes live.

---

## 🟡 Important Issues

### I1: Screenshots Upload — No File Type Validation
**File:** `src/app/api/screenshots/upload/route.ts`

No MIME type or extension validation. Any file can be uploaded as a "screenshot":
```js
const ext = file.name.split(".").pop() || "png"
// No check that ext is an image type
// No check that file.type is an image MIME
```

The screenshots bucket is **public** (confirmed in migration: `public: true`), so uploaded files are accessible to everyone.

**Impact:** The public screenshots bucket can be used to host arbitrary files (HTML, SVG with XSS, executables).

**Recommendation:** Validate MIME type against `['image/png', 'image/jpeg', 'image/gif', 'image/webp']`. Validate file extension. Add max file size check (currently none — only the template upload has a 10MB limit).

---

### I2: No Screenshot Size Limit
**Files:** `src/app/api/screenshots/upload/route.ts`, `src/app/api/templates/upload/route.ts`

Individual screenshot uploads have no size limit at all. The template upload route processes screenshots without checking their individual sizes despite `MAX_SCREENSHOT_SIZE` being defined as 5MB in constants.

**Impact:** Users can upload arbitrarily large images, consuming storage and bandwidth.

---

### I3: `file_path` Column Inconsistency — Some Contain Full URLs
**Database observation:**

Some template `file_path` values contain full public URLs:
```
https://pixasvjwrjvuorqqrpti.supabase.co/storage/v1/object/public/templates/...
```
While others contain relative paths:
```
2f04a9fa-b87f-4480-9042-5efed98a0c61/invoice-hound.zip
```

The download route calls `supabase.storage.from("templates").download(template.file_path)` which will fail for full URLs.

**Impact:** Downloads may fail for templates with full URL paths. The watchdog template likely can't be downloaded.

---

### I4: Template Storage Bucket — All Authenticated Users Can Read All Files
**File:** `supabase/schema.sql`

```sql
create policy "templates_storage_select" on storage.objects
  for select using (bucket_id = 'templates' and auth.role() = 'authenticated');
```

Any authenticated user can download any template's zip file directly from storage, bypassing the download route entirely.

**Impact:** Paid templates (when implemented) can be downloaded without purchase by any logged-in user who knows the file path (which is exposed via the `file_path` column on the templates table, readable by anon).

**Recommendation:** Restrict storage select to buyers only, or use signed URLs with short expiry generated in the download route.

---

### I5: Race Condition in Affiliate Click/Signup Counting
**Files:** `src/app/api/affiliate/track-click/route.ts`, `src/app/api/affiliate/attribute/route.ts`

Both use read-then-increment pattern:
```js
const { data: affiliate } = await supabase.from('affiliates').select('id, total_clicks')...
await supabase.from('affiliates').update({ total_clicks: affiliate.total_clicks + 1 })
```

Under concurrent requests, this loses increments. Should use `.rpc()` or SQL `total_clicks + 1`.

**Impact:** Affiliate stats undercount under load.

---

### I6: In-Memory Rate Limiting Won't Work on Serverless
**File:** `src/app/api/affiliate/track-click/route.ts`

Uses a `Map<string, ...>` for rate limiting. On Vercel (serverless), each invocation may run in a different container, making this ineffective.

```js
const rateLimit = new Map<string, { count: number; reset: number }>()
```

The middleware has proper Upstash-based rate limiting, but this route has its own in-memory implementation that won't work.

**Impact:** The `/api/affiliate/track-click` endpoint has effectively no rate limiting in production.

---

### I7: `reviews` Table — No DELETE Policy
**File:** `supabase/schema.sql`

Reviews have SELECT, INSERT, and UPDATE policies but **no DELETE policy**. Users cannot delete their own reviews.

The account deletion route tries to delete reviews, but since it uses the user's auth context (not admin), it may silently fail.

**Impact:** Users can't delete reviews; GDPR implications. Account deletion may leave review data behind.

---

### I8: `reports` and `bookmarks` Tables — Missing from Schema Files
The `reports` and `bookmarks` tables exist in the database but have no corresponding migration files in `supabase/migrations/`. This means:
- Their RLS policies are unknown/undocumented
- Schema can't be reproduced from source
- No code review possible for their security policies

**Recommendation:** Add migration files for these tables.

---

### I9: `profile/become-seller` — No Validation or Requirements
**File:** `src/app/api/profile/become-seller/route.ts`

Any authenticated user can instantly become a seller by calling this endpoint. No requirements (email verification, profile completeness, etc.).

**Impact:** Low barrier enables spam sellers.

---

### I10: Template PATCH — `file_path` and `preview_data` in Allowed Fields
**File:** `src/app/api/templates/[id]/route.ts`

The PATCH route allows updating `file_path` and `preview_data`:
```js
const allowed = ["title", "description", ..., "file_path", "preview_data", ...]
```

A seller could change `file_path` to point to another seller's file, or inject malicious content in `preview_data`.

**Impact:** Sellers can point their template to any file in the storage bucket (or any URL).

**Recommendation:** Remove `file_path` and `preview_data` from PATCH-able fields. These should only be updated via the upload/replace-file routes.

---

### I11: `purchases` Table — Missing RLS Upsert Policy
The download route upserts into purchases with `onConflict: "buyer_id,template_id"`. The RLS insert policy only allows `auth.uid() = buyer_id`, but there's no UPDATE policy on purchases. The upsert may fail on conflict because update isn't allowed.

This is why the code has a fallback to the admin client — indicating the developer hit this issue but band-aided it.

**Impact:** Purchase recording is unreliable; depends on admin client being configured.

---

### I12: CORS Headers — Not Explicitly Set
No CORS headers are set on any API route. Next.js defaults apply. The `promote/track` and `promote/track-batch` endpoints (which are unauthenticated) could be called from any origin.

**Recommendation:** Add explicit CORS configuration, especially for unauthenticated endpoints.

---

## 🟢 Minor Issues

### M1: `tagline` in Profile — Not in Database Schema
**File:** `src/app/api/profile/route.ts`

The profile PATCH route allows updating `tagline`, but this column isn't defined in any schema/migration file. Will silently fail.

---

### M2: `seller_response` and `seller_response_at` — Not in Reviews Schema
**File:** `src/app/api/reviews/[id]/respond/route.ts`

The review respond route writes to `seller_response` and `seller_response_at` columns not defined in the base schema. These were likely added via an untracked migration.

---

### M3: Template Status Check Enum Mismatch
**Database:** `CHECK (status IN ('draft','published','archived'))`
**Code:** Uses `'pending_review'`, `'flagged'`, `'deleted'` statuses

The template upload route can set status to `pending_review`, and reports can set `flagged`, but the database CHECK constraint only allows `draft/published/archived`.

**Impact:** These operations will fail with a constraint violation. The schema likely was updated but the migration files don't reflect it.

---

### M4: Missing `updated_at` Auto-Update Trigger
Templates have an `updated_at` column, but no trigger to auto-update it. The PATCH route manually sets it, which is fine, but other update paths (download count increment, rating recalc) don't update it.

---

### M5: `recalc_template_rating` — Only Fires on INSERT/UPDATE, Not DELETE
If a review is deleted (e.g., via account deletion with admin client), the template's `avg_rating` and `review_count` won't be recalculated.

---

### M6: No Pagination Limit Enforcement on Some Routes
**Files:** `affiliate/earnings`, `affiliate/referrals`

The `per_page` parameter is parsed from query string with no upper bound:
```js
const perPage = parseInt(request.nextUrl.searchParams.get('per_page') || '10')
```

Could request `per_page=1000000` to dump all data.

---

### M7: Error Message Leakage
Several routes return raw Supabase error messages: `error: error.message`. These may expose table names, column names, or constraint details.

---

### M8: Template Slug Not Validated on Upload
**File:** `src/app/api/templates/upload/route.ts`

The `slug` comes from form data with no format validation. Only the database `UNIQUE` constraint prevents duplicates. Malicious slugs with path traversal (`../../etc`) could affect file storage paths.

**Impact:** Low risk since Supabase storage handles path sanitization, but still worth validating.

---

### M9: `promote/webhook` Uses Same `STRIPE_WEBHOOK_SECRET` for Both Webhooks
If the main checkout webhook is implemented, it should use a separate webhook secret from the promote webhook. Currently they'd share `STRIPE_WEBHOOK_SECRET`.

---

## ✅ Things Done Well

1. **RLS is enabled on all tables** — Confirmed all tables have RLS enabled with appropriate policies.
2. **Auth checks on all protected routes** — Every route that should require auth does check `supabase.auth.getUser()`.
3. **Middleware rate limiting** — Well-structured tiered rate limiting via Upstash Redis with proper fallback.
4. **Promote webhook** — Proper Stripe signature verification.
5. **Template file scanning** — Good multi-layer security scan for uploaded zips (suspicious pattern detection, binary file detection).
6. **New seller review queue** — First 3 uploads require manual review.
7. **Input validation on profile updates** — Username format validated with regex, uniqueness checked.
8. **Self-referral prevention** — Affiliate system prevents self-referral.
9. **Review integrity** — 1-hour delay between purchase and review.
10. **Purchase check before review** — RLS + application-level check.

---

## Database Observations

### Tables Confirmed Present
profiles, templates, purchases, bookmarks, reviews, reports, affiliates, referrals, referral_clicks, affiliate_earnings, promotions, seller_follows, featured_templates

### Tables Referenced But Missing
- `affiliate_clicks` (referenced in account deletion — should be `referral_clicks`)
- `affiliate_referrals` (referenced in account deletion — should be `referrals`)

### Missing Foreign Keys / Indexes
- `promotions.seller_id` — No ON DELETE CASCADE (profile deletion won't cascade)
- `reports` — Schema not in source control, can't verify constraints
- `bookmarks` — Schema not in source control, can't verify constraints

### Schema vs. Code Drift
The codebase references columns and statuses not present in the tracked schema files:
- `templates.changelog`, `templates.faq`, `templates.file_hash`, `templates.scan_status`, `templates.scan_results`, `templates.requires_review`, `templates.file_updated_at`
- `profiles.notification_prefs`, `profiles.tagline`, `profiles.last_active_at`
- `reviews.seller_response`, `reviews.seller_response_at`
- Template status values: `pending_review`, `flagged`, `deleted`

These likely exist via untracked migrations, but the schema source of truth is incomplete.
