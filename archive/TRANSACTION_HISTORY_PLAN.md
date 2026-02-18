# Transaction History Page — Implementation Plan

## 1. Database Changes

### New columns on `purchases` table:
```sql
ALTER TABLE public.purchases
  ADD COLUMN status text DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'refunded')),
  ADD COLUMN stripe_payment_intent_id text,
  ADD COLUMN platform_fee_cents integer DEFAULT 0,
  ADD COLUMN seller_earnings_cents integer DEFAULT 0;
```

### New RLS note
The existing `purchases_select_seller` policy already lets sellers read purchases for their templates. No new policies needed.

### Migration file
Create `supabase/migrations/add_purchase_transaction_fields.sql` with the above.

---

## 2. API Route: `GET /api/seller/transactions`

**File:** `src/app/api/seller/transactions/route.ts`

### Auth
- Get user from supabase auth. 401 if not logged in. 403 if not a seller.

### Query
```sql
SELECT
  p.id,
  p.price_cents,
  p.platform_fee_cents,
  p.seller_earnings_cents,
  p.status,
  p.created_at,
  t.id AS template_id,
  t.title AS template_title,
  t.slug AS template_slug,
  b.username AS buyer_username,
  b.display_name AS buyer_display_name
FROM purchases p
JOIN templates t ON t.id = p.template_id
JOIN profiles b ON b.id = p.buyer_id
WHERE t.seller_id = :current_user_id
```

### Query params (all optional)
| Param | Type | Description |
|-------|------|-------------|
| `period` | `week\|month\|year\|all` | Date range filter (default: `all`) |
| `from` | ISO date | Custom range start |
| `to` | ISO date | Custom range end |
| `template_id` | uuid | Filter by specific template |
| `status` | `completed\|pending\|refunded` | Filter by status |
| `sort` | `date\|amount\|template` | Sort column (default: `date`) |
| `order` | `asc\|desc` | Sort direction (default: `desc`) |
| `page` | number | Page number (default: 1) |
| `per_page` | number | Items per page (default: 20, max: 100) |

### Response shape
```json
{
  "transactions": [...],
  "summary": {
    "total_earnings_cents": 50000,
    "earnings_this_month_cents": 12000,
    "earnings_this_week_cents": 3000,
    "total_transactions": 42,
    "avg_sale_cents": 1190,
    "top_template": { "id": "...", "title": "...", "sales_count": 15 }
  },
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 42,
    "total_pages": 3
  }
}
```

### Summary query (run in parallel with main query)
```sql
-- total earnings
SELECT
  COALESCE(SUM(p.seller_earnings_cents), 0) AS total_earnings_cents,
  COUNT(*) AS total_transactions,
  COALESCE(AVG(p.price_cents), 0) AS avg_sale_cents
FROM purchases p
JOIN templates t ON t.id = p.template_id
WHERE t.seller_id = :uid AND p.status = 'completed';

-- this month
... WHERE ... AND p.created_at >= date_trunc('month', now());

-- this week
... WHERE ... AND p.created_at >= date_trunc('week', now());

-- top template
SELECT t.id, t.title, COUNT(*) AS sales_count
FROM purchases p JOIN templates t ON t.id = p.template_id
WHERE t.seller_id = :uid AND p.status = 'completed'
GROUP BY t.id, t.title
ORDER BY sales_count DESC LIMIT 1;
```

---

## 3. API Route: `GET /api/seller/transactions/export`

**File:** `src/app/api/seller/transactions/export/route.ts`

Same filters as above (no pagination). Returns CSV with headers:
```
Transaction ID, Date, Template, Buyer, Sale Price, Platform Fee, Net Earnings, Status
```

Set `Content-Type: text/csv` and `Content-Disposition: attachment; filename=molt-mart-transactions-YYYY-MM-DD.csv`

---

## 4. TypeScript Types

Add to `src/lib/types.ts`:

```typescript
export interface SellerTransaction {
  id: string
  price_cents: number
  platform_fee_cents: number
  seller_earnings_cents: number
  status: 'completed' | 'pending' | 'refunded'
  created_at: string
  template_id: string
  template_title: string
  template_slug: string
  buyer_username: string
  buyer_display_name: string | null
}

export interface TransactionSummary {
  total_earnings_cents: number
  earnings_this_month_cents: number
  earnings_this_week_cents: number
  total_transactions: number
  avg_sale_cents: number
  top_template: { id: string; title: string; sales_count: number } | null
}

export interface TransactionFilters {
  period: 'week' | 'month' | 'year' | 'all'
  from?: string
  to?: string
  template_id?: string
  status?: 'completed' | 'pending' | 'refunded'
  sort: 'date' | 'amount' | 'template'
  order: 'asc' | 'desc'
  page: number
  per_page: number
}
```

