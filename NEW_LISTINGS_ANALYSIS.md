# New Listings Feature — Analysis & Recommendations

## 1. What the Page Should Include

**Route:** `/templates/new`

A dedicated "New Listings" page serves a different purpose than sorting Browse by "newest". It's a **discovery feed** that signals marketplace vitality and gives new sellers instant visibility.

### Page Layout
- **Header:** "New Listings" with subtitle like "Fresh templates added to Molt Mart"
- **Time-group headers:** "Today", "This Week", "Earlier This Month" — gives temporal context without tabs
- **Listing cards** in a single-column or 2-col layout (more spacious than Browse's 3-col grid, emphasizing each new item)
- **Load More** button (not infinite scroll — keeps it lightweight, SSR-friendly)
- **Category filter chips** along the top (reuse `CategoryFilter` component)

### Why not just tabs on Browse?
- Dedicated URL = shareable, bookmarkable
- Different visual treatment (timeline feel vs grid)
- Can feature "New today" badge count in navbar
- Homepage snippet drives traffic to it specifically

## 2. Listing Card Design

Reuse the existing `TemplateCard` component with one addition: **relative timestamp**.

### Fields to show (same as current TemplateCard):
- Screenshot (if available)
- Category badge + difficulty badge
- Price (Free / $X.XX)
- Title
- Description (2-line clamp)
- Seller name (via `SellerLink`)
- Star rating + download count

### New additions for "new" context:
- **Relative time** — "2 hours ago", "just now" — using `date-fns`'s `formatDistanceToNow` (already a dependency)
- **"New" badge** — sparkle icon + "New" badge on cards less than 48 hours old (use across the site, not just this page)
- **For 0 ratings/downloads:** Show "Be the first to review" or "Just launched" instead of empty stars — avoids the "dead listing" look

### Implementation approach:
Add an optional `showTimestamp?: boolean` prop to `TemplateCard`. When true, render `formatDistanceToNow(template.created_at)` in the footer. No need for a separate card component.

## 3. Real-Time Approach

### Recommendation: **Server-side with ISR + client polling (no Supabase Realtime needed)**

**Why not Supabase Realtime?**
- New listings trickle in (not chat-frequency). Real-time subscriptions are overkill.
- Adds client-side complexity and WebSocket connections.
- Next.js 16 RSC architecture favors server rendering.

**Recommended approach:**
1. **Server Component** fetches newest templates with `revalidate: 60` (ISR, 1-min cache)
2. **Optional client enhancement:** A small "X new templates since you loaded this page" banner that polls a lightweight count endpoint every 60s. Clicking it does a router.refresh().

**API endpoint:** `GET /api/templates/new-count?since=<ISO timestamp>` — returns `{ count: number }`. Trivial Supabase query.

This gives near-real-time feel with zero WebSocket overhead.

## 4. Homepage Snippet Design

### Placement
Add a new section **above** "Browse Templates" (or between Browse and Categories):

```
┌─────────────────────────────────────────┐
│  🆕 Just Added                View All →│
│                                          │
│  [Card 1]  [Card 2]  [Card 3]  [Card 4]│
│                                          │
└─────────────────────────────────────────┘
```

### Specs:
- **4 templates** in a horizontal row (matches the 3-col grid but tighter)
- **Horizontal scroll on mobile** (overflow-x-auto), grid on desktop
- Section title: "Just Added" or "🆕 New Listings" with "View All →" link to `/templates/new`
- Query: `status=published`, `order by created_at desc`, `limit 4`, templates from **last 7 days only**
- If no templates in last 7 days: **hide the section entirely** (don't show stale "new" content)

### Supabase query:
```ts
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
const { data: newTemplates } = await supabase
  .from("templates")
  .select("*, seller:profiles!seller_id(username, display_name)")
  .eq("status", "published")
  .gte("created_at", weekAgo)
  .order("created_at", { ascending: false })
  .limit(4)
```

## 5. Navigation Changes

### Desktop navbar:
Add "New" link between "Browse Templates" and "Sell":

```tsx
<Link href="/templates/new" className="...">
  New
</Link>
```

**Optional enhancement (Phase 2):** Badge showing count of templates added today:
```tsx
<Link href="/templates/new" className="relative ...">
  New
  {todayCount > 0 && (
    <span className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
      {todayCount}
    </span>
  )}
</Link>
```

### Mobile nav (`MobileNav` component):
Add "New" entry to the mobile menu as well.

## 6. Edge Cases

| Scenario | Handling |
|---|---|
| **No new templates at all** | Show friendly empty state: "No new templates yet. Check back soon!" with link to Browse |
| **No templates in last 7 days** (homepage) | Hide the "Just Added" section entirely |
| **Tons of new templates (50+/day)** | Pagination via "Load More" (20 per page). Time-group headers prevent visual overload |
| **Template published then unpublished** | Already filtered by `status=published` |
| **Same user uploads many templates** | No special handling needed — if one seller dominates, that's fine for a young marketplace |
| **Timezone differences** | Use `formatDistanceToNow` which handles this automatically. Store/query in UTC |
| **SEO** | Add metadata: `title: "New AI Agent Templates | Molt Mart"`, `description` with dynamic count |

## 7. Recommended Features (Priority Ranked)

### P0 — MVP (Build Now)
1. **`/templates/new` page** — SSR, chronological, with time-grouped headers, Load More pagination
2. **Homepage "Just Added" snippet** — 4 cards, last 7 days, horizontal row
3. **Navbar "New" link** — desktop + mobile
4. **Relative timestamps** on cards (`showTimestamp` prop on `TemplateCard`)
5. **"Just launched" treatment** for 0-review templates

### P1 — Quick Follows
6. **Category filter chips** on the New page (reuse `CategoryFilter`)
7. **"X new since you loaded" refresh banner** (client polling, 60s interval)
8. **Navbar badge** with today's new count

### P2 — Nice to Have
9. **"New this week" / "New this month" toggle** (URL param `?period=week|month`)
10. **RSS feed** at `/templates/new/rss.xml` (Route Handler generating XML)
11. **"New templates" notification** for returning users (localStorage last-visit timestamp)

### P3 — Future
12. **Email digest** — "X new templates this week" for subscribed users
13. **Personalized "New for You"** — new templates in categories the user has downloaded from

---

## File Changes Summary

| File | Change |
|---|---|
| `src/app/templates/new/page.tsx` | **New** — New Listings page |
| `src/app/page.tsx` | Add "Just Added" section |
| `src/components/navbar.tsx` | Add "New" nav link |
| `src/components/mobile-nav.tsx` | Add "New" nav link |
| `src/components/template-card.tsx` | Add optional `showTimestamp` prop |
| `src/app/api/templates/new-count/route.ts` | **New** — count endpoint for refresh banner (P1) |
