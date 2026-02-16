# Featured Templates — Build Plan (Agent 3 → Agent 4)

> Every file that needs to be created or modified. Agent 4: build in the order listed.

---

## 0. Install Stripe

```bash
npm install stripe
```

Add to `.env.local`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 1. Database Migration

### File: `molt-mart/supabase/migrations/promotions.sql`
**Action:** CREATE

```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id),
  promoted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  amount_paid_cents INTEGER NOT NULL DEFAULT 2500,
  stripe_session_id TEXT,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Each template has at most ONE active promotion row. Re-promote = UPDATE promoted_at.
CREATE UNIQUE INDEX promotions_template_id_idx ON promotions(template_id);
CREATE INDEX promotions_promoted_at_idx ON promotions(promoted_at DESC);
CREATE INDEX promotions_seller_id_idx ON promotions(seller_id);

-- RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Anyone can read promotions (needed for featured display)
CREATE POLICY "Public read" ON promotions FOR SELECT USING (true);

-- Sellers can insert/update their own
CREATE POLICY "Seller insert" ON promotions FOR INSERT WITH CHECK (
  seller_id = auth.uid()
);
CREATE POLICY "Seller update" ON promotions FOR UPDATE USING (
  seller_id = auth.uid()
);
```

**Execution:** Run via Supabase dashboard SQL editor, or via `pg` in a Node script:
```js
// scripts/run-migration.js
const { readFileSync } = require('fs');
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query(readFileSync('./supabase/migrations/promotions.sql', 'utf8'));
await client.end();
```

**Key design:** One row per template (UNIQUE on template_id). Re-promoting UPDATEs `promoted_at` to `now()` and increments `amount_paid_cents`. This keeps ordering simple: `ORDER BY promoted_at DESC`.

---

## 2. Types

### File: `src/lib/types.ts`
**Action:** MODIFY

**Add at the end of the file:**

```typescript
export interface Promotion {
  id: string
  template_id: string
  seller_id: string
  promoted_at: string
  amount_paid_cents: number
  stripe_session_id: string | null
  impressions: number
  clicks: number
  created_at: string
  template?: Template & { seller?: { username: string; display_name: string | null; avatar_url?: string | null } }
}
```

---

## 3. Stripe Helpers

### File: `src/lib/stripe.ts`
**Action:** CREATE

```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})
```

---

## 4. API Routes

### 4a. `src/app/api/promote/checkout/route.ts`
**Action:** CREATE

**Purpose:** Create a Stripe Checkout session for promoting a template.

**Shape:**
- **POST** body: `{ templateId: string }`
- Auth required (get user from supabase server client)
- Validate: user owns the template, template is published, no re-promote within 24hrs
- 24hr cooldown check: query `promotions` for this template_id, check if `promoted_at` is within last 24hrs
- Create Stripe Checkout session:
  - `mode: 'payment'`
  - `line_items: [{ price_data: { currency: 'usd', unit_amount: 2500, product_data: { name: 'Promote: <template title>' } }, quantity: 1 }]`
  - `metadata: { template_id, seller_id: user.id }`
  - `success_url: ${BASE_URL}/dashboard/seller?promoted=${templateId}`
  - `cancel_url: ${BASE_URL}/dashboard/seller`
- Return `{ url: session.url }`

### 4b. `src/app/api/promote/webhook/route.ts`
**Action:** CREATE

**Purpose:** Stripe webhook handler. On `checkout.session.completed`, upsert the promotion.

