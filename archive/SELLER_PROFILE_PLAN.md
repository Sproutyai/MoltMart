# Seller Profile — Implementation Plan

## 1. Database Changes

### 1a. New columns on `profiles` table

```sql
ALTER TABLE public.profiles
  ADD COLUMN banner_url text,
  ADD COLUMN website text,
  ADD COLUMN github_username text,
  ADD COLUMN twitter_username text,
  ADD COLUMN specialties text[] DEFAULT '{}',
  ADD COLUMN is_verified boolean DEFAULT false,
  ADD COLUMN follower_count integer DEFAULT 0;

CREATE INDEX profiles_username_idx ON public.profiles(username);
CREATE INDEX profiles_is_seller_idx ON public.profiles(is_seller);
```

### 1b. New `seller_follows` table (future-ready)

```sql
CREATE TABLE public.seller_follows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, seller_id)
);
ALTER TABLE public.seller_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_select" ON public.seller_follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON public.seller_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON public.seller_follows FOR DELETE USING (auth.uid() = follower_id);

-- Trigger to update follower_count
CREATE OR REPLACE FUNCTION public.update_follower_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET follower_count = follower_count + 1 WHERE id = NEW.seller_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET follower_count = follower_count - 1 WHERE id = OLD.seller_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON public.seller_follows
  FOR EACH ROW EXECUTE PROCEDURE public.update_follower_count();
```

### 1c. New `featured_templates` table

```sql
CREATE TABLE public.featured_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  position integer DEFAULT 0,
  UNIQUE(seller_id, template_id)
);
ALTER TABLE public.featured_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "featured_select" ON public.featured_templates FOR SELECT USING (true);
CREATE POLICY "featured_insert" ON public.featured_templates FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "featured_update" ON public.featured_templates FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "featured_delete" ON public.featured_templates FOR DELETE USING (auth.uid() = seller_id);
```

### 1d. Seller stats DB function

```sql
CREATE OR REPLACE FUNCTION public.get_seller_stats(seller_uuid uuid)
RETURNS TABLE(
  total_templates integer,
  total_downloads bigint,
  avg_rating numeric,
  total_reviews bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    count(*)::integer AS total_templates,
    coalesce(sum(t.download_count), 0)::bigint AS total_downloads,
    coalesce(avg(NULLIF(t.avg_rating, 0)), 0)::numeric AS avg_rating,
    coalesce(sum(t.review_count), 0)::bigint AS total_reviews
  FROM public.templates t
  WHERE t.seller_id = seller_uuid AND t.status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Migration file
Create `supabase/migrations/002_seller_profiles.sql` with all of the above.

---

## 2. Type Updates

### `src/lib/types.ts` — Update `Profile` interface

```ts
export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  website: string | null
  github_username: string | null
  twitter_username: string | null
  specialties: string[]
  is_seller: boolean
  is_verified: boolean
  follower_count: number
  created_at: string
}

export interface SellerStats {
  total_templates: number
  total_downloads: number
  avg_rating: number
  total_reviews: number
}
```

---

## 3. New Pages

### 3a. `/sellers/[username]/page.tsx` — Public Seller Profile

**Route:** `src/app/sellers/[username]/page.tsx`

Server component. Fetches profile by username, their published templates, featured templates, and stats.

**Layout:**
```
┌──────────────────────────────────────────────┐
│  Banner image (full width, 200px tall)       │
├──────────────────────────────────────────────┤
│  Avatar (overlapping banner by 40px)         │
│  Display Name  [Verified ✓]                  │
│  @username · Member since Jan 2025           │
│  Bio text                                    │
│  [GitHub] [Twitter/X] [Website]              │
│  Specialties: [Coding] [Automation] [...]    │
├──────────────────────────────────────────────┤
│  Stats bar:                                  │
│  Templates: 12 | Downloads: 1.2k | ⭐ 4.7   │
│  Followers: 34                               │
├──────────────────────────────────────────────┤
│  [Follow] button (if logged in & not self)   │
├──────────────────────────────────────────────┤
│  📌 Featured Templates (horizontal scroll)   │
├──────────────────────────────────────────────┤
│  All Templates (grid, sorted by newest)      │
│  [Sort: newest / popular / top-rated]        │
│  Pagination                                  │
└──────────────────────────────────────────────┘
```

**Data fetching:**
```ts
// 1. Get profile
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("username", username)
  .eq("is_seller", true)
  .single()

