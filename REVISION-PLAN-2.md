# Molt Mart Revision Plan 2

## Issue Summary

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 4 | Upload/drafts broken with RLS error | 🔴 Critical | Blocking |
| 1 | Avatar picker broken for buyers | 🟡 Medium | UI bug |
| 2 | Can't un-archive products | 🟡 Medium | Missing feature |
| 3 | Eye icon → 404 on product cards | 🟡 Medium | Broken link |

---

## Root Cause Analysis

### Issue #4 — Upload/Drafts RLS Error
The upload route (`src/app/api/templates/upload/route.ts`) inserts with columns that **don't exist in any migration**:
- `file_hash`, `scan_status`, `scan_results`, `requires_review`, `file_updated_at`, `changelog`, `faq`

These columns were added to the code (upload route + scan logic) but the corresponding `ALTER TABLE` migration was never created or applied. Supabase's PostgREST layer returns RLS-like errors when you try to insert into columns that don't exist (the insert silently drops unknown columns, but the issue may actually be that `effectiveStatus = "pending_review"` is being set AND the CHECK constraint on the live DB may not include `pending_review`/`flagged`/`deleted`).

**Two possible causes (both likely):**
1. Missing columns — need migration to add `file_hash`, `scan_status`, `scan_results`, `requires_review`, `file_updated_at`, `changelog`, `faq`
2. CHECK constraint on `status` column may not include all needed values on live DB

**Fix:** Create migration for missing columns AND verify/update CHECK constraint. Alternatively, use admin client for the insert (bypasses RLS).

### Issue #1 — Avatar Picker
The profile page code is **correct** — it already conditionally renders `AvatarPicker` for non-sellers and `ImageUpload` for sellers. The bug is likely that the `ImageUpload` component is somehow still rendered or there's a click-through issue. Need to verify `is_seller` is being read correctly, or check if there's a CSS layering issue.

### Issue #2 — Un-archive Products
The code **already supports this**! `handleArchiveToggle` in `products/page.tsx` toggles between `archived` and `published`. It calls `PATCH /api/templates/[id]` with `{ status: "published" }`. The API route allows `status` in the update. The dropdown menu shows "Unarchive" for archived products. **This may already work** — need to verify the PATCH route doesn't have a status transition restriction, and that the CHECK constraint allows it.

### Issue #3 — Eye Icon → 404
The "View" button links to `/templates/${product.slug}`. If the slug is wrong or the product is archived (and `templates_select` RLS only shows `status = 'published'` to non-owners), this would 404 for archived products when opened in a new tab (the seller IS the owner so RLS should pass). More likely the slug in the DB doesn't match an actual page route, OR the `/templates/[slug]` page has additional filtering.

---

## Chunking

### Chunk A: Database Migration + Upload Fix (Issue #4) — CRITICAL
**Scope:** Fix the upload/draft creation pipeline
**Files:**
- New migration SQL (add missing columns, verify CHECK constraint)
- `src/app/api/templates/upload/route.ts` — potentially switch insert to admin client
- `src/lib/scan-zip.ts` — verify it exists and works
- Verify live DB state via Supabase dashboard or a test script

**Agent Group: 3 agents (standard pipeline)**
1. **Investigator** — Connect to Supabase (via JS script using `@supabase/supabase-js`), list actual columns on `templates` table, check constraints and RLS policies. Document findings.
2. **Implementer** — Create the migration SQL, apply it, fix the upload route if needed (e.g., use admin client for insert to bypass RLS, or fix column references).
3. **Verifier** — Test upload flow end-to-end, confirm no RLS errors.

### Chunk B: UI Fixes (Issues #1, #2, #3)
**Scope:** Avatar picker, un-archive, eye icon
**Files:**
- `src/app/dashboard/profile/page.tsx` — avatar picker investigation
- `src/components/avatar-picker.tsx` — verify it works standalone
- `src/components/image-upload.tsx` — check for click handler conflicts
- `src/app/dashboard/seller/products/page.tsx` — eye icon link fix
- `src/app/templates/[slug]/page.tsx` — verify route exists and handles archived products for owners

**Agent Group: 3 agents (standard pipeline)**
1. **Investigator** — Check the `/templates/[slug]` page for status filtering. Test avatar picker in isolation. Verify un-archive actually works (it may already).
2. **Implementer** — Fix eye icon link (disable for archived or use preview route). Fix avatar picker if needed. Add explicit un-archive UI if the current toggle isn't working.
3. **Verifier** — Test all three fixes visually.

---

## Execution Order

1. **Chunk A first** (blocking issue, unlocks content creation)
2. **Chunk B second** (UI polish, can run in parallel if Chunk A doesn't touch same files)

Both chunks can run **in parallel** — they touch completely different files.

---

## Key Files Reference

| File | Issues |
|------|--------|
| `src/app/api/templates/upload/route.ts` | #4 |
| `src/app/api/templates/[id]/route.ts` | #2, #3 |
| `src/app/dashboard/seller/products/page.tsx` | #2, #3 |
| `src/app/dashboard/profile/page.tsx` | #1 |
| `src/components/avatar-picker.tsx` | #1 |
| `src/components/image-upload.tsx` | #1 |
| `supabase/schema.sql` | #4 |
| `supabase/migrations/` (new) | #4 |
