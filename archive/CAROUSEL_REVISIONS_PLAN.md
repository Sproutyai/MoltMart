# Carousel Revisions Plan

## Files to Modify
1. `src/components/featured-section.tsx`
2. `src/components/template-card.tsx`
3. `src/components/new-listings-snippet.tsx`
4. `src/app/page.tsx`

## 1. Convert Featured Section to Carousel (R→L)

**File: `src/components/featured-section.tsx`**

- Add import: `import { InfiniteCarousel } from "@/components/infinite-carousel"`
- Change limit from `.limit(6)` to `.limit(10)` (more cards for smooth carousel looping)
- Replace the static grid with InfiniteCarousel. Change:

```tsx
// OLD — the entire return block
return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold sm:text-3xl">⭐ Featured Enhancements</h2>
        <Button variant="ghost" asChild>
          <Link href="/templates/featured">View All →</Link>
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((t) => (
          <TemplateCard key={t.id} template={t as Template & { seller: { username: string; display_name: string | null } }} isFeatured />
        ))}
      </div>
    </section>
  )
```

```tsx
// NEW
return (
    <section className="mx-auto max-w-full overflow-hidden">
      <div className="mb-6 mx-auto max-w-6xl flex items-center justify-between px-4">
        <h2 className="text-2xl font-bold sm:text-3xl">⭐ Featured</h2>
        <Button variant="ghost" asChild>
          <Link href="/templates/featured">View All →</Link>
        </Button>
      </div>
      <InfiniteCarousel direction="left" speed={35}>
        {sorted.map((t) => (
          <TemplateCard key={t.id} template={t as Template & { seller: { username: string; display_name: string | null } }} isFeatured />
        ))}
      </InfiniteCarousel>
    </section>
  )
```

Key changes:
- `max-w-6xl` → `max-w-full overflow-hidden` on section
- Header wrapper gets `mx-auto max-w-6xl px-4` (matches Popular/New)
- Grid replaced with `<InfiniteCarousel direction="left" speed={35}>`
- `direction="left"` = content moves left = visually scrolls Right-to-Left ✓

## 2. Border Colors for Popular and New Cards

**File: `src/components/template-card.tsx`**

Add a new prop `borderColor` to support per-section coloring:

```tsx
// OLD interface
interface TemplateCardProps {
  template: Template & { seller?: { ... } }
  showTimestamp?: boolean
  isFeatured?: boolean
}
```

```tsx
// NEW interface
interface TemplateCardProps {
  template: Template & { seller?: { ... } }
  showTimestamp?: boolean
  isFeatured?: boolean
  borderColor?: "amber" | "green" | "red"
}
```

Update the destructuring:
```tsx
// OLD
export function TemplateCard({ template, showTimestamp, isFeatured }: TemplateCardProps) {
```
```tsx
// NEW
export function TemplateCard({ template, showTimestamp, isFeatured, borderColor }: TemplateCardProps) {
```

Update the Card className. Replace:
```tsx
// OLD
${isFeatured ? 'ring-1 ring-amber-300 dark:ring-amber-700' : ''}
```
```tsx
// NEW
${borderColor === 'amber' || isFeatured ? 'ring-1 ring-amber-300 dark:ring-amber-700' : ''}${borderColor === 'green' ? 'ring-1 ring-emerald-400 dark:ring-emerald-600' : ''}${borderColor === 'red' ? 'ring-1 ring-rose-400 dark:ring-rose-600' : ''}
```

Cleaner approach — compute the ring class before the JSX:
```tsx
// Add after the priceDisplay variable, before handleBeacon:
const ringClass =
    borderColor === "green" ? "ring-1 ring-emerald-400 dark:ring-emerald-600"
  : borderColor === "red" ? "ring-1 ring-rose-400 dark:ring-rose-600"
  : (borderColor === "amber" || isFeatured) ? "ring-1 ring-amber-300 dark:ring-amber-700"
  : ""
```

Then in the Card className, replace:
```
${isFeatured ? 'ring-1 ring-amber-300 dark:ring-amber-700' : ''}
```
with:
```
${ringClass}
```

### Pass borderColor from each section:

