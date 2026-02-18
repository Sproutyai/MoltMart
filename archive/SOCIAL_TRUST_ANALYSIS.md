# Social Trust & Verification — Analysis

## Current State

- `Profile` type already has `github_username`, `twitter_username`, `is_verified`
- `seller-social-links.tsx` renders icon links to GitHub/Twitter profiles
- `seller-profile-header.tsx` shows a blue checkmark if `is_verified`
- Dashboard profile page has manual text inputs for GitHub/Twitter usernames — **no OAuth verification**

**Problem:** Anyone can type any GitHub/Twitter username. There's no proof they own the account. Trust signals are just links with no stats.

---

## 1. Trust Signals to Display (Ranked by Buyer Impact)

### GitHub (most important — this is a dev marketplace)
1. **Verified ownership** (OAuth-proven) — #1 trust signal
2. **Account age** — "GitHub member since 2016" = experienced dev
3. **Public repos count** — shows active builder
4. **Followers count** — social proof
5. **Avatar** — use as fallback profile pic
6. **Bio** — additional context

### X/Twitter (secondary)
1. **Verified ownership** (OAuth-proven)
2. **Followers count** — reach/reputation
3. **Account age**
4. **Tweet count** — active presence

### Composite
- **"Verified Seller"** badge = at least 1 OAuth-connected account
- **Trust score** (optional, v2) = weighted combination of signals

---

## 2. Where to Show Trust Signals

