# Molt Mart — Next Steps Analysis

*Product strategy analysis — Feb 16, 2026*

## What Exists Today

Homepage, browse/search with categories, template detail pages with reviews/screenshots/video, seller dashboard (upload, edit, promote, analytics, transactions), buyer dashboard (downloads, review prompts), featured templates, affiliate program, social trust (GitHub/X OAuth with follower counts), seller profiles with follow system, new listings page, FAQ, sell landing page, auth flows, custom error pages.

**Honest assessment:** The bones are solid. You have a functional marketplace loop: list → discover → download → review. But it's a *static* marketplace. There's no reason for anyone to come back after their first visit.

---

## The Big Gaps

### 1. NO VERSION UPDATES / UPDATE NOTIFICATIONS
**What:** When a seller updates a template, buyers who downloaded it have no idea. No changelog, no notification, no way to re-download the latest version.
**Why it matters:** This is the #1 reason buyers come back to any marketplace. Without it, Molt Mart is a one-and-done experience. Templates are living things — AI models change, OpenClaw evolves, bugs get fixed.
**Complexity:** Medium
**Priority:** **Must-have**

### 2. NO COLLECTIONS / WISHLISTS / BOOKMARKS
**What:** Buyers can't save templates for later. No "favorites" list, no collections like "My Agent Setup" or "Want to Try."
**Why it matters:** People browse before they buy. If they can't save things, they leave and forget. This is basic e-commerce table stakes.
**Complexity:** Simple
**Priority:** **Must-have**

### 3. NO SELLER ANALYTICS THAT MATTER
**What:** Sellers see download counts and transaction tables. They don't see: where traffic comes from, conversion rate (views → downloads), which search terms find their templates, how their templates compare to category averages.
**Why it matters:** Sellers who understand their performance stay engaged and improve their listings. Sellers who see a flat download count get bored and leave.
**Complexity:** Medium
**Priority:** **Should-have**

### 4. NO TEMPLATE VERSIONING
**What:** There's a `version` field on templates but no version history. No way to publish v1.1, let alone let buyers see what changed.
**Why it matters:** Directly tied to #1. Sellers need to ship updates. Buyers need to know what changed. This is how trust compounds over time.
**Complexity:** Medium
**Priority:** **Must-have**

### 5. NO "INSTALL WITH ONE CLICK" EXPERIENCE
**What:** The download button gives you a file. Then what? There's no `openclaw install <template>` CLI integration, no deep link, no guided setup beyond optional `setup_instructions` markdown.
**Why it matters:** The entire homepage promises "Install in One Click." If that's not real, trust erodes immediately. The gap between marketing and reality is the fastest way to lose users.
**Complexity:** Medium (needs OpenClaw CLI integration)
**Priority:** **Must-have**

### 6. NO TEMPLATE PREVIEW / "TRY BEFORE YOU BUY"
**What:** You can see screenshots and description. You can't preview the actual SOUL.md, AGENTS.md, or file structure in a meaningful way. The `preview_data` field exists in the schema but isn't prominently displayed.
**Why it matters:** AI agent templates are code-like. People want to see what they're getting. A live preview or expanded file preview builds massive confidence.
**Complexity:** Simple (data exists, just needs better UI)
**Priority:** **Should-have**

### 7. NO COMMENTS / Q&A ON TEMPLATES
**What:** Reviews exist, but there's no way to ask a question before downloading. No seller-buyer communication channel.
**Why it matters:** Every successful marketplace (GitHub, Gumroad, Envato) has some form of Q&A. Questions answered publicly become social proof AND reduce support burden for sellers.
**Complexity:** Medium
**Priority:** **Should-have**

### 8. NO EMAIL NOTIFICATIONS AT ALL
**What:** No emails for: new review on your template, someone followed you, template update available, weekly digest of your seller stats, affiliate earnings update.
**Why it matters:** If Molt Mart never reaches out to users, they forget it exists. Email is the re-engagement channel. Without it, you're 100% dependent on users remembering to come back.
**Complexity:** Medium (Resend/Postmark + templates)
**Priority:** **Must-have**

