# Search Popup Analysis & Plan

## Current State

- **NavbarSearch** (`navbar-search.tsx`): Simple `<input>` in a `<form>`, rounded-full, 264-320px wide, hidden on mobile. Submit navigates to `/templates?q=...`.
- **MobileNav** (`mobile-nav.tsx`): Search input inside a Sheet (slide-down), same submit behavior.
- **Templates page** (`templates/page.tsx`): Server-rendered. Pulls top 10 promotions, shows up to 2 featured cards matching query/category above organic results.
- **Featured page** (`templates/featured/page.tsx`): Infinite-scroll grid of all promoted templates, ordered by `promoted_at DESC`.
- **Promotions table**: `template_id` (unique), `seller_id`, `promoted_at`, `amount_paid_cents` (2500 = $25), `impressions`, `clicks`. Already has `increment_promotion_stat()` RPC.

**Key insight**: Currently promoted templates only get 2 slots on the browse page and require users to visit `/templates/featured`. The search popup makes every search interaction = guaranteed impressions for promoted content.

---

## 1. Value for Sellers

**Why this is a 10x upgrade for promotions:**
- Current: 2 featured slots on browse page + a dedicated featured page most users won't visit
- Proposed: 36 slots visible on EVERY search interaction site-wide
- Every user who thinks about searching sees promoted content — this is the highest-traffic interaction on a marketplace
- Impression counts will skyrocket → sellers can see ROI → more sellers promote → more revenue

**Show ALL promoted templates (up to 36 visible).** The popup grid should show the first 36 ordered by `promoted_at DESC`. No pagination within the popup — it's a snapshot. If there are more than 36, the oldest ones simply don't appear (natural rotation creates urgency to re-promote).

**This creates a "promote or get pushed off" dynamic** — exactly like DexScreener. Sellers are incentivized to re-promote periodically to stay visible.

---

## 2. Promo Card Design (Compact Cards)

Each card in the 3-column grid should be **compact** — roughly 160-180px wide. Show:

| Field | Include? | Reasoning |
|-------|----------|-----------|
| **Thumbnail/screenshot** | ✅ Yes (small, ~120x80px) | Visual anchor, most important for scanning |
| **Template name** | ✅ Yes (1-2 lines, truncated) | Essential |
| **Price** | ✅ Yes ("Free" or "$4.99") | Buyers filter by price mentally |
| **Category badge** | ✅ Yes (small pill) | Helps scanning relevance |
| **Star rating** | ⚠️ Only if > 0 reviews | Avoids empty stars looking bad |
| **Download count** | ❌ No | Clutter at this size |
| **"Featured" badge** | ❌ No | Everything in the grid is featured — badge is redundant |
| **Seller name** | ❌ No | Clutter. Visible on click-through |

**Layout per card:**
```
┌──────────────────┐
│   [thumbnail]    │
│ Template Name... │
│ 🏷 Category  $X  │
└──────────────────┘
```

Compact, scannable, clickable. The whole card is a link to the template detail page.

---

## 3. Buyer Experience (Not Annoying)

### Making it feel natural:
- **No "Promoted" or "Ad" label on the section** — just a subtle heading like "✨ Trending" or "⭐ Featured" or even no heading at all. The grid IS the default state. It's content, not ads.
- Promoted cards use the **same visual language** as template cards elsewhere on the site, just compact.
- The grid appears **below the search input** — it's what you see while you think about what to search. It's ambient discovery, not interruptive.

### No tabs. Keep it simple.
Tabs ("Promoted" | "Recent" | "Popular") add cognitive load and dilute the promoted placement value. The popup has ONE job: show the search bar + promoted grid. Keep it focused.

### Typing behavior — **Option C with a twist:**

1. **Popup opens** → User sees search input (focused) + promoted grid below
2. **User types** → Promoted grid stays visible (no filtering). Below the input, show lightweight **autocomplete suggestions** (3-5 text-only items from template titles matching the query). These appear between the search bar and the grid.
3. **User presses Enter** (or clicks a suggestion) → Popup closes, navigates to `/templates?q=...`
4. **User clicks a promoted card** → Popup closes, navigates to template detail page

**Why NOT live search results in the popup:**
- Requires client-side Supabase queries on every keystroke (debounced, but still complex)
- Duplicates the browse page functionality
- Makes the popup too complex — it becomes a mini-app instead of a quick interaction
- The browse page already handles search beautifully with filters, sorting, pagination

**Why NOT filter promoted grid by query:**
- Defeats the purpose — sellers are paying for visibility regardless of search terms
- Grid would become mostly empty for specific queries
- Weird UX (typing makes content disappear)

**Autocomplete suggestions are the sweet spot:**
- Lightweight (just titles, fetched via a simple `ilike` query, debounced 300ms)
- Helps users find what they want faster
- Doesn't replace the promoted grid — just overlays a small suggestion list

---

## 4. UX Flow (Final Design)

### Desktop:
```
[Navbar: ... [🔍 Search enhancements...] ...]
                      ↓ click
┌─────────────────────────────────────────┐
│ 🔍 |search enhancements...        |  ✕ │  ← auto-focused input
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐              │
│  │card1│ │card2│ │card3│              │  ← 3-column grid
│  └─────┘ └─────┘ └─────┘              │
│  ┌─────┐ ┌─────┐ ┌─────┐              │
│  │card4│ │card5│ │card6│  ...          │
│  └─────┘ └─────┘ └─────┘              │
│  ... up to 36 cards (scrollable)       │
│                                         │
│  ⭐ See all featured →                  │
└─────────────────────────────────────────┘
  ↑ backdrop overlay (click to close)
```

