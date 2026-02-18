# QA Investigation 2 — Molt Mart Bug Report

**Date:** 2026-02-16  
**Investigator:** QA Agent 2  
**Trigger:** Recent change wrapping entire TemplateCard in `<Link>`

---

## Issue 1: Nested `<a>` tags inside TemplateCard (CRITICAL)

**File:** `src/components/template-card.tsx`

The entire card is wrapped in `<Link href={templateUrl}>` which renders as `<a>`. Inside it:

- **SellerLink** (`src/components/seller-link.tsx`) renders another `<Link href={/sellers/...}>` = nested `<a>` inside `<a>`
- **BookmarkButton** is wrapped in `<span onClick={(e) => e.preventDefault()}>` — the `preventDefault()` stops outer Link navigation in the bookmark area, but the button itself works via `fetch()`. However the wrapping span's `e.preventDefault()` also prevents default on the outer `<a>`, which is hacky but functional.

**Impact:** Nested `<a>` tags are invalid HTML. Browser behavior is undefined — some browsers will close the outer `<a>` before opening the inner one, causing broken DOM structure. The SellerLink's `e.stopPropagation()` only stops the click from bubbling but doesn't fix the invalid nesting. This can cause:
- SellerLink clicks navigating to template page instead of seller page
- Hydration mismatches in React/Next.js
- Unpredictable click behavior across browsers

**Fix:** Replace the outer `<Link>` with a `<div>` that uses `onClick={() => router.push(templateUrl)}`, or use the card-as-link pattern with inner interactive elements using `position: relative; z-index` and removing them from the `<a>` tree.

---

## Issue 2: Download button on detail page — NOT caused by TemplateCard change

**Files:** `src/components/download-button.tsx`, `src/app/templates/[slug]/page.tsx`

The DownloadButton on the detail page is **standalone** in the sidebar, NOT inside a TemplateCard. The Link wrapper change should NOT affect it.

**However**, there's a potential bug in the download handler: After calling `res.blob()`, the response body has already been consumed by the `!res.ok` check path which calls `res.json()`. On the success path it calls `res.blob()` — this is fine because the branch is exclusive (`if !res.ok` returns early). **The download route and button code look correct.**

**If downloads are broken**, possible causes:
- The download API at `/api/templates/[id]/download` uses the template `id` (UUID), but `DownloadButton` receives `templateId={t.id}` which is the correct UUID. ✅
- Storage file might be missing (`template.file_path` could be null/invalid) — the route has a fallback to `preview_data` but if both are empty it 500s.
- Check if `createAdminClient` or Supabase storage credentials are configured correctly in production.

**Recommendation:** Add logging/error tracking to identify the actual failure point. The code logic itself appears sound.

---

## Issue 3: Similar Enhancements cards collapsed/cutting off text

**File:** `src/components/similar-templates.tsx`, `src/components/template-card.tsx`

The grid in `similar-templates.tsx`:
```html
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
```

Each TemplateCard renders:
```html
<Link className="block h-full">
  <Card className="h-full ...">
```

The `h-full` on both Link and Card means "100% of parent height." In a CSS Grid, each cell's height is determined by the tallest item in the row. This should work correctly for equal-height cards.

**BUT** — the `lg:grid-cols-4` in similar-templates creates 4 narrow columns. Combined with the card content (screenshot, badges, title, description, seller, ratings), the cards are squeezed horizontally. The `line-clamp-1` on title and `line-clamp-2` on description aggressively truncate text.

**The real layout issue:** On the detail page (`templates/[slug]/page.tsx`), the Similar Templates section is inside `lg:col-span-2` of a `lg:grid-cols-3` parent layout. So the available width is ~66% of the page. Then `lg:grid-cols-4` splits that into 4 columns — each card gets roughly **16% of viewport width**, which is extremely narrow. Cards will look squished/collapsed.

**Fix:** Change `similar-templates.tsx` grid to use fewer columns:
```
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
```
Or even `lg:grid-cols-2` given the constrained parent width.

---

## Issue 4: "More by Seller" section has the same narrow-column problem

**File:** `src/app/templates/[slug]/page.tsx` line ~155

```html
<div className="grid gap-4 sm:grid-cols-3">
```

This is also inside the `lg:col-span-2` area. 3 columns in 66% width = ~22% each. Better than the similar templates section but still tight.

**Recommendation:** Consider `sm:grid-cols-2 lg:grid-cols-3` or just `sm:grid-cols-2`.

---

## Issue 5: Nested links in Library "Leave a Review" and "View Listing"

**File:** `src/app/dashboard/library-client.tsx`

The `LibraryCard` component does NOT wrap the entire card in a `<Link>` (it uses targeted Links for screenshot and title). However, the "Leave a Review" button is inside a `<Link href={templateUrl}>` and "View Listing" is also a `<Link>`. These are fine — no nesting issue here since the outer card is just a `<Card>` (div), not a link.

**No issue here.** ✅

---

## Issue 6: Homepage carousel cards have fixed width, masking the nested-link problem

**File:** `src/components/infinite-carousel.tsx`

Cards in carousel are wrapped in `<div className="w-[300px]">`. The nested `<a>` issue (Issue 1) still exists but the fixed width prevents layout collapse. Users may still experience broken SellerLink clicks.

---

## Issue 7: BookmarkButton `e.preventDefault()` wrapper may cause confusion

**File:** `src/components/template-card.tsx`, line ~54

```jsx
<span onClick={(e) => e.preventDefault()}><BookmarkButton ... /></span>
```

The `e.preventDefault()` on the span prevents the outer `<Link>` from navigating when clicking the bookmark area. But `preventDefault` on a span's click doesn't actually prevent the parent `<a>`'s navigation — it prevents the **default action of the event on the `<a>`** only if the event reaches the `<a>` element. Since `BookmarkButton` internally calls `e.preventDefault(); e.stopPropagation()`, the span wrapper is redundant. The BookmarkButton should work correctly.

However, the SellerLink wrapper uses `e.stopPropagation()` but NOT `e.preventDefault()`:
```jsx
<span onClick={(e) => e.stopPropagation()}>
  <SellerLink ... />
</span>
```

`stopPropagation` stops the event from reaching the outer `<Link>`'s onClick handler, but it does NOT prevent the nested `<a>` (SellerLink) default navigation — which is the desired behavior. However, because of nested `<a>` invalid HTML, browsers may rewrite the DOM, making the SellerLink `<a>` NOT actually nested, which could cause the outer link to handle the click instead.

---

## Summary of Required Fixes

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | 🔴 Critical | Nested `<a>` tags (SellerLink inside card Link) | Refactor TemplateCard to avoid nesting `<a>` elements |
| 3 | 🟡 Medium | Similar Enhancements cards too narrow (4 cols in 66% width) | Reduce to `lg:grid-cols-2` or `lg:grid-cols-3` |
| 4 | 🟡 Medium | "More by Seller" cards also narrow (3 cols in 66% width) | Reduce to `sm:grid-cols-2` |
| 2 | 🟠 Investigate | Download button reported broken but code looks correct | Add error logging; check storage/credentials in production |
| 6 | 🟡 Low | Carousel cards have nested `<a>` (same as #1) | Fixed when #1 is fixed |
| 7 | ⚪ Info | Redundant `preventDefault` wrapper on BookmarkButton span | Clean up but not breaking |
