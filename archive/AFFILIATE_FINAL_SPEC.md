# Molt Mart Affiliate Program — FINAL SPEC

> Reviewed and refined by Sub-Agent 2. This is the definitive build spec.

---

## Critical Review Summary

### What to KEEP from Agent 1 (and why)
- **Flat 7.5% commission for MVP** — already in the plan, simple, proven
- **Lifetime attribution** — genuine differentiator, keep it
- **30-day cookie** — industry standard, fine
- **Core DB schema** — solid, minor tweaks needed
- **Dashboard with stats/link/earnings** — essential baseline
- **Landing page structure** — good bones, copy needs de-hyping
- **Real-time click tracking** — critical for activation psychology
- **One-click affiliate signup** — correct, no friction

### What to CUT or DEFER (and why)

| Cut/Defer | Reason |
|-----------|--------|
| **Tiered commissions (Silver/Gold/Platinum)** | DEFER. We have 0 affiliates. Nobody will reach 50+ sales for months. Ship flat 7.5%, add tiers when someone actually hits 10 sales. Premature complexity. |
| **Two-tier referrals** | DEFER indefinitely. MLM-adjacent, adds complexity, no value at launch. |
| **8 unlockable badges** | DEFER. Ship 0 badges. A "Molt Mart Affiliate" badge on profile is enough. Gamification without users is a ghost town. |
| **Monthly leaderboard** | DEFER. A leaderboard with 3 people is embarrassing, not motivating. |
| **Pre-made banner/graphics** | DEFER. Nobody is making banner ads for a new marketplace. Text links and social posts are enough. |
| **QR code on referral link** | DEFER. Cute but unused for a digital product marketplace. |
| **Earnings calculator on landing page** | DEFER to v2. Nice conversion tool but not MVP. |
| **Monthly contests** | DEFER. No budget, no users. |
| **Seasonal campaigns (2x commission days)** | DEFER. |
| **Affiliate newsletter** | DEFER. We'd be emailing 5 people. |
| **Custom referral URLs (`/ref/username`)** | DEFER. Vanity feature. |
| **Variable rewards / random 2x days** | DEFER. |
| **Confetti animations** | DEFER. |

### What to CHANGE (and why)

**1. Commission must come from the platform's 15% cut, NOT the seller's revenue.**

Math proof:
- Template sells for $10.00
- Stripe takes ~3.4% ($0.34) — *Note: Stripe is 2.9% + $0.30, so on $10 it's ~$0.59 or 5.9%. On $25 it's ~$1.03 or 4.1%. Let's use 5% average.*
- Platform takes 15% ($1.50)
- Seller gets 80% ($8.00) — this is their money, we don't touch it
- Affiliate commission at 7.5% of sale = $0.75
- **Platform's actual take: $1.50 - $0.75 = $0.75** (on a $10 sale)
- Platform effectively earns 7.5% instead of 15% on affiliated sales

This works. On non-affiliated sales (majority), platform keeps full 15%. Affiliate commission is a customer acquisition cost paid from platform margin. Sellers should not even know about the affiliate split — it's invisible to them.

On a $25 template:
- Stripe: ~$1.03 (4.1%)
- Platform: $3.75 (15%)
- Affiliate: $1.875 (7.5%)
- Platform net: $1.875
- Seller: $20.22

✅ Sustainable. Platform still nets ~7.5% on affiliated sales. Sellers are unaffected.

**2. Drop the "endowed progress at 20%" — it's deceptive.** A progress bar that starts at 20% for doing nothing is a dark pattern. Devs will see through it and lose trust. Show honest progress: 0/1 first referral.

**3. Tone down the copy.** Agent 1's copy is too "affiliate marketing bro." Our audience is developers. They smell hype. Rewritten below.

**4. "First 100 affiliates" scarcity** — CUT. We can't promise "permanent perks" we haven't defined. Empty scarcity erodes trust with a technical audience.

**5. The Reddit copy suggestion is cringe.** "Not affiliated (well, technically I am lol)" — no. Devs on Reddit will downvote this to oblivion. Cut all pre-made Reddit copy; just note "be genuine and disclose affiliation per FTC guidelines."

