# Store & Profile Page Fix Plan

## Current Architecture

### Two separate pages share the same `profiles` DB table:

| Page | File | Route | Purpose |
|------|------|-------|---------|
| **Edit Store** | `src/app/dashboard/profile/page.tsx` | `/dashboard/profile` | Seller store settings (shown in nav as "Edit Store") |
| **Edit Profile** | `src/app/dashboard/account/profile/page.tsx` | `/dashboard/account/profile` | Personal profile (shown in nav as "Edit Profile") |

### Current Fields Per Page

**Edit Store** (`/dashboard/profile`) — dual-purpose page (shows "Edit Store" for sellers, "Edit Profile" for non-sellers):
- Avatar (ImageUpload for sellers, AvatarPicker for non-sellers)
- **Display Name** ← REDUNDANT (exists on Edit Profile)
- **Username** ← REDUNDANT (exists on Edit Profile)
- Tagline
- **Bio** ← OK here (store description)
- Website
- Specialties

**Edit Profile** (`/dashboard/account/profile`):
- Avatar
- Display Name
- Username
- **Bio** ← SHOULD BE REMOVED (belongs on store page only)

## Changes Required

### 1. Edit Store page (`src/app/dashboard/profile/page.tsx`)
**Remove:**
- Display Name field (state: `displayName`, input, label)
- Username field (state: `username`, input, label, validation logic, `usernameError`)
- Remove `display_name` and `username` from the `handleSave` body
- Update preview to pull display_name/username from loaded `profile` object (read-only) instead of editable state

**Keep:** Avatar (ImageUpload), Tagline, Bio (rename label to "Store Description"), Website, Specialties

### 2. Edit Profile page (`src/app/dashboard/account/profile/page.tsx`)
**Remove:**
- Bio field (state: `bio`, textarea, label)
- Remove `bio` from the `handleSave` body

**Keep:** Avatar, Display Name, Username

### 3. API route (`src/app/api/profile/route.ts`)
**No changes needed.** The API accepts any subset of allowed fields. Both pages already send only what they need; we just stop sending the redundant ones.

### 4. Database
**No changes needed.** The `bio` column stays in `profiles` table — it's used by:
- `src/app/sellers/[username]/page.tsx` — displays bio on public seller page
- `src/components/seller-search-card.tsx` — shows bio in seller search results
- `src/components/seller-profile-header.tsx` — shows bio in seller profile header

The bio is conceptually a "store description" stored in the `bio` column. No schema change required.

### 5. Preview panel in Edit Store
The preview currently uses `displayName` and `username` state variables. After removing those as editable fields, update the preview to reference `profile.display_name` and `profile.username` (the loaded values from DB, read-only).

## Files to Modify (summary)
1. `src/app/dashboard/profile/page.tsx` — Remove display_name/username fields + update preview refs
2. `src/app/dashboard/account/profile/page.tsx` — Remove bio field

## Risk Assessment
- **Low risk.** Both changes are purely UI field removals.
- No other components depend on these fields being editable on these specific pages.
- The API route is generic and doesn't need changes.
- DB schema unchanged.
