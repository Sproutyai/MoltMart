# Store Fixes Implementation Plan

## Issue 1: Save Profile Error — Missing `tagline` Column

**Root Cause:** The `tagline` column was never added to the `profiles` table. The `seller_profiles.sql` migration adds `website`, `specialties`, `banner_url`, etc., but NOT `tagline`. The Profile type declares it, the form sends it, the API allows it, but the DB column doesn't exist.

**Fix: Run SQL migration to add the column.**

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tagline text;
```

Execute via Supabase SQL Editor or CLI:
- Go to: https://supabase.com/dashboard/project/pixasvjwrjvuorqqrpti/sql/new
- Run the above SQL

**No code changes needed** — the frontend and API already handle `tagline` correctly.

---

## Issue 2: "Manual linking is disabled" — Connect GitHub/X Broken

**Root Cause:** The `connected-accounts.tsx` component calls `supabase.auth.linkIdentity()` which requires the **"Manual Linking"** setting enabled in Supabase Auth config. This is a Supabase dashboard setting, not a code issue.

**Fix: Enable Manual Linking in Supabase Dashboard.**

1. Go to: https://supabase.com/dashboard/project/pixasvjwrjvuorqqrpti/settings/auth
2. Scroll to **"Security"** section
3. Find **"Manual Linking"** (or "Allow manual linking of accounts") and **enable** it
4. Click Save

**Also ensure OAuth providers are configured:**
- GitHub: https://supabase.com/dashboard/project/pixasvjwrjvuorqqrpti/auth/providers → GitHub must have Client ID + Secret
- Twitter/X: Same page → Twitter must have API Key + Secret

**No code changes needed.**

---

## Issue 3: Banner Image in Preview — Remove from Edit Store

**Root Cause:** The Edit Store preview card (in `src/app/dashboard/profile/page.tsx`) renders a gradient banner strip at the top of the preview. The user wants this removed.

**File:** `src/app/dashboard/profile/page.tsx`

**Change:** Remove the gradient `div` and adjust the avatar positioning.

### Exact edit:

**Find (lines ~104-109):**
```tsx
              <div className="relative h-24 w-full overflow-hidden" style={{
                background: `linear-gradient(135deg, hsl(${(profile.username || "a").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 60%, 85%), hsl(${((profile.username || "a").split("").reduce((a, c) => a + c.charCodeAt(0), 0) + 60) % 360}, 50%, 90%))`,
              }} />
              <div className="px-4 pb-4">
                <div className="flex items-center gap-3 -mt-6">
```

**Replace with:**
```tsx
              <div className="px-4 pb-4 pt-4">
                <div className="flex items-center gap-3">
```

Also update the avatar's `pt-6` since we no longer need offset:

**Find:**
```tsx
                  <div className="pt-6">
```

**Replace with:**
```tsx
                  <div>
```

---

## Summary of All Changes

| # | Issue | Fix Type | Location |
|---|-------|----------|----------|
| 1 | `tagline` column missing | **SQL migration** | Supabase SQL Editor |
| 2 | Manual linking disabled | **Dashboard setting** | Supabase Auth Settings |
| 3 | Banner in preview | **Code change** | `src/app/dashboard/profile/page.tsx` |

### Code change for Issue 3 (complete diff):

```diff
--- a/src/app/dashboard/profile/page.tsx
+++ b/src/app/dashboard/profile/page.tsx
@@ preview card section
-              <div className="relative h-24 w-full overflow-hidden" style={{
-                background: `linear-gradient(135deg, hsl(${(profile.username || "a").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 60%, 85%), hsl(${((profile.username || "a").split("").reduce((a, c) => a + c.charCodeAt(0), 0) + 60) % 360}, 50%, 90%))`,
-              }} />
-              <div className="px-4 pb-4">
-                <div className="flex items-center gap-3 -mt-6">
+              <div className="px-4 pb-4 pt-4">
+                <div className="flex items-center gap-3">
@@ avatar name section
-                  <div className="pt-6">
+                  <div>
```
