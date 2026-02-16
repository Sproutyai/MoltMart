# Featured Placements Research — Molt Mart

## Current Site Structure Summary

**Pages:** Homepage (hero + popular + categories + new listings + how-it-works + seller CTA), Browse `/templates` (search, category filter, sort, pagination), New Listings `/templates/new` (time-grouped), Template Detail `/templates/[slug]` (screenshots, description, reviews, "more by seller"), Seller Dashboard, Seller Profile, Affiliate pages.

**Key observation:** There are currently ZERO featured/promoted placements. Every template competes purely on downloads, ratings, and recency. This is the baseline.

---

## Placement Evaluations

### A. Homepage Hero Carousel

- **Where:** Above "Popular Enhancements", replacing or supplementing the current hero section
- **Why sellers pay:** Highest-traffic, highest-visibility spot on the entire site. First thing users see.
- **Good:** Premium revenue per slot, creates aspirational "best of" showcase, helps users discover quality templates
- **Bad:** Disrupts clean hero. Carousel UX is notoriously poor (low engagement on slides 2+). If templates are low quality, damages site credibility.
- **Backfire risk:** MEDIUM. Users may scroll past carousels. If featured templates are bad, erodes trust in entire marketplace.
- **Price:** $75–100/week per slot (3 slots). Premium pricing justified by exclusivity.
- **Degradation:** 0 featured → hide section entirely. 1000 → never happens, hard cap at 3-5 slots.
- **Mobile:** Carousels work on mobile but engagement drops. Swipeable is fine.
- **Marketplace precedent:** App Store "Today" tab, Steam featured carousel. Standard.
- **VERDICT: BUILD LATER.** High revenue potential but complex UI, needs quality curation. Not MVP.

### B. Homepage "Featured Enhancements" Section

- **Where:** Between hero and current "Popular Enhancements" section. 4-6 cards in a dedicated row.
- **Why sellers pay:** Homepage visibility without needing to be organically popular.
- **Good:** Non-intrusive, fits naturally in page flow, easy to implement (same TemplateCard component + a "Featured" label). Clear revenue.
- **Bad:** If poorly labeled, users may not realize it's paid. If quality is low, section looks bad.
- **Backfire risk:** LOW. Standard pattern users expect. Just needs a subtle "Featured" or "Sponsored" label.
- **Price:** $25–50/week per slot.
- **Degradation:** 0 featured → section hidden. Too many → cap at 6, rotate or queue.
- **Mobile:** Works perfectly (grid collapses to 1-2 columns).
- **Marketplace precedent:** Etsy "Editor's Picks", Amazon "Sponsored" rows. Very standard.
- **VERDICT: ✅ MVP — BUILD FIRST.** Easiest to implement, natural UX, proven pattern.

### C. Search Results — Top Spots

- **Where:** Top 1-2 results in `/templates` browse page, labeled "Sponsored" or "Featured"
- **Why sellers pay:** Users searching have HIGH purchase intent. This is the Google Ads model.
- **Good:** Highest-converting placement (user is actively looking). Can be keyword/category targeted.
- **Bad:** If irrelevant to search query, frustrating. Must match query context.
- **Backfire risk:** MEDIUM. Users learn to skip "sponsored" results. If not relevant, actively annoying.
- **Price:** $10–25/week (category-specific), or per-impression/click model later.
- **Degradation:** 0 → no sponsored row. Many → cap at 2 per page, clearly separated from organic.
- **Mobile:** Works fine, same card layout.
- **Marketplace precedent:** Amazon Sponsored Products, Etsy Ads, App Store Search Ads. Industry standard.
- **VERDICT: ✅ MVP — BUILD FIRST.** High conversion, proven model, straightforward implementation.

### D. Category Pages — Top Spots

- **Where:** Same as C but scoped to category filter. When user filters by "Coding", featured Coding templates appear first.
- **Why sellers pay:** Targeted visibility in their niche. More relevant = higher conversion.
- **Good:** More relevant than generic featuring. Sellers in niche categories get affordable visibility.
- **Bad:** Small categories may have no featured templates (wasted UI). Overlap with search featuring.
- **Price:** $10/week per category (cheaper than global).
- **VERDICT: Merge with C.** Category featuring is just search featuring with a category filter. Same implementation. Not a separate placement.

### E. Template Detail Page — "Similar Featured"

