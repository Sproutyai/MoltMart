# FINAL Implementation Plan: Navbar + Bookmarks Revisions

## Part 1: Remove Home Button from Navbar

### File: `src/components/nav-links.tsx`

**Change 1:** Remove Home from the `links` array. Change:
```tsx
const links = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  { href: "/templates", label: "Explore", match: (p: string) => p === "/templates" },
```
To:
```tsx
const links = [
  { href: "/templates", label: "Explore", match: (p: string) => p === "/templates" },
```

**Change 2:** Remove the `.filter()` call. Change:
```tsx
      {links
        .filter((l) => !(l.href === "/" && pathname === "/"))
        .map((l) => (
```
To:
```tsx
      {links
        .map((l) => (
```

### File: `src/components/mobile-nav.tsx`

**Change 1:** Remove the conditional Home link block. Delete these 3 lines entirely:
```tsx
          {pathname !== "/" && (
            <Link href="/" onClick={close} className={linkClass(pathname === "/")}>Home</Link>
          )}
```

---

## Part 2: Bookmarks Tab Redesign

### File: `src/app/dashboard/bookmarks/bookmarks-client.tsx`

#### 2A. Add Imports

Add to existing lucide imports:
```tsx
import { Heart, Search, ArrowUpDown, ShoppingBag, Filter, LayoutGrid, List, Star, ExternalLink } from "lucide-react"
```

Add new imports:
```tsx
import { useEffect } from "react"
import { SafeImage } from "@/components/safe-image"
import { CategoryPlaceholder } from "@/components/category-placeholder"
```

Note: `format` from date-fns is NOT needed (bookmarks have no dates to format).

#### 2B. Add ViewMode Type and State

Add after the existing type definitions (`SortOption`, `PriceFilter`):
```tsx
type ViewMode = "card" | "list"

function getStoredViewMode(): ViewMode {
  if (typeof window === "undefined") return "card"
  return (localStorage.getItem("molt-bookmarks-view") as ViewMode) || "card"
}
```

Inside the component, add after existing state declarations:
```tsx
const [viewMode, setViewMode] = useState<ViewMode>("card")

useEffect(() => {
  setViewMode(getStoredViewMode())
}, [])

function changeViewMode(mode: ViewMode) {
  setViewMode(mode)
  localStorage.setItem("molt-bookmarks-view", mode)
}
```

Update the `useState` import to include `useEffect`:
```tsx
import { useState, useMemo, useEffect } from "react"
```
(Remove the separate `useEffect` import if added above — just merge into this line.)

#### 2C. Add View Toggle Buttons in Header

Replace the header `<div>` section. Current:
```tsx
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="text-red-500" size={24} /> My Bookmarks
          <span className="text-base font-normal text-muted-foreground">({templates.length})</span>
        </h1>
        <Link href="/templates">
          <Button variant="outline" size="sm">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse Enhancements
          </Button>
        </Link>
      </div>
```

Replace with:
```tsx
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="text-red-500" size={24} /> My Bookmarks
          <span className="text-base font-normal text-muted-foreground">({templates.length})</span>
        </h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "card" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2 rounded-r-none"
              onClick={() => changeViewMode("card")}
              title="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2 rounded-l-none"
              onClick={() => changeViewMode("list")}
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Link href="/templates">
            <Button variant="outline" size="sm">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Enhancements
            </Button>
          </Link>
        </div>
      </div>
```

#### 2D. Replace the Grid Section with View-Mode-Aware Rendering

Replace the entire grid block (from `<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">` through its closing `</div>`). 

Current card grid code:
```tsx
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <div key={t.id} className="relative">
              {purchasedSet.has(t.id) && (
                <Badge className="absolute top-2 right-2 z-10 bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-5">
                  ✓ Purchased
                </Badge>
              )}
              <TemplateCard
                template={t}
                initialBookmarked={true}
                onBookmarkRemove={() => setRemovedIds((prev) => new Set(prev).add(t.id))}
              />
            </div>
          ))}
        </div>
```