**6. Simplify the trigger function** to use flat 7.5% (already does), but add a `commission_rate` column on `affiliates` table for future flexibility.

### What's MISSING (added below)

- Anti-fraud rules
- Terms & conditions
- Refund handling
- Self-referral prevention
- Mobile responsiveness requirement
- Seller + affiliate dual-role handling
- Commission approval flow (30-day hold)

---

## FINAL SPEC

---

### 1. Commission Structure (Finalized)

| | Rate | Source |
|---|---|---|
| **All affiliates (MVP)** | 7.5% of sale price | Deducted from platform's 15% fee |
| **Future tiers** | Up to 12% (not 15%) | Added when volume justifies it |
| **Cookie window** | 30 days | |
| **Attribution** | Lifetime (all future purchases by referred user) | |
| **Payout threshold** | $50 minimum | Higher than $25 to reduce payment ops overhead |
| **Payout frequency** | Monthly, after 30-day hold | Refund window |
| **Payments** | Stubbed at launch. Tracked from day 1, paid retroactively when Stripe Connect is live. | |

**Why not 15% max tier?** At 15% affiliate + 5% Stripe, the platform would *lose money* on affiliated sales (15% platform fee - 15% affiliate - absorbed Stripe = negative). Max tier should never exceed platform fee minus Stripe margin. **12% is the ceiling.**

---

### 2. MVP Features (Build NOW)

1. **One-click affiliate enrollment** — any logged-in user, one button, instant
2. **Unique referral link** — `moltmart.com/?ref=CODE`, copy button
3. **30-day referral cookie** (middleware)
4. **Click tracking** — real-time, deduplicated by IP hash per day
5. **Signup attribution** — link referred user to affiliate on account creation
6. **Purchase commission trigger** — DB trigger creates earning record at 7.5%
7. **Affiliate dashboard** — stats, link, earnings table, referrals table
8. **Landing page** (`/affiliate`) — simple, honest, dev-friendly
9. **Payout stub** — "tracked, payments coming soon" card
10. **"Affiliate" badge on profile** — simple boolean indicator
11. **3 pre-written social share texts** — Twitter and LinkedIn only
12. **Email: first commission earned** — single transactional email

That's it. 12 features. Everything else waits.

---

### 3. Deferred Features (v2+)

| Feature | When | Trigger |
|---------|------|---------|
| Tiered commissions | When 5+ affiliates hit 10 sales | Manual migration |
| Stripe Connect payouts | When total pending > $500 | Business priority |
| Earnings calculator | v2 landing page refresh | Nice to have |
| Leaderboard | When 20+ active affiliates | Need critical mass |
| Badges/gamification | When engagement data exists | Data-driven |
| Two-tier referrals | Probably never | MLM complexity |
| Pre-made graphics | When affiliates ask for them | Demand-driven |
| Custom referral URLs | Low priority | Vanity feature |
| Social share buttons (Discord, Reddit) | v2 | Twitter/LinkedIn enough for MVP |

---

### 4. Landing Page Content (`/affiliate`)

**Tone: Direct, honest, developer-friendly. No hype.**

#### Hero
- **Headline:** "Refer developers to Molt Mart. Earn 7.5% on every sale."
- **Subhead:** "You earn commission on every purchase your referrals make — not just the first one. Free to join."
- **CTA:** "Get Your Referral Link" (if logged in) / "Sign Up to Start" (if not)

#### How It Works (3 steps)
1. **Get your link** — Sign up and copy your unique referral URL
2. **Share it** — Post it wherever developers hang out
3. **Earn commission** — 7.5% on every sale your referrals make, for as long as they're a customer

#### Why It's Worth It
- **Lifetime earnings** — Your referrals buy a template 6 months from now? You still earn.
- **Real-time tracking** — See clicks and conversions as they happen
- **No minimums** — No traffic requirements, no approval process
- **Honest tracking** — 30-day cookie, transparent dashboard