### 9. NO BUNDLES / STARTER KITS
**What:** No way to group templates together. "Complete Customer Service Agent Kit" = SOUL.md + AGENTS.md + TOOLS.md + workflow templates. Currently each is a separate listing.
**Why it matters:** Bundles increase average order value, simplify the buyer experience, and give sellers a differentiation tool. They also make great featured content.
**Complexity:** Medium
**Priority:** **Should-have**

### 10. NO COMMUNITY / SOCIAL LAYER
**What:** You can follow sellers, but there's no feed, no "what's trending this week," no showcase of what people built with templates, no discussions.
**Why it matters:** Marketplaces that become communities have 10x retention. Even a simple "Recently popular" + "Staff picks" editorial layer would help.
**Complexity:** Simple (curated) to Complex (full community)
**Priority:** Should-have (start with curated editorial)

---

## Quick Wins (Easy to Build, High Impact)

| Feature | Effort | Impact | Notes |
|---------|--------|--------|-------|
| **Wishlist/Bookmark** | 1 day | High | New table `bookmarks(user_id, template_id)`, heart icon on cards, `/dashboard/bookmarks` page |
| **Preview file contents** | 1 day | High | `preview_data` already exists — render SOUL.md/AGENTS.md in a tabbed code viewer on template detail page |
| **"Similar templates" on detail page** | 1 day | Medium | Query same category + tags, show 3-4 cards below reviews |
| **Template update changelog** | 2 days | High | `template_versions` table, changelog textarea on edit, "Updated" badge on cards |
| **Weekly digest email** | 2 days | High | Cron job, simple email: your stats this week, new templates in categories you browse |
| **Buyer "My Setup" page** | 1 day | Medium | Show which templates the user has installed, organized by category — makes the dashboard feel personal |

---

## Category-by-Category Analysis

### Buyer Experience Gaps
- No wishlist/bookmarks
- No update notifications
- No "similar templates" recommendations
- No install guidance beyond markdown
- No way to ask questions before downloading
- No email re-engagement
- Dashboard is bare — just a download list

### Seller Experience Gaps
- No meaningful analytics (traffic sources, conversion, search terms)
- No version management
- No buyer communication tools
- No way to offer bundles
- No email notifications for reviews/sales
- No seller tier/badge system (beyond verified)
- No way to see competitor templates or category benchmarks

### Discovery/Curation Gaps
- No "similar templates" recommendations
- No "trending this week" 
- No editorial/staff picks (featured exists but feels automated)
- No "templates by AI model" browsing (field exists, no filter page)
- No "starter kit" concept for new users
- No search suggestions/autocomplete

### Trust/Safety Gaps
- No template reporting/flagging
- No content moderation queue visible to admins
- No seller response to reviews
- No verified purchase badge on reviews
- No refund/dispute flow
- No template scanning (malicious content check)

---

## The Biggest Gap

**Molt Mart has no re-engagement loop.**

A user visits → browses → maybe downloads something → leaves → never comes back.

There's no:
- Email bringing them back
- Update notifications pulling them back
- Wishlist reminding them of things they wanted
- Community keeping them engaged
- "What's new this week" giving them a reason to check in

The marketplace *works* for a single session. It doesn't work as an ongoing relationship. Fix the re-engagement loop and everything else compounds.

---

## Recommended Build Order

### Phase 1: Retention Basics (1 week)
1. Wishlist/bookmarks
2. Template file preview (use existing preview_data)
3. Similar templates recommendations
4. Template versioning + changelogs

### Phase 2: Re-engagement (1 week)
5. Email notification system (Resend)
6. Update notifications for downloaded templates
7. Weekly digest email
8. Seller review notifications

### Phase 3: Depth (1-2 weeks)
9. Q&A / comments on templates
10. Seller analytics dashboard (traffic, conversion)
11. Bundles/starter kits
12. Template reporting/flagging
13. Seller responses to reviews

### Phase 4: Growth (ongoing)
14. OpenClaw CLI integration (`openclaw install`)
15. Trending/editorial content
16. Search autocomplete
17. AI model filter page
18. Seller tiers/badges
