# Molt Mart — UX Audit Report

**Date:** February 16, 2026  
**Auditor:** Independent UX Sub-agent  
**Scope:** Full source code review of all pages, components, and user flows

---

## Summary

**Total issues found: 42**  
- Critical: 5  
- High: 12  
- Medium: 15  
- Low: 10

---

## Issues

### 1. Terminology Chaos: "Templates" vs "Enhancements"
**Location:** Entire site  
**Severity:** Critical  
**Problem:** The branding is deeply inconsistent. The hero says "Enhancement Store," navbar says "Enhancements," but the browse page heading says "Browse Templates," the URL is `/templates`, search placeholder says "Search templates," mobile nav says "Browse Templates," new listings page says "New Listings" with "Fresh templates added to Molt Mart," cards link to `/templates/[slug]`, seller dashboard says "My Templates," upload says "Upload Template," the footer mixes both. The user encounters both terms on every single page.  
**User impact:** Users don't know if "templates" and "enhancements" are the same thing or different product types. Destroys brand coherence.  
**Fix:** Pick ONE term. Either rebrand everything to "Enhancements" (URLs, headings, code) or stick with "Templates." Don't use both.

### 2. "Forgot Password?" Links to `#` (Dead Link)
**Location:** `src/app/login/page.tsx` — Login page  
**Severity:** Critical  
**Problem:** The "Forgot password?" link is `href="#"`. It does nothing. Users who forget their password are completely stuck.  
**User impact:** Locked-out users cannot recover their accounts.  
**Fix:** Implement a password reset flow using Supabase's `resetPasswordForEmail()` or remove the link until it's functional.

### 3. No `/sellers` Index Page
**Location:** URL `/sellers` — 404  
**Severity:** High  
**Problem:** Individual seller profiles exist at `/sellers/[username]`, but there's no `/sellers` browse page. The footer and various links reference sellers but there's no way to discover them except through search results.  
**User impact:** Users who want to browse creators have no way to do so.  
**Fix:** Create a `/sellers` page with search/filter for seller profiles.

### 4. DownloadButton Always Says "Download Free" for Paid Templates
**Location:** `src/components/download-button.tsx`  
**Severity:** Critical  
**Problem:** The button text is either "Download Again" (if purchased) or "Download Free" (if not). There's no logic for paid templates — a $25 template shows "Download Free" to users who haven't purchased it. The component doesn't receive `priceCents` as a prop.  
**User impact:** Users think paid templates are free. Either they get confused when charged, or the download API rejects them with no clear explanation.  
**Fix:** Pass `priceCents` to `DownloadButton`. Show "Buy for $X" / "Get for Free" / "Download Again" appropriately. Integrate Stripe checkout for paid items.

### 5. No Mobile Dashboard Navigation
**Location:** `src/app/dashboard/layout.tsx`  
**Severity:** Critical  
**Problem:** The dashboard sidebar is `hidden md:block`. On mobile, there is NO alternative navigation. Mobile users who land on `/dashboard` have zero way to navigate to seller dashboard, upload, transactions, profile, or affiliate pages.  
**User impact:** The entire dashboard is broken on mobile. Users can only see the page they landed on.  
**Fix:** Add a mobile-friendly dashboard nav — either a horizontal scrollable tab bar, a dropdown/sheet menu, or a bottom nav.

### 6. Homepage Hero Stats Are Hardcoded Lies
**Location:** `src/app/page.tsx` — Hero section  
**Severity:** High  
**Problem:** "2,000+ Enhancements," "500+ Creators," "50K+ Downloads" are hardcoded strings, not pulled from the database. For a new marketplace, these numbers are almost certainly fabricated.  
**User impact:** Destroys trust when users browse and see 3 templates. Classic startup credibility killer.  
**Fix:** Either pull real counts from the database or remove the stats section until you have real numbers worth showing.

### 7. Homepage Search Bar Navigates Away Without Context
**Location:** `src/app/page.tsx` → `SearchInput` component  
**Severity:** Medium  
**Problem:** The `SearchInput` on the homepage submits to `/templates?q=...` which is correct, but the component reads `useSearchParams()` — on the homepage there are no search params, so it always starts empty. That's fine. However, having both a navbar search AND an inline search bar on the homepage is redundant and confusing.  
**User impact:** Two search bars visible simultaneously on desktop. Which one should I use?  
**Fix:** Remove the inline search from homepage. The navbar search is sufficient. Or hide the navbar search on the homepage.

