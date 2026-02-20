# Molt Mart Explore Page Redesign — UX Research & Recommendations

## 1. Card Redesign

### Current Problems
- `aspect-video` (16:9) thumbnail = ~50% of card height
- `line-clamp-2` description wastes vertical space (nobody reads descriptions while scanning)
- CardHeader + CardContent + CardFooter = too much vertical chrome
- No `next/image` — raw `<img>` tags, no optimization

### Recommended: Compact Card (Default)

**Remove from default card:**
- Description (`line-clamp-2` paragraph) — move to hover/detail only
- Timestamp in footer (keep "NEW" badge)
- Seller avatar row (move to hover overlay)

**New card structure:**
```tsx
// ~180px tall total on desktop vs current ~320px
<Link>
  <div className="group relative rounded-lg border border-border/50 bg-card overflow-hidden transition-all hover:shadow-md hover:border-border">
    {/* Thumbnail: 4:3 ratio instead of 16:9 — shows more cards */}
    <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
      <Image src={...} alt={...} fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw" />
      {/* Overlay badges */}
      {isNew && <Badge className="absolute top-2 left-2 ...">NEW</Badge>}
      {isFeatured && <Badge className="absolute top-2 right-2 ...">⭐ Featured</Badge>}
      {price === 0 && <Badge className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px]">FREE</Badge>}
    </div>
    {/* Metadata: tight, 2 lines max */}
    <div className="p-2.5">
      <h3 className="font-medium text-sm leading-tight line-clamp-1">{title}</h3>
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3 fill-yellow-500 text-yellow-500" />
          <span>{rating}</span>
          <span>·</span>
          <span>{downloads}</span>
        </div>
        <span className="font-semibold text-sm">{price}</span>
      </div>
    </div>
  </div>
</Link>
```

**Why:** Gumroad, Figma Community, and VS Code Extensions all use compact cards — thumbnail + title + minimal metadata. Creative Market shows description only on hover. This pattern lets users scan 3-4x more items.

**Thumbnail ratio:** `aspect-[4/3]` instead of `aspect-video`. Figma Community uses ~4:3. It's 25% shorter than 16:9 while still showing enough of the template.

**Priority:** 🔴 MUST-HAVE

---

## 2. Grid Density

### Current
```
grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```
On 1920px: 4 columns × huge cards = 4-8 visible. No xl/2xl breakpoints.

### Recommended
```
grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
```

| Breakpoint | Columns | Approx width/card | Notes |
|---|---|---|---|
| default (mobile) | 2 | ~170px | Compact 2-col like app stores |
| sm (640px) | 3 | ~190px | Tablet portrait |
| md (768px) | 4 | ~175px | Tablet landscape |
| lg (1024px) | 5 | ~185px | Small desktop |
| xl (1280px) | 6 | ~195px | Standard desktop |
| 2xl (1536px) | 6 | ~235px | Large desktop (comfortable) |

**Gap:** Reduce from `gap-4` (16px) to `gap-3` (12px). Figma Community uses ~12px gaps.

**Result:** At 1920×1080, with compact cards, users see **18-24 items above the fold** (6 cols × 3-4 rows) vs current 4-8.

**Why:** Envato Market uses 5-6 columns at desktop. Creative Market uses 4-5. Figma Community uses 4-6. More density = faster scanning, more clicks.

**Priority:** 🔴 MUST-HAVE

---

## 3. Staff Picks Treatment

### Current Problem
Staff Picks renders in the same full grid (`sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`), taking 1-2 full rows and pushing organic content below fold.

### Recommended: Horizontal Carousel

```tsx
<section className="space-y-2">
  <div className="flex items-center justify-between">
    <h2 className="text-sm font-semibold flex items-center gap-1.5">
      ⭐ Staff Picks
    </h2>
    <Button variant="ghost" size="sm" className="text-xs">View all →</Button>
  </div>
  <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
    {featured.map(t => (
      <div key={t.id} className="snap-start shrink-0 w-[200px] sm:w-[220px]">
        <TemplateCard template={t} isFeatured variant="compact" />
      </div>
    ))}
  </div>
</section>
```

**Why:** Product Hunt uses horizontal carousels for featured content. Gumroad Discover uses a highlighted banner row. This takes ~180px vertical space (one row) instead of ~640px (two full grid rows). Organic results are immediately visible.

**Alternative:** If >6 featured items, use a swipeable carousel with left/right arrow buttons (like Netflix/Spotify pattern).