- **Where:** In the sidebar or below "More by [seller]" section on `/templates/[slug]`
- **Why sellers pay:** Steal competitors' traffic. User is looking at a template and sees yours.
- **Good:** High intent (user is evaluating a purchase). Competitive placement drives sales.
- **Bad:** FEELS PREDATORY. Showing competing paid templates on someone else's detail page is hostile to the original seller. "You came to buy X, here's promoted Y instead."
- **Backfire risk:** HIGH. Sellers will hate having competitors promoted on their pages. May discourage sellers from listing. This is the most controversial placement.
- **Price:** $15–30/week.
- **Degradation:** 0 → section hidden. Many → cap at 3.
- **Marketplace precedent:** Amazon does this aggressively ("Sponsored products related to this item"). Etsy does NOT. It's divisive.
- **VERDICT: ⚠️ DEFER. Too controversial for early marketplace.** Revisit when marketplace is large enough that sellers accept it as normal. Could offer opt-out for premium sellers.

### F. New Listings Page — Featured New

- **Where:** Top of `/templates/new` page, above "Today" group
- **Why sellers pay:** New sellers want launch visibility. Hard to get discovered among many new listings.
- **Good:** Helps new sellers get traction. Launch boost is a natural value-add.
- **Bad:** Low traffic page compared to homepage/browse. May not be worth much.
- **Price:** $5–10 flat fee (one-time, lasts 7 days on new page).
- **Backfire risk:** LOW.
- **VERDICT: DEFER.** Low traffic, low revenue. Nice-to-have later.

### G. Navbar "Featured" Link / Dedicated Featured Page

- **Where:** New nav item linking to `/templates/featured`
- **Why sellers pay:** Dedicated showcase page, "premium" feeling.
- **Good:** Gives featured templates a permanent home. Buyers who want curated picks go here.
- **Bad:** Another nav item clutters navigation. Users may not click it. Low organic traffic unless promoted.
- **Backfire risk:** LOW but also low reward. If nobody visits the page, it's worthless.
- **Price:** Part of a bundle, not standalone.
- **VERDICT: DEFER.** Only makes sense when there are enough featured templates to fill a page. Not MVP.

### H. Browse Page Sidebar/Banner

- **Where:** Banner above or beside the template grid on `/templates`
- **Why sellers pay:** Persistent visibility while browsing.
- **Good:** Display-ad style, familiar.
- **Bad:** FEELS LIKE ADS. Banner blindness is real. Breaks the clean marketplace feel. Users hate banners.
- **Backfire risk:** HIGH. Makes the site feel cheap/ad-supported.
- **VERDICT: ❌ DO NOT BUILD.** Against marketplace UX principles. Banners belong on content sites, not marketplaces.

### I. Email/Newsletter Featuring

- **Where:** Weekly "New on Molt Mart" email to subscribers
- **Why sellers pay:** Direct to inbox, high engagement.
- **Good:** Premium placement, not visible on-site so doesn't clutter UX. Email has good conversion.
- **Bad:** Requires email list first. Requires newsletter infrastructure.
- **Price:** $25–50 per inclusion.
- **VERDICT: DEFER.** Great idea but requires email infrastructure that doesn't exist yet. Build after email system.

### J. "Promoted" Badge on Cards

- **Where:** On the TemplateCard component itself — a small golden badge/border
- **Why sellers pay:** Their template stands out everywhere it appears (search, homepage, category).
- **Good:** Subtle, pervasive. Works across all pages without new sections. Low implementation cost.
- **Bad:** If every card is promoted, badge loses meaning. Must be subtle — too flashy feels spammy.
- **Backfire risk:** LOW if subtle. Users on Etsy and Amazon are trained to see "Sponsored" labels.
- **Price:** Part of any featuring package, not standalone.
- **VERDICT: ✅ MVP — BUILD FIRST.** This is just a visual indicator, not a placement. It should accompany B and C.

---

## Pricing Model Recommendation

### Recommended: **Model 4 (Tiered) + Time-Based**

| Tier | Placements | Price | Duration |
|------|-----------|-------|----------|
| **Basic** | "Featured" badge + boosted in category results | $10 | 7 days |
| **Standard** | Basic + featured on browse page (top 2 spots) | $25 | 7 days |
| **Premium** | Standard + homepage "Featured" section | $50 | 7 days |

