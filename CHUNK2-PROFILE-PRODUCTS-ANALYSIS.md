# CHUNK 2 Analysis: Avatar Picker, Un-archive, Eye Icon

## Issue A — Edit Profile Avatar Picker Broken

### Root Cause: **NOT BROKEN** (conditional logic is correct)

The profile page at `src/app/dashboard/account/profile/page.tsx` lines 78-87 has correct conditional rendering:
- `profile.is_seller` → renders `<ImageUpload>` (file picker for custom uploads)
- `!profile.is_seller` (buyers) → renders `<AvatarPicker>` (5 premade avatars)

**The AvatarPicker component works correctly.** It renders premade avatar buttons and calls `/api/profile/set-avatar` on click.

### Possible Real Issue
If the bug reporter sees a file picker, it means `profile.is_seller === true` for their account. Either:
1. The user IS a seller and should see ImageUpload (not a bug)
2. The `is_seller` field is incorrectly set in the database

### Questions Answered
- **Is ImageUpload intercepting clicks?** No — only one renders based on the ternary. They cannot overlap.
- **Is AvatarPicker rendered for non-sellers?** Yes, the conditional is correct.
- **Z-index/event propagation issue?** No — mutually exclusive rendering.

### Recommendation
Verify the test user's `is_seller` field. If the intent is for sellers to ALSO pick premade avatars, add AvatarPicker as an option for sellers too (e.g., tabs: "Upload Custom" / "Choose Premade").

---

## Issue B — Can't Un-archive Products

### Root Cause: **ALREADY IMPLEMENTED in frontend, backend allows it**

**Frontend:** `handleArchiveToggle()` in `src/app/dashboard/seller/products/page.tsx` (line ~97) correctly toggles:
```js
const newStatus = product.status === "archived" ? "published" : "archived"
```
The dropdown menu shows "Unarchive" with `<ArchiveRestore>` icon when `product.status === "archived"`.

**Backend:** `PATCH /api/templates/[id]` accepts `status` in the allowed fields list and updates it without any status transition validation. So `archived → published` works.

### Possible Real Issue
The unarchive button EXISTS in the `...` dropdown menu but may not be obvious to users. It's hidden behind the MoreHorizontal menu. There are no validation issues.

### Questions Answered
- **Is there a status change action?** Yes, `handleArchiveToggle` toggles between archived/published.
- **What statuses can you transition to?** Any — no server-side validation on transitions.
- **Should un-archive go to draft or published?** Currently goes to `published`. Going to `draft` would be safer but current behavior seems intentional.

### Recommendation
This may not actually be broken. If the user can't find it, consider adding an "Unarchive" button directly on the archived product banner (the yellow warning strip) for better discoverability.

---

## Issue C — Eye Icon 404

### Root Cause: **Slug-based URL + archived products filtered from public page**

**The eye icon links to:** `/templates/${product.slug}` (both list and card views)

**The public template page** (`src/app/templates/[slug]/page.tsx`) queries:
```sql
.eq("status", "published")
```
Line 39: Only published templates are returned. If no match → `notFound()` (line 82) → **404**.

### This means:
1. **Archived products** → Eye icon → 404 (because `.eq("status", "published")` excludes them)
2. **Draft products** → Eye icon → 404 (same reason)
3. **Published products with valid slug** → Should work fine

### Secondary concern: slug correctness
If the slug is null/empty or was never generated, the URL `/templates/null` or `/templates/undefined` would also 404. But the primary issue is the status filter.

### Questions Answered
- **What URL does eye icon link to?** `/templates/${product.slug}` opened in new tab
- **For archived products, does the public page exist?** No — filtered out by `.eq("status", "published")`
- **Should archived products show "Preview" instead of "View Live"?** Yes.

### Recommendation (FIX NEEDED)
1. For non-published products, either:
   - Hide the eye icon entirely, OR
   - Change it to a "Preview" that uses an owner-only preview route (e.g., `/dashboard/seller/preview/${product.id}`)
2. Quick fix: conditionally show the eye icon only for `status === "published"`:
   ```tsx
   {product.status === "published" && (
     <Link href={`/templates/${product.slug}`} target="_blank">
       <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
     </Link>
   )}
   ```
3. Better fix: Allow the public page to show non-published templates to their owner (check auth, skip status filter for owner).

---

## Summary of Fixes Needed

| Issue | Actually Broken? | Fix |
|-------|-----------------|-----|
| A: Avatar Picker | Probably not — verify `is_seller` | Maybe add premade avatars for sellers too |
| B: Un-archive | No — works, just hidden in dropdown | Improve discoverability (add button on archive banner) |
| C: Eye icon 404 | **YES** | Hide eye for non-published OR add owner preview route |
