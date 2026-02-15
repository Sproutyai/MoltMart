-- MOLT MART — COMPLETE SCHEMA + RLS
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  is_seller boolean default false,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- TEMPLATES
create table public.templates (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text unique not null,
  description text not null,
  long_description text,
  category text not null,
  tags text[] default '{}',
  price_cents integer default 0,
  file_path text not null,
  preview_data jsonb default '{}',
  download_count integer default 0,
  avg_rating numeric(3,2) default 0,
  review_count integer default 0,
  status text default 'published' check (status in ('draft','published','archived')),
  compatibility text default '>=0.1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.templates enable row level security;
create policy "templates_select" on public.templates for select using (status = 'published' or auth.uid() = seller_id);
create policy "templates_insert" on public.templates for insert with check (auth.uid() = seller_id);
create policy "templates_update" on public.templates for update using (auth.uid() = seller_id);
create policy "templates_delete" on public.templates for delete using (auth.uid() = seller_id);
create index templates_category_idx on public.templates(category);
create index templates_status_idx on public.templates(status);
create index templates_slug_idx on public.templates(slug);

-- PURCHASES
create table public.purchases (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete cascade,
  price_cents integer default 0,
  created_at timestamptz default now(),
  unique(buyer_id, template_id)
);
alter table public.purchases enable row level security;
create policy "purchases_select" on public.purchases for select using (auth.uid() = buyer_id);
create policy "purchases_insert" on public.purchases for insert with check (auth.uid() = buyer_id);
create policy "purchases_select_seller" on public.purchases for select using (
  template_id in (select id from public.templates where seller_id = auth.uid())
);

-- REVIEWS
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique(buyer_id, template_id)
);
alter table public.reviews enable row level security;
create policy "reviews_select" on public.reviews for select using (true);
create policy "reviews_insert" on public.reviews for insert with check (
  auth.uid() = buyer_id
  and exists (select 1 from public.purchases where buyer_id = auth.uid() and template_id = reviews.template_id)
);
create policy "reviews_update" on public.reviews for update using (auth.uid() = buyer_id);

-- FUNCTIONS
create or replace function public.increment_download_count(tid uuid)
returns void as $$
begin
  update public.templates set download_count = download_count + 1 where id = tid;
end;
$$ language plpgsql security definer;

create or replace function public.recalc_template_rating()
returns trigger as $$
begin
  update public.templates set
    avg_rating = (select coalesce(avg(rating), 0) from public.reviews where template_id = NEW.template_id),
    review_count = (select count(*) from public.reviews where template_id = NEW.template_id)
  where id = NEW.template_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_review_change
  after insert or update on public.reviews
  for each row execute procedure public.recalc_template_rating();

-- STORAGE
insert into storage.buckets (id, name, public) values ('templates', 'templates', false)
on conflict do nothing;

create policy "templates_storage_insert" on storage.objects
  for insert with check (bucket_id = 'templates' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "templates_storage_select" on storage.objects
  for select using (bucket_id = 'templates' and auth.role() = 'authenticated');
create policy "templates_storage_delete" on storage.objects
  for delete using (bucket_id = 'templates' and auth.uid()::text = (storage.foldername(name))[1]);