### Seller Profile (`/sellers/[username]`)
**Add a "Verification" section** between bio and specialties:
- GitHub card: avatar, username (linked), member since, repos, followers, green "Verified" badge
- Twitter card: avatar, username (linked), followers, tweets, green "Verified" badge
- If neither connected: show nothing (don't show empty state publicly)

### Template Cards (`template-card.tsx`)
- Add a small ✓ shield icon next to seller name if `is_verified`
- Tooltip: "Verified seller — GitHub connected"
- **Don't** clutter cards with stats — keep them clean

### Template Detail Page (`/templates/[slug]`)
- In the sticky sidebar, add a "Seller" section below the install block:
  - Avatar + name + verified badge
  - "GitHub verified · 45 repos · 200 followers"
  - "Member since Jan 2018"
  - Link to full seller profile

### Dashboard Profile (`/dashboard/profile`)
- Replace manual GitHub/Twitter text inputs with OAuth connect buttons
- Show connected status with disconnect option
- Display cached stats preview

---

## 3. Data Fetching Approach

### GitHub API (public, no auth required for basic data)
```
GET https://api.github.com/users/{username}
```
Returns: `login`, `avatar_url`, `bio`, `public_repos`, `followers`, `created_at`

- **Rate limit:** 60 req/hour unauthenticated, 5000/hour with token
- Use a GitHub OAuth app token for server-side fetches

### Twitter API v2
```
GET https://api.twitter.com/2/users/by/username/{username}?user.fields=public_metrics,created_at,verified
```
- **Rate limit:** 300 req/15min (app-level)
- Requires Bearer token from Twitter Developer app

### Caching Strategy
- Cache stats in `profiles` table (new columns, see §6)
- **Refresh:** On OAuth connect + daily cron job (or Supabase Edge Function on schedule)
- **Stale display is fine** — stats don't change rapidly
- Add `social_stats_updated_at` timestamp column

---

## 4. OAuth Flow

### Using Supabase `linkIdentity()`

```typescript
// Connect GitHub
const { error } = await supabase.auth.linkIdentity({
  provider: 'github',
  options: { redirectTo: `${origin}/dashboard/profile?connected=github` }
})

// Connect Twitter  
const { error } = await supabase.auth.linkIdentity({
  provider: 'twitter',
  options: { redirectTo: `${origin}/dashboard/profile?connected=twitter` }
})
```

**After OAuth callback:**
1. Supabase stores the identity in `auth.identities`
2. We read the provider username from the identity data
3. Update `profiles.github_username` (now OAuth-verified)
4. Set `profiles.github_verified = true`
5. Fetch and cache GitHub stats
6. If any account is verified, set `is_verified = true`

**Disconnect flow:**
```typescript
await supabase.auth.unlinkIdentity({ provider: 'github' })
// Then clear github_username, github_verified, cached stats
```

### Supabase Setup Required
- Enable GitHub provider in Supabase Auth dashboard
- Enable Twitter provider in Supabase Auth dashboard
- Set OAuth app credentials for each

---

## 5. UI Design Concepts

### Dashboard — Connect Buttons
```
┌─────────────────────────────────────────┐
│ Connected Accounts                       │
│                                          │
│ ┌─ GitHub ────────────────────────────┐ │
│ │ 🟢 Connected as @growthchain        │ │
│ │ 45 repos · 200 followers            │ │
│ │                    [Disconnect]      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─ X / Twitter ──────────────────────┐  │
│ │ Not connected                       │  │
│ │           [Connect X Account]       │  │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Seller Profile — Verification Section
```
┌─────────────────────────────────────────┐
│ Verified Accounts                        │
│                                          │
│ ✅ GitHub  @growthchain                  │
│    45 repos · 200 followers · Since 2018 │
│                                          │
│ ✅ X  @growthchain                       │
│    1.2K followers · Since 2020           │
└─────────────────────────────────────────┘
```

### Template Card — Verified Badge
```
By @growthchain ✓
```
Just a small CheckCircle icon (already used in profile header). Tooltip: "Verified seller"

### Template Detail — Sidebar Seller Section
```
┌─ About the Seller ─────────────┐
│ [avatar] growthchain ✓          │
│ GitHub verified · 45 repos      │
│ Member since Jan 2018           │
│         [View Profile →]        │
└─────────────────────────────────┘
```

---

## 6. Database Changes

### Alter `profiles` table

```sql
ALTER TABLE profiles
  ADD COLUMN github_verified boolean DEFAULT false,
  ADD COLUMN github_avatar_url text,
  ADD COLUMN github_bio text,
  ADD COLUMN github_repos_count integer,
  ADD COLUMN github_followers_count integer,
  ADD COLUMN github_created_at timestamptz,
  ADD COLUMN twitter_verified boolean DEFAULT false,
  ADD COLUMN twitter_avatar_url text,
  ADD COLUMN twitter_followers_count integer,
  ADD COLUMN twitter_tweet_count integer,
  ADD COLUMN twitter_created_at timestamptz,
  ADD COLUMN social_stats_updated_at timestamptz;
```

### Update `is_verified` trigger
```sql
-- Auto-set is_verified when any social account is verified
CREATE OR REPLACE FUNCTION update_is_verified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_verified = COALESCE(NEW.github_verified, false) OR COALESCE(NEW.twitter_verified, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_is_verified
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_is_verified();
```

---

## 7. Components Needed

| Component | Description |
|-----------|-------------|
| `ConnectAccountCard` | Dashboard card with connect/disconnect button for a provider. Shows status + cached stats. |
| `ConnectedAccountsSection` | Dashboard wrapper rendering ConnectAccountCards for GitHub + Twitter |
| `VerifiedAccountsList` | Public-facing list of verified accounts with stats (for seller profile) |
| `VerifiedBadge` | Small inline badge: ✓ icon + tooltip. Reusable on cards, detail pages, etc. |
| `SellerTrustSidebar` | Sidebar section for template detail page showing seller info + trust signals |
| `useSocialConnect` | Hook wrapping `linkIdentity()` / `unlinkIdentity()` + post-connect stat fetching |
| `api/social/refresh` | API route to fetch + cache GitHub/Twitter stats for current user |

---

## 8. Edge Cases

| Case | Handling |
|------|----------|
| **Private GitHub profile** | API still returns basic stats (repos, followers). Bio may be null. Handle gracefully. |
| **Suspended Twitter account** | API returns error. Show "Account unavailable" or hide Twitter section. |
| **Rate limiting (GitHub)** | Use server-side token (5K/hr). Cache aggressively. Never fetch client-side. |
| **Rate limiting (Twitter)** | 300/15min is generous. Batch refresh via cron, not on-demand. |
| **User connects then changes GitHub username** | `linkIdentity` stores provider user ID, not username. Refresh username from API on stat refresh. |
| **User disconnects on GitHub/Twitter side** | Token becomes invalid. On next refresh, mark as unverified and notify user. |
| **Multiple Supabase auth providers** | User might sign up with email, then link GitHub. `linkIdentity` handles this. |
| **Already signed up with GitHub** | Identity already exists — no need to link. Detect and skip straight to verification. |
| **Username conflicts** | Two users claim same GitHub username — only OAuth-verified one gets the badge. Remove manual username input. |

---

## 9. Copy & Text

### Buttons
- **Connect:** "Connect GitHub" / "Connect X Account"
- **Disconnect:** "Disconnect"
- **Reconnect:** "Reconnect" (if token expired)

### Badges & Labels
- On seller profile: **"Verified"** (with ✅ icon, next to account name)
- On template cards: **✓** icon only (tooltip: "Verified seller")
- On template detail sidebar: **"GitHub verified"** / **"X verified"**

### Section Headings
- Dashboard: **"Connected Accounts"**
- Seller profile: **"Verified Accounts"**
- Template detail sidebar: **"About the Seller"**

### Stats Format
- "45 repos · 200 followers · Since 2018"
- "1.2K followers · 8.5K tweets · Since 2020"
- Use compact numbers (1.2K, not 1,200) for > 999

### Empty States
- Dashboard (not connected): "Connect your GitHub to build trust with buyers"
- Dashboard (not connected, Twitter): "Connect your X account to build trust with buyers"

### Success Toast
- "GitHub connected! Your verified badge is now live."
- "X account connected!"

### Error States
- "Failed to connect GitHub. Please try again."
- "This GitHub account is already linked to another user."

---

## 10. Implementation Priority

### Phase 1 — GitHub OAuth (ship first, biggest trust impact)
1. Enable GitHub provider in Supabase dashboard
2. Add DB columns (github_verified, cached stats)
3. Build `ConnectAccountCard` + `useSocialConnect` hook
4. Build `api/social/refresh` endpoint (fetches GitHub API, caches stats)
5. Replace manual GitHub username input with OAuth connect button
6. Add `VerifiedBadge` to template cards + seller link
7. Add `VerifiedAccountsList` to seller profile page

### Phase 2 — Twitter OAuth
1. Enable Twitter provider in Supabase dashboard
2. Add Twitter DB columns
3. Extend ConnectAccountCard for Twitter
4. Add Twitter to VerifiedAccountsList

### Phase 3 — Enhanced Trust Display
1. `SellerTrustSidebar` on template detail page
2. Daily cron to refresh cached stats
3. Handle edge cases (expired tokens, username changes)

### Phase 4 — Trust Score (optional, future)
1. Composite trust score from all signals
2. Trust tier badges (New Seller → Established → Trusted)
3. "Verified seller" filter on marketplace search
