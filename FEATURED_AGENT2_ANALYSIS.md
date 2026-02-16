# Featured Templates — Agent 2 Refined Analysis

> For Agent 3. This supersedes Agent 1's recommendations where they conflict.

---

## 1. Placement-by-Placement Review of Agent 1's Ideas

### A. Homepage Hero Carousel — AGREE: DEFER
Agent 1 is right. Too complex for MVP, carousel UX is bad, and it needs curation. Skip.

### B. Homepage "Featured Enhancements" Section — AGREE: MVP ✅
This is Thomas's vision exactly. Small section above "Popular Enhancements." But Agent 1 said cap at 6 — Thomas wants NO CAP. Featured list grows forever, show ~20 at a time with infinite scroll. This changes the implementation significantly. It's not a curated row of 6 — it's an infinite scrollable section ordered by recency of promotion (newest promotion = top).

**My modification:** Show the first 4-6 as a visible row. "See all featured →" link goes to `/templates/featured` (dedicated page with infinite scroll). This keeps the homepage clean while supporting Thomas's unlimited model.

### C. Search Results — Top Spots — AGREE: MVP ✅
Correct. Show 1-2 featured templates above organic results, labeled "Featured." Scoped to the active search/category. This is the highest-converting placement.

**Key question I asked myself:** With Thomas's "forever" model, how do we pick WHICH featured templates show in search? Answer: Most recently promoted first, filtered by relevance to query/category. If your template is featured but irrelevant to the search, it doesn't show.

### D. Category Pages — AGREE: Merge with C
Same implementation. Featured templates matching the category appear at top.

### E. Template Detail Page "Similar Featured" — AGREE: DEFER
Too hostile for early marketplace. Correct call.

### F. New Listings Page — AGREE: DEFER
Low traffic, low value.

### G. Navbar "Featured" Link / Dedicated Page — DISAGREE: MVP ✅
Agent 1 said defer. Thomas explicitly wants this. With the "forever" model, you NEED a dedicated page because the list grows indefinitely. This is where infinite scroll lives. Navbar link is cheap to add.

**Implementation:** `/templates/featured` — same TemplateCard grid as browse page, ordered by promotion date (newest first), infinite scroll loading 20 at a time. Navbar gets a "Featured" or "⭐ Featured" link.

### H. Browse Page Sidebar/Banner — AGREE: DO NOT BUILD
Feels cheap. Skip forever.

### I. Email/Newsletter — AGREE: DEFER
No email infra yet.

### J. "Featured" Badge on Cards — AGREE: MVP ✅
Subtle badge/border on all featured TemplateCards everywhere they appear. Low cost, high value.

---

## 2. Answers to Agent 1's 8 Open Questions

### Q1: Quality gate — minimum rating/downloads?
**Answer: No gate at launch.** Here's why: Molt Mart is early-stage. Many templates have 0 reviews and few downloads. A quality gate would exclude most of the catalog from paying for promotion. That kills revenue. 

**Instead:** Any published, non-flagged template can be featured. If the marketplace matures and we see low-quality templates cluttering featured spots, add a gate later (e.g., ≥3.0 rating with ≥3 reviews, or no reviews at all — meaning unrated is OK, but actively bad-rated is not).

### Q2: Stripe integration?
**Answer: Assume yes.** Sellers already sell templates, so Stripe is integrated. The featuring purchase is a one-time Stripe Checkout session for a flat fee. Reuse existing Stripe setup. No subscriptions needed.

### Q3: Featured slot conflicts (more buyers than slots)?
**Answer: Thomas's model solves this.** There are no slot limits. Everyone who pays is featured forever. Order = most recent promotion at top. The homepage shows the top 4-6 (most recently promoted) with a "See all" link. Search results show top 1-2 relevant featured. The dedicated `/templates/featured` page shows all with infinite scroll.

No rotation, no queue, no caps. Simple stack: pay → go to top → get pushed down as others pay.

### Q4: Seller dashboard UX?
**Answer:** Two entry points:
1. **On each template's listing card** in the seller dashboard: a "⭐ Promote" button (or "Boost" — whatever copy we pick). If already promoted, show "Promoted" badge + position info.
2. **Dedicated "Promote" section** in the seller dashboard sidebar nav. Shows all your templates with promote/status for each.

Flow: Click "Promote" → see pricing/info modal → confirm → Stripe Checkout → return to dashboard with confirmation → template immediately goes to top of featured.

### Q5: Auto-renewal?
**Answer: No auto-renewal.** Thomas's model is one-time flat fee, forever. No renewal needed. If a seller wants to go back to the top, they pay again (re-promote). This is the re-monetization mechanic — you don't expire, but you sink. To rise, pay again.

### Q6: Analytics?
**Answer: Yes, basic.** Show on the seller dashboard:
- "Featured position: #X of Y"
- Impressions since promotion
- Clicks since promotion
- This is a strong incentive for re-promotion ("You've dropped to position #47, boost back to #1 for $25")

