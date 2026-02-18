# Homepage Carousel & Layout Plan

## Overview
Three changes to `src/app/page.tsx`:
1. Popular Enhancements → auto-scrolling carousel (left-to-right)
2. New Enhancements → move directly below Popular, carousel (right-to-left)
3. Categories → fix 5-item layout

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/infinite-carousel.tsx` | **CREATE** — reusable carousel component |
| `src/app/page.tsx` | **MODIFY** — replace Popular grid, reorder sections, fix categories |
| `src/components/new-listings-snippet.tsx` | **MODIFY** — use carousel instead of grid, increase limit to 10 |
| `src/app/globals.css` | **MODIFY** — add keyframes for carousel animation |

---

## 1. Infinite Carousel Component

### Approach: CSS `@keyframes` + duplicated children

Create `src/components/infinite-carousel.tsx`:

```tsx
"use client"

import { ReactNode } from "react"

interface InfiniteCarouselProps {
  children: ReactNode[]
  direction?: "left" | "right"  // "left" = cards move left (standard), "right" = cards move right
  speed?: number // seconds for one full cycle, default 30
}

export function InfiniteCarousel({ children, direction = "left", speed = 30 }: InfiniteCarouselProps) {
  // We render children twice for seamless loop
  const animationClass = direction === "left" ? "animate-scroll-left" : "animate-scroll-right"

  return (
    <div className="overflow-hidden">
      <div
        className={`flex gap-5 ${animationClass}`}
        style={{ animationDuration: `${speed}s` }}
        // Pause on hover for UX
        onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
        onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
      >
        {/* First set */}
        {children.map((child, i) => (
          <div key={`a-${i}`} className="w-[300px] flex-shrink-0 sm:w-[340px]">
            {child}
          </div>
        ))}
        {/* Duplicate set for seamless loop */}
        {children.map((child, i) => (
          <div key={`b-${i}`} className="w-[300px] flex-shrink-0 sm:w-[340px]" aria-hidden>
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### CSS Keyframes

Add to `src/app/globals.css`:

```css
@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes scroll-right {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

.animate-scroll-left {
  animation: scroll-left linear infinite;
}

.animate-scroll-right {
  animation: scroll-right linear infinite;
}
```

**How it works:** The flex container holds 2× the cards. `scroll-left` translates from 0 to -50% (halfway, i.e. exactly one set width). When set A scrolls off-screen left, set B is in exactly the same position set A started — seamless loop. `scroll-right` is the reverse.

**Mobile:** Works identically. Cards are 300px wide so ~1.2 visible on small screens, which looks good for a carousel. The overflow is hidden so no horizontal page scroll.

---

## 2. Changes to `page.tsx`

### Popular Enhancements Section

Change the query limit from 6 to 10. Replace the grid with `InfiniteCarousel`:

```tsx
import { InfiniteCarousel } from "@/components/infinite-carousel"

// In the query:
.limit(10)

// Replace the grid section:
<section className="mx-auto max-w-full overflow-hidden">
  <div className="mb-6 mx-auto max-w-6xl flex items-center justify-between px-4">
    <h2 className="text-2xl font-bold sm:text-3xl">Popular Enhancements</h2>
    <Button variant="ghost" asChild>
      <Link href="/templates">View All →</Link>
    </Button>
  </div>
  <InfiniteCarousel direction="right" speed={35}>
    {(templates as ...).map((t) => (
      <TemplateCard key={t.id} template={t} />
    ))}
  </InfiniteCarousel>
</section>
```

> **Direction note:** Thomas says "left to right" meaning the cards *appear to move* left-to-right. That means new cards enter from the left and exit right → the CSS translateX goes from negative to zero → use `direction="right"`. Conversely "right to left" for New Enhancements uses `direction="left"`.

### New Enhancements — Move Directly Below Popular

Currently `<NewListingsSnippet />` is rendered after Categories. Move it to immediately after the Popular section. The section order becomes:

1. Hero
2. Featured (Suspense)
3. **Popular Enhancements** (carousel, L→R)
4. **New Enhancements** (carousel, R→L)  ← moved up
5. Categories
6. How it works
7. For Sellers

### Modify `new-listings-snippet.tsx`

- Change `.limit(4)` → `.limit(10)`
- Replace the grid with `InfiniteCarousel direction="left"`:

```tsx
import { InfiniteCarousel } from "@/components/infinite-carousel"

// ... existing query but with .limit(10)

return (
  <section className="mx-auto max-w-full overflow-hidden">
    <div className="mb-6 mx-auto max-w-6xl flex items-center justify-between px-4">
      <h2 className="text-2xl font-bold sm:text-3xl">🆕 New Enhancements</h2>
      <Button variant="ghost" asChild>
        <Link href="/templates/new">View All →</Link>
      </Button>
    </div>
    <InfiniteCarousel direction="left" speed={35}>
      {(templates as ...).map((t) => (
        <TemplateCard key={t.id} template={t} showTimestamp />
      ))}
    </InfiniteCarousel>
  </section>
)
```

### Conveyor Belt Effect

Both carousels use `speed={35}` (same speed) so when both are visible on screen, the opposing motion creates a satisfying conveyor belt effect. Reduce `space-y-20` gap between these two sections to `space-y-10` or even less to keep them visually paired. 

**Implementation detail:** Since Popular and New are inside the `space-y-20` div, consider wrapping just these two in a `<div className="space-y-8">` to tighten the gap between them while keeping the larger gap before/after.

---

## 3. Categories — 5 Items Layout Fix

**Choice: 5 columns on desktop, horizontal scroll on mobile.**

Replace the categories grid classes:

```tsx
<section className="mx-auto max-w-4xl">
  <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">Enhancement Categories</h2>
  <div className="flex gap-4 overflow-x-auto pb-2 sm:overflow-visible sm:grid sm:grid-cols-5">
    {CATEGORIES.map((cat) => {
      const Icon = CATEGORY_ICONS[cat] ?? Zap
      return (
        <Link key={cat} href={`/templates?category=${encodeURIComponent(cat)}`} className="min-w-[140px] flex-shrink-0 sm:min-w-0">
          <Card className="group cursor-pointer border transition-colors hover:border-primary hover:bg-primary/5">
            <CardContent className="flex flex-col items-center gap-2 py-4">
              <Icon className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="text-sm font-medium">{cat}</span>
            </CardContent>
          </Card>
        </Link>
      )
    })}
  </div>
</section>
```

**Desktop (sm+):** 5-column grid, all items in one clean row. At `max-w-4xl` (~896px) each card is ~170px wide — plenty of room.

**Mobile:** Horizontal scroll with `overflow-x-auto`. Each card has `min-w-[140px]` so they're tappable. The `pb-2` adds padding for the scrollbar. Hide scrollbar with CSS if desired:

```css
/* Optional: hide scrollbar on category row */
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

---

## Section Order in Final `page.tsx`

```
<div className="-mx-4 -my-6">
  {/* Hero */}
  
  <div className="space-y-20 px-4 py-16">
    {/* Featured */}
    <Suspense fallback={null}><FeaturedSection /></Suspense>

    {/* Conveyor belt pair — tighter spacing */}
    <div className="space-y-8">
      {/* Popular Enhancements — carousel direction="right" (L→R) */}
      {/* New Enhancements — carousel direction="left" (R→L) */}
      <Suspense fallback={null}><NewListingsSnippet /></Suspense>
    </div>

    {/* Categories — 5-col grid */}
    {/* How it works */}
    {/* For Sellers */}
  </div>
</div>
```

---

## Edge Cases & Notes

- **< 10 templates:** Carousel still works with fewer cards since we duplicate them. Even 3 cards (rendered as 6) will loop. If only 1-2 exist, consider falling back to a static display. Add: `if (templates.length < 3) return <static grid>`.
- **NewListingsSnippet returns null** when no new templates exist in the past week. That's fine — the Popular carousel still shows alone.
- **Accessibility:** `aria-hidden` on the duplicate set prevents screen readers from reading cards twice. Pause-on-hover lets users interact with cards.
- **Performance:** CSS animations are GPU-accelerated (`transform`), so this is very performant. No JS animation frames needed.
- **Card width:** Fixed at 300px/340px(sm) via the carousel wrapper. The `TemplateCard` component should fill its container width — verify it uses `w-full` or doesn't have a fixed width.
- **Links inside carousel:** Cards are clickable links. Verify click works fine during animation (it does — CSS transforms don't block pointer events). The pause-on-hover helps here too.
