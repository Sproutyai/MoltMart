# Molt Mart Affiliate Program — Implementation Plan

## Overview
Any logged-in user can become an affiliate, get a unique referral link/code, and earn **7.5% commission** on purchases made by referred users. Attribution window: **30 days** (cookie-based). Payments are stubbed for now.

---

## 1. Database Schema

```sql
-- AFFILIATES
create table public.affiliates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  referral_code text unique not null,        -- e.g. 'ABC123'
  status text default 'active' check (status in ('active', 'paused', 'banned')),
  total_clicks integer default 0,
  total_signups integer default 0,
  total_earnings_cents integer default 0,
  created_at timestamptz default now()
);
alter table public.affiliates enable row level security;
create policy "affiliates_select_own" on public.affiliates for select using (auth.uid() = user_id);
create policy "affiliates_select_public" on public.affiliates for select using (true);  -- need code lookups
create policy "affiliates_insert" on public.affiliates for insert with check (auth.uid() = user_id);
create policy "affiliates_update" on public.affiliates for update using (auth.uid() = user_id);
create index affiliates_referral_code_idx on public.affiliates(referral_code);
create index affiliates_user_id_idx on public.affiliates(user_id);

-- REFERRALS (tracks each referred user)
create table public.referrals (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  referred_user_id uuid references public.profiles(id) on delete set null,
  status text default 'signed_up' check (status in ('signed_up', 'purchased')),
  created_at timestamptz default now(),
  unique(affiliate_id, referred_user_id)
);
alter table public.referrals enable row level security;
create policy "referrals_select" on public.referrals for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);
create policy "referrals_insert" on public.referrals for insert with check (true);  -- API route handles auth
create index referrals_affiliate_id_idx on public.referrals(affiliate_id);

-- AFFILIATE EARNINGS (one row per qualifying purchase)
create table public.affiliate_earnings (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  sale_amount_cents integer not null,         -- original purchase price
  commission_cents integer not null,          -- 7.5% of sale
  status text default 'pending' check (status in ('pending', 'approved', 'paid')),
  created_at timestamptz default now(),
  unique(purchase_id)                         -- one commission per purchase
);
alter table public.affiliate_earnings enable row level security;
create policy "earnings_select" on public.affiliate_earnings for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);
create index earnings_affiliate_id_idx on public.affiliate_earnings(affiliate_id);

-- REFERRAL CLICKS (lightweight tracking)
create table public.referral_clicks (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  ip_hash text,                               -- hashed IP for dedup
  user_agent text,
  created_at timestamptz default now()
);
alter table public.referral_clicks enable row level security;
create policy "clicks_insert" on public.referral_clicks for insert with check (true);
create policy "clicks_select" on public.referral_clicks for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);

-- Function: record affiliate earning when a referred user makes a purchase
create or replace function public.record_affiliate_earning()
returns trigger as $$
declare
  v_affiliate_id uuid;
  v_commission integer;
begin
  -- Check if buyer was referred
  select r.affiliate_id into v_affiliate_id
  from public.referrals r
  where r.referred_user_id = NEW.buyer_id
  limit 1;

  if v_affiliate_id is not null and NEW.price_cents > 0 then
    v_commission := (NEW.price_cents * 75) / 1000;  -- 7.5%
    
    insert into public.affiliate_earnings (affiliate_id, purchase_id, referred_user_id, sale_amount_cents, commission_cents)
    values (v_affiliate_id, NEW.id, NEW.buyer_id, NEW.price_cents, v_commission);
    
    update public.affiliates
    set total_earnings_cents = total_earnings_cents + v_commission
    where id = v_affiliate_id;
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_purchase_check_affiliate
  after insert on public.purchases
  for each row execute procedure public.record_affiliate_earning();
```

---

## 2. TypeScript Types

Add to `src/lib/types.ts`:

```typescript
export interface Affiliate {
  id: string
  user_id: string
  referral_code: string
  status: 'active' | 'paused' | 'banned'
  total_clicks: number
  total_signups: number
  total_earnings_cents: number
  created_at: string
  profile?: Profile
}

export interface Referral {
  id: string
  affiliate_id: string
  referred_user_id: string | null
  status: 'signed_up' | 'purchased'
  created_at: string
  referred_user?: Profile
}

export interface AffiliateEarning {
  id: string
  affiliate_id: string
  purchase_id: string
  referred_user_id: string
  sale_amount_cents: number
  commission_cents: number
  status: 'pending' | 'approved' | 'paid'
  created_at: string
  referred_user?: Profile
  purchase?: Purchase
}

export interface AffiliateStats {
  total_clicks: number
  total_signups: number
  total_purchases: number
  total_earnings_cents: number
  pending_earnings_cents: number
  conversion_rate: number  // signups / clicks
}
```

---

## 3. Middleware / Cookie Logic

### `src/middleware.ts` (create or extend)

```
On every request:
1. Check URL for `?ref=XXXX` query param
2. If present, set cookie `molt_ref=XXXX` with 30-day expiry, path=/
3. Also redirect to clean URL (strip ?ref param) — optional, can keep it
```

### On signup (`src/app/signup/page.tsx` or API route):
```
1. Read `molt_ref` cookie
2. If present, look up affiliate by referral_code
3. If valid affiliate found, create referral record (affiliate_id, referred_user_id, status='signed_up')
4. Increment affiliates.total_signups
5. Log a click if not already logged
```

### On purchase (handled by DB trigger automatically):
```
The `record_affiliate_earning` trigger fires on every purchase insert.
It checks if the buyer has a referral record and creates an earning entry.
```

---

## 4. Pages