When typing:
```
┌─────────────────────────────────────────┐
│ 🔍 |notion temp|                    ✕   │
│  ┌─────────────────────────────────────┐│
│  │ Notion Template - Dark Mode         ││  ← autocomplete (3-5 suggestions)
│  │ Notion Budget Tracker               ││
│  │ Notion Habit Planner                ││
│  └─────────────────────────────────────┘│
│  ┌─────┐ ┌─────┐ ┌─────┐              │  ← promoted grid still visible below
│  │card1│ │card2│ │card3│              │
│  ...                                    │
└─────────────────────────────────────────┘
```

### Mobile:
- **Full-screen overlay** (not a centered modal — too cramped)
- Search input at top, promoted grid below, scrollable
- Back button or ✕ to close
- Same autocomplete behavior

---

## 5. Technical Implementation

### Pattern: **Dialog/Overlay (not dropdown)**
- Use Radix `Dialog` (already available via shadcn) or a custom overlay
- **Not a dropdown** — too small for 36 cards
- **Not a traditional modal** — should feel lighter, more like a search overlay (think Spotlight/Cmd+K)
- Render as a portal attached to `<body>` to avoid z-index issues

### Component Structure:
```
SearchPopup (new client component)
├── SearchPopupTrigger (button styled as search input)
├── SearchPopupContent (overlay)
│   ├── SearchInput (auto-focused)
│   ├── AutocompleteSuggestions (conditional, when typing)
│   └── PromotedGrid (3-col grid of compact cards)
│       ├── CompactTemplateCard × 36
│       └── "See all featured →" link
```

### Data Loading:
- **Promoted templates**: Fetch on popup open (not on page load — saves bandwidth for users who never search)
- Single query: `promotions` joined with `templates` + `profiles`, ordered by `promoted_at DESC`, limit 36
- Cache in React state so re-opening popup doesn't re-fetch (stale for session is fine)
- **Autocomplete**: Debounced 300ms, `templates.title.ilike.%query%`, limit 5, client-side Supabase query

### API Route (optional optimization):
Could create `/api/search-popup` that returns promoted templates in one shot. But client-side Supabase is fine since `promotions` has public read policy.

### Keyboard Navigation:
- `Escape` → close popup
- `Enter` → navigate to `/templates?q=...` (if input has text) or close (if empty)
- `ArrowDown/Up` → navigate autocomplete suggestions
- `Cmd/Ctrl + K` → open popup from anywhere (power user shortcut, nice-to-have)

### Impression Tracking:
- When popup opens and promoted cards are visible, fire `increment_promotion_stat(template_id, 'impressions')` for each visible card
- Batch this: call once per popup open, not per card
- Consider a single RPC that increments all visible template IDs at once (new function)
- Click tracking: fire on card click before navigation

### Mobile:
- Full-screen overlay using the same Dialog but with `className="fixed inset-0"` styling
- 2-column grid on mobile (cards are too small at 3-col on phone)
- Input with large touch target

---

## 6. Additional Features

### "See all featured →" link
✅ Yes. At the bottom of the grid. Links to `/templates/featured`. Gives users a clear path if they want to browse all promoted content.

### Recent searches
⚠️ Nice-to-have, not v1. Store in `localStorage`, show as chips below search input when query is empty. Adds complexity. Do it in v2.

### Cmd+K shortcut
✅ Yes, easy win. Add a global `keydown` listener. Shows the popup is a first-class feature.

---

## 7. Migration Path

### What changes:
1. **`navbar-search.tsx`** → Replace `<form>` with a `<button>` styled identically to current search input. Clicking opens the popup.
2. **New: `search-popup.tsx`** → The popup component (Dialog-based overlay with search + promoted grid).
3. **New: `compact-template-card.tsx`** → Smaller card component for the popup grid.
4. **`mobile-nav.tsx`** → Replace the search form with the same popup trigger (or open popup directly).
5. **`navbar.tsx`** → No changes needed (already renders `<NavbarSearch />`).
6. **Templates browse page** → No changes. Still works with `?q=` param as before.
7. **Promotions** → Consider adding a batch impressions RPC.

### What stays the same:
- The browse page `/templates` and its search/filter/sort functionality
- The featured page `/templates/featured`
- The promotions table structure
- How sellers purchase promotions

---

## 8. Summary

| Aspect | Decision |
|--------|----------|
| Popup type | Dialog overlay (Radix Dialog) |
| Grid | 3-col desktop, 2-col mobile, up to 36 cards |
| Card content | Thumbnail, name, category, price |
| Typing behavior | Autocomplete suggestions + Enter navigates to browse page |
| Promoted grid while typing | Stays visible (no filtering) |
| Mobile | Full-screen overlay |
| Data loading | Client-side on popup open, cached |
| Keyboard | Escape close, Enter search, Arrow keys suggestions, Cmd+K open |
| Impression tracking | Batch on popup open |

**The win-win:**
- **Sellers**: 36 high-visibility slots on every search interaction. Way more impressions than the current 2-slot browse page placement. Creates urgency to promote/re-promote.
- **Buyers**: Clean search experience with ambient discovery. Promoted content feels like helpful suggestions, not ads. Autocomplete helps find things fast. One click to browse page for full search.
- **Molt Mart**: More promotion revenue as sellers see higher impression/click counts. Natural monetization that improves (not degrades) the user experience.