### Q7: Free templates — can they be featured?
**Answer: Yes.** A seller promoting a free template is paying $25 for visibility/brand building. Their money is just as good. No reason to restrict.

### Q8: Refund policy?
**Answer: No refunds.** Promotion is a visibility service, not a guarantee of results. The seller paid for placement, they got placement. Standard for all ad/promotion products. State this clearly in the purchase flow.

---

## 3. Agent 1's Tiered Weekly Model vs Thomas's Flat-Fee-Forever Model

### Agent 1's Model
| Tier | Price | Duration | Placements |
|------|-------|----------|-----------|
| Basic | $10/wk | 7 days | Badge + category boost |
| Standard | $25/wk | 7 days | + browse top spots |
| Premium | $50/wk | 7 days | + homepage section |

### Thomas's Model
| Action | Price | Duration | Effect |
|--------|-------|----------|--------|
| Promote | ~$25 | Forever | Go to top of featured stack everywhere |

### Comparison

| Factor | Tiered Weekly | Flat-Fee-Forever |
|--------|--------------|-----------------|
| Simplicity | ❌ 3 tiers to explain | ✅ One price, one action |
| Recurring revenue | ✅ Forced weekly renewal | ⚠️ Only if sellers re-promote |
| Seller-friendliness | ❌ Feels like a tax/rent | ✅ Pay once, done |
| Early-stage fit | ❌ Hard to sell weekly to small sellers | ✅ Low commitment |
| Scalability | ✅ Slots are scarce, revenue grows with price | ⚠️ Revenue grows with volume |
| Implementation | ❌ Expiry logic, tier management | ✅ Simple: add to stack |
| UX complexity | ❌ "Which tier?" decision paralysis | ✅ One button |

### Verdict: Thomas's model wins for MVP.

**Why:** Simplicity is everything at early stage. One price, one action, instant result. Sellers understand it immediately. No expiry tracking, no tier confusion. Revenue comes from volume + re-promotion.

**Can they be combined?** Yes, later. Thomas mentioned time-window premium spots as an alternative. This is essentially Agent 1's Premium tier — a special homepage banner or "spotlight" position that IS time-limited (e.g., $50 for 24 hours in a premium spot). But this is Phase 2.

### The Re-Promotion Mechanic Is The Key Revenue Driver

The genius of Thomas's model: you never expire, but you sink. This creates organic pressure to re-promote without the hostility of expiration. "Your template dropped to #34" is much friendlier than "Your promotion expired." The seller CHOOSES to pay again rather than being forced.

---

## 4. FINAL Pricing & Placement Model

### MVP (Phase 1)

**One product: "Promote Your Template" — $25 flat fee**

What you get:
- Immediately placed at **#1** in the featured stack
- Appear in the **homepage featured section** (if in top ~6)
- Appear at **top of search/category results** (when relevant, if in top ~2 most recently promoted for that category)
- **"Featured" badge** on your template card everywhere
- Listed on **`/templates/featured`** page (forever, infinite scroll)
- **Navbar** "Featured" link drives traffic to the dedicated page
- You stay featured **forever** — but your position drops as others promote
- **Re-promote anytime** to jump back to #1 ($25 again)

### Phase 2 (Later)

- **Premium Spotlight:** $50-75 for a 24-hour homepage banner/hero position (time-limited, exclusive)
- **Analytics dashboard** for featured templates
- **Category-specific promotion:** $15 to be #1 in a specific category only
- **Bundle discounts:** Promote 3 templates for $60

---

## 5. Edge Cases & Degradation

| # Featured | Homepage Section | Search Results | Navbar/Dedicated Page | Overall |
|-----------|-----------------|---------------|----------------------|---------|
| **0** | Section hidden entirely | No featured above results | Nav link hidden or leads to empty state "No featured yet — be the first!" | Clean, no clutter |
| **1-6** | Show all in a single row | Show 1-2 in relevant searches | Page shows small grid, no scroll needed | Ideal state |
| **7-20** | Show top 6, "See all →" link | Show top 2 relevant | One page of results | Good |
| **21-100** | Show top 6, "See all →" | Top 2 relevant | Infinite scroll kicks in | Fine, page stays useful |
| **100-500** | Same | Same | Multiple pages of scroll, still ordered by recency | Position #100+ is essentially invisible except on dedicated page |
| **1000+** | Same | Same | Long list. Consider adding filters/sort to featured page (by category, by date) | Most templates are buried. Re-promotion pressure is very high → good for revenue |

**Key insight:** At 1000+ featured, the bottom of the list is essentially worthless. But the seller paid $25 and still has the badge + technically appears on the page. The VALUE proposition shifts to "be near the top" which means re-promoting. This is the business model working as intended.

**Risk at scale:** If featured becomes meaningless because everyone is featured, the badge loses value. Mitigation: the badge still has value because it appears on cards. Being "Featured #800" is less about position and more about the social proof of the badge.

---

## 6. Seller UX Flow

