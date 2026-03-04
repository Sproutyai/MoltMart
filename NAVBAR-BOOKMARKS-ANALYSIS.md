# Navbar + Bookmarks Analysis

## Revision 1: Remove Home Button from Navbar

### Files to Change

**`src/components/nav-links.tsx`**
- Remove `{ href: "/", label: "Home", match: (p: string) => p === "/" }` from the `links` array (line 14)
- Remove the `.filter((l) => !(l.href === "/" && pathname === "/"))` on line 26 — this filter only existed to hide Home when already on `/`

**`src/components/mobile-nav.tsx`**
- Remove the conditional Home link block (lines 42-44):
  ```tsx
  {pathname !== "/" && (
    <Link href="/" onClick={close} className={linkClass(pathname === "/")}>Home</Link>
  )}
  ```

### Other "Home" References (DO NOT CHANGE)
- `src/app/templates/[slug]/page.tsx` line 160: Breadcrumb `{ label: "Home", href: "/" }` — this is a **breadcrumb trail**, not nav. Keep it.

### No footer Home link exists. No other references found.

---

## Revision 2: Bookmarks Tab Redesign

### Current State of `bookmarks-client.tsx`
- Uses default `TemplateCard` variant (not `variant="library"`)
- Has: search, sort (recent/alpha/category), category filter tabs, price filter (all/free/paid)
- Has purchased badge overlay and optimistic bookmark removal
- Grid: `sm:grid-cols-2 lg:grid-cols-3`
- **No view mode toggle** (card only)
- **No list view**

### What to Add/Change

1. **Imports to add**: `LayoutGrid`, `List`, `ExternalLink`, `Star` from lucide-react; `SafeImage`, `CategoryPlaceholder`, `format` from date-fns
2. **State**: Add `viewMode` state with `localStorage` key `molt-bookmarks-view`, same hydration pattern as library
3. **View toggle**: Add card/list toggle buttons in header (between title and Browse Enhancements button), copy pattern from library
4. **Card view changes**: Switch to `TemplateCard variant="library"` with actions (View Listing link). Move the purchased badge into the actions area or keep overlay.
5. **List view**: Add table-style list view matching library format

### Data Field Availability for List View

Comparing what library list view shows vs what bookmarks data has:

| Column | Library Source | Bookmarks Source | Available? |
|--------|--------------|-----------------|------------|
| Thumbnail | `t.screenshots?.[0]` | `t.screenshots?.[0]` | ✅ Yes |
| Title | `t.title` | `t.title` | ✅ Yes |
| Seller | `t.seller.display_name \|\| username` | `t.seller?.display_name \|\| username` | ✅ Yes (included in props type) |
| Category | `t.category` | `t.category` | ✅ Yes |
| Purchase Date | `purchase.created_at` | N/A | ❌ Not applicable — replace with price |
| Cost | `purchase.price_cents` | `t.price_cents` | ✅ Yes (from template directly) |
| Rating | `reviewMap[id]` (user's rating) | `t.avg_rating` + `t.review_count` | ⚠️ Different — bookmarks shows community avg rating, not user's rating |
| Download | `DownloadButton` | Only if purchased | ⚠️ Conditional — show only for items in `purchasedIds` |
| Actions | Download + View Listing | View Listing + conditional Download | ✅ Adaptable |

### Adapted List View Columns for Bookmarks
Recommended: `[Thumbnail, Title, Seller, Category, Price, Rating, Actions]`
- **Price**: from `t.price_cents` (show "Free" or formatted dollar amount)
- **Rating**: show `t.avg_rating` with star icon (community rating)
- **Actions**: "View Listing" link; show "✓ Purchased" badge if in `purchasedIds`
- **No Download column** unless purchased (could add conditional DownloadButton)

### Gaps & Issues

1. **No `DownloadButton` import needed** unless we want download for purchased bookmarks — the plan mentions it but bookmarks page currently doesn't have download. Recommend: skip download in bookmarks, keep it simple. Users go to Purchases for downloads.

2. **`TemplateCard variant="library"`** expects `purchaseDate` and `userRating` props — bookmarks don't have these. Options:
   - Pass `purchaseDate={undefined}` (it's optional)
   - Pass `userRating={undefined}` (it's optional)
   - The card should still render fine without them

3. **Bookmark removal in list view**: Current card view has `onBookmarkRemove` on `TemplateCard`. In list view, need a manual unbookmark button (heart icon) since we're not using TemplateCard there.

4. **`StarRating` component** is imported in library but only used elsewhere — for bookmarks list view, just use the simple Star icon + number pattern.

---

## Summary: Implementation Checklist

### nav-links.tsx
- [ ] Remove Home from links array
- [ ] Remove the `.filter()` call

### mobile-nav.tsx
- [ ] Remove the `{pathname !== "/" && ...Home...}` block

### bookmarks-client.tsx
- [ ] Add imports: `LayoutGrid, List, ExternalLink, Star` + `SafeImage, CategoryPlaceholder, format`
- [ ] Add `ViewMode` type and `viewMode` state with localStorage persistence
- [ ] Add view toggle buttons in header
- [ ] Switch card view to use `variant="library"` with actions
- [ ] Add list view with columns: thumbnail, title, seller, category, price, rating, actions
- [ ] Handle bookmark removal in list view (unbookmark button)
- [ ] Show "✓ Purchased" badge in both views