### `/affiliate` — Public landing page
- Hero section: "Earn 7.5% on every sale you refer"
- How it works: 3-step flow (Sign up → Share link → Earn commission)
- Stats/social proof (total affiliates, total paid out — stubbed)
- CTA: "Become an Affiliate" → links to `/signup` or `/dashboard/affiliate` if logged in
- FAQ section

### `/dashboard/affiliate` — Affiliate dashboard
- **If not an affiliate:** Show "Become an Affiliate" card with one-click signup
- **If affiliate:**
  - Stats cards row: Total Clicks | Signups | Purchases | Earnings
  - Referral link section: display link + copy button + referral code
  - Earnings table: date, referred user, template, sale amount, commission, status
  - Referrals table: referred users, signup date, status
  - Payout section: "💰 Payouts coming soon" placeholder card

---

## 5. Components

### `src/components/affiliate/affiliate-stats.tsx`
- Props: `stats: AffiliateStats`
- 4 stat cards in a grid

### `src/components/affiliate/referral-link-card.tsx`
- Props: `referralCode: string`
- Shows full URL, copy button, QR code (optional later)

### `src/components/affiliate/earnings-table.tsx`
- Props: `earnings: AffiliateEarning[]`
- Sortable table with columns: Date, User, Template, Sale, Commission, Status

### `src/components/affiliate/referrals-table.tsx`
- Props: `referrals: Referral[]`
- Table: User, Signup Date, Status (signed_up/purchased)

### `src/components/affiliate/become-affiliate-card.tsx`
- One-click "Become an Affiliate" button
- Calls API to create affiliate record

### `src/components/affiliate/payout-placeholder.tsx`
- "Payouts coming soon" card with brief explanation

---

## 6. API Routes

### `POST /api/affiliate/join`
- Auth required
- Generate unique 8-char referral code (nanoid)
- Insert into `affiliates` table
- Return affiliate record

### `POST /api/affiliate/track-click`
- Public (no auth)
- Body: `{ referral_code: string }`
- Validate code exists, insert into `referral_clicks`, increment `total_clicks`
- Rate-limit by IP hash

### `POST /api/affiliate/record-signup`
- Called internally after user signup
- Body: `{ user_id: string, referral_code: string }`
- Create referral record, increment `total_signups`

### `GET /api/affiliate/stats`
- Auth required
- Return AffiliateStats for current user's affiliate account

### `GET /api/affiliate/earnings`
- Auth required
- Return paginated earnings list

### `GET /api/affiliate/referrals`
- Auth required
- Return paginated referrals list

---

## 7. Navigation Changes

### Dashboard sidebar (`src/app/dashboard/layout.tsx`)
Add after "Account" section:
```
<p className="...">Affiliate</p>
<Link href="/dashboard/affiliate">
  <Megaphone className="h-4 w-4" />
  Affiliate Program
</Link>
```
Show for all users (non-affiliates see the "join" CTA).

### Navbar (`src/components/navbar.tsx`)
Add dropdown menu item:
```
<DropdownMenuItem asChild>
  <Link href="/dashboard/affiliate">Affiliate Program</Link>
</DropdownMenuItem>
```

### Footer (if exists) or homepage
Add "Affiliate Program" link pointing to `/affiliate`.

---

## 8. Payment Integration Stubs

### Where Stripe connects later:
1. **`/api/affiliate/request-payout`** — stubbed endpoint, returns `{ message: "Payouts coming soon" }`
2. **Payout placeholder card** on dashboard — shows total approved earnings, "Request Payout" button disabled with tooltip
3. **Stripe Connect** — affiliates will onboard via Stripe Connect Express; store `stripe_account_id` on affiliates table (column added later)
4. **Webhook** — `stripe webhook → mark earnings as 'paid'` (future)
5. **Auto-approval** — earnings auto-approve after 30-day refund window (future cron job)

---

## 9. File-by-File Implementation Order

### Phase 1: Database & Types
1. `supabase/affiliate-schema.sql` — All SQL from section 1
2. `src/lib/types.ts` — Add Affiliate types from section 2

### Phase 2: Middleware & Cookie Tracking
3. `src/middleware.ts` — Create/extend with referral cookie logic
4. `src/lib/affiliate.ts` — Helper functions: `generateReferralCode()`, `getAffiliateByCode()`, `recordReferralSignup()`

### Phase 3: API Routes
5. `src/app/api/affiliate/join/route.ts`
6. `src/app/api/affiliate/track-click/route.ts`
7. `src/app/api/affiliate/record-signup/route.ts`
8. `src/app/api/affiliate/stats/route.ts`
9. `src/app/api/affiliate/earnings/route.ts`
10. `src/app/api/affiliate/referrals/route.ts`

### Phase 4: Components
11. `src/components/affiliate/affiliate-stats.tsx`
12. `src/components/affiliate/referral-link-card.tsx`
13. `src/components/affiliate/earnings-table.tsx`
14. `src/components/affiliate/referrals-table.tsx`
15. `src/components/affiliate/become-affiliate-card.tsx`
16. `src/components/affiliate/payout-placeholder.tsx`

### Phase 5: Pages
17. `src/app/affiliate/page.tsx` — Public landing page
18. `src/app/dashboard/affiliate/page.tsx` — Affiliate dashboard

### Phase 6: Navigation & Integration
19. `src/app/dashboard/layout.tsx` — Add affiliate sidebar link
20. `src/components/navbar.tsx` — Add affiliate dropdown item
21. `src/app/signup/page.tsx` — Read `molt_ref` cookie, call record-signup after user creation

### Phase 7: Polish
22. Add loading states and error handling
23. Add empty states for tables
24. Mobile responsiveness check