### 8. Navbar "Sell" Link Goes to Seller Dashboard (Auth-Required)
**Location:** `src/components/navbar.tsx` — "Sell" link  
**Severity:** High  
**Problem:** The "Sell" nav link goes to `/dashboard/seller`, which redirects unauthenticated users to `/login`. There's no dedicated "Sell on Molt Mart" landing page explaining the value prop. The user just gets bounced to login with no context.  
**User impact:** Potential sellers click "Sell," see a login page, and leave. No conversion funnel.  
**Fix:** Create a `/sell` landing page with benefits, how it works, and CTA to sign up as seller. Only link to the dashboard from within the seller flow.

### 9. Homepage "Seller Dashboard" Button in CTA Section (Unauthenticated)
**Location:** `src/app/page.tsx` — "Create & Sell Enhancements" section  
**Severity:** High  
**Problem:** The section has two buttons: "Start Selling Today" (→ `/signup`) and "Seller Dashboard" (→ `/dashboard/seller`). The second button is shown to ALL users including logged-out visitors. Clicking it redirects to login, which is confusing.  
**User impact:** Logged-out users click "Seller Dashboard" and get dumped to login with no explanation.  
**Fix:** Only show "Seller Dashboard" to authenticated sellers. Show a single "Start Selling" CTA for everyone else.

### 10. Auth Pages at Wrong Routes
**Location:** `src/app/login/page.tsx`, `src/app/signup/page.tsx`  
**Severity:** Medium  
**Problem:** Auth pages are at `/login` and `/signup` (not under `/auth/`). The signup page references `/auth/callback` for email redirect. The mobile nav sign-out form posts to `/auth/signout`. This is inconsistent — some auth routes are under `/auth/`, login/signup are not.  
**User impact:** Minor, but inconsistent URL structure makes the site feel unpolished.  
**Fix:** Either move login/signup under `/auth/` or move callback/signout out. Be consistent.

### 11. Mobile Nav Terminology Differs from Desktop
**Location:** `src/components/mobile-nav.tsx` vs `src/components/navbar.tsx`  
**Severity:** Medium  
**Problem:** Desktop nav says "Enhancements" but mobile nav says "Browse Templates." Desktop says "New" but mobile says "New Listings." Different labels for the same destinations.  
**User impact:** Users switching between desktop and mobile can't find the same sections.  
**Fix:** Use identical labels in both navs.

### 12. No Mobile Search
**Location:** `src/components/navbar-search.tsx`  
**Severity:** High  
**Problem:** `NavbarSearch` is `hidden md:block`. There is NO search on mobile — not in the navbar, not in the mobile nav sheet. Mobile users can only search if they navigate to `/templates` first and use the inline `SearchInput`.  
**User impact:** Mobile users have significantly degraded discovery. Search is the #1 way users find content.  
**Fix:** Add a search icon to mobile navbar that opens a search input, or include search in the mobile nav sheet.

### 13. Footer Links to Dashboard/Upload for Logged-Out Users
**Location:** `src/components/footer.tsx`  
**Severity:** Medium  
**Problem:** Footer shows "Sell Enhancements," "Upload," "Dashboard" links to everyone. These redirect to login for unauthenticated users.  
**User impact:** Dead-end experience for logged-out users clicking footer links.  
**Fix:** Either conditionally render these links, or ensure they redirect gracefully with a message about why login is needed.

### 14. Signup "Become Seller" Checkbox Race Condition
**Location:** `src/app/signup/page.tsx`  
**Severity:** High  
**Problem:** After `signUp()`, the code calls `/api/profile/become-seller` as a POST. But the user was just created and may not be authenticated yet (Supabase email confirmation flow). The API call likely fails silently. Similarly, `/api/affiliate/attribute` is called immediately after signup.  
**User impact:** Users who check "Register as a Seller" may not actually become sellers. They'd need to do it again from the dashboard.  
**Fix:** Handle seller status in the signup metadata/trigger, or defer the become-seller call until after email confirmation and first login.

### 15. Browse Page Heading Says "Browse Templates" While Nav Says "Enhancements"
**Location:** `src/app/templates/page.tsx`  
**Severity:** Medium  
**Problem:** Another instance of Issue #1. The main browse page says "Browse Templates" in the `<h1>`.  
**User impact:** Reinforces terminology confusion.  
**Fix:** Align with chosen terminology.

### 16. No Active State on Navigation Links
**Location:** `src/components/navbar.tsx`, `src/app/dashboard/layout.tsx`  
**Severity:** Medium  
**Problem:** Neither the main navbar nor the dashboard sidebar highlights the currently active page. All links look the same regardless of which page you're on.  
**User impact:** Users lose spatial awareness of where they are in the site.  
**Fix:** Use `usePathname()` to add active styles (bold text, background highlight, etc.).

