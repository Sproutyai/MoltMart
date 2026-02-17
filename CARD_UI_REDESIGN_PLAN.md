# Card UI Redesign Plan

## Problem
4 badges (category, difficulty, Featured, Free/price) in a single `flex justify-between` row overflow at 300px card width.

## Chosen Approach: Option A Hybrid
**Price moves to the title row. Featured becomes a top-edge accent bar. Badge row only has category + difficulty (always fits).**

### Reasoning
- Category + difficulty are metadata — they belong together as small badges
- Price is a primary decision factor — it belongs next to the title where eyes go first
- Featured is a promotional state — a subtle colored bar at the top of the card (before the screenshot) communicates it without eating badge space
- This approach works identically whether Featured/difficulty are present or not — no layout shifts

## Card Structure (top to bottom)

```
┌─────────────────────────────────┐
│ ▀▀▀ amber bar if Featured ▀▀▀  │  ← 3px h, full-width, amber-400 (conditional)
├─────────────────────────────────┤
│  [screenshot image]             │  ← aspect-video, optional
├─────────────────────────────────┤
│  [Category] [🟢 Difficulty]     │  ← badge row, flex gap-2, flex-wrap just in case
├─────────────────────────────────┤
│  Title Here              $4.99  │  ← flex justify-between, title truncated, price right
│                      or [Free]  │
│                           [🔖]  │  ← bookmark button inline with price
├─────────────────────────────────┤
│  Description text clamp 2 lines │
│  @seller  ✓                     │
├─────────────────────────────────┤
│  ★★★★☆ (12)          ↓ 340     │  ← footer: rating left, downloads right
│  🕐 2 days ago  ✨NEW           │  ← timestamp row (conditional)
└─────────────────────────────────┘
```

## Detailed Implementation

### 1. Featured indicator (replaces Featured badge)
```tsx
{isFeatured && (
  <div className="h-1 w-full bg-amber-400 dark:bg-amber-500 rounded-t-lg" />
)}
```
- Placed as first child inside `<Card>`, before screenshot
- No space consumed, visually distinct with the existing amber border

### 2. Badge row (CardHeader top)
```tsx
<div className="flex items-center gap-2 flex-wrap">
  <Badge variant="outline" className="text-xs">{template.category}</Badge>
  {template.difficulty && (
    <Badge variant="outline" className="text-xs ...">{emoji} {template.difficulty}</Badge>
  )}
</div>
```
- Max 2 badges — always fits at 300px
- `flex-wrap` as safety net

### 3. Title + Price + Bookmark row
```tsx
<div className="mt-2 flex items-start justify-between gap-2">
  <h3 className="font-semibold leading-tight line-clamp-1 min-w-0">{template.title}</h3>
  <div className="flex items-center gap-1.5 flex-shrink-0">
    {priceDisplay}
    <BookmarkButton templateId={template.id} size={16} />
  </div>
</div>
```
- Title takes remaining space, truncates with `line-clamp-1`
- Price + bookmark pinned right, never wraps

### 4. Price display update
- Free: `<Badge>` stays as-is (small green badge)
- Paid: `<span className="font-bold text-sm whitespace-nowrap">$4.99</span>`

### 5. No changes needed to CardContent or CardFooter
They already work fine.

## Badge Combinations

| Featured | Difficulty | Screenshot | Result |
|----------|-----------|------------|--------|
| ✅ | ✅ | ✅ | Amber bar → image → [category][difficulty] → title + price |
| ✅ | ❌ | ✅ | Amber bar → image → [category] → title + price |
| ❌ | ✅ | ❌ | No bar → [category][difficulty] → title + price |
| ❌ | ❌ | ❌ | No bar → [category] → title + price |

All combinations produce a clean, non-overflowing layout.

## Key Tailwind Classes
- Featured bar: `h-1 w-full bg-amber-400 dark:bg-amber-500`
- Badge row: `flex items-center gap-2 flex-wrap`
- Title row: `mt-2 flex items-start justify-between gap-2`
- Price area: `flex items-center gap-1.5 flex-shrink-0`
- Title: `font-semibold leading-tight line-clamp-1 min-w-0`
