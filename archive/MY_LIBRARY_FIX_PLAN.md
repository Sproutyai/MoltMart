# My Library Fix Plan

## Investigation Summary

### Architecture (how it's supposed to work)
1. User clicks "Download Free" → `POST /api/templates/[id]/download`
2. Download route upserts a row into `purchases` table (buyer_id, template_id, price_cents=0)
3. Dashboard page (`/dashboard`) queries `purchases` joined with `templates` to show downloads
4. RLS policies allow users to SELECT their own purchases (`auth.uid() = buyer_id`) and INSERT (`auth.uid() = buyer_id`)

### Root Cause: Silent upsert failure (no error handling)

The download route at `src/app/api/templates/[id]/download/route.ts` line ~33 does:
```ts
await supabase.from("purchases").upsert(
  { buyer_id: user.id, template_id: id, price_cents: 0 },
  { onConflict: "buyer_id,template_id" }
)
```

**The error is never checked.** If this upsert fails (FK constraint, RLS issue, etc.), the download still proceeds — the user gets their zip file but no purchase record is created. The download succeeds silently without tracking.

Possible failure reasons:
- **Most likely:** The Supabase client returns `{ error }` but it's ignored. Could be an RLS or FK issue in production that doesn't surface.
- The `profiles` row might not exist yet at download time (FK constraint on `buyer_id → profiles.id` would fail), though `handle_new_user` trigger should create it.

### Fix Plan

#### 1. Add error handling to download route
**File:** `src/app/api/templates/[id]/download/route.ts`

Change the upsert to check for errors:
```ts
const { error: purchaseError } = await supabase.from("purchases").upsert(
  { buyer_id: user.id, template_id: id, price_cents: 0 },
  { onConflict: "buyer_id,template_id" }
)

if (purchaseError) {
  console.error("Failed to record purchase:", purchaseError)
  // Don't block the download, but log it
}
```

This will at least surface the actual error in logs so we can see what's happening in production.

#### 2. Rename "My Downloads" → "My Library"

**File: `src/app/dashboard/layout.tsx`**
- Line 24: `{ href: "/dashboard", label: "My Downloads", icon: Download }` → `"My Library"`
- Change icon import from `Download` to `Library` (from lucide-react), or keep `Download`

**File: `src/app/dashboard/page.tsx`**
- Line 49: `<h1 className="text-2xl font-bold">My Downloads</h1>` → `"My Library"`
- Line 37: `"Failed to load your downloads"` → `"Failed to load your library"`

#### 3. No DB changes needed
- The `purchases` table schema is correct
- RLS policies are correct (SELECT where `auth.uid() = buyer_id`, INSERT where `auth.uid() = buyer_id`)
- The unique constraint on `(buyer_id, template_id)` is correct for the upsert

#### 4. Debugging next step
After deploying the error logging, check Vercel logs to see if the upsert is actually failing and why. If it's a FK constraint on `profiles.id`, we may need to:
- Ensure the profile exists before upserting the purchase, OR
- Use a service-role client for the upsert (bypasses RLS), OR  
- Add an `ON CONFLICT DO UPDATE SET created_at = now()` to handle edge cases

### Files to Change (summary)
| File | Change |
|------|--------|
| `src/app/api/templates/[id]/download/route.ts` | Add error handling to upsert |
| `src/app/dashboard/page.tsx` | Rename "My Downloads" → "My Library" (2 places) |
| `src/app/dashboard/layout.tsx` | Rename nav label "My Downloads" → "My Library" |