#### FAQ
- **How much can I earn?** 7.5% of every sale. A $25 template = $1.88. Refer 20 active buyers = compounding passive income.
- **When do I get paid?** We're launching payments soon (Stripe Connect). All earnings are tracked from day one and will be paid retroactively.
- **Do I earn on repeat purchases?** Yes. Every purchase a referred user makes, forever.
- **Can I be a seller AND an affiliate?** Yes. You cannot earn affiliate commission on your own products.
- **What are the rules?** Don't spam. Don't self-refer. Disclose your affiliation. Full terms below.

#### CTA (bottom)
- "Ready? It takes 10 seconds." + button

**What's NOT on this page:** earnings calculators, fake social proof counters, scarcity tactics, testimonials we don't have, badge/tier explanations.

---

### 5. Dashboard Features (MVP only)

**Stats Row (4 cards):**
- Total Clicks | Referred Signups | Conversions (purchases) | Total Earnings

**Referral Link Card:**
- Full URL displayed
- Copy button with "Copied!" feedback
- 2 share buttons: Twitter, LinkedIn (pre-filled text)

**Earnings Table:**
- Date | Template | Sale Amount | Commission | Status (pending/approved/paid)
- Empty state: "No earnings yet. Share your link to get started."

**Referrals Table:**
- Referred User (anonymized: first initial + "***") | Signup Date | Purchases Made
- Empty state: "No referrals yet."

**Payout Card:**
- Total approved earnings: $XX.XX
- "Payments via Stripe Connect are coming soon. All your earnings are tracked and will be paid retroactively."

**NOT in MVP dashboard:** QR codes, progress bars, tier indicators, quick share templates, leaderboard, badges, notifications feed.

---

### 6. Database Schema (Finalized)

```sql
-- AFFILIATES
create table public.affiliates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  referral_code text unique not null,
  commission_rate integer default 75,         -- basis points (75 = 7.5%), allows future tier changes
  status text default 'active' check (status in ('active', 'paused', 'banned')),
  total_clicks integer default 0,
  total_signups integer default 0,
  total_sales integer default 0,
  total_earnings_cents integer default 0,
  created_at timestamptz default now()
);
alter table public.affiliates enable row level security;
create policy "affiliates_select_own" on public.affiliates for select using (auth.uid() = user_id);
create policy "affiliates_select_by_code" on public.affiliates for select using (true);
create policy "affiliates_insert" on public.affiliates for insert with check (auth.uid() = user_id);
create index affiliates_referral_code_idx on public.affiliates(referral_code);
create index affiliates_user_id_idx on public.affiliates(user_id);

-- REFERRALS
create table public.referrals (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(referred_user_id)                    -- a user can only be referred by ONE affiliate
);
alter table public.referrals enable row level security;
create policy "referrals_select" on public.referrals for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);
create index referrals_affiliate_id_idx on public.referrals(affiliate_id);
create index referrals_referred_user_idx on public.referrals(referred_user_id);

-- AFFILIATE EARNINGS
create table public.affiliate_earnings (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  sale_amount_cents integer not null,
  commission_rate integer not null,            -- snapshot of rate at time of sale
  commission_cents integer not null,
  status text default 'pending' check (status in ('pending', 'approved', 'paid', 'reversed')),
  approved_at timestamptz,
  created_at timestamptz default now(),
  unique(purchase_id)
);
alter table public.affiliate_earnings enable row level security;
create policy "earnings_select" on public.affiliate_earnings for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);
create index earnings_affiliate_id_idx on public.affiliate_earnings(affiliate_id);
create index earnings_status_idx on public.affiliate_earnings(status);

-- REFERRAL CLICKS (lightweight)
create table public.referral_clicks (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  ip_hash text not null,
  user_agent text,
  created_at timestamptz default now()
);
alter table public.referral_clicks enable row level security;
create policy "clicks_insert" on public.referral_clicks for insert with check (true);
create policy "clicks_select" on public.referral_clicks for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);
-- Dedup index: one click per IP per affiliate per day
create unique index clicks_dedup_idx on public.referral_clicks(affiliate_id, ip_hash, (created_at::date));

-- TRIGGER: record commission on purchase
create or replace function public.record_affiliate_earning()
returns trigger as $$
declare
  v_affiliate record;
  v_commission integer;
begin
  -- Find affiliate for this buyer
  select a.id, a.commission_rate, a.user_id
  into v_affiliate
  from public.referrals r
  join public.affiliates a on a.id = r.affiliate_id
  where r.referred_user_id = NEW.buyer_id
    and a.status = 'active'
  limit 1;

  if v_affiliate.id is not null
    and NEW.price_cents > 0
    and v_affiliate.user_id != NEW.seller_id  -- no commission on own products
  then
    v_commission := (NEW.price_cents * v_affiliate.commission_rate) / 1000;

    insert into public.affiliate_earnings
      (affiliate_id, purchase_id, referred_user_id, sale_amount_cents, commission_rate, commission_cents)
    values
      (v_affiliate.id, NEW.id, NEW.buyer_id, NEW.price_cents, v_affiliate.commission_rate, v_commission);

    update public.affiliates
    set total_earnings_cents = total_earnings_cents + v_commission,
        total_sales = total_sales + 1
    where id = v_affiliate.id;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_purchase_check_affiliate
  after insert on public.purchases
  for each row execute procedure public.record_affiliate_earning();
```

