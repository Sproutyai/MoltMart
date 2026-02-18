# Search Popup Build Plan

## Architecture Overview

Replace `NavbarSearch` (simple form) with a **trigger button** that opens a **Dialog overlay** containing: search input + autocomplete suggestions + 3-column promoted grid. Same trigger replaces mobile search in `MobileNav`.

### Component Tree
```
SearchPopup (client component, renders trigger + dialog)
├── Trigger: <button> styled like search input (+ Cmd+K badge)
├── Dialog (shadcn Dialog, portal to body)
│   ├── SearchPopupInput (autofocused, with autocomplete dropdown)
│   │   └── AutocompleteSuggestions (absolute positioned list)
│   ├── PromotedHeader ("⭐ Promoted Enhancements" + "Promote yours →")
│   └── PromotedGrid (3-col desktop, 2-col mobile)
│       └── CompactPromotedCard × N
```

---

## File-by-File Plan

### 1. `src/components/compact-promoted-card.tsx` — CREATE

**What:** Compact card for promoted templates in the popup grid.

**Props:**
```ts
interface CompactPromotedCardProps {
  template: Template & { seller?: { username: string; display_name: string | null } }
  onClick?: () => void  // for click tracking before navigation
}
```

**Implementation:**
- Entire card is a clickable `<Link>` to `/templates/${template.slug}`
- Layout: vertical stack
  - **Thumbnail**: 100% width, aspect-[3/2], rounded-md. If `template.screenshots[0]` exists use `<img>`, else show category icon fallback (use a colored div with category text)
  - **Title**: `font-semibold text-sm line-clamp-1 mt-1.5`
  - **Bottom row** (flex, items-center, justify-between):
    - Left: `<Badge variant="outline" className="text-[10px] px-1.5 py-0">` with category
    - Right: Price — green "Free" badge or `$X.XX` text
  - **Rating row** (only if `review_count > 0`): `<StarRating size={10}>` + `(N)` in `text-[10px] text-muted-foreground`
- Card container: `rounded-lg border bg-card p-2 hover:bg-accent/50 transition-colors cursor-pointer`
- Max height natural (~140-160px depending on thumbnail)
- On click: call `onClick?.()` then navigate (use `router.push` instead of `<Link>` to allow click tracking)

**Styling:** Tailwind only. No custom CSS.

---

### 2. `src/components/search-popup.tsx` — CREATE

**What:** The main search popup component (trigger + dialog content).

**Props:**
```ts
interface SearchPopupProps {
  className?: string  // applied to trigger button
}
```

**State:**
- `open: boolean` — dialog open state
- `query: string` — search input value
- `promotedTemplates: PromotedTemplate[]` — fetched on first open, cached
- `suggestions: { id: string; title: string; slug: string }[]` — autocomplete results
- `loadingPromoted: boolean`
- `selectedIndex: number` — keyboard nav for suggestions (-1 = none)

**Key Implementation:**

#### Trigger Button
```tsx
<button
  onClick={() => setOpen(true)}
  className="hidden md:flex items-center gap-2 h-9 w-64 lg:w-80 rounded-full border border-input bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted transition-colors"
>
  <Search className="size-3.5" />
  <span>Search enhancements...</span>
  <kbd className="ml-auto text-[10px] border rounded px-1.5 py-0.5 bg-background text-muted-foreground">⌘K</kbd>
</button>
```
- Looks identical to the old search input but is a button
- Shows `⌘K` keyboard hint on the right
- `hidden md:flex` — hidden on mobile (mobile uses its own trigger)

#### Dialog
- Use shadcn `Dialog` + `DialogContent`
- **Override DialogContent styling**: remove default centering max-width. Instead:
  - `className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 gap-0"`
  - On mobile: `fixed inset-0 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 rounded-none sm:rounded-xl`
- No `DialogTitle` visible (add `sr-only` for accessibility)
- `DialogOverlay` click closes (default shadcn behavior)

#### Search Input (inside dialog)
```tsx
<div className="flex items-center border-b px-4">
  <Search className="size-4 text-muted-foreground shrink-0" />
  <input
    ref={inputRef}
    autoFocus
    value={query}
    onChange={handleQueryChange}
    onKeyDown={handleKeyDown}
    placeholder="Search enhancements..."
    className="flex-1 h-12 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
  />
  {query && (
    <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
      <X className="size-4" />
    </button>
  )}
</div>
```

