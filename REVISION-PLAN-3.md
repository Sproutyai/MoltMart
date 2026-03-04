# Revision Plan 3 — Navbar Home Button Removal + Bookmarks Redesign

## Overview
Two simple UI revisions. Can be done as **one chunk** (single agent) since they're independent, small changes with no shared logic.

---

## Revision 1: Remove Home Button from Navbar

### Files to Change

**`src/components/nav-links.tsx`**
- Remove the `{ href: "/", label: "Home", ... }` entry from the `links` array
- Remove the `.filter((l) => !(l.href === "/" && pathname === "/"))` since it was only needed because of the Home link

**`src/components/mobile-nav.tsx`**
- Remove the conditional Home link block (lines with `pathname !== "/" && ... Home`)

### Result
- Desktop nav: Home link gone, logo still links to `/`
- Mobile nav: Home link gone, logo still links to `/`

---

## Revision 2: Bookmarks Tab Redesign

### Reference
The purchases page (`src/app/dashboard/library-client.tsx`) has:
- Card/list view toggle (LayoutGrid/List icons)
- `viewMode` state with localStorage persistence
- List view: table-like rows with thumbnail, title, seller, category, date, cost, rating, download
- Card view: `TemplateCard` with `variant="library"` in a 3-col grid

### Files to Change

**`src/app/dashboard/bookmarks/bookmarks-client.tsx`**
Major rework to match library page format:

1. **Add imports**: `LayoutGrid`, `List`, `SafeImage`, `CategoryPlaceholder`, `DownloadButton`, `format` from date-fns, `Star`, `ExternalLink`
2. **Add state**: `viewMode` with localStorage persistence (`molt-bookmarks-view` key), same pattern as library
3. **Add view toggle** in header area (same LayoutGrid/List button pair as library)
4. **Change card grid** from `sm:grid-cols-2 lg:grid-cols-3` — use `TemplateCard` with `variant="library"` instead of default variant (currently uses default), add action buttons (View Listing, download if purchased)
5. **Add list view**: Replicate the library list view format adapted for bookmarks:
   - Columns: thumbnail, title, seller, category, price, rating, actions
   - No "purchased date" column (not applicable), replace with bookmark-specific info
   - Show "Purchased ✓" badge inline if in `purchasedIds`
   - Action: link to listing page

### Detailed Changes to `bookmarks-client.tsx`:

```
ADD to imports:
  - LayoutGrid, List, ExternalLink, Star from lucide-react
  - SafeImage from "@/components/safe-image"
  - CategoryPlaceholder from "@/components/category-placeholder"
  - format from "date-fns" (if needed)

ADD state:
  - viewMode / setViewMode (same localStorage pattern as library)

ADD to header section (after Browse Enhancements button):
  - Card/List toggle buttons (copy from library-client)

CHANGE the grid rendering:
  - Use TemplateCard with variant="library" instead of default
  - Add actions prop with View Listing button (like library)
  - Keep the purchased badge overlay

ADD list view (before card view, same if/else pattern as library):
  - Table header: thumbnail, title, seller, category, price, actions
  - Row items with same styling as library list view
  - Adapt for bookmark data (template directly, not purchase.template)
```

---

## Agent Assignment

### Single Agent — All Changes
**Files:**
1. `src/components/nav-links.tsx` — remove Home link
2. `src/components/mobile-nav.tsx` — remove Home link  
3. `src/app/dashboard/bookmarks/bookmarks-client.tsx` — full redesign matching library format

**Reference files (read-only):**
- `src/app/dashboard/library-client.tsx` — copy view toggle + list view patterns
- `src/components/template-card.tsx` — use `variant="library"`

**Estimated complexity:** Medium-low. Mostly copy-adapt from library page.