**Why this works:**
- Simple to understand
- Three price points capture different budgets
- Time-based creates recurring revenue
- Weekly cadence matches marketplace browsing patterns

**Why NOT permanent/one-time:**
- Featured section becomes polluted over time
- No recurring revenue
- Early buyers lose value as more are added
- No scarcity/urgency

**Why NOT auction:**
- Too complex for MVP
- Unfair to small sellers
- Unpredictable pricing scares sellers away
- Revisit at scale

### Revenue Math

**Conservative assumptions (early stage):**
- 50 active sellers
- 10% feature per week = 5 purchases/week
- Average tier: $25 (Standard)
- Weekly revenue: $125
- Monthly: ~$500
- Annual: ~$6,000

**Growth scenario (6 months, 200 sellers):**
- 15% feature = 30 purchases/week
- Average tier: $30
- Weekly: $900
- Monthly: ~$3,600
- Annual: ~$43,000

**Mature scenario (500+ sellers):**
- Monthly: $10,000–20,000 from featuring alone

---

## User Experience Guidelines

1. **Always label promoted content.** "Featured" or "⭐ Featured" — never try to hide it.
2. **Cap featured slots.** Max 2 in search results, max 6 on homepage section. Scarcity protects UX.
3. **Quality gate.** Only templates with ≥3.5 avg rating and ≥5 downloads can be featured. Prevents bad templates from paying for visibility.
4. **Visual distinction should be subtle.** Slight golden border or small badge. NOT a giant banner or animation.
5. **Featured templates must be RELEVANT.** In search, only show featured results matching the query/category.

---

## What Other Marketplaces Do

| Marketplace | Featured Model |
|-------------|---------------|
| **App Store** | Curated editorial "Today" picks (not paid). Search ads are auction-based. |
| **Etsy** | Etsy Ads — pay-per-click, budget-based. Offsite ads (mandatory for >$10K sellers). |
| **Amazon** | Sponsored Products — CPC auction. Sponsored Brands. Very aggressive, multiple placements per page. |
| **Fiverr** | Seller Plus subscription includes promoted gigs. Also "Promoted Gigs" — CPC model. |
| **ThemeForest** | Featured files (editor-curated, not paid). No paid promotion system. |
| **Gumroad** | "Discover" page — algorithmic, no paid featuring. |

**Takeaway:** Most successful marketplaces use CPC/auction for search, editorial curation for homepage. Molt Mart is too small for CPC — flat fee tiers are better for now.

---

## MVP Implementation Plan (Build First)

### Phase 1: Core Featured System
1. **Database:** Add `featured_until` timestamp and `featured_tier` enum to templates table
2. **Homepage "Featured" section** (Placement B) — query `featured_until > now() AND featured_tier IN ('premium')`, show up to 6
3. **Search/Browse boost** (Placement C) — query featured templates matching category/search, show top 2 with "Featured" badge before organic results
4. **"Featured" badge on TemplateCard** (Placement J) — golden border/badge when `featured_until > now()`
5. **Seller Dashboard: "Feature This Template" button** — Stripe checkout for 7-day tier
6. **Admin: basic management** — view active featured, manual override

### Phase 2: Deferred
- Homepage hero carousel (A) — after 50+ featured purchases
- Template detail page competitors (E) — after seller feedback
- New listings featuring (F) — low priority
- Dedicated featured page (G) — when enough content
- Email featuring (I) — after email system built
- CPC/auction model — when marketplace has 500+ active sellers

---

## Open Questions for Agent 2

1. **Quality gate implementation:** Should featuring require minimum rating/downloads, or should any published template be featureable?
2. **Stripe integration:** Is Stripe already set up for template purchases? Can we reuse checkout flow for featuring?
3. **Featured slot conflicts:** What happens when more sellers buy Premium than there are homepage slots? FIFO queue? Random rotation? Show all in a scrollable row?
4. **Seller dashboard UX:** Where exactly does the "Feature This Template" CTA go? On the template list? Separate page?
5. **Auto-renewal:** Should featuring auto-renew weekly, or require manual re-purchase?
6. **Analytics:** Do we show sellers how their featured placement performed (impressions, clicks)?
7. **Free templates:** Can free templates be featured? Or only paid templates? (Free templates featuring = pure visibility play for the seller)
8. **Refund policy:** What if a seller features a template and it gets 0 extra downloads?
