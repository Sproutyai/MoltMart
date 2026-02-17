# Molt Mart — Seller Profile Page UX Analysis

> Date: 2026-02-16 | Analyst: AI UX Review

---

## Analysis 1: What's Lacking / What to Improve (Buyer Perspective)

### Current State Summary

The seller profile page already has a solid foundation:
- ✅ Banner image (with gradient fallback)
- ✅ Avatar + display name + username + member since
- ✅ Bio section
- ✅ Social links (GitHub, Twitter, website)
- ✅ Trust section (verified GitHub/Twitter with follower counts)
- ✅ Specialties as badges
- ✅ Stats bar (templates, downloads, rating, reviews, followers)
- ✅ Follow button
- ✅ Featured templates section
- ✅ Paginated "All Templates" grid with sort options

This is already better than many marketplaces. The gaps below are about going from **good → great**.

---

### Issue 1: No Reviews/Testimonials Section

**What's missing:** Buyers can't see actual reviews on the seller profile page. Stats show `total_reviews` and `avg_rating` as numbers, but there's no way to read what other buyers said.

**Why it matters:** Social proof is the #1 trust driver. A "4.8 stars" number means nothing without readable reviews. Etsy, Gumroad, and ThemeForest all show recent reviews prominently.

**Proposed solution:** Add a "Recent Reviews" section below the template grid (or as a tab). Pull the latest 5 reviews across all the seller's templates with template name, rating, comment, and buyer name.

**UI suggestion:**
```
┌─────────────────────────────────────────┐
│ ⭐⭐⭐⭐⭐  "This template saved me hours"  │
│ — @buyer123 on "AI Meeting Notes"       │
│ 2 weeks ago                             │
├─────────────────────────────────────────┤
│ ⭐⭐⭐⭐☆  "Good but docs could improve"   │
│ — @buyer456 on "Code Review Agent"      │
│ 1 month ago                             │
└─────────────────────────────────────────┘
```

**Complexity:** Medium (need to query reviews table joined with templates, build ReviewCard component)

---

### Issue 2: No Tabbed Navigation

**What's missing:** Everything is stacked vertically — header, featured, all templates. As sellers grow, this becomes a long scroll with no way to jump to what you want.

**Why it matters:** Buyers visiting for the first time want to browse templates. Return visitors might want reviews or the "About" section. Tabs let both succeed.

**Proposed solution:** Add tabs: **Templates** (default) | **Reviews** | **About**

**UI suggestion:** Horizontal tab bar below the stats bar. "Templates" shows the grid, "Reviews" shows review cards, "About" shows extended bio + social details.

**Complexity:** Medium (tab state via URL searchParams, split content into tab panels)

---

### Issue 3: No "Contact Seller" or Communication Path

**What's missing:** No way for a buyer to ask a pre-purchase question. The only option is to follow.

**Why it matters:** High-intent buyers with questions about compatibility or customization will bounce if they can't ask. This is standard on Etsy, ThemeForest, etc.

**Proposed solution:** Add a "Contact Seller" button that opens a simple message form (or links to a discussion/support channel). Initially could just be a mailto or a simple internal messaging system.

**UI suggestion:** Secondary button next to Follow: `[Follow] [💬 Contact]`

**Complexity:** Simple (mailto/link) → Complex (internal messaging system)

---

### Issue 4: Template Cards Don't Show Enough at a Glance

**What's missing:** The template grid uses `TemplateCard` but from the seller profile context, buyers already know who the seller is — the "by @username" on each card is redundant space. Cards should emphasize price, rating, and download count more prominently.

**Why it matters:** When browsing a seller's catalog, the decision is "which template?" not "which seller?" — the card hierarchy should shift.

**Proposed solution:** Create a `SellerTemplateCard` variant that drops the seller attribution and promotes price + rating + downloads.

**UI suggestion:** Compact card: thumbnail → title → short description → `$4.99 · ⭐4.8 · 1.2k downloads`

**Complexity:** Simple (new card variant or prop flag on existing card)

---

### Issue 5: No "Top Seller" or Activity Badges

**What's missing:** `is_verified` comes from GitHub/Twitter connection, but there are no achievement badges for marketplace activity (top seller, 100+ downloads, fast responder, etc.).

**Why it matters:** Buyers on Etsy look for "Star Seller" badges. These gamification signals build trust AND motivate sellers.

**Proposed solution:** Add computed badges based on thresholds:
- 🏆 **Top Seller** — top 10% by revenue
- 📦 **100+ Downloads** — cumulative downloads milestone
- ⭐ **Highly Rated** — avg rating ≥ 4.5 with ≥ 10 reviews
- 🕐 **Early Adopter** — joined in first 3 months
- 🔥 **Trending** — high recent sales velocity

**UI suggestion:** Badge row between the name and bio, similar to specialties but with icons and distinct colors.

**Complexity:** Medium (badge logic can be computed server-side, need badge component)

---

### Issue 6: No Response Time / Activity Indicator

**What's missing:** No signal of whether this seller is active. A profile could be abandoned.

**Why it matters:** Buyers want to know they'll get support if something breaks. "Last active 2 days ago" or "Updated a template 1 week ago" signals life.

**Proposed solution:** Show "Last updated a template X days ago" or a green "Active" dot if they've published/updated within 30 days.

**UI suggestion:** Small text under the member-since line: `Last active 3 days ago`

**Complexity:** Simple (query `MAX(updated_at)` from templates)

---

### Issue 7: Empty State for New Sellers is Bare

**What's missing:** When a seller has 0 templates, the page shows "No templates published yet." — not encouraging for buyers who land here.

**Why it matters:** Early sellers sharing their profile link get a dead-looking page.

