# QA Investigation 1 — Findings

Investigation of bugs after commit `8d1a5bb` ("make entire template card clickable").

---

## Bug 1: Download Button on Template Detail Pages Doesn't Work

### Investigation
- `DownloadButton` is used in two places: template detail sidebar and library page
- In **neither** location is it inside a `<Link>` wrapper or `TemplateCard`
- The API route (`/api/templates/[id]/download`) looks correct — returns a zip blob with proper headers
- The frontend download flow (create blob URL → create `<a>` → click → cleanup) is a standard pattern

### Possible Root Causes
1. **Auth issue:** If the user isn't logged in, the API returns 401 and `handleDownload` shows a redirect — but there could be a cookie/session issue causing auth to silently fail
2. **Popup/download blocker:** The programmatic `a.click()` inside an async callback may be blocked by browsers since it's not in the direct call stack of a user gesture (the `await fetch()` breaks the trust chain)
3. **Response consumed twice on error path:** When `!res.ok`, the code calls `res.json()` then returns. This is fine. But if the response is ok but not actually a zip (e.g., a redirect or HTML error page), `res.blob()` would succeed but produce a corrupt file

### Most Likely Cause: **Browser blocks programmatic download**
The `a.click()` happens after `await fetch()` + `await res.blob()`, which breaks the user-gesture trust chain. Some browsers (especially Safari) will block this.

### Proposed Fix
Use a direct link approach instead of fetch+blob:
```tsx
// Option A: Open download URL directly
window.open(`/api/templates/${templateId}/download`, '_blank')

// Option B: Use an actual <a> with download attribute
// Change API to GET and use a hidden <a href="/api/..." download> that's clicked
```

Or keep the current approach but convert the POST endpoint to also accept GET requests, then use a simple `<a href="..." download>` link.

---

## Bug 2: Similar Enhancements Cards Collapsed/Cutting Off Text

### Root Cause
The `TemplateCard` was wrapped in `<Link className="block h-full">` in commit `8d1a5bb`. Inside CSS grid containers (used in `similar-templates.tsx` and the "More by seller" section), this adds an extra layer between the grid and the Card.

**Before:** Grid → Card (direct child, participates in grid sizing)
**After:** Grid → `<a class="block h-full">` → Card

The `<a>` with `display: block; height: 100%` inside a grid cell works in most cases, but combined with `overflow-hidden` on the Card, content can be clipped. The issue is especially visible when:
- Cards have no screenshots (reducing total height)
- The grid row height is determined by the shortest card
- `overflow-hidden` clips the footer content

Additionally, **nested `<a>` tags** (see Bug 4) can cause browsers to break the DOM structure, which can collapse card heights unpredictably.

### Proposed Fix
```tsx
// Change Link className from "block h-full" to proper flex:
<Link href={templateUrl} onClick={handleBeacon} className="flex flex-col h-full">
```
OR remove `overflow-hidden` from the Card and handle overflow on individual sections.

---

## Bug 3: BookmarkButton Wrapper Uses `preventDefault` Instead of `stopPropagation`

### Location
`template-card.tsx`:
```tsx
<span onClick={(e) => e.preventDefault()}><BookmarkButton templateId={template.id} size={16} /></span>
```

### Issue
`e.preventDefault()` on a `<span>` is meaningless — spans have no default action. The intent was to prevent the parent `<Link>` from navigating, which requires `e.stopPropagation()` (or `e.preventDefault()` on the **Link/anchor** element, not the span).

The `BookmarkButton` internally does both `e.preventDefault()` and `e.stopPropagation()` on its `<button>`, so direct button clicks work. **But** if the user clicks the span's padding area (not the button), the event bubbles to the Link and triggers navigation.

### Proposed Fix
```tsx
<span onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
  <BookmarkButton templateId={template.id} size={16} />
</span>
```

---

## Bug 4: Nested `<a>` Tags — Invalid HTML (HIGH SEVERITY)

### Issue
`TemplateCard` is now wrapped in `<Link>` (renders as `<a>`). Inside, `SellerLink` is also a `<Link>` (renders as `<a>`). **Nesting `<a>` inside `<a>` is invalid HTML per the spec.**

Browsers handle this by "repairing" the DOM — typically by closing the outer `<a>` before opening the inner one. This **breaks the card structure**, potentially causing:
- Card content to render outside the card boundaries
- Click areas to not work as expected
- The collapsed/clipped card appearance (contributes to Bug 2)
- Inconsistent behavior across browsers

### Evidence
The `SellerLink` component renders:
```html
<a href="/sellers/username">...</a>  <!-- inner link -->
```
Inside the card's outer:
```html
<a href="/templates/slug">...</a>  <!-- outer link -->
```

The `<span onClick={stopPropagation}>` wrapper doesn't fix the HTML nesting violation — it only handles JavaScript events.

### Proposed Fix
**Option A (recommended):** Make TemplateCard use `onClick` + `router.push()` on a `<div>` instead of wrapping in `<Link>`:
```tsx
<div onClick={() => router.push(templateUrl)} className="block h-full cursor-pointer">
  <Card>...</Card>
</div>
```
This allows inner Links to be valid.

**Option B:** Render SellerLink as plain text (not a link) when inside a card context:
```tsx
<SellerLink username={...} asText={insideCard} />
```

---

## Bug 5: Redundant `stopPropagation` on SellerLink Wrapper

### Location
`template-card.tsx`:
```tsx
<span onClick={(e) => e.stopPropagation()}>
  <SellerLink ... />
</span>
```

`seller-link.tsx` already has:
```tsx
<Link ... onClick={(e) => e.stopPropagation()}>
```

### Issue
Redundant but harmless. The real fix is addressing Bug 4 (nested anchor tags).

---

## Summary

| # | Bug | Severity | Root Cause |
|---|-----|----------|-----------|
| 1 | Download button broken | **High** | Likely browser blocking programmatic download after async fetch (broken user-gesture chain) |
| 2 | Similar cards collapsed | **High** | Link wrapper + nested `<a>` tags causing DOM repair + `overflow-hidden` clipping |
| 3 | BookmarkButton span uses wrong event method | **Medium** | `preventDefault` on span does nothing; needs `stopPropagation` |
| 4 | Nested `<a>` tags (invalid HTML) | **High** | SellerLink `<a>` nested inside card's outer `<a>` |
| 5 | Redundant stopPropagation wrapper | **Low** | Duplication, cosmetic |

### Recommended Fix Priority
1. **Bug 4** — Fix nested anchors (this likely also fixes Bug 2)
2. **Bug 2** — Fix card layout (may be resolved by Bug 4 fix)
3. **Bug 1** — Switch download to GET-based `<a download>` or `window.location`
4. **Bug 3** — Add `stopPropagation` to bookmark span wrapper
5. **Bug 5** — Cleanup redundant wrapper
