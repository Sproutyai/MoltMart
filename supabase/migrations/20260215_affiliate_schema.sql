-- AFFILIATES
create table if not exists public.affiliates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  referral_code text unique not null,
  commission_rate integer default 75,
  status text default 'active' check (status in ('active', 'paused', 'banned')),
  total_clicks integer default 0,
  total_signups integer default 0,
  total_sales integer default 0,
  total_earnings_cents integer default 0,
  created_at timestamptz default now()
);
alter table public.affiliates enable row level security;
drop policy if exists "affiliates_select_own" on public.affiliates;
create policy "affiliates_select_own" on public.affiliates for select using (true);
drop policy if exists "affiliates_insert" on public.affiliates;
create policy "affiliates_insert" on public.affiliates for insert with check (auth.uid() = user_id);
create index if not exists affiliates_referral_code_idx on public.affiliates(referral_code);
create index if not exists affiliates_user_id_idx on public.affiliates(user_id);

-- REFERRALS
create table if not exists public.referrals (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(referred_user_id)
);
alter table public.referrals enable row level security;
drop policy if exists "referrals_select" on public.referrals;
create policy "referrals_select" on public.referrals for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);
drop policy if exists "referrals_insert" on public.referrals;
create policy "referrals_insert" on public.referrals for insert with check (true);
create index if not exists referrals_affiliate_id_idx on public.referrals(affiliate_id);
create index if not exists referrals_referred_user_idx on public.referrals(referred_user_id);

-- AFFILIATE EARNINGS
create table if not exists public.affiliate_earnings (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  sale_amount_cents integer not null,
  commission_rate integer not null,
  commission_cents integer not null,
  status text default 'pending' check (status in ('pending', 'approved', 'paid', 'reversed')),
  approved_at timestamptz,
  created_at timestamptz default now(),
  unique(purchase_id)
);
alter table public.affiliate_earnings enable row level security;
drop policy if exists "earnings_select" on public.affiliate_earnings;
create policy "earnings_select" on public.affiliate_earnings for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);
create index if not exists earnings_affiliate_id_idx on public.affiliate_earnings(affiliate_id);
create index if not exists earnings_status_idx on public.affiliate_earnings(status);

-- REFERRAL CLICKS
create table if not exists public.referral_clicks (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  ip_hash text not null,
  user_agent text,
  created_at timestamptz default now()
);
alter table public.referral_clicks enable row level security;
drop policy if exists "clicks_insert" on public.referral_clicks;
create policy "clicks_insert" on public.referral_clicks for insert with check (true);
drop policy if exists "clicks_select" on public.referral_clicks;
create policy "clicks_select" on public.referral_clicks for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);
-- Dedup handled in application code (one click per IP per affiliate per day)

-- TRIGGER: record commission on purchase
create or replace function public.record_affiliate_earning()
returns trigger as $$
declare
  v_affiliate record;
  v_commission integer;
begin
  select a.id, a.commission_rate, a.user_id
  into v_affiliate
  from public.referrals r
  join public.affiliates a on a.id = r.affiliate_id
  where r.referred_user_id = NEW.buyer_id
    and a.status = 'active'
  limit 1;

  if v_affiliate.id is not null
    and NEW.price_cents > 0
    and v_affiliate.user_id != NEW.seller_id
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

drop trigger if exists on_purchase_check_affiliate on public.purchases;
create trigger on_purchase_check_affiliate
  after insert on public.purchases
  for each row execute procedure public.record_affiliate_earning();