**File: `src/app/page.tsx`** — Popular section cards:
```tsx
// OLD
<TemplateCard key={t.id} template={t} />
```
```tsx
// NEW
<TemplateCard key={t.id} template={t} borderColor="green" />
```

**File: `src/components/new-listings-snippet.tsx`** — New section cards:
```tsx
// OLD
<TemplateCard key={t.id} template={t} showTimestamp />
```
```tsx
// NEW
<TemplateCard key={t.id} template={t} showTimestamp borderColor="red" />
```

**File: `src/components/featured-section.tsx`** — Featured cards already use `isFeatured` which maps to amber. No change needed (the `isFeatured` fallback handles it).

## 3. Uniform Spacing

All three carousels already use `InfiniteCarousel` which has `gap-5` (20px) and card width `w-[300px] sm:w-[340px]`. After converting Featured to use InfiniteCarousel, spacing is automatically unified. **No additional changes needed.**

## 4. Simplify Titles

**File: `src/components/featured-section.tsx`**
```
OLD: "⭐ Featured Enhancements"
NEW: "⭐ Featured"
```
(Already handled in revision #1 above)

**File: `src/app/page.tsx`** — Popular section:
```
OLD: "Popular Enhancements"
NEW: "Popular"
```

**File: `src/components/new-listings-snippet.tsx`**:
```
OLD: "🆕 New Enhancements"
NEW: "🆕 New"
```

## 5. Add 20px Space Below "Browse OpenClaw Upgrades"

**File: `src/app/page.tsx`**

The h2 "Browse OpenClaw Upgrades" currently has `mb-[-10px] mt-[-10px]`. The Featured section is inside a `space-y-20` container. We need 20px gap between the heading and the featured carousel.

Replace:
```tsx
<h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl mb-[-10px] mt-[-10px]">
```
With:
```tsx
<h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl mb-[20px] mt-[-10px]">
```

But `space-y-20` (80px) between children will override. The h2 and FeaturedSection are siblings inside `space-y-20`. To get exactly 20px gap, we should also adjust. Best approach: wrap the h2 and FeaturedSection together so `space-y-20` doesn't add 80px between them.

**Better fix:** Move Featured into same wrapper as h2, remove from space-y-20 flow:

Replace in page.tsx:
```tsx
<h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl mb-[-10px] mt-[-10px]">
          Browse OpenClaw Upgrades
        </h2>

        {/* Featured Templates */}
        <Suspense fallback={null}>
          <FeaturedSection />
        </Suspense>
```
With:
```tsx
<div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl mt-[-10px] mb-[20px]">
            Browse OpenClaw Upgrades
          </h2>

          {/* Featured Templates */}
          <Suspense fallback={null}>
            <FeaturedSection />
          </Suspense>
        </div>
```

This wraps them in a single div so `space-y-20` treats them as one unit, and the `mb-[20px]` on the h2 creates exactly 20px gap to the carousel.

## Summary of All Edits

| File | Changes |
|------|---------|
| `src/components/template-card.tsx` | Add `borderColor` prop, compute `ringClass`, use in Card className |
| `src/components/featured-section.tsx` | Import InfiniteCarousel, change limit to 10, replace grid with `<InfiniteCarousel direction="left" speed={35}>`, update section/header classes, rename title to "⭐ Featured" |
| `src/components/new-listings-snippet.tsx` | Add `borderColor="red"` to TemplateCard, rename title to "🆕 New" |
| `src/app/page.tsx` | Add `borderColor="green"` to Popular TemplateCards, rename "Popular Enhancements" → "Popular", wrap h2+FeaturedSection in div with `mb-[20px]` on h2 |

## Carousel Direction Verification
- `direction="left"` → uses `scroll-left` animation → `translateX(0) → translateX(-50%)` → content moves LEFT = new content enters from RIGHT = **Right-to-Left** ✓
- `direction="right"` → uses `scroll-right` animation → `translateX(-50%) → translateX(0)` → content moves RIGHT = new content enters from LEFT = **Left-to-Right** ✓

Final pattern:
- **Featured:** `direction="left"` → R→L ✓
- **Popular:** `direction="right"` → L→R ✓ (already set in page.tsx)
- **New:** `direction="left"` → R→L ✓ (already set in new-listings-snippet.tsx)