**Key details:**
- Verify webhook signature using `stripe.webhooks.constructEvent`
- Extract `template_id` and `seller_id` from `session.metadata`
- Use Supabase **service role** client (create with `SUPABASE_SERVICE_ROLE_KEY` env var) since webhook has no user session
- UPSERT into `promotions`: if row exists for template_id, UPDATE `promoted_at = now()`, `amount_paid_cents = amount_paid_cents + 2500`, `stripe_session_id = session.id`. If not, INSERT new row.
- SQL via supabase: `.upsert({ template_id, seller_id, promoted_at: new Date().toISOString(), amount_paid_cents: 2500, stripe_session_id: session.id }, { onConflict: 'template_id' })`
- **Note:** For the upsert to add to amount_paid_cents on re-promote, use an RPC or two-step: first try select, then insert or update. Simpler: just upsert with the new amount (don't accumulate — each row represents current state + latest payment). Track total spent separately if needed later.
- Return 200.

**Env needed:** `SUPABASE_SERVICE_ROLE_KEY` for admin client.

### 4c. `src/lib/supabase/admin.ts`
**Action:** CREATE

```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

### 4d. `src/app/api/promote/stats/route.ts`
**Action:** CREATE

**Purpose:** Return promotion stats for the current seller's templates.

- **GET** — auth required
- Query: `promotions` where `seller_id = user.id`, join with templates
- For each promotion, compute `position`: count of promotions with `promoted_at` > this one's `promoted_at`, + 1
- Return: `{ promotions: [{ template_id, template_title, promoted_at, position, impressions, clicks }] }`

### 4e. `src/app/api/promote/track/route.ts`
**Action:** CREATE

**Purpose:** Track impressions and clicks for analytics.

- **POST** body: `{ templateId: string, type: 'impression' | 'click' }`
- No auth required (public tracking)
- Update promotions row: increment `impressions` or `clicks` by 1
- Use `.rpc()` or raw update with increment. Supabase doesn't support atomic increment natively in JS, so use an RPC:

```sql
-- Add to migration:
CREATE OR REPLACE FUNCTION increment_promotion_stat(p_template_id UUID, p_field TEXT)
RETURNS void AS $$
BEGIN
  IF p_field = 'impressions' THEN
    UPDATE promotions SET impressions = impressions + 1 WHERE template_id = p_template_id;
  ELSIF p_field = 'clicks' THEN
    UPDATE promotions SET clicks = clicks + 1 WHERE template_id = p_template_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- Call: `supabase.rpc('increment_promotion_stat', { p_template_id: templateId, p_field: type })`
- Return 200

---

## 5. "Featured" Badge on TemplateCard

### File: `src/components/template-card.tsx`
**Action:** MODIFY

**Changes:**

1. Add `isFeatured?: boolean` to `TemplateCardProps`:
```typescript
interface TemplateCardProps {
  template: Template & { seller?: ... }
  showTimestamp?: boolean
  isFeatured?: boolean
}
```

2. Add `isFeatured` to destructured props:
```typescript
export function TemplateCard({ template, showTimestamp, isFeatured }: TemplateCardProps) {
```

3. Add a featured badge in the `CardHeader` badges row, right after the category badge. Insert before `{priceDisplay}`:
```tsx
{isFeatured && (
  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-xs gap-0.5">
    <Star size={10} className="fill-amber-500 text-amber-500" /> Featured
  </Badge>
)}
```

4. Add `Star` to the lucide-react imports (already has `Sparkles` and `Download`).

5. Optionally: add a subtle left border to the Card when featured:
```tsx
<Card className={`h-full transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] overflow-hidden ${isFeatured ? 'ring-1 ring-amber-300 dark:ring-amber-700' : ''}`}>
```

---

## 6. Homepage Featured Section

### File: `src/app/page.tsx`
**Action:** MODIFY

**Changes — add a "Featured Enhancements" section ABOVE the "Popular Enhancements" section:**

1. Add import at top: `import { FeaturedSection } from "@/components/featured-section"`

2. Inside the `<div className="space-y-20 px-4 py-16">`, BEFORE the `{/* Browse Templates */}` section, add:
```tsx
{/* Featured Templates */}
<Suspense fallback={null}>
  <FeaturedSection />
</Suspense>
```

### File: `src/components/featured-section.tsx`
**Action:** CREATE

**Purpose:** Server component that fetches top 6 featured templates and renders them. Hidden if 0.