### 17. Dashboard Sidebar Shows "Seller" Section to Non-Sellers
**Location:** `src/app/dashboard/layout.tsx`  
**Severity:** Medium  
**Problem:** The sidebar always shows Seller links (My Templates, Upload Template, Transactions, Public Profile) even for users who aren't sellers. Clicking these leads to pages that may show "Become a Seller" prompts or empty states.  
**User impact:** Cluttered navigation. Non-seller users see 4+ irrelevant links.  
**Fix:** Conditionally show seller section only when `profile.is_seller` is true.

### 18. "Upload Template" in Dropdown Menu Even for Non-Sellers
**Location:** `src/components/navbar.tsx` — user dropdown  
**Severity:** Medium  
**Problem:** The avatar dropdown always shows "Upload Template" regardless of seller status. Non-sellers clicking this will hit the upload page but may not have permission.  
**User impact:** Confusing dead-end for buyers.  
**Fix:** Only show "Upload Template" and "Seller Dashboard" in dropdown when user `is_seller`.

### 19. Mobile Nav Conditionally Shows Upload but Not Other Seller Links
**Location:** `src/components/mobile-nav.tsx`  
**Severity:** Low  
**Problem:** Mobile nav shows "Upload Template" only if `isSeller`, which is good. But it always shows the "Sell" link which goes to `/dashboard/seller`. Inconsistent conditional logic.  
**User impact:** Minor inconsistency.  
**Fix:** Either hide "Sell" for non-sellers on mobile too, or make it go to a public sell landing page.

### 20. Seller Dashboard Stats Card "Est. Earnings" Is Misleading
**Location:** `src/app/dashboard/seller/page.tsx`  
**Severity:** High  
**Problem:** `estimatedEarnings` is calculated as `download_count * price_cents` for paid templates. But downloads ≠ purchases. Free templates also get downloads. This number is fiction.  
**User impact:** Sellers see inflated earnings that don't match reality. Destroys trust.  
**Fix:** Calculate from actual purchase/transaction data, not download counts.

### 21. No Confirmation Before Archiving Templates
**Location:** `src/app/dashboard/seller/page.tsx` — `toggleArchive()`  
**Severity:** Medium  
**Problem:** Clicking the archive button immediately archives the template with no confirmation dialog. One misclick removes a published template from the marketplace.  
**User impact:** Accidental archiving of active templates.  
**Fix:** Add an `AlertDialog` confirmation before archiving.