**Proposed solution:** Show a friendlier empty state: the seller's bio/social presence more prominently, and a "This seller is setting up shop — follow to get notified when they publish!" CTA.

**Complexity:** Simple

---

### Issue 8: No Share / Embed Profile

**What's missing:** No easy way to share a seller's profile or embed a "Buy from me on Molt Mart" badge.

**Why it matters:** Sellers want to promote their Molt Mart presence on their own sites/socials. A share button + embeddable badge drives traffic.

**Proposed solution:** Share button (copy link, Twitter share) + optional embeddable HTML badge sellers can put on their site.

**Complexity:** Simple (share button) / Medium (embeddable badge)

---

## Analysis 2: What's Customizable by the Seller

### Currently Editable (via `/dashboard/profile`)

| Field | Input Type | Notes |
|-------|-----------|-------|
| Display Name | Text input | ✅ Works |
| Username | Text input | ✅ Works |
| Bio | Textarea | ✅ Works |
| Avatar URL | Text input | ⚠️ Manual URL — no upload |
| Banner URL | Text input | ⚠️ Manual URL — no upload |
| Website | Text input | ✅ Works |
| Specialties | Comma-separated text | ✅ Works, could be better UX |

### Currently in DB but NOT Editable in Dashboard

| Column | Status | Notes |
|--------|--------|-------|
| `github_username` | Set via OAuth connect | Managed by ConnectedAccounts component |
| `twitter_username` | Set via OAuth connect | Managed by ConnectedAccounts component |
| `github_verified` / `twitter_verified` | Auto-computed | ✅ Correct — shouldn't be editable |
| `is_verified` | Auto-computed trigger | ✅ Correct |
| `follower_count` | Auto-computed trigger | ✅ Correct |
| Social stats (followers, repos, etc.) | Auto-synced | ✅ Correct |

### What SHOULD Be Added as Editable

#### 1. Image Upload for Avatar & Banner
**Current:** Sellers paste a URL. This is terrible UX — most people don't have image hosting.
**Should be:** File upload with drag-and-drop → uploads to Supabase Storage → sets URL automatically.
**Priority:** HIGH — this is the most impactful UX improvement for the edit page.
**Complexity:** Medium (Supabase storage bucket + upload component + image cropping)

#### 2. LinkedIn URL
**Current:** Not in schema or UI.
**Should be:** Add `linkedin_url` to profiles table. Many professional template creators have LinkedIn as their primary identity signal.
**Complexity:** Simple (one column + one input)

#### 3. Location / Timezone
**Current:** Not in schema.
**Should be:** Optional `location` text field (e.g., "San Francisco, CA" or "GMT+1"). Helps buyers gauge response time expectations and adds a human touch.
**Complexity:** Simple

#### 4. Specialties UX Improvement
**Current:** Comma-separated text input.
**Should be:** Tag picker with autocomplete from existing popular specialties + ability to add custom ones. Shows preview of badges in real-time.
**Complexity:** Medium

#### 5. Featured Templates Management
**Current:** `featured_templates` table exists but there's no UI in the dashboard to manage it.
**Should be:** Drag-and-drop reorderable list in dashboard. Seller picks up to 3-5 templates to feature.
**Priority:** HIGH — the feature exists in the DB and renders on the profile, but sellers can't use it.
**Complexity:** Medium

#### 6. Profile Theme / Accent Color
**Current:** Not available.
**Should be:** Let sellers pick an accent color that tints their banner gradient. Simple but makes profiles feel personalized.
**Complexity:** Simple (one color column + CSS variable)

#### 7. "About" Extended Description
**Current:** Bio is a short textarea (3 rows).
**Should be:** Keep bio as a short tagline, add a separate `about` field with markdown support for a longer "About Me" section. Template authors on ThemeForest have detailed about sections discussing their workflow, experience, etc.
**Complexity:** Medium (new column + markdown renderer)

---

### Summary: Priority Improvements

| # | Improvement | Impact | Complexity | Priority |
|---|-----------|--------|------------|----------|
| 1 | Image upload for avatar/banner | 🔴 High | Medium | P0 |
| 2 | Featured templates dashboard UI | 🔴 High | Medium | P0 |
| 3 | Recent reviews section on profile | 🔴 High | Medium | P1 |
| 4 | Seller activity indicator | 🟡 Medium | Simple | P1 |
| 5 | Achievement badges | 🟡 Medium | Medium | P1 |
| 6 | Contact seller button | 🟡 Medium | Simple→Complex | P2 |
| 7 | Tab navigation | 🟡 Medium | Medium | P2 |
| 8 | LinkedIn URL field | 🟢 Low | Simple | P2 |
| 9 | Location field | 🟢 Low | Simple | P2 |
| 10 | Specialties tag picker | 🟢 Low | Medium | P3 |
| 11 | Share/embed profile | 🟢 Low | Simple | P3 |
| 12 | Compact template card variant | 🟢 Low | Simple | P3 |
| 13 | Extended about (markdown) | 🟢 Low | Medium | P3 |
| 14 | Profile accent color | 🟢 Low | Simple | P3 |

---

### What's Already Done Well

Credit where due — the current implementation is **significantly above a v1 MVP**:

- **Banner + avatar overlap** layout is polished and matches modern marketplace aesthetics
- **Trust section** with GitHub/Twitter verification + follower counts is unique and powerful for a dev tool marketplace
- **Stats bar** provides good at-a-glance credibility
- **Follow system** with real-time count is production-ready
- **Specialties badges** add personality
- **Social links** are present and well-placed
- **Sort + pagination** on templates works

The biggest gaps are **image uploads** (sellers shouldn't paste URLs), **featured template management** (DB ready, no UI), and **reviews visibility** on the profile page.