Replace with:
```tsx
        viewMode === "list" ? (
          /* ── List View ── */
          <div className="border rounded-lg overflow-hidden">
            {/* Table header — hidden on mobile */}
            <div className="hidden sm:grid sm:grid-cols-[48px_1fr_100px_90px_80px_60px_auto] gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
              <span></span>
              <span>Title</span>
              <span>Seller</span>
              <span>Category</span>
              <span>Price</span>
              <span>Rating</span>
              <span></span>
            </div>
            <div className="divide-y">
              {filtered.map((t) => {
                const templateUrl = `/templates/${t.slug}`
                const screenshot = t.screenshots?.[0]

                return (
                  <div
                    key={t.id}
                    className="flex flex-col sm:grid sm:grid-cols-[48px_1fr_100px_90px_80px_60px_auto] gap-2 sm:gap-3 px-4 py-3 items-start sm:items-center hover:bg-muted/30 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded overflow-hidden shrink-0 bg-muted">
                      {screenshot ? (
                        <SafeImage
                          src={screenshot}
                          alt={t.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full">
                          <CategoryPlaceholder category={t.category} />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="min-w-0">
                      <Link href={templateUrl} className="font-medium text-sm hover:underline truncate block">
                        {t.title}
                      </Link>
                      {/* Mobile-only: show seller + meta inline */}
                      <div className="sm:hidden flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                        {t.seller && <span>by {t.seller.display_name || t.seller.username}</span>}
                        <span>{t.price_cents === 0 ? "Free" : `$${(t.price_cents / 100).toFixed(2)}`}</span>
                        {purchasedSet.has(t.id) && <span className="text-emerald-500 font-medium">✓ Purchased</span>}
                      </div>
                    </div>

                    {/* Seller — desktop */}
                    <span className="hidden sm:block text-sm text-muted-foreground truncate min-w-0">
                      {t.seller ? (t.seller.display_name || t.seller.username) : "—"}
                    </span>

                    {/* Category — desktop */}
                    <span className="hidden sm:block min-w-0">
                      <Badge variant="secondary" className="text-xs font-normal max-w-full truncate block">
                        {t.category}
                      </Badge>
                    </span>

                    {/* Price — desktop */}
                    <span className="hidden sm:block text-sm font-medium">
                      {t.price_cents === 0 ? (
                        <span className="text-green-500">Free</span>
                      ) : (
                        `$${(t.price_cents / 100).toFixed(2)}`
                      )}
                    </span>

                    {/* Rating — desktop */}
                    <span className="hidden sm:block">
                      {t.avg_rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{t.avg_rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {purchasedSet.has(t.id) && (
                        <Badge className="hidden sm:inline-flex bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-5">
                          ✓ Purchased
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setRemovedIds((prev) => new Set(prev).add(t.id))}
                        title="Remove bookmark"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                      <Link href={templateUrl}>
                        <Button variant="outline" size="sm" className="h-8">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* ── Card View ── */
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => {
              const templateUrl = `/templates/${t.slug}`
              return (
                <TemplateCard
                  key={t.id}
                  template={t}
                  variant="library"
                  initialBookmarked={true}
                  onBookmarkRemove={() => setRemovedIds((prev) => new Set(prev).add(t.id))}
                  actions={
                    <div className="flex flex-col gap-2 w-full">
                      {purchasedSet.has(t.id) && (
                        <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-5 w-fit">
                          ✓ Purchased
                        </Badge>
                      )}
                      <Link href={templateUrl}>
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="mr-2 h-3 w-3" />
                          View Listing
                        </Button>
                      </Link>
                    </div>
                  }
                />
              )
            })}
          </div>
        )
```

**Important:** The ternary replaces the `<div className="grid ...">` inside the existing else branch of the empty-state check. The surrounding structure (`filtered.length === 0 ? <empty> : <HERE>`) stays the same. Wrap the ternary in a fragment `<>...</>` or just use parentheses since it's already in the else branch.

#### 2E. Handle TemplateCard `variant="library"` Props

- Pass `variant="library"` — this renders the smaller card format
- Do NOT pass `purchaseDate` or `userRating` — both are optional props and will be `undefined`, which is handled: the card skips rendering those sections via `{purchaseDate && ...}` and `{userRating !== undefined && ...}` guards
- Pass `actions` with the View Listing button + optional Purchased badge

#### 2F. Bookmark Removal in List View

The list view includes a heart button (filled, red) that calls the same `setRemovedIds` optimistic removal. This matches the existing behavior — the `onBookmarkRemove` prop on `TemplateCard` does the same thing internally.

**Note:** The actual server-side unbookmark is triggered by the `TemplateCard` heart button in card view (which calls the bookmark API). In list view, we need to also call the unbookmark API. Check if there's a bookmark toggle function we can call.

**Action:** Look at how `TemplateCard` handles unbookmarking internally. The `onBookmarkRemove` callback fires after the API call succeeds. For list view, we need to replicate that API call. Add an inline handler:

```tsx
async function handleUnbookmark(templateId: string) {
  try {
    await fetch(`/api/bookmarks/${templateId}`, { method: "DELETE" })
    setRemovedIds((prev) => new Set(prev).add(templateId))
  } catch {
    // silently fail, user can retry
  }
}
```

Add this function inside the component body, and use `onClick={() => handleUnbookmark(t.id)}` on the list view heart button instead of the direct `setRemovedIds` call.

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/nav-links.tsx` | Remove Home link + remove filter |
| `src/components/mobile-nav.tsx` | Remove Home link block |
| `src/app/dashboard/bookmarks/bookmarks-client.tsx` | Add view toggle, list view, switch to library variant cards |

**Reference files (read-only):**
| File | Why |
|------|-----|
| `src/app/dashboard/library-client.tsx` | Pattern reference for list view + view toggle |
| `src/components/template-card.tsx` | Confirm `variant="library"` accepts optional `purchaseDate`/`userRating` |

## Verification

After implementation:
1. Navigate desktop/mobile nav — Home should be gone, logo still links to `/`
2. Breadcrumb on `/templates/[slug]` should still show "Home" (untouched)
3. Bookmarks page: card/list toggle works, persists to localStorage
4. Card view: smaller library-style cards with "View Listing" button
5. List view: table with thumbnail, title, seller, category, price, rating, unbookmark button
6. Unbookmark works in both views (optimistic removal + API call)
7. "✓ Purchased" badge shows in both views for purchased items