#### Autocomplete Suggestions
- Shown when `query.length >= 2` and `suggestions.length > 0`
- Rendered as a list between search input and promoted grid
- Each item: `<div>` with template title, clickable → `router.push(/templates/${slug})` + close
- Keyboard: ArrowDown/Up changes `selectedIndex`, Enter on selected navigates
- Styling: `border-b divide-y bg-muted/30`, each item `px-4 py-2 text-sm hover:bg-accent cursor-pointer`
- Active item (keyboard selected): `bg-accent`

#### Autocomplete Query
- `useEffect` with 300ms debounce on `query`
- Query: `supabase.from("templates").select("id, title, slug").eq("status", "published").ilike("title", `%${query}%`).limit(5)`
- Use **client** supabase: `createBrowserClient` from `@/lib/supabase/client`
- Clear suggestions when query is empty

#### Promoted Grid
- Rendered below suggestions (or directly below search if no suggestions)
- Container: `flex-1 overflow-y-auto px-4 pb-4`
- Header row: `flex items-center justify-between py-3`
  - Left: `<h3 className="text-sm font-semibold text-muted-foreground">⭐ Promoted Enhancements</h3>`
  - Right: `<Link href="/dashboard/seller" className="text-xs text-primary hover:underline">Promote yours →</Link>`
- Grid: `grid grid-cols-2 sm:grid-cols-3 gap-3`
- Render `CompactPromotedCard` for each promoted template
- If no promoted templates and not loading: show subtle empty state

#### Data Fetching (Promoted)
- Fetch on first `open === true` (use a ref `hasFetched`)
- Query via client supabase:
```ts
const { data } = await supabase
  .from("promotions")
  .select("template_id, templates!inner(id, title, slug, category, price_cents, screenshots, avg_rating, review_count, seller:profiles!seller_id(username, display_name))")
  .order("promoted_at", { ascending: false })
  .limit(36)
```
- **Note**: If the join syntax doesn't work with Supabase JS, do two queries:
  1. Fetch promotion `template_id`s (limit 36, ordered)
  2. Fetch templates by IDs with seller join
  3. Re-sort client-side by promotion order
- Cache result in state — don't refetch on subsequent opens

#### Keyboard Shortcuts
- **Global `Cmd+K` / `Ctrl+K`**: Add `useEffect` with `keydown` listener on `document`
  - `if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true) }`
- **Escape**: Handled by shadcn Dialog automatically
- **Enter** (in search input, no suggestion selected): navigate to `/templates?q=${query}`, close dialog
- **ArrowDown/Up**: Navigate suggestions

#### Impression Tracking
- On popup open, after promoted templates are loaded:
```ts
// Fire once per open
const ids = promotedTemplates.map(t => t.id)
fetch("/api/promote/track-batch", {
  method: "POST",
  body: JSON.stringify({ templateIds: ids, type: "impression" }),
})
```
- Click tracking: each `CompactPromotedCard` onClick calls:
```ts
navigator.sendBeacon("/api/promote/track", JSON.stringify({ templateId: id, type: "click" }))
```

#### Close Behavior
- Escape → close (Dialog default)
- Backdrop click → close (Dialog default)
- Navigation (suggestion click, card click, Enter search) → `setOpen(false)` then `router.push`
- Reset `query` and `suggestions` on close

---

### 3. `src/app/api/promote/track-batch/route.ts` — CREATE

**What:** Batch impression tracking endpoint.

**Implementation:**
```ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { templateIds, type } = await req.json()
    if (!Array.isArray(templateIds) || !['impression', 'click'].includes(type)) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Admin client unavailable' }, { status: 503 })
    }

    const field = type === 'impression' ? 'impressions' : 'clicks'

    // Call RPC for each (or create a batch RPC — see note below)
    await Promise.all(
      templateIds.map((id: string) =>
        supabase.rpc('increment_promotion_stat', { p_template_id: id, p_field: field })
      )
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Batch track error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

**Note:** This fires N RPCs in parallel. For v1 this is fine (max 36 calls). For v2, consider a single SQL function that accepts an array of IDs.

---

### 4. `src/components/navbar-search.tsx` — MODIFY

**Changes:** Replace entire component to just render `<SearchPopup />`.

```tsx
"use client"