```tsx
import { createClient } from "@/lib/supabase/server"
import { TemplateCard } from "@/components/template-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Template } from "@/lib/types"

export async function FeaturedSection() {
  const supabase = await createClient()
  
  // Get top 6 most recently promoted templates
  const { data: promotions } = await supabase
    .from("promotions")
    .select("template_id, promoted_at")
    .order("promoted_at", { ascending: false })
    .limit(6)
  
  if (!promotions || promotions.length === 0) return null
  
  const templateIds = promotions.map(p => p.template_id)
  
  const { data: templates } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url)")
    .in("id", templateIds)
    .eq("status", "published")
  
  if (!templates || templates.length === 0) return null
  
  // Sort by promotion order
  const idOrder = new Map(templateIds.map((id, i) => [id, i]))
  const sorted = [...templates].sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99))
  
  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold sm:text-3xl">⭐ Featured Enhancements</h2>
        <Button variant="ghost" asChild>
          <Link href="/templates/featured">View All →</Link>
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((t) => (
          <TemplateCard key={t.id} template={t as any} isFeatured />
        ))}
      </div>
    </section>
  )
}
```

---

## 7. Dedicated Featured Page (`/templates/featured`)

### File: `src/app/templates/featured/page.tsx`
**Action:** CREATE

**Purpose:** Full page of all featured templates with infinite scroll, ordered by `promoted_at DESC`.

**Key details:**
- Server component for initial load (first 20)
- Client component `FeaturedGrid` for infinite scroll
- Query: join promotions → templates, ordered by `promoted_at DESC`, paginated 20 at a time
- Empty state: "No featured enhancements yet — be the first! [Promote yours →]" linking to `/dashboard/seller`

```tsx
import { createClient } from "@/lib/supabase/server"
import { FeaturedGrid } from "@/components/featured-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles } from "lucide-react"

const PAGE_SIZE = 20

export default async function FeaturedPage() {
  const supabase = await createClient()
  
  const { data: promotions } = await supabase
    .from("promotions")
    .select("template_id")
    .order("promoted_at", { ascending: false })
    .range(0, PAGE_SIZE - 1)
  
  if (!promotions || promotions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">No Featured Enhancements Yet</h1>
        <p className="text-muted-foreground">Be the first to promote your template!</p>
        <Button asChild><Link href="/dashboard/seller">Promote Yours →</Link></Button>
      </div>
    )
  }
  
  const ids = promotions.map(p => p.template_id)
  const { data: templates } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url)")
    .in("id", ids)
    .eq("status", "published")
  
  // Sort by promotion order
  const idOrder = new Map(ids.map((id, i) => [id, i]))
  const sorted = (templates || []).sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99))
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">⭐ Featured Enhancements</h1>
      <p className="text-muted-foreground">Templates promoted by their creators. Ordered by most recently promoted.</p>
      <FeaturedGrid initialTemplates={sorted} pageSize={PAGE_SIZE} />
    </div>
  )
}
```

### File: `src/components/featured-grid.tsx`
**Action:** CREATE

**Purpose:** Client component with infinite scroll for the featured page.

```tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { TemplateCard } from "@/components/template-card"
import { Loader2 } from "lucide-react"
import type { Template } from "@/lib/types"

interface Props {
  initialTemplates: (Template & { seller?: any })[]
  pageSize: number
}

export function FeaturedGrid({ initialTemplates, pageSize }: Props) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialTemplates.length >= pageSize)
  const loaderRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const supabase = createClient()
    const offset = templates.length
    
    const { data: promotions } = await supabase
      .from("promotions")
      .select("template_id")
      .order("promoted_at", { ascending: false })
      .range(offset, offset + pageSize - 1)
    
    if (!promotions || promotions.length === 0) {
      setHasMore(false)
      setLoading(false)
      return
    }
    
    const ids = promotions.map(p => p.template_id)
    const { data: newTemplates } = await supabase
      .from("templates")
      .select("*, seller:profiles!seller_id(username, display_name, avatar_url)")
      .in("id", ids)
      .eq("status", "published")
    
    if (newTemplates) {
      const idOrder = new Map(ids.map((id, i) => [id, i]))
      const sorted = [...newTemplates].sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99))
      setTemplates(prev => [...prev, ...sorted])
      setHasMore(newTemplates.length >= pageSize)
    }
    setLoading(false)
  }, [loading, hasMore, templates.length, pageSize])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore()
    }, { threshold: 0.1 })
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(t => <TemplateCard key={t.id} template={t as any} isFeatured />)}
      </div>
      <div ref={loaderRef} className="flex justify-center py-8">
        {loading && <Loader2 className="h-6 w-6 animate-spin" />}
      </div>
    </>
  )
}
```