// 2. Get stats via RPC
const { data: stats } = await supabase.rpc("get_seller_stats", { seller_uuid: profile.id })

// 3. Get featured templates
const { data: featured } = await supabase
  .from("featured_templates")
  .select("template:templates(*)")
  .eq("seller_id", profile.id)
  .order("position")

// 4. Get all published templates (paginated)
const { data: templates, count } = await supabase
  .from("templates")
  .select("*", { count: "exact" })
  .eq("seller_id", profile.id)
  .eq("status", "published")
  .order("created_at", { ascending: false })
  .range(from, to)
```

### 3b. `/sellers/[username]/loading.tsx` — Skeleton loader

### 3c. `/sellers/page.tsx` — Browse Sellers page (optional, nice-to-have)

Lists all sellers with search. Can defer to v2.

---

## 4. New Components

### 4a. `src/components/seller-profile-header.tsx`

**Props:**
```ts
interface SellerProfileHeaderProps {
  profile: Profile
  stats: SellerStats
  isOwnProfile: boolean
  isFollowing: boolean
}
```

**Renders:** Banner, avatar, name, verified badge, bio, social links, specialties, stats bar, follow button.

### 4b. `src/components/seller-social-links.tsx`

**Props:**
```ts
interface SellerSocialLinksProps {
  website: string | null
  github_username: string | null
  twitter_username: string | null
}
```

**Renders:** Icon links row (Globe, GitHub, Twitter icons from lucide-react). Only renders non-null links.

### 4c. `src/components/seller-stats-bar.tsx`

**Props:**
```ts
interface SellerStatsBarProps {
  stats: SellerStats
  followerCount: number
  memberSince: string
}
```

**Renders:** Horizontal stat items with labels.

### 4d. `src/components/featured-templates.tsx`

**Props:**
```ts
interface FeaturedTemplatesProps {
  templates: Template[]
}
```

**Renders:** Horizontal scrollable row of `TemplateCard` components with a "📌 Featured" heading. Hidden if empty.

### 4e. `src/components/follow-button.tsx` (client component)

**Props:**
```ts
interface FollowButtonProps {
  sellerId: string
  initialFollowing: boolean
}
```

**Behavior:** Toggles follow/unfollow via `/api/sellers/[id]/follow` endpoint. Optimistic UI update.

### 4f. `src/components/seller-link.tsx`

Small reusable component for displaying a seller name as a clickable link. Used in template cards and detail pages.

**Props:**
```ts
interface SellerLinkProps {
  username: string
  displayName: string | null
  avatarUrl?: string | null
  showAvatar?: boolean
}
```

**Renders:** `<Link href={/sellers/${username}}>` with optional avatar + name. `onClick` stops propagation (for use inside template card links).

---

## 5. API Routes

### 5a. `PATCH /api/profile` — Modify existing

**Add new fields** to the update: `banner_url`, `website`, `github_username`, `twitter_username`, `specialties`.

File: `src/app/api/profile/route.ts` — add the new columns to the allowed update fields.

### 5b. `POST /api/sellers/[id]/follow/route.ts` — Toggle follow

```ts
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sellerId = params.id
  // Check if already following
  const { data: existing } = await supabase
    .from("seller_follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("seller_id", sellerId)
    .maybeSingle()

  if (existing) {
    await supabase.from("seller_follows").delete().eq("id", existing.id)
    return NextResponse.json({ following: false })
  } else {
    await supabase.from("seller_follows").insert({ follower_id: user.id, seller_id: sellerId })
    return NextResponse.json({ following: true })
  }
}
```

### 5c. `PUT /api/sellers/featured/route.ts` — Update featured templates

```ts
// Body: { template_ids: string[] } (max 6)
// Deletes existing featured, inserts new ones with position
```

---

## 6. Modified Existing Files

### 6a. `src/components/template-card.tsx`

**Change:** Replace plain text seller name with `<SellerLink>` component.

```tsx
// Before:
<p className="mt-2 text-xs text-muted-foreground">
  by {template.seller.display_name || template.seller.username}
</p>

// After:
<div className="mt-2">
  <SellerLink
    username={template.seller.username}
    displayName={template.seller.display_name}
  />