```
Seller Dashboard
├── My Templates
│   ├── Template A          [⭐ Promote]
│   ├── Template B (Featured #12)  [📊 Stats | 🔄 Re-promote]  
│   └── Template C          [⭐ Promote]
└── Promote
    ├── Overview: "Get more visibility for $25"
    ├── Your Promoted Templates (with position + stats)
    └── Promote a Template (select from list → pay)
```

### Step-by-step flow:

1. Seller sees "⭐ Promote" button on their template card in dashboard
2. Clicks → Modal/page appears:
   - "Promote [Template Name] for $25"
   - "Your template will appear at #1 in Featured, at the top of relevant search results, and get a ⭐ Featured badge"
   - "You stay featured forever. Re-promote anytime to jump back to #1"
   - [Promote Now — $25] button
3. Click → Stripe Checkout (one-time payment)
4. Success → Redirect back to dashboard
5. Template immediately appears at top of featured stack
6. Dashboard shows: "Template B — Featured #1" with impression/click stats
7. Over time, position drops. Dashboard shows: "Template B — Featured #34. Re-promote to #1?"

### Re-promotion flow:
Same as above but button says "🔄 Re-promote to #1 — $25" instead of "⭐ Promote"

---

## 7. Quality Gate Decision

**No quality gate at launch.** Reasons:
- Small marketplace, few templates have enough reviews for meaningful filtering
- Revenue > curation at this stage
- The market self-corrects: bad templates that get featured won't convert, so sellers of bad templates won't re-promote
- Featured is clearly labeled, so users know it's paid placement

**Add later (Phase 2) if needed:**
- Block templates that have been flagged/reported
- Block templates with avg rating < 2.0 (only if they have 3+ reviews)
- This is a soft gate that only filters truly bad actors

---

## 8. What's Missing / Not Yet Considered

### Must address before build:

1. **Re-promotion stacking:** If a seller promotes the same template twice, do they go to #1 again? **Yes.** Each payment = new promotion = top of stack. The old entry is replaced (not duplicated).

2. **Multiple templates by same seller:** Can a seller have 3 templates in the top 5? **Yes, no limit initially.** If it becomes a problem (one seller dominating), add a cap later.

3. **Position calculation:** Is position global or per-category? **Both.** Global position for homepage/dedicated page. Per-category position for search/category results. A template can be #50 globally but #2 in "Productivity" category.

4. **Database model:** Need a `promotions` table, not just a field on templates:
   - `id`, `template_id`, `seller_id`, `promoted_at`, `amount_paid`, `stripe_payment_id`
   - Featured order = `ORDER BY promoted_at DESC`
   - This supports re-promotion history and analytics

5. **What "forever" means technically:** The template stays in the featured list as long as it's published. If a seller unpublishes or deletes the template, it leaves featured. No refund.

6. **Launch pricing:** $25 may be too high or too low. Start at $25, monitor. If nobody buys, drop to $15. If everyone buys immediately, raise to $35. Can adjust freely since it's a one-time fee (no existing subscribers to grandfather).

7. **Fraud/gaming:** Someone could write a bot to promote every 5 minutes to stay at #1. Mitigation: cooldown of 24 hours between re-promotions of the same template. Or: don't worry about it, they're paying $25 each time.

8. **FTC compliance:** Featured/sponsored content must be labeled. Use "Featured" or "Sponsored" labels clearly. This is non-negotiable.

9. **Homepage featured section name:** Suggest "Featured Enhancements" or "⭐ Promoted" — needs to be distinct from "Popular Enhancements." Thomas to decide on copy.

10. **Empty state messaging:** When there are 0 featured templates, the seller dashboard promote section should say: "Be the first to promote your template! Featured templates appear on the homepage, in search results, and get a ⭐ badge."

---

## Summary for Agent 3

**Build this (MVP):**

| Component | Description |
|-----------|------------|
| **`promotions` DB table** | template_id, seller_id, promoted_at, amount_paid, stripe_payment_id |
| **Homepage "Featured" section** | Above Popular. Show top 6 by promoted_at DESC. "See all →" link. Hidden if 0. |
| **`/templates/featured` page** | Navbar link. Full grid, infinite scroll, 20 per load, ordered by promoted_at DESC. Hidden from nav if 0 featured. |
| **Search/category featured** | Top 1-2 results labeled "Featured", filtered by relevance to query/category. Most recently promoted first. |
| **"Featured" badge on TemplateCard** | Subtle badge/golden border on all cards for promoted templates. |
| **Seller dashboard "Promote" button** | On each template card in dashboard. Opens payment flow. |
| **Seller dashboard "Promote" section** | Sidebar nav item. Overview of promoted templates with position + basic stats. |
| **Stripe one-time checkout** | $25 flat fee. One-time payment. No subscription. |
| **Re-promote flow** | Same as promote, replaces previous promotion timestamp (moves to #1). 24hr cooldown. |
| **Basic analytics** | Position, impressions, clicks since promotion. Shown on seller dashboard. |

**Don't build yet:**
- Hero carousel
- Template detail page competitor ads
- New listings featuring
- Email featuring
- Premium spotlight/time-limited spots
- CPC/auction model
- Quality gates
- Category-specific pricing