---

## 8. Search/Category Featured Results

### File: `src/app/templates/page.tsx`
**Action:** MODIFY

**Changes — inject top 1-2 featured results before organic results:**

1. After the existing `query` execution (after `const { data: templates, count } = await query`), add a featured query:

```typescript
// Fetch featured templates matching current search/category
let featuredTemplates: (Template & { seller: any })[] = []
{
  // Get all promoted template IDs ordered by recency
  const { data: promos } = await supabase
    .from("promotions")
    .select("template_id")
    .order("promoted_at", { ascending: false })
    .limit(10) // fetch a few extra to filter

  if (promos && promos.length > 0) {
    const promoIds = promos.map(p => p.template_id)
    let fQuery = supabase
      .from("templates")
      .select("*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, twitter_verified)")
      .in("id", promoIds)
      .eq("status", "published")

    if (q) {
      const escaped = q.replace(/%/g, "\\%")
      fQuery = fQuery.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%,tags.cs.{${q}}`)
    }
    if (category) {
      fQuery = fQuery.eq("category", category)
    }

    const { data: ft } = await fQuery.limit(2)
    if (ft) {
      // Sort by promotion order
      const idOrder = new Map(promoIds.map((id, i) => [id, i]))
      featuredTemplates = [...ft].sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99)) as any
    }
  }
}

// Remove featured from organic results to avoid dupes
const featuredIds = new Set(featuredTemplates.map(t => t.id))
const organicTemplates = (templates || []).filter(t => !featuredIds.has(t.id))
```

2. In the JSX results grid section, replace the existing grid with:

```tsx
{/* Featured results */}
{featuredTemplates.length > 0 && (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {featuredTemplates.map((t) => (
      <TemplateCard key={t.id} template={t as any} isFeatured />
    ))}
  </div>
)}

{/* Organic results */}
{organicTemplates && organicTemplates.length > 0 ? (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {(organicTemplates as any[]).map((t) => (
      <TemplateCard key={t.id} template={t} />
    ))}
  </div>
) : (
  /* existing empty state */
)}
```

3. Update totalCount display to not include featured in the "X results" count (keep as-is, it's fine — the count reflects organic).

---

## 9. Navbar "Featured" Link

### File: `src/components/navbar.tsx`
**Action:** MODIFY

**Change:** Add a "Featured" link in the desktop nav, after "New" and before "Sell":

```tsx
<Link href="/templates/featured" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
  ⭐ Featured
