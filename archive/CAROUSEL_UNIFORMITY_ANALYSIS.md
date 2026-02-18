# Carousel Uniformity Analysis

## Summary

3 carousels: **Featured** (FeaturedSection), **Popular** (inline in page.tsx), **New** (NewListingsSnippet)

---

## 1. STRUCTURAL LAYOUT ISSUE (High Priority)

**Problem:** Featured is inside the first `<div>` with `space-y-20`, while Popular + New are grouped together in a nested `<div className="space-y-8">`. This creates **unequal vertical spacing**:
- Gap between Featured → Popular: `80px` (space-y-20)
- Gap between Popular → New: `32px` (space-y-8)

**Location:** `page.tsx` lines ~75-105

**Fix:** Move all 3 carousels into the same container with uniform spacing:
```tsx
<div className="space-y-12">
  <Suspense fallback={null}><FeaturedSection /></Suspense>
  {/* Popular */}
  <section>...</section>
  <Suspense fallback={null}><NewListingsSnippet /></Suspense>
</div>
```

---

## 2. CAROUSEL PROPS INCONSISTENCY (Medium Priority)

| Prop | Featured | Popular | New |
|------|----------|---------|-----|
| direction | `left` | `right` | `left` |
| speed | `35` | `35` | `35` |
| gap | `gap-5` (20px) | `gap-5` | `gap-5` |
| card width | `300/340px` | `300/340px` | `300/340px` |

**✅ Speed, gap, card width are identical.** Direction varies intentionally (visual interest). No issue.

---

## 3. BORDER COLOR INCONSISTENCY (High Priority)

**Problem:** Featured cards use `isFeatured` prop (no `borderColor`), Popular uses `borderColor="green"`, New uses `borderColor="red"`.

In `template-card.tsx`, the ring logic:
- `borderColor === "green"` → `ring-1 ring-emerald-400 dark:ring-emerald-600`
- `borderColor === "red"` → `ring-1 ring-rose-400 dark:ring-rose-600`
- `borderColor === "amber"` OR `isFeatured` → `ring-1 ring-amber-300 dark:ring-amber-700`
- No borderColor & not featured → `""` (no ring)

**Issue:** Featured section passes `isFeatured` but not `borderColor="amber"`. This works because of the `|| isFeatured` fallback — **but it's inconsistent API usage**. Should pass `borderColor="amber"` explicitly for clarity.

**Ring assessment:** `ring-1` creates a 1px outline around the full card on all sides. ✅ Works correctly.

**Dark mode:** Amber uses `dark:ring-amber-700` which is quite dark/subtle. Emerald uses `dark:ring-emerald-600` and rose `dark:ring-rose-600` — these are brighter. **Amber ring may be too subtle in dark mode.**

**Fix:** Change `dark:ring-amber-700` to `dark:ring-amber-500` for better dark mode visibility. Also pass `borderColor="amber"` explicitly in FeaturedSection.

---

## 4. HOVER GLOW vs RING CONFLICT (Low Priority)

**Hover effect:** `hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]` (amber glow in light) and `dark:hover:shadow-[0_0_25px_rgba(239,68,68,0.18)]` (red glow in dark).

**Issue:** The hover glow is always amber/red regardless of the card's ring color. A green-ringed Popular card glows amber on hover — visually contradictory.

**Fix (Low priority):** Either make glow neutral (white/gray) or remove it. A subtle neutral glow works better:
```
hover:shadow-[0_0_20px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.06)]
```

---

## 5. SECTION HEADING INCONSISTENCY (Medium Priority)

| Section | Heading | Emoji | Wrapper |
|---------|---------|-------|---------|
| Featured | `⭐ Featured` | Yes | Own section component |
| Popular | `Popular` | No | Inline in page.tsx |
| New | `🆕 New` | Yes | Own section component |

**Issues:**
- Popular has NO emoji while Featured and New do. Inconsistent.
- "Browse OpenClaw Upgrades" h2 sits above Featured with custom negative margin `mt-[-10px] mb-[20px]` — hacky.

**Fix:** Add emoji to Popular: `🔥 Popular` or remove emojis from all. I recommend adding `🔥` for consistency.

---

## 6. "Browse OpenClaw Upgrades" TITLE SPACING (Medium Priority)

**Location:** `page.tsx` — `mt-[-10px] mb-[20px]`

**Problem:** Negative margin is fragile. The title conceptually spans all 3 carousels but is only grouped with Featured in the first div.

**Fix:** Make it a standalone element above the unified carousel container:
```tsx
<h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-10">
  Browse OpenClaw Upgrades
</h2>
<div className="space-y-12">
  {/* all 3 carousels */}
</div>
```

---

## 7. SECTION HEADERS PADDING CONSISTENCY (Low Priority)

All 3 carousels use identical header markup:
```tsx
<div className="mb-6 mx-auto max-w-6xl flex items-center justify-between px-4">
```
✅ Consistent. No issue.

---

## 8. MOBILE CONSIDERATIONS (Low Priority)

- Cards at `w-[300px]` on mobile are fine (carousel scrolls)
- `overflow-hidden` on all sections ✅
- Touch pause with 3s resume delay ✅
- No issues found

---

## 9. FEATURED SECTION HIDE BEHAVIOR (✅ No Issue)

`FeaturedSection` returns `null` if no promotions or no published templates. ✅ Correct.

Since it's in the unified spacing container, hiding it won't leave awkward gaps (space-y only applies between visible children).

---

## 10. VISUAL DISTINCTION BETWEEN SECTIONS (Low Priority)

All 3 sections look very similar — just different headings. They may blur together on a long scroll.

**Optional enhancement:** Add a very subtle background to Featured section:
```tsx
<section className="mx-auto max-w-full overflow-hidden py-4 bg-amber-50/30 dark:bg-amber-950/10 rounded-xl">
```

**Priority:** Low — current design is clean. Only if it feels monotonous.

---

## Priority Summary

| # | Issue | Priority |
|---|-------|----------|
| 1 | Unequal vertical spacing (80px vs 32px) | **High** |
| 3 | Amber ring too subtle in dark mode | **High** |
| 5 | Missing emoji on Popular heading | **Medium** |
| 6 | Hacky negative margin on main title | **Medium** |
| 3b | Featured not passing borderColor explicitly | **Medium** |
| 4 | Hover glow color mismatch with ring | **Low** |
| 10 | Sections blur together visually | **Low** |
