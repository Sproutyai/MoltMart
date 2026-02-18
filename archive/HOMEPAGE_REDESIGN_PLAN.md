# Homepage Redesign Plan — Revision 3

## 1. Hero Section

**Remove:** Animated gradient background, stats row, Badge pill above headline.

**New design:** Clean, minimal hero on the default `bg-background` (consistent with rest of site). Subtle top border or light muted background (`bg-muted/30`) optional.

**Layout (centered, top-to-bottom):**

1. *(Logo placeholder — Revision 4 will add the Molt Mart logo here, above the headline. Leave a `div` with `mb-6` for it.)*
2. **Headline:** "The Marketplace for AI Agent Templates" — `text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground`
3. **Subheadline:** "Built by AI agents, for AI agents" — `text-xl sm:text-2xl font-medium text-muted-foreground mt-4`
4. **Description:** "Discover, download, and sell powerful AI agent templates for OpenClaw. Build smarter agents — or share your brilliance and earn." — `text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto`
5. **CTA buttons:** "Browse Templates" (primary, solid) + "Start Selling" (outline) — `mt-8 flex gap-4 justify-center`

**Padding:** `py-20 sm:py-28 px-4 text-center`

No gradient, no animation, no stats. Clean and professional.

## 2. Browse Templates Section (was "Featured Templates")

**Changes:**
- Rename heading from "Featured Templates" → "Browse Templates"
- Add `<SearchInput />` component between the heading row and the grid
- Search submits to `/templates?q=...` (existing behavior of SearchInput)
- Keep "View All →" link
- Keep the 3-column template grid

**Layout:**
```
[Browse Templates]                    [View All →]
[━━━━━━━━━━━ Search bar ━━━━━━━━━━━━━━━━━━━━━]
[Card] [Card] [Card]
[Card] [Card] [Card]
```

## 3. Navbar Global Search

**Add a compact search bar to the navbar** between the nav links and the right-side auth controls.

**Implementation:**
- Create `src/components/navbar-search.tsx` — a client component ("use client")
  - Small search input with Search icon, placeholder "Search templates..."
  - On submit → `router.push(/templates?q=...)`
  - Compact: `h-9 w-64 lg:w-80` with rounded-full styling
  - Hidden on mobile (`hidden md:block`) — mobile users use the homepage search or browse page
- In `navbar.tsx`: import and place `<NavbarSearch />` between the `<nav>` links and the right-side `<div>`

## 4. Additional Improvements

### Recommended for this revision:
- **Category quick-links:** Move the "Browse by Category" section higher — right after Browse Templates section, before "How It Works". This gives users fast navigation.
- **Subtle hero polish:** Add a faint decorative element — e.g., a `bg-gradient-to-b from-muted/50 to-transparent` on the hero for slight visual depth without the flashy gradient.

### Deferred (future revisions):
- Trust indicators / social proof (need real data first)
- Trending/new templates section (need more templates)
- Testimonials (need real users)

## 5. Files to Modify

| File | Changes |
|------|---------|
| `src/app/page.tsx` | Rewrite hero section (remove gradient, stats, badge; new layout). Rename "Featured Templates" → "Browse Templates" and add SearchInput. Reorder sections (categories before how-it-works). |
| `src/components/navbar.tsx` | Add `<NavbarSearch />` between nav links and auth controls. Add Suspense boundary. |
| `src/components/navbar-search.tsx` | **NEW FILE.** Client component — compact search bar for navbar. |
| `src/app/globals.css` | Remove the `@keyframes gradient` animation if it exists there. |

## 6. Implementation Steps

1. Create `src/components/navbar-search.tsx` (new client component)
2. Edit `src/components/navbar.tsx` — add NavbarSearch between nav and auth
3. Edit `src/app/page.tsx`:
   a. Rewrite hero: remove gradient/animation/stats/badge, add new clean layout with logo placeholder
   b. Rename "Featured Templates" → "Browse Templates", add `<SearchInput />` with Suspense
   c. Move "Browse by Category" section above "How It Works"
   d. Remove unused imports
4. Check/remove `@keyframes gradient` from globals.css
5. Test responsive: mobile, tablet, desktop
6. Verify search works from both navbar and homepage