**Key changes from Agent 1's schema:**
- Added `commission_rate` on affiliates (future tier flexibility)
- Added `total_sales` counter
- Added `commission_rate` snapshot on earnings (audit trail)
- Added `approved_at` and `reversed` status on earnings (refund handling)
- Changed `referrals` unique constraint to `referred_user_id` (a user has ONE affiliate, period)
- Removed `status` from referrals (unnecessary — just check if earnings exist)
- Added dedup index on clicks (one per IP per affiliate per day)
- Added anti-self-commission check in trigger (`affiliate.user_id != seller_id`)

---

### 7. Anti-Fraud Rules

**Implemented in code:**
1. **No self-referral** — Cannot set own referral cookie. Middleware checks: if logged-in user's ID matches affiliate's user_id, ignore the ref param.
2. **No commission on own products** — Trigger checks `affiliate.user_id != seller_id`.
3. **Click dedup** — Max one click counted per IP hash per affiliate per day.
4. **30-day hold** — Earnings stay "pending" for 30 days before becoming "approved." If a refund occurs in that window, status → "reversed."
5. **IP hash matching** — If referred user's signup IP matches affiliate's known IP, flag for manual review (don't auto-block, just flag).
6. **Rate limiting** — `/api/affiliate/track-click` rate-limited to 10 req/min per IP.
7. **Banned status** — Affiliates can be set to `banned`, which stops all commission accrual.

**Handled manually (for now):**
- Review affiliates with suspiciously high signup-to-no-purchase ratios
- Review if same user keeps creating accounts via same affiliate

---

### 8. Terms & Conditions (Key Points)

Display on `/affiliate` page as collapsible section or link to `/affiliate/terms`.

1. **Eligibility** — Any registered Molt Mart user can join. One affiliate account per person.
2. **Commission** — 7.5% of sale price on qualifying purchases made by your referred users. Rate may change with 30 days notice.
3. **Attribution** — 30-day cookie. First-touch attribution (first affiliate to refer a user gets credit). Lifetime earnings on attributed users.
4. **Prohibited conduct:**
   - Self-referrals (referring your own accounts)
   - Spam (unsolicited bulk email, DMs, or comments)
   - Misleading claims about Molt Mart
   - Cookie stuffing or forced clicks
   - Bidding on "Molt Mart" branded keywords in paid ads
   - Creating fake accounts to generate commissions
5. **Refunds** — If a referred purchase is refunded, the associated commission is reversed.
6. **Payments** — Monthly, after 30-day approval hold. $50 minimum. Via Stripe Connect (coming soon). Earnings tracked from day one.
7. **Termination** — We can terminate affiliate accounts for violations. Pending approved earnings will still be paid.
8. **Tax responsibility** — Affiliates are responsible for reporting their own earnings.
9. **FTC compliance** — Affiliates must disclose their relationship with Molt Mart per FTC guidelines.
10. **Modifications** — We may update these terms with 30 days email notice.

---

### 9. Pages & Components to Build

#### Pages

| Page | Route | Description |
|------|-------|-------------|
| Affiliate Landing | `/affiliate` | Public marketing page (see Section 4) |
| Affiliate Dashboard | `/dashboard/affiliate` | Stats, link, tables (see Section 5) |
| Affiliate Terms | `/affiliate/terms` | Terms & conditions (see Section 8) |

#### Components

| Component | File | Purpose |
|-----------|------|---------|
| `AffiliateStats` | `src/components/affiliate/affiliate-stats.tsx` | 4 stat cards (clicks, signups, sales, earnings) |
| `ReferralLinkCard` | `src/components/affiliate/referral-link-card.tsx` | Link display + copy + Twitter/LinkedIn share |
| `EarningsTable` | `src/components/affiliate/earnings-table.tsx` | Sortable earnings list with status |
| `ReferralsTable` | `src/components/affiliate/referrals-table.tsx` | Referred users list |
| `BecomeAffiliateCard` | `src/components/affiliate/become-affiliate-card.tsx` | One-click enrollment CTA |
| `PayoutPlaceholder` | `src/components/affiliate/payout-placeholder.tsx` | "Coming soon" payout card |

#### API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/affiliate/join` | POST | Yes | Create affiliate record |
| `/api/affiliate/track-click` | POST | No | Record click (rate-limited) |
| `/api/affiliate/stats` | GET | Yes | Return affiliate stats |
| `/api/affiliate/earnings` | GET | Yes | Paginated earnings |
| `/api/affiliate/referrals` | GET | Yes | Paginated referrals |

**Note:** `record-signup` from Agent 1's plan should be handled inline in the signup flow (read cookie → insert referral), not as a separate API route. Fewer moving parts.

#### Middleware

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Read `?ref=` param, set `molt_ref` cookie (30 days). Skip if user is the affiliate themselves. |

#### Navigation Changes

- Dashboard sidebar: add "Affiliate Program" link (for all users)
- User dropdown menu: add "Affiliate Program" link
- Footer: add "Affiliate Program" link
- Post-purchase page: add subtle "Earn by sharing" CTA

#### Files to Create/Modify (Build Order)

1. `supabase/migrations/affiliate_schema.sql`
2. `src/lib/types.ts` (add Affiliate types)
3. `src/lib/affiliate.ts` (helpers: generateCode, getByCode, etc.)
4. `src/middleware.ts` (extend with ref cookie)
5. `src/app/api/affiliate/join/route.ts`
6. `src/app/api/affiliate/track-click/route.ts`
7. `src/app/api/affiliate/stats/route.ts`
8. `src/app/api/affiliate/earnings/route.ts`
9. `src/app/api/affiliate/referrals/route.ts`
10. `src/components/affiliate/affiliate-stats.tsx`
11. `src/components/affiliate/referral-link-card.tsx`
12. `src/components/affiliate/earnings-table.tsx`
13. `src/components/affiliate/referrals-table.tsx`
14. `src/components/affiliate/become-affiliate-card.tsx`
15. `src/components/affiliate/payout-placeholder.tsx`
16. `src/app/affiliate/page.tsx`
17. `src/app/affiliate/terms/page.tsx`
18. `src/app/dashboard/affiliate/page.tsx`
19. `src/app/dashboard/layout.tsx` (add sidebar link)
20. `src/components/navbar.tsx` (add dropdown link)
21. Signup flow modification (read cookie, create referral)

---

## Reality Check

Molt Mart is new with no users. Here's the honest early strategy:

1. **Don't fake social proof.** No "Join 500+ affiliates" when there are 3. Just say "Free to join."
2. **Early affiliates are believers, not earners.** They'll promote because they like the product or believe in the vision. Commission is a bonus, not the primary motivator yet.
3. **The landing page should sell Molt Mart first, affiliate program second.** If someone doesn't believe in the marketplace, no commission rate will make them promote it.
4. **Track everything from day one** so when payments go live, early affiliates get rewarded retroactively. This builds immense loyalty.
5. **Flat 7.5% is enough.** Don't over-promise with tiers nobody will reach. When someone hits 10 sales, surprise them with a rate bump. Under-promise, over-deliver.

---

*This is the definitive spec. Build agent: follow this, not the research doc or the original plan.*
