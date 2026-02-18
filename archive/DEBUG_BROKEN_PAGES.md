# Debug Report: Broken Pages

## Root Cause

**Single root cause:** `src/components/template-card.tsx` passes an `onClick` event handler to a `<Link>` component, but `TemplateCard` is a **server component** (no `"use client"` directive). 

Next.js error:
```
Event handlers cannot be passed to Client Component props.
  <... href=... onClick={function handleBeacon} className=... children=...>
```

The `handleBeacon` function (added in commit `7ea38df` for the Featured Templates system) uses `navigator.sendBeacon()` and is passed via `onClick` to `<Link>`. Server components cannot pass event handlers to client components.

This crashes **all three broken pages** because they all render `<TemplateCard>`:
1. **Homepage** (`/`) — "Popular Enhancements" grid + `<NewListingsSnippet>`
2. **`/templates`** — browse results grid + featured injection
3. **`/templates/new`** — new listings grid

The `error.tsx` error boundary catches these crashes, showing "Something went wrong."

## What's NOT broken
- Build passes (this is a runtime-only error)
- DB is fine: `promotions` table exists (empty), `increment_promotion_stat` RPC exists
- Categories match between code constants and DB values
- All imports/exports are correct
- No other server/client mismatches found

## Fix Plan

### Fix 1 (only fix needed): Make TemplateCard a client component

**File:** `src/components/template-card.tsx`

**Option A (simplest):** Add `"use client"` at the top of the file.

This is safe because:
- TemplateCard already imports client components (`SellerLink`, `StarRating`)
- It uses `formatDistanceToNow` from date-fns (works in both)
- It references `navigator.sendBeacon` (browser-only API)
- The parent pages are server components that just pass serializable props — no issue

**Option B (minimal client boundary):** Extract just the beacon click link into a tiny client component:

Create `src/components/featured-click-link.tsx`:
```tsx
"use client"
import Link from "next/link"

export function FeaturedClickLink({ href, templateId, children, ...props }: { href: string; templateId: string; children: React.ReactNode; [key: string]: any }) {
  return (
    <Link href={href} onClick={() => navigator.sendBeacon("/api/promote/track", JSON.stringify({ templateId, type: "click" }))} {...props}>
      {children}
    </Link>
  )
}
```

Then in `template-card.tsx`, conditionally use `FeaturedClickLink` when `isFeatured` is true, plain `Link` otherwise.

### Recommendation

**Go with Option A** — add `"use client"` to `template-card.tsx`. It's one line, zero risk, and the component already depends on client-side APIs. Option B is over-engineered for this case.

### Order of fixes
1. Add `"use client"` to top of `src/components/template-card.tsx` — **that's it, all 3 pages will work.**