import { SearchPopup } from "@/components/search-popup"

export function NavbarSearch() {
  return <SearchPopup />
}
```

That's it. The trigger button inside `SearchPopup` already has `hidden md:flex` to match the old behavior.

---

### 5. `src/components/mobile-nav.tsx` — MODIFY

**Changes:** Replace the inline search `<form>` with a mobile-specific trigger that opens the same `SearchPopup`.

**Exact change — replace the search form block:**

OLD:
```tsx
{/* Mobile Search */}
<form onSubmit={handleSearch} className="relative">
  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
  <input
    type="text"
    placeholder="Search enhancements..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="h-10 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
  />
</form>
```

NEW:
```tsx
{/* Mobile Search — opens search popup */}
<SearchPopup className="block w-full" mobile />
```

- Add `mobile` prop to `SearchPopup` that renders a full-width trigger button (not `hidden md:flex`)
- When mobile trigger is clicked: close the Sheet first (`close()`), then open the popup
- **Alternative simpler approach**: Don't embed in Sheet. Instead, add a search icon button in the mobile header bar that opens the popup directly. But embedding in Sheet is fine too.

**Actually, simplest approach:**
- `SearchPopup` `mobile` prop renders trigger as: `<button className="flex items-center gap-2 h-10 w-full rounded-lg border ...">`
- The `SearchPopup` Dialog works independently of the Sheet — it renders as a portal so z-index is fine (Dialog z-50+, Sheet z-50, but Dialog portal attaches to body)
- When popup opens from mobile Sheet, both are open — that's fine, Dialog overlays everything

**Remove** `query` state and `handleSearch` function and `Search` import (if no longer used) from MobileNav. Add `SearchPopup` import.

---

### 6. `src/components/navbar.tsx` — NO CHANGES

Already renders `<NavbarSearch />` which will now render the popup trigger. No changes needed.

---

### 7. `src/app/templates/page.tsx` — NO CHANGES

Browse page continues to work with `?q=` query param. No changes.

---

## Supabase Client Note

The popup needs a **browser/client** Supabase instance for:
1. Fetching promoted templates (on popup open)
2. Autocomplete search (on typing)

Check that `src/lib/supabase/client.ts` exports a browser client. It should already exist (used by other client components). Use:
```ts
import { createClient } from "@/lib/supabase/client"
```

---

## z-index Considerations

- Navbar: `z-50`
- shadcn Dialog overlay: `z-50` (default) — BUT it's a portal on `<body>`, so it stacks above everything
- Sheet (mobile nav): `z-50` — Dialog portal still overlays it
- No z-index conflicts expected

---

## Quality Checklist

- [x] Escape closes popup (Dialog default)
- [x] Backdrop click closes popup (Dialog default)
- [x] Cmd+K opens popup from anywhere
- [x] Mobile: full-screen overlay via Dialog responsive styling
- [x] Promoted grid: 3-col desktop, 2-col mobile
- [x] Autocomplete: debounced, max 5 results
- [x] Enter navigates to browse page with query
- [x] Card click: track + navigate to detail
- [x] Impression tracking: batch on open
- [x] No z-index conflicts (portal-based Dialog)
- [x] Supabase query efficient: single join query, limit 36, cached

---

## Build Order

1. **`src/components/compact-promoted-card.tsx`** — CREATE (no dependencies, pure presentational)
2. **`src/app/api/promote/track-batch/route.ts`** — CREATE (no dependencies, simple API route)
3. **`src/components/search-popup.tsx`** — CREATE (depends on #1 and #2, the main component)
4. **`src/components/navbar-search.tsx`** — MODIFY (swap to render SearchPopup)
5. **`src/components/mobile-nav.tsx`** — MODIFY (replace search form with SearchPopup mobile trigger)

Steps 1 and 2 can be done in parallel. Step 3 depends on both. Steps 4 and 5 can be done in parallel after 3.

```
[1: CompactPromotedCard] ──┐
                            ├──→ [3: SearchPopup] ──┬──→ [4: NavbarSearch modify]
[2: track-batch API]  ─────┘                        └──→ [5: MobileNav modify]
```