---

## 5. Components

All in `src/components/transactions/`:

### `EarningsSummary.tsx`
- Props: `{ summary: TransactionSummary }`
- 4 cards in a row: Total Earnings, This Month, This Week, Total Transactions
- Below cards: small text showing avg sale price and top-selling template
- Use `DollarSign`, `TrendingUp`, `Calendar`, `Hash` icons

### `TransactionFilters.tsx`
- Props: `{ filters: TransactionFilters, templates: { id: string, title: string }[], onChange: (f) => void }`
- Row of controls: Period select (This Week / This Month / This Year / All Time), Template select (all + each template), Status select (All / Completed / Pending / Refunded)
- Export CSV button on the right side

### `TransactionTable.tsx`
- Props: `{ transactions: SellerTransaction[], sort, order, onSort }`
- Columns: Date, Template, Buyer, Amount, Fee, Net, Status
- Clickable column headers for sorting (with arrow indicator)
- Status badges: green=completed, yellow=pending, red=refunded
- Date formatted as "Feb 15, 2026 10:30 PM"
- Amounts formatted as "$12.00"
- Template name links to `/templates/{slug}`

### `TransactionPagination.tsx`
- Props: `{ page, totalPages, onChange }`
- Previous/Next buttons + page indicator

### `EmptyTransactions.tsx`
- Receipt icon + "No transactions yet" + "Sales will appear here once customers purchase your templates"

---

## 6. Page Layout

**File:** `src/app/dashboard/transactions/page.tsx` (replace placeholder)

```
"use client" page

┌─────────────────────────────────────────────────┐
│ Transaction History                    [Export]  │
├─────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐│
│ │  Total   │ │  This    │ │  This    │ │ Total││
│ │ Earnings │ │  Month   │ │  Week    │ │ Sales││
│ │ $500.00  │ │ $120.00  │ │  $30.00  │ │  42  ││
│ └──────────┘ └──────────┘ └──────────┘ └──────┘│
├─────────────────────────────────────────────────┤
│ [Period ▾] [Template ▾] [Status ▾]             │
├─────────────────────────────────────────────────┤
│ Date↓  │ Template │ Buyer │ Amount │ Fee │ Net  │
│ ────────┼──────────┼───────┼────────┼─────┼───── │
│ Feb 15  │ AI Bot   │ jane  │ $15.00 │$2.25│$12.75│
│ Feb 14  │ Helper   │ bob   │ $10.00 │$1.50│$8.50 │
│ ...     │          │       │        │     │      │
├─────────────────────────────────────────────────┤
│              ‹ Page 1 of 3 ›                    │
└─────────────────────────────────────────────────┘
```

State management: `useState` for filters, `useEffect` to fetch on filter change. Loading skeleton while fetching.

---

## 7. Implementation Steps (Ordered)

1. **Database migration** — Create `supabase/migrations/add_purchase_transaction_fields.sql`. Add `status`, `stripe_payment_intent_id`, `platform_fee_cents`, `seller_earnings_cents` columns to `purchases`. Run migration.

2. **Types** — Add `SellerTransaction`, `TransactionSummary`, `TransactionFilters` to `src/lib/types.ts`.

3. **API route** — Create `src/app/api/seller/transactions/route.ts` with GET handler. Auth check → build query with filters → run summary queries → return JSON.

4. **Export API route** — Create `src/app/api/seller/transactions/export/route.ts`. Same query, CSV output.

5. **Components** — Create all 5 components in `src/components/transactions/`:
   - `EarningsSummary.tsx`
   - `TransactionFilters.tsx`
   - `TransactionTable.tsx`
   - `TransactionPagination.tsx`
   - `EmptyTransactions.tsx`

6. **Page** — Replace `src/app/dashboard/transactions/page.tsx` with the full implementation wiring all components together.

7. **Test** — Verify with both empty state (new seller) and with mock/seed data.

---

## Notes

- **Platform fee calculation:** For now, hardcode 15% platform fee. Calculate on purchase creation: `platform_fee_cents = Math.round(price_cents * 0.15)`, `seller_earnings_cents = price_cents - platform_fee_cents`. Do NOT show the percentage to users — just show dollar amounts.
- **Backfill:** Existing purchases have 0 for fee/earnings columns. Add a one-time migration to backfill: `UPDATE purchases SET platform_fee_cents = ROUND(price_cents * 0.15), seller_earnings_cents = price_cents - ROUND(price_cents * 0.15) WHERE seller_earnings_cents = 0 AND price_cents > 0;`
- **Existing UI components:** Use shadcn `Card`, `Button`, `Badge`, `Select`, `Table` components that are already in the project.
