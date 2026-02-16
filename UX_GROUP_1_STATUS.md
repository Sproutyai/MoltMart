# Group 1 Status: ✅ COMPLETE

**Commit:** `6d57fe3`
**Branch:** main
**Build:** ✅ Passes

## Changes Made

### #2 — Terminology unified to "Enhancements"
Files changed: `mobile-nav.tsx`, `navbar-search.tsx`, `search-input.tsx`, `navbar.tsx`, `footer.tsx`, `upload-form.tsx`, `edit-template-form.tsx`, `transaction-table.tsx`, `page.tsx` (homepage), `templates/page.tsx`, `templates/new/page.tsx`, `templates/featured/page.tsx`, `dashboard/page.tsx`, `dashboard/layout.tsx`, `dashboard/seller/page.tsx`, `dashboard/seller/upload/page.tsx`, `dashboard/seller/edit/[id]/page.tsx`, `dashboard/seller/promote/page.tsx`, `signup/page.tsx`

### #7 — Hero stats now real
Queries published template count, unique seller count, and total downloads from Supabase. Displays actual numbers.

### #16 — Duplicate search removed
Removed `<SearchInput />` from homepage Popular Enhancements section. Removed import.

### #25 — Footer auth-aware
Footer is now an async server component. Shows Dashboard/Profile/Transactions for logged-in users, Login/Signup for visitors.

### #5 — Mobile search added
Added search input at top of mobile nav Sheet with form submission to `/templates?q=...`.