</Link>
```

Insert it between the "New" and "Sell" links in the `<nav>` element.

### File: `src/components/mobile-nav.tsx`
**Action:** MODIFY

**Change:** Add the same "⭐ Featured" link in the mobile nav menu. (Read the file first to find exact insertion point — it should mirror the desktop nav items.)

---

## 10. Seller Dashboard — "Promote" Button on Each Template

### File: `src/app/dashboard/seller/page.tsx`
**Action:** MODIFY

**Changes:**

1. Add imports:
```typescript
import { Megaphone, TrendingUp } from "lucide-react"
```

2. Add state for promotions data:
```typescript
const [promotions, setPromotions] = useState<Map<string, { promoted_at: string; position: number; impressions: number; clicks: number }>>(new Map())
const [promoting, setPromoting] = useState<string | null>(null)
```

3. In the `load()` function, after fetching templates, fetch promotion data:
```typescript
if (p?.is_seller) {
  // ... existing template fetch ...
  
  // Fetch promotions for seller's templates
  const { data: promos } = await supabase
    .from("promotions")
    .select("template_id, promoted_at, impressions, clicks")
    .eq("seller_id", user.id)
  
  if (promos) {
    // Get all promotions to compute position
    const { data: allPromos } = await supabase
      .from("promotions")
      .select("template_id, promoted_at")
      .order("promoted_at", { ascending: false })
    
    const posMap = new Map<string, number>()
    allPromos?.forEach((p, i) => posMap.set(p.template_id, i + 1))
    
    const promoMap = new Map()
    promos.forEach(p => {
      promoMap.set(p.template_id, {
        promoted_at: p.promoted_at,
        position: posMap.get(p.template_id) ?? 0,
        impressions: p.impressions,
        clicks: p.clicks,
      })
    })
    setPromotions(promoMap)
  }
}
```

4. Add promote handler:
```typescript
async function handlePromote(templateId: string) {
  setPromoting(templateId)
  try {
    const res = await fetch("/api/promote/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || "Failed to start promotion")
      return
    }
    // Redirect to Stripe Checkout
    window.location.href = data.url
  } catch {
    toast.error("Something went wrong")
  } finally {
    setPromoting(null)
  }
}
```

5. In each template's Card row (inside `templates.map`), add a promote/re-promote button after the existing edit/archive buttons:

```tsx
{/* Inside the flex gap-1 div with edit/archive buttons */}
{t.status === "published" && (
  promotions.has(t.id) ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handlePromote(t.id)}
      disabled={promoting === t.id}
      title="Re-promote to #1"
    >
      {promoting === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4 text-amber-500" />}
    </Button>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handlePromote(t.id)}
      disabled={promoting === t.id}
      title="Promote for $25"
    >
      {promoting === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
    </Button>
  )
)}
```

6. For promoted templates, show position badge next to the status badge:
```tsx
{promotions.has(t.id) && (
  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-xs">
    ⭐ #{promotions.get(t.id)!.position}
  </Badge>
)}
```

7. Handle the `?promoted=` query param on page load. After templates load, check URL:
```typescript
// In useEffect, after loading:
const params = new URLSearchParams(window.location.search)
if (params.get("promoted")) {
  toast.success("Template promoted! It's now #1 in Featured.")
  window.history.replaceState({}, "", "/dashboard/seller")
}
```

---

## 11. Seller Dashboard — "Promote" Sidebar Section

### File: `src/app/dashboard/seller/promote/page.tsx`
**Action:** CREATE

**Purpose:** Dedicated promote management page showing all promoted templates with stats + a button to promote any unpromoted template.

```tsx
"use client"
// Client component
// - Fetch all seller's templates
// - Fetch promotions for seller
// - Compute position for each by querying all promotions ordered by promoted_at DESC
// - Display two sections:
//   1. "Your Promoted Templates" — cards showing template name, position, impressions, clicks, promoted_at, [Re-promote to #1 — $25] button
//   2. "Promote a Template" — list of unpromoted published templates with [Promote — $25] button each
// - Empty state: "Get more visibility for $25. Featured templates appear on the homepage, in search results, and get a ⭐ badge."
// - Re-promote button disabled if promoted_at is within last 24 hours (show "Available in Xh")
// - Use same handlePromote function as main seller page (calls /api/promote/checkout)
```

**Stats display per promoted template:**
```
┌─────────────────────────────────────────────────────┐
│ Template Title                    Featured #12      │
│ Promoted 3 days ago                                 │
│ 📊 1,234 impressions  👆 56 clicks  4.5% CTR       │
│                              [🔄 Re-promote — $25]  │
└─────────────────────────────────────────────────────┘
```

### File: `src/app/dashboard/seller/layout.tsx`
**Action:** CHECK IF EXISTS, then MODIFY or CREATE

If a seller dashboard layout exists, add a sidebar link for "Promote". If no layout exists, the promote page is accessible directly via `/dashboard/seller/promote` and linked from the main seller dashboard page.

**Add a link on the main seller dashboard page** (in `src/app/dashboard/seller/page.tsx`), near the top next to "Upload New Template":
```tsx
<Link href="/dashboard/seller/promote">
  <Button variant="outline"><Megaphone className="mr-2 h-4 w-4" />Promote Templates</Button>