**Priority:** 🔴 MUST-HAVE

---

## 4. Filters

### Current: Only category pills + sort dropdown. No price filter, no "Free" toggle.

### Recommended: Inline Filter Bar (not sidebar)

Sidebar filters are overkill for Molt Mart's current catalog size. Inline filters (like Gumroad, VS Code Extensions) are better for <1000 items.

```tsx
<div className="flex items-center gap-2 flex-wrap">
  {/* Free toggle — most requested filter pattern */}
  <Button
    variant={freeOnly ? "default" : "outline"}
    size="sm"
    className="h-7 text-xs"
    onClick={() => setFreeOnly(!freeOnly)}
  >
    Free
  </Button>

  {/* Price range dropdown */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" className="h-7 text-xs">
        Price {priceRange && `· ${priceRange}`}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => setPriceRange(null)}>Any price</DropdownMenuItem>
      <DropdownMenuItem onClick={() => setPriceRange("under-5")}>Under $5</DropdownMenuItem>
      <DropdownMenuItem onClick={() => setPriceRange("5-15")}>$5 – $15</DropdownMenuItem>
      <DropdownMenuItem onClick={() => setPriceRange("15-plus")}>$15+</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  {/* Rating filter */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" className="h-7 text-xs">
        Rating {minRating && `· ${minRating}+`}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => setMinRating(null)}>Any</DropdownMenuItem>
      <DropdownMenuItem onClick={() => setMinRating(4)}>4+ stars</DropdownMenuItem>
      <DropdownMenuItem onClick={() => setMinRating(3)}>3+ stars</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  {/* Category pills stay as-is but move to this row */}
  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
    {categories.map(cat => (
      <Badge key={cat} variant={...} className="cursor-pointer shrink-0 text-xs h-7" onClick={...}>
        {cat}
      </Badge>
    ))}
  </div>

  {/* Sort moves to far right */}
  <div className="ml-auto">
    <Select ...>...</Select>
  </div>
</div>
```

**Filters to add (Supabase query side):**
- `freeOnly`: `.eq("price_cents", 0)`
- `priceRange`: `.gte("price_cents", min).lte("price_cents", max)`
- `minRating`: `.gte("avg_rating", minRating)`

**Why:** Gumroad has a "Free" filter. Creative Market has price ranges. VS Code extensions has rating filters. These are the 3 most common filters in template marketplaces.

**When to add sidebar:** When catalog exceeds ~500 items OR when adding tag-based filtering. Then switch to a collapsible sidebar (240px wide, sticky).

**Priority:** 🔴 MUST-HAVE (Free toggle), 🟡 NICE-TO-HAVE (price range, rating)

---

## 5. Loading & Performance

### 5a. next/image
Replace all `<img>` with `next/image`:
```tsx
import Image from "next/image"

<Image
  src={template.screenshots[0]}
  alt={template.title}
  fill
  className="object-cover"
  sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 17vw"
  loading="lazy"        // default, explicit for clarity
  placeholder="blur"    // if blurDataURL available
  blurDataURL={template.blur_hash_url}  // generate on upload
/>
```

**Priority:** 🔴 MUST-HAVE

### 5b. Skeleton Loading States
```tsx
function TemplateCardSkeleton() {
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] w-full bg-muted" />
      <div className="p-2.5 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="flex justify-between">
          <div className="h-3 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-12" />
        </div>
      </div>
    </div>
  )
}

// Use in grid:
{loading && Array.from({ length: 12 }).map((_, i) => <TemplateCardSkeleton key={i} />)}
```

**Priority:** 🔴 MUST-HAVE

### 5c. Pagination: Cursor-based Infinite Scroll
Current: Hard limit of 50 items, no "load more."

```tsx
// Replace limit(50) with cursor pagination
const PAGE_SIZE = 30  // smaller pages, faster loads

// IntersectionObserver sentinel at bottom of grid
const sentinelRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting && hasMore && !loading) loadMore() },
    { rootMargin: "200px" }  // pre-fetch 200px before visible
  )
  if (sentinelRef.current) observer.observe(sentinelRef.current)
  return () => observer.disconnect()
}, [hasMore, loading])

// Cursor: use last item's created_at + id for stable pagination
const loadMore = async () => {
  const lastItem = templates[templates.length - 1]
  let q = supabase.from("templates").select(SELECT_QUERY)
    .eq("status", "published")
    .lt("created_at", lastItem.created_at)  // cursor
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE)
  // ... apply same filters
}
```