</div>
```

### 6b. `src/app/templates/[slug]/page.tsx`

**Change:** Replace plain seller name text with `<SellerLink>` with avatar.

```tsx
// Before:
<p className="mt-1 text-muted-foreground">
  by {t.seller.display_name || t.seller.username}
</p>

// After:
<div className="mt-1">
  <SellerLink
    username={t.seller.username}
    displayName={t.seller.display_name}
    avatarUrl={t.seller.avatar_url}
    showAvatar
  />
</div>
```

Also add a "More by this seller" section at the bottom (fetch 3 more templates by same seller).

### 6c. `src/app/dashboard/profile/page.tsx`

**Change:** Add fields for `banner_url`, `website`, `github_username`, `twitter_username`, `specialties` (multi-select from `CATEGORIES`). Add a "View public profile" link.

### 6d. `src/lib/types.ts`

**Change:** Update `Profile` interface and add `SellerStats` (see Section 2).

### 6e. `src/app/templates/page.tsx` — Search integration

**Change:** When search query `q` is present, also search sellers and display a "Sellers" section above template results if matches found.

```ts
// After existing template query, add:
if (q) {
  const escaped = q.replace(/%/g, "\\%")
  const { data: sellerResults } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, bio")
    .eq("is_seller", true)
    .or(`username.ilike.%${escaped}%,display_name.ilike.%${escaped}%`)
    .limit(5)
  // Pass sellerResults to page for rendering
}
```

Render seller results in a small horizontal card row above template grid:
```tsx
{sellerResults && sellerResults.length > 0 && (
  <div className="space-y-2">
    <h2 className="text-sm font-medium text-muted-foreground">Sellers</h2>
    <div className="flex gap-3 overflow-x-auto pb-2">
      {sellerResults.map(s => <SellerSearchCard key={s.username} seller={s} />)}
    </div>
  </div>
)}
```

### 6f. `src/components/search-input.tsx`

No changes needed — existing search input passes `q` param which the templates page already reads.

---

## 7. New Component: `SellerSearchCard`

`src/components/seller-search-card.tsx`

Small card shown in search results: avatar, display name, @username, truncated bio. Links to `/sellers/[username]`.

---

## 8. File-by-File Implementation Order

| Step | File | Action |
|------|------|--------|
| 1 | `supabase/migrations/002_seller_profiles.sql` | Create migration with all DB changes |
| 2 | `src/lib/types.ts` | Update `Profile`, add `SellerStats` |
| 3 | `src/components/seller-link.tsx` | Create — reusable seller name link |
| 4 | `src/components/seller-social-links.tsx` | Create — social icon links |
| 5 | `src/components/seller-stats-bar.tsx` | Create — stats display |
| 6 | `src/components/featured-templates.tsx` | Create — featured templates row |
| 7 | `src/components/follow-button.tsx` | Create — follow toggle (client) |
| 8 | `src/components/seller-profile-header.tsx` | Create — full profile header |
| 9 | `src/components/seller-search-card.tsx` | Create — search result card |
| 10 | `src/app/sellers/[username]/page.tsx` | Create — public seller profile page |
| 11 | `src/app/sellers/[username]/loading.tsx` | Create — skeleton loader |
| 12 | `src/app/api/sellers/[id]/follow/route.ts` | Create — follow toggle API |
| 13 | `src/app/api/sellers/featured/route.ts` | Create — featured templates API |
| 14 | `src/app/api/profile/route.ts` | Modify — add new profile fields |
| 15 | `src/app/dashboard/profile/page.tsx` | Modify — add new form fields |
| 16 | `src/components/template-card.tsx` | Modify — use `SellerLink` |
| 17 | `src/app/templates/[slug]/page.tsx` | Modify — use `SellerLink`, add "More by seller" |
| 18 | `src/app/templates/page.tsx` | Modify — add seller search results |

---

## 9. Future Considerations (designed for, not implemented now)

- **Verification badges:** `is_verified` column exists, display logic in `SellerProfileHeader`. Admin API to set verification TBD.
- **Contact seller:** Could add a modal/form that sends an in-app message. Table `seller_messages` TBD.
- **Follow notifications:** `seller_follows` table is ready. Notification system TBD.
- **Seller analytics dashboard:** Stats function exists; could build a dashboard view showing trends over time.