### 22. Seller Dashboard Template List Not Responsive on Mobile
**Location:** `src/app/dashboard/seller/page.tsx`  
**Severity:** High  
**Problem:** Each template row has: title, status badge, position badge, download count, rating, price, and 3 action buttons all in a horizontal flex row. On mobile (which already has no sidebar nav — Issue #5), this will overflow or compress into an unreadable mess.  
**User impact:** Seller dashboard is unusable on mobile.  
**Fix:** Use a card-based layout for mobile, or make the row responsive with stacking.

### 23. Promote Page "$25" Price Not Dynamic
**Location:** `src/app/dashboard/seller/promote/page.tsx`  
**Severity:** Low  
**Problem:** The $25 price is hardcoded in the UI text. If pricing changes server-side, the UI will show stale pricing.  
**User impact:** Minor — could show wrong price.  
**Fix:** Fetch promotion price from an API or config.

### 24. Profile Page — Avatar/Banner Are URL Inputs (No Upload)
**Location:** `src/app/dashboard/profile/page.tsx`  
**Severity:** High  
**Problem:** Users must paste a URL for their avatar and banner. There's no file upload. Most users don't have hosted image URLs readily available.  
**User impact:** Most users will leave avatar/banner empty because they don't know how to get an image URL.  
**Fix:** Add file upload to Supabase Storage and generate URLs automatically.

### 25. Profile Page — No Username Availability Check
**Location:** `src/app/dashboard/profile/page.tsx`  
**Severity:** Medium  
**Problem:** Users can change their username but there's no real-time availability check. They'll only find out it's taken when they hit save and the API returns an error.  
**User impact:** Frustrating trial-and-error for username changes.  
**Fix:** Add debounced username availability check on input change.

### 26. Template Detail Sidebar Sticky Offset May Overlap Navbar
**Location:** `src/app/templates/[slug]/page.tsx`  
**Severity:** Low  
**Problem:** Sidebar uses `sticky top-20`. The navbar is `h-16` (4rem = `top-16`). `top-20` (5rem) leaves 1rem gap which is fine, but if content in the sidebar is taller than the viewport, the bottom gets cut off with no scroll.  
**User impact:** On short viewports, bottom of sidebar (install command, seller info) may be inaccessible.  
**Fix:** Use `sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto`.

### 27. Template Detail — Review Section Has No Anchor for `#reviews`
**Location:** `src/app/templates/[slug]/page.tsx`  
**Severity:** Medium  
**Problem:** The buyer dashboard links to `/templates/${slug}#reviews` for leaving reviews, but there's no `id="reviews"` on the reviews section heading.  
**User impact:** The `#reviews` link scrolls to top of page instead of the reviews section.  
**Fix:** Add `id="reviews"` to the reviews `<div>`.

### 28. No 404 / Error Pages
**Location:** `src/app/` — missing `not-found.tsx`, `error.tsx`  
**Severity:** Medium  
**Problem:** No custom 404 or error pages. Users hitting bad URLs get the default Next.js 404 which doesn't match the site's branding.  
**User impact:** Jarring experience when encountering errors.  
**Fix:** Create `src/app/not-found.tsx` and `src/app/error.tsx` with branded content and navigation back to safety.

### 29. Affiliate Landing Page FAQ References "/affiliate/terms" as Text
**Location:** `src/app/affiliate/page.tsx`  
**Severity:** Low  
**Problem:** The FAQ answer for "What are the rules?" says `"Full terms at /affiliate/terms."` as plain text, not a clickable link.  
**User impact:** Users have to manually type the URL.  
**Fix:** Make it a `<Link>`.

### 30. Affiliate Terms Page Not Wrapped in Dashboard Layout
**Location:** `src/app/affiliate/terms/page.tsx`  
**Severity:** Low  
**Problem:** The terms page adds its own `container mx-auto max-w-2xl px-4 py-12` wrapper. It's a standalone page which is fine, but it's nested under `/affiliate/` which has no layout, so it inherits the root layout. This means it has the standard navbar but no back-link to the affiliate program.  
**User impact:** Dead-end page with no obvious way back to the affiliate program.  
**Fix:** Add a back link at top of page.

### 31. New Listings Page Has Custom Pagination, Browse Page Uses Shared Component
**Location:** `src/app/templates/new/page.tsx` vs `src/app/templates/page.tsx`  
**Severity:** Low  
**Problem:** Two different pagination implementations. The new listings page builds its own prev/next buttons, while the browse page uses the shared `<Pagination>` component.  
**User impact:** Inconsistent pagination UI across pages.  
**Fix:** Use the shared `<Pagination>` component everywhere.

### 32. Search Input Placeholder Inconsistency
**Location:** `src/components/search-input.tsx` vs `src/components/navbar-search.tsx`  
**Severity:** Low  
**Problem:** Inline search says "Search templates by name, description, or tags..." while navbar search says "Search templates..." Different helpfulness levels.  
**User impact:** Minor — users may not know tags are searchable from navbar.  
**Fix:** Align placeholder text.

### 33. TemplateCard SellerLink Is Clickable Inside a Link (Nested `<a>`)
**Location:** `src/components/template-card.tsx`  
**Severity:** High  
**Problem:** The entire card is wrapped in `<Link href={/templates/${slug}}>`. Inside it, `<SellerLink>` renders another link to `/sellers/[username]`. This creates nested `<a>` tags which is invalid HTML and causes unpredictable click behavior.  
**User impact:** Clicking the seller name may navigate to the template detail instead of the seller profile, or vice versa. Invalid HTML causes accessibility issues.  
**Fix:** Either make the card click area exclude the seller link (use `onClick` + `stopPropagation` on seller link), or remove the seller link from the card and only show it as text.

### 34. Featured Section Beacon Tracking in Template Card
**Location:** `src/components/template-card.tsx` — `onClick` for featured cards  
**Severity:** Low  
**Problem:** Featured cards use `navigator.sendBeacon()` on click for tracking. This fires on every click, but `sendBeacon` doesn't guarantee delivery and there's no error handling.  
**User impact:** None to users, but tracking data may be unreliable.  
**Fix:** Acceptable for MVP. Consider server-side tracking long-term.

### 35. No Loading States for Homepage Sections
**Location:** `src/app/page.tsx`  
**Severity:** Low  
**Problem:** `<Suspense fallback={null}>` wraps `FeaturedSection` and `NewListingsSnippet`. The fallback is literally nothing — the sections just pop in after loading, causing layout shift.  
**User impact:** Content jumps around as sections load.  
**Fix:** Use skeleton loaders as Suspense fallbacks.

### 36. Category Filter Counts Fetch ALL Published Templates
**Location:** `src/app/templates/page.tsx`  
**Severity:** Medium  
**Problem:** To get category counts, the page runs `select("category").eq("status", "published")` which fetches ALL published templates just to count categories. At scale this is O(n) on every page load.  
**User impact:** Slow page loads as template count grows.  
**Fix:** Create a materialized view or use a Supabase RPC for category counts.

### 37. Seller Profile Page References `featured_templates` Table That May Not Exist
**Location:** `src/app/sellers/[username]/page.tsx`  
**Severity:** Medium  
**Problem:** The page queries a `featured_templates` table wrapped in try/catch with comment "Table may not exist yet." Also queries `seller_follows` with similar caveat. This is technical debt — features partially built.  
**User impact:** Featured templates on seller profiles likely never render. Follow button may not work.  
**Fix:** Either create the tables or remove the code. Half-built features are confusing.

### 38. Seller Profile Has Follow Button but No Followers Page
**Location:** `src/app/sellers/[username]/page.tsx`, `src/components/follow-button.tsx`  
**Severity:** Low  
**Problem:** Users can follow sellers but there's no "Following" list in the buyer dashboard and no follower count visible (besides the stat in the profile header).  
**User impact:** Following a seller has no visible effect. Users can't see who they follow or get updates.  
**Fix:** Add a "Following" section to the buyer dashboard. Consider notifications for new templates from followed sellers.

### 39. Dropdown Menu "Upload Template" Label While Hero Says "Create Enhancements"
**Location:** `src/components/navbar.tsx` dropdown  
**Severity:** Low  
**Problem:** Yet another terminology inconsistency. Dropdown says "Upload Template" while marketing copy says "Create Enhancements."  
**User impact:** Reinforces Issue #1.  
**Fix:** Align terminology.

### 40. Edit Template Page Has No Link Back to Template Detail
**Location:** `src/app/dashboard/seller/edit/[id]/page.tsx`  
**Severity:** Low  
**Problem:** The edit page just shows the form with no "View live listing" link, no breadcrumbs, and no back button.  
**User impact:** Sellers can't easily preview their changes live.  
**Fix:** Add a "View listing" link and a back button to the seller dashboard.

### 41. Homepage `-mx-4 -my-6` Negative Margins Are Fragile
**Location:** `src/app/page.tsx`  
**Severity:** Low  
**Problem:** The homepage uses negative margins to break out of the parent layout's padding. This is brittle — if the layout padding changes, the homepage breaks.  
**User impact:** None currently, but maintenance hazard.  
**Fix:** Use a layout variant or conditional padding for full-bleed pages.

### 42. No SEO Metadata on Key Pages
**Location:** `src/app/page.tsx`, `src/app/templates/page.tsx`, `src/app/templates/[slug]/page.tsx`  
**Severity:** High  
**Problem:** The homepage, browse page, and template detail pages have no `export const metadata` or `generateMetadata()`. Only the new listings page and affiliate pages have metadata. Template detail pages especially need dynamic OG tags for social sharing.  
**User impact:** Poor search engine visibility. Shared links show generic titles.  
**Fix:** Add `generateMetadata()` to all major pages, especially template detail with dynamic title/description/OG image.

---

## Priority Matrix

### Fix Immediately (Critical)
1. **#5** — Mobile dashboard nav (entire dashboard broken on mobile)
2. **#4** — Download button says "Free" for paid templates
3. **#1** — Terminology inconsistency (pick "Enhancements" or "Templates")
4. **#2** — Dead forgot password link
5. **#33** — Nested `<a>` tags in template card

### Fix This Sprint (High)
6. **#12** — No mobile search
7. **#6** — Fake hero stats
8. **#8** — "Sell" link needs landing page
9. **#9** — Dashboard button shown to logged-out users
10. **#14** — Seller signup race condition
11. **#20** — Fake earnings calculation
12. **#22** — Seller dashboard not responsive
13. **#24** — No avatar upload (URL-only)
14. **#42** — Missing SEO metadata

### Fix Soon (Medium)
15-29: Issues #7, #10, #11, #13, #15, #16, #17, #18, #21, #25, #27, #28, #36, #37

### Polish (Low)
30-42: Issues #3, #19, #23, #26, #29, #30, #31, #32, #34, #35, #38, #39, #40, #41