**Priority:** 🔴 MUST-HAVE

---

## 6. Hover States

### Current: Only `hover:shadow` on card. No preview, no actions.

### Recommended: Overlay with Quick Actions

```tsx
{/* Add to the card thumbnail area */}
<div className="aspect-[4/3] w-full overflow-hidden bg-muted relative group">
  <Image ... className="object-cover transition-transform duration-300 group-hover:scale-105" />

  {/* Hover overlay */}
  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
    {/* Quick actions */}
    <div className="flex gap-1.5">
      <Button size="icon" variant="secondary" className="size-7 rounded-full bg-white/90 hover:bg-white" onClick={e => { e.preventDefault(); /* bookmark */ }}>
        <Bookmark className="size-3.5" />
      </Button>
      <Button size="icon" variant="secondary" className="size-7 rounded-full bg-white/90 hover:bg-white" onClick={e => { e.preventDefault(); /* quick view modal */ }}>
        <Eye className="size-3.5" />
      </Button>
    </div>
    {/* Seller avatar */}
    <Avatar className="size-6 border-2 border-white">
      <AvatarImage src={seller.avatar_url} />
    </Avatar>
  </div>
</div>
```

**Why:** Creative Market shows bookmark + quick view on hover. Envato shows "Live Preview" button. This moves the bookmark button (currently inline) to hover-only, saving space.

**Optional enhancement:** "Quick Preview" modal that shows full description, all screenshots, seller info, and "Add to Cart" without leaving the explore page. Figma Community does this.

**Priority:** 🟡 NICE-TO-HAVE (improves engagement but not blocking)

---

## 7. Mobile Layout

### Current: Single column full-width cards = enormous, ~3 cards per viewport.

### Recommended: 2-Column Compact Grid

```
grid grid-cols-2 gap-2 sm:grid-cols-3 ...
```

With the compact card design (no description, `aspect-[4/3]` thumbnail, tight padding), 2 columns on mobile shows **6-8 cards per viewport** — matching app store patterns (iOS App Store, Google Play).

**Mobile-specific adjustments:**
- `p-2` padding on card metadata (vs `p-2.5` desktop)
- `text-xs` for title (vs `text-sm`)
- Hide star rating on mobile to save space, keep only price
- Category pills: make horizontally scrollable (already done ✅)

```tsx
{/* Mobile-optimized metadata */}
<div className="p-2 sm:p-2.5">
  <h3 className="font-medium text-xs sm:text-sm leading-tight line-clamp-1">{title}</h3>
  <div className="flex items-center justify-between mt-1">
    <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
      <Star className="size-3" /> {rating}
    </span>
    <span className="font-semibold text-xs sm:text-sm">{price}</span>
  </div>
</div>
```

**Why:** Every successful mobile marketplace (Etsy, App Store, Google Play) uses 2-column grids. Single column is for content feeds (social media), not product browsing.

**Priority:** 🔴 MUST-HAVE

---

## Implementation Priority Order

| # | Change | Impact | Effort |
|---|--------|--------|--------|
| 1 | Card redesign (remove description, 4:3 ratio, compact) | 🔴 Critical | Medium |
| 2 | Grid density (6 cols desktop, 2 cols mobile) | 🔴 Critical | Small |
| 3 | Staff Picks → horizontal carousel | 🔴 Critical | Small |
| 4 | next/image + lazy loading | 🔴 Critical | Small |
| 5 | Skeleton loading states | 🔴 Critical | Small |
| 6 | Infinite scroll pagination | 🔴 Critical | Medium |
| 7 | Free filter toggle | 🔴 Critical | Small |
| 8 | Hover overlay with quick actions | 🟡 Nice | Medium |
| 9 | Price range + rating filters | 🟡 Nice | Small |
| 10 | Quick preview modal | 🟡 Nice | Large |

**Estimated total for must-haves:** 1-2 days of focused work. The card + grid changes are mostly Tailwind class swaps. The infinite scroll and next/image are straightforward refactors.

---

## Key Tailwind Classes Summary

```
// OLD grid
grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4

// NEW grid
grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6

// OLD thumbnail
aspect-video

// NEW thumbnail
aspect-[4/3]

// OLD card padding
CardHeader pb-2 + CardContent pb-2 + CardFooter

// NEW card padding
p-2.5 (single div, no Card sub-components needed)

// Staff picks carousel
flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide
// Each item: snap-start shrink-0 w-[200px] sm:w-[220px]
```
