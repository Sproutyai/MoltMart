# Edit Store Page — Fixes Analysis

## Issue 1: Save Profile Error — "Could not find the 'tagline' column"

**Root Cause:** The `tagline` column does **not exist** in the `profiles` table. The code references it in:
- `src/app/dashboard/profile/page.tsx` — reads `prof.tagline`, sends it in PATCH body
- `src/app/api/profile/route.ts` — includes `tagline` in allowed fields, passes to `.update()`
- `src/lib/types.ts` — `Profile` type has `tagline?: string | null`
- `src/components/seller-profile-header.tsx` — displays `profile.tagline`

**Fix:** Add the column to the database:
```sql
ALTER TABLE profiles ADD COLUMN tagline text;
```

No code changes needed — everything is already wired up correctly.

## Issue 2: "Manual linking is disabled" on Connect GitHub / Connect X

**Root Cause:** This is a **Supabase project configuration issue**, not a code issue.

The code in `src/components/connected-accounts.tsx` calls `supabase.auth.linkIdentity({ provider })` which is the correct Supabase API. The error "Manual linking is disabled" comes from the Supabase Auth server when the project setting `GOTRUE_SECURITY_MANUAL_LINKING_ENABLED` is `false`.

**Fix:** In the Supabase Dashboard:
1. Go to **Authentication → Providers** (or **Auth → Settings**)
2. Enable **"Manual Linking"** (Allow users to manually link identities)
3. URL: `https://supabase.com/dashboard/project/pixasvjwrjvuorqqrpti/auth/providers`

Also ensure GitHub and Twitter/X OAuth providers are configured with valid client ID/secret.

## Issue 3: Remove Banner Image from Edit Store Preview

**Root Cause:** The preview section in `src/app/dashboard/profile/page.tsx` (lines ~128-133) renders a gradient banner div that's purely decorative (not an uploaded banner image). The `banner_url` column exists in DB but is unused.

**What to remove/modify in `src/app/dashboard/profile/page.tsx`:**

The banner is this block inside the preview `<CardContent>`:
```jsx
<div className="relative h-24 w-full overflow-hidden" style={{
  background: `linear-gradient(135deg, hsl(...), hsl(...))`,
}} />
```

And adjust the avatar section below it (remove the `-mt-6` negative margin that overlaps the banner).

**Note:** The public seller profile page (`seller-profile-header.tsx`) also has a gradient banner — that's a separate decision on whether to keep it there.

---

## Summary of Required Changes

| Issue | Type | Fix |
|-------|------|-----|
| 1. tagline column missing | **DB migration** | `ALTER TABLE profiles ADD COLUMN tagline text;` |
| 2. Manual linking disabled | **Supabase dashboard config** | Enable manual linking in Auth settings |
| 3. Banner in preview | **Code change** | Remove gradient div + adjust layout in profile/page.tsx preview section |
