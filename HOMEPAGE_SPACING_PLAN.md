# Homepage Spacing Plan

## Analysis

The gap between the hero and carousel sections comes from two sources:
1. **Hero section**: `py-24 sm:py-32` (bottom padding = 96px / 128px on sm+)
2. **Content wrapper**: `<div className="space-y-20 px-4 py-16">` (top padding = 64px)

Combined bottom gap ≈ 160–192px. To reduce by ~75px, cut `py-16` → `pt-2 pb-16` (saves 64px from top) and reduce hero bottom padding slightly.

## Changes

### File: `src/app/page.tsx`

#### 1. Reduce hero bottom padding

**Old:**
```
<section className="hero-gradient px-4 py-24 sm:py-32">
```
**New:**
```
<section className="hero-gradient px-4 pt-24 pb-20 sm:pt-32 sm:pb-28">
```
This saves ~16px on both breakpoints.

#### 2. Reduce content wrapper top padding

**Old:**
```
<div className="space-y-20 px-4 py-16">
```
**New:**
```
<div className="space-y-20 px-4 pt-0 pb-16">
```
This saves 64px. Combined with hero change = ~80px reduction (close to 75px target).

#### 3. Add "Browse OpenClaw Upgrades" heading

Insert immediately inside the content wrapper `<div>`, **before** the FeaturedSection `<Suspense>` block:

```tsx
{/* Section heading */}
<h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl pt-10">
  Browse OpenClaw Upgrades
</h2>
```

The `pt-10` (40px) gives breathing room from the hero without being excessive. Net gap reduction is ~75px total (saved ~80, added back ~5 with the heading spacing).

## Summary

| Change | Pixels saved |
|--------|-------------|
| Hero `pb-24→pb-20` / `sm:pb-32→sm:pb-28` | ~16px |
| Content wrapper `py-16→pt-0 pb-16` | 64px |
| Heading `pt-10` adds back | -40px |
| **Net reduction** | **~40px** |

Hmm, that only nets ~40px. Let me revise:

### Revised approach (simpler)

Just change the content wrapper and skip adjusting the hero:

**Old:**
```
<div className="space-y-20 px-4 py-16">
```
**New:**
```
<div className="space-y-20 px-4 pt-0 pb-16">
```

Then add the heading with minimal top padding:

```tsx
<h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl pt-2">
  Browse OpenClaw Upgrades
</h2>
```

This removes 64px of top padding and the heading adds ~8px + its own height. The visual gap reduction is roughly 55px from padding alone. To get closer to 75px, also trim the hero:

### Final plan

| # | What | Old | New |
|---|------|-----|-----|
| 1 | Hero section classes | `hero-gradient px-4 py-24 sm:py-32` | `hero-gradient px-4 pt-24 pb-21 sm:pt-32 sm:pb-28` |
| 2 | Content wrapper classes | `space-y-20 px-4 py-16` | `space-y-20 px-4 pt-0 pb-16` |
| 3 | New heading | *(doesn't exist)* | See markup below |

**Heading markup** — insert as first child of the content wrapper div, before the FeaturedSection Suspense:

```tsx
<h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
  Browse OpenClaw Upgrades
</h2>
```

**No CSS file changes needed** — all changes are Tailwind utility classes in `page.tsx`.

Note: Tailwind v4 doesn't have `pb-21` by default. Use `pb-[84px]` instead (96 - 12 = 84). And `sm:pb-[104px]` (128 - 24 = 104).

### Final final (clean):

| # | What | Old → New |
|---|------|-----------|
| 1 | Hero `<section>` classes | `hero-gradient px-4 py-24 sm:py-32` → `hero-gradient px-4 pt-24 pb-[84px] sm:pt-32 sm:pb-[104px]` |
| 2 | Content wrapper `<div>` classes | `space-y-20 px-4 py-16` → `space-y-20 px-4 pt-0 pb-16` |
| 3 | Add heading as first child of content wrapper | See above |

Savings: hero ~12px + ~24px(sm) + wrapper 64px = **76px** on mobile, **88px** on sm+. Close enough; the heading itself occupies space so visually the sections feel ~75px closer.