</Link>
```

---

## 12. Analytics Tracking (Client-Side)

### File: `src/components/template-card.tsx`
**Action:** MODIFY (additional change)

**Add click tracking for featured cards:**

The TemplateCard is wrapped in a `<Link>`. To track clicks on featured cards without blocking navigation, fire a beacon on click:

```tsx
// Inside TemplateCard, wrap the Link's onClick:
const handleClick = isFeatured ? () => {
  navigator.sendBeacon("/api/promote/track", JSON.stringify({ templateId: template.id, type: "click" }))
} : undefined

// Add onClick={handleClick} to the <Link> element
```

**Impression tracking:** For simplicity in MVP, track impressions server-side when featured templates are queried. In the `FeaturedSection` and in the browse page featured query, after fetching featured templates, fire a POST to `/api/promote/track` with type `impression` for each. **Better approach:** do it in `FeaturedSection` (server component) by calling the Supabase RPC directly:

```typescript
// In featured-section.tsx, after fetching templates:
for (const id of templateIds) {
  await supabase.rpc("increment_promotion_stat", { p_template_id: id, p_field: "impressions" })
}
```

This is imprecise (counts SSR renders, not actual views) but good enough for MVP.

---

## 13. Summary of All Files

| # | File Path | Action | Purpose |
|---|-----------|--------|---------|
| 1 | `supabase/migrations/promotions.sql` | CREATE | DB table + RLS + RPC for atomic increment |
| 2 | `src/lib/types.ts` | MODIFY | Add `Promotion` interface |
| 3 | `src/lib/stripe.ts` | CREATE | Stripe client singleton |
| 4 | `src/lib/supabase/admin.ts` | CREATE | Service-role Supabase client for webhooks |
| 5 | `src/app/api/promote/checkout/route.ts` | CREATE | Stripe Checkout session creation |
| 6 | `src/app/api/promote/webhook/route.ts` | CREATE | Stripe webhook → upsert promotion |
| 7 | `src/app/api/promote/stats/route.ts` | CREATE | Seller's promotion stats API |
| 8 | `src/app/api/promote/track/route.ts` | CREATE | Impression/click tracking |
| 9 | `src/components/template-card.tsx` | MODIFY | Add `isFeatured` prop, badge, ring, click tracking |
| 10 | `src/components/featured-section.tsx` | CREATE | Homepage featured row (server component) |
| 11 | `src/app/page.tsx` | MODIFY | Import & render FeaturedSection above Popular |
| 12 | `src/app/templates/featured/page.tsx` | CREATE | Dedicated featured page with empty state |
| 13 | `src/components/featured-grid.tsx` | CREATE | Infinite scroll client component for featured page |
| 14 | `src/app/templates/page.tsx` | MODIFY | Inject 1-2 featured results above organic in search/browse |
| 15 | `src/components/navbar.tsx` | MODIFY | Add "⭐ Featured" nav link |
| 16 | `src/components/mobile-nav.tsx` | MODIFY | Add "⭐ Featured" to mobile nav |
| 17 | `src/app/dashboard/seller/page.tsx` | MODIFY | Add promote/re-promote buttons, promo stats, success toast |
| 18 | `src/app/dashboard/seller/promote/page.tsx` | CREATE | Dedicated promote management page with stats |

---

## 14. Build Order

1. **Migration** (#1) — run SQL first
2. **Types + Stripe + Admin client** (#2, #3, #4) — foundation
3. **API routes** (#5, #6, #7, #8) — backend complete
4. **TemplateCard badge** (#9) — visual foundation
5. **Homepage featured section** (#10, #11)
6. **Featured dedicated page** (#12, #13)
7. **Browse page featured injection** (#14)
8. **Navbar links** (#15, #16)
9. **Seller dashboard promote flow** (#17, #18)
10. **Test end-to-end:** promote → Stripe → webhook → appears on homepage/search/featured page
