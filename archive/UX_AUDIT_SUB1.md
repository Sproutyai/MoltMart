# Molt Mart UX Audit

## Navigation & Information Architecture

### 1. Terminology inconsistency: "Templates" vs "Enhancements"
**Where:** Sitewide  
**Problem:** The homepage and hero copy say "Enhancements" everywhere ("The Enhancement Store", "Browse Enhancements", "Enhancement Categories"), but the navbar link says "Enhancements" while the browse page heading says "Browse Templates". The mobile nav says "Browse Templates". New listings page says "New Listings". Footer says "Browse Enhancements". Template cards, dashboard, and seller pages all say "Templates". The URL path is `/templates`.  
**Impact:** Users encounter two different product names for the same thing, creating confusion about whether these are the same or different features.  
**Fix:** Pick one term and use it everywhere. "Templates" is more concrete and matches the URLs. Update homepage copy to say "Templates" or rebrand URLs to `/enhancements`.

### 2. "Forgot password?" link goes nowhere
**Where:** `src/app/login/page.tsx`  
**Problem:** The "Forgot password?" link has `href="#"` — it's a dead link.  
**Impact:** Users who forget their password are stuck with no recovery path.  
**Fix:** Implement a password reset flow or remove the link until it's ready.

### 3. Mobile nav missing Profile/Settings link
**Where:** `src/components/mobile-nav.tsx`  
**Problem:** The mobile nav shows Dashboard, Upload Template, and Sign Out when logged in, but has no link to Edit Profile, Transactions, Affiliate Dashboard, or Public Profile. Desktop users get these via the sidebar, but mobile users inside the dashboard have no sidebar.  
**Impact:** Mobile users can't access profile settings, transactions, or affiliate features without knowing the URL.  
**Fix:** Add Profile, Transactions, and Affiliate links to mobile nav. Or add a mobile-friendly dashboard sidebar/tab bar.

### 4. Dashboard sidebar not visible on mobile
**Where:** `src/app/dashboard/layout.tsx`  
**Problem:** The sidebar has `hidden md:block` — it's completely invisible on mobile. There's no mobile alternative (hamburger, tabs, or bottom nav).  
**Impact:** Mobile users landing on `/dashboard` can only see the current page content. They cannot navigate to seller dashboard, transactions, profile settings, or affiliate dashboard.  
**Fix:** Add a mobile dashboard nav — either a horizontal scrollable tab bar, a collapsible menu, or expose the sidebar via a sheet/drawer.

### 5. "Sell" nav link goes to seller dashboard (auth-required page)
**Where:** `src/components/navbar.tsx`, `src/components/mobile-nav.tsx`  
**Problem:** The "Sell" link in the top nav points to `/dashboard/seller`, which requires authentication. Unauthenticated users get redirected to `/login` with no context about what they were trying to do.  
**Impact:** New visitors clicking "Sell" to learn about selling get dumped on a login page instead of a landing/info page.  
**Fix:** Create a `/sell` landing page explaining the seller program (similar to `/affiliate`), with a CTA to sign up/log in. Or redirect unauthenticated users to the "For Sellers" section of the homepage.

### 6. Footer shows Log In/Sign Up/Dashboard links regardless of auth state
**Where:** `src/components/footer.tsx`  
**Problem:** The footer is a server component that doesn't check auth state. It always shows "Log In", "Sign Up", and "Dashboard" links. Logged-in users see "Log In" and "Sign Up" which are irrelevant.  
**Impact:** Minor confusion; logged-in users see auth links they don't need.  
**Fix:** Either make the footer auth-aware or keep it static but relabel as "Account" → "Get Started" to be more generic.

### 7. Homepage hero stats are hardcoded
**Where:** `src/app/page.tsx`  
**Problem:** "2,000+ Enhancements", "500+ Creators", "50K+ Downloads" are hardcoded strings, not pulled from the database.  
**Impact:** These numbers are likely inaccurate (especially for a new marketplace), which erodes trust.  
**Fix:** Either fetch real counts from the database or remove the stats until they're meaningful.

### 8. Homepage "Create Enhancements" CTA goes to /signup
**Where:** `src/app/page.tsx`  
**Problem:** The secondary hero button "Create Enhancements" goes to `/signup`. If the user is already logged in, they land on a signup page they don't need.  
**Impact:** Logged-in users who want to start creating get sent to signup instead of the seller dashboard or upload page.  
**Fix:** Make this link conditional: `/signup` for unauthenticated, `/dashboard/seller/upload` for authenticated users. (Since homepage is a server component, this is straightforward.)

### 9. Homepage "Seller Dashboard" button in the "For Sellers" section
**Where:** `src/app/page.tsx` (bottom CTA section)  
**Problem:** The "Seller Dashboard" button links to `/dashboard/seller` which requires auth. Same issue as #5.  
**Impact:** Unauthenticated users clicking this get redirected to login without context.  
**Fix:** Same as #5 — use a landing page or make auth-aware.

### 10. Search on homepage vs search on browse page are different components
**Where:** `src/app/page.tsx` uses `SearchInput`, navbar uses `NavbarSearch`  
**Problem:** Homepage has a `SearchInput` component in the "Popular Enhancements" section. The navbar also has `NavbarSearch`. These likely function differently (one might navigate to `/templates?q=...`, the other might be in-page).  
**Impact:** Two search inputs visible on the homepage could confuse users about which to use.  
**Fix:** Remove the inline search from the homepage popular section; the navbar search is sufficient. Or make the homepage search prominent and hide the navbar search on the homepage.

### 11. No active state indication in navbar links
**Where:** `src/components/navbar.tsx`  
**Problem:** All nav links use the same styling (`text-muted-foreground hover:text-foreground`). There's no indication of which page is currently active.  
**Impact:** Users don't know where they are in the site hierarchy.  
**Fix:** Use `usePathname()` (client component wrapper) to highlight the active nav link.

### 12. No active state in dashboard sidebar
**Where:** `src/app/dashboard/layout.tsx`  
**Problem:** All sidebar links have the same styling. No visual indicator of which dashboard section is active.  
**Impact:** Users navigating between dashboard sections don't know which one they're on.  
**Fix:** Compare current pathname to link href and apply active styling (e.g., `bg-muted font-semibold`).

### 13. Template detail page has no back/breadcrumb navigation
**Where:** `src/app/templates/[slug]/page.tsx`  
**Problem:** When a user clicks into a template detail from browse, there's no breadcrumb or back button to return to their search results.  
**Impact:** Users lose their search context and must use the browser back button.  
**Fix:** Add breadcrumbs: Home → Templates → [Category] → [Template Name].

### 14. Review anchor link may not work
**Where:** `src/app/dashboard/page.tsx`  
**Problem:** The "Leave a Review" button links to `/templates/${slug}#reviews`, but the template detail page doesn't have an element with `id="reviews"`.  
**Impact:** The hash link doesn't scroll to the reviews section.  
**Fix:** Add `id="reviews"` to the reviews section heading in the template detail page.

### 15. Dropdown menu missing Profile link
**Where:** `src/components/navbar.tsx`  
**Problem:** The user dropdown menu shows Dashboard, Seller Dashboard, Upload Template, Affiliate Program, and Sign Out. There's no link to Edit Profile (`/dashboard/profile`).  
**Impact:** Users must navigate to Dashboard first, then use the sidebar to find profile settings.  
**Fix:** Add "Edit Profile" to the dropdown menu.

### 16. Upload page has no seller check
**Where:** `src/app/dashboard/seller/upload/page.tsx`  
**Problem:** The upload page just renders `<UploadForm />` without checking if the user is a seller. A non-seller user navigating here directly might see a form that fails on submission.  
**Impact:** Confusing error for non-seller users who find this page via the footer or navbar.  
**Fix:** Check seller status and show the "Become a Seller" prompt (like the seller dashboard does) if they're not a seller.

### 17. No confirmation before archiving templates
**Where:** `src/app/dashboard/seller/page.tsx`  
**Problem:** The archive button immediately toggles the template status without a confirmation dialog.  
**Impact:** Accidental clicks archive a published template, potentially removing it from the marketplace.  
**Fix:** Add a confirmation dialog before archiving.

### 18. Seller dashboard template list not mobile-friendly
**Where:** `src/app/dashboard/seller/page.tsx`  
**Problem:** The template row uses `flex items-center` with fixed-width columns (`w-16`, `w-14`, etc.) and multiple buttons inline. On mobile (where the sidebar is hidden), this layout will overflow or compress badly.  
**Impact:** Seller dashboard is barely usable on mobile.  
**Fix:** Use a responsive card layout on mobile instead of the row layout.

### 19. Auth pages exist at both /login and /auth/login (possibly)
**Where:** `src/app/login/page.tsx`, `src/app/signup/page.tsx`  
**Problem:** The login/signup pages are at `/login` and `/signup`, but the original spec mentioned `/auth/login` and `/auth/signup`. Only `/login` and `/signup` exist. The callback route is at `/auth/callback`. This is fine but the structure is slightly inconsistent.  
**Impact:** Minimal — just an organizational note.  
**Fix:** None needed unless you want consistent grouping under `/auth/`.

### 20. Sign out in mobile nav uses form POST to /auth/signout
**Where:** `src/components/mobile-nav.tsx`  
**Problem:** Mobile nav uses `<form action="/auth/signout" method="post">` but there's no visible `/auth/signout` route in the file listing. The desktop uses `<SignOutButton />` component. These may work differently.  
**Impact:** Sign out might not work on mobile if the route doesn't exist.  
**Fix:** Verify `/auth/signout` route exists. If not, use the same `SignOutButton` component approach.

### 21. No loading/error states for client-side pages
**Where:** Seller dashboard, Profile, Promote, Transactions pages  
**Problem:** These are all client-side pages that fetch data in `useEffect`. While they show a `Loader2` spinner during loading, there are no error states if the API calls fail (they silently fail or just show empty state).  
**Impact:** Users see an empty dashboard with no explanation when there's a network error.  
**Fix:** Add error states that explain what went wrong and offer a retry button.

### 22. Profile page avatar/banner require manual URL entry
**Where:** `src/app/dashboard/profile/page.tsx`  
**Problem:** Avatar and Banner are plain text inputs where users paste URLs. There's no file upload, no preview, and no avatar selection.  
**Impact:** Most users won't have a hosted image URL ready. This is a high-friction UX for a basic profile feature.  
**Fix:** Add file upload with preview (the site already has `/api/screenshots/upload` — extend this for avatars).

### 23. Featured page empty state CTA says "Promote Yours →" but links to /dashboard/seller
**Where:** `src/app/templates/featured/page.tsx`  
**Problem:** The empty state button says "Promote Yours →" but links to the seller dashboard, not the promote page (`/dashboard/seller/promote`).  
**Impact:** User has to navigate again from seller dashboard to find the promote feature.  
**Fix:** Link directly to `/dashboard/seller/promote`.

### 24. Affiliate terms link in FAQ is plain text, not a link
**Where:** `src/app/affiliate/page.tsx`  
**Problem:** FAQ answer says "Full terms at /affiliate/terms." but it's plain text inside an `AccordionContent`, not an actual link.  
**Impact:** Users can't click through to the terms.  
**Fix:** Make it a `<Link href="/affiliate/terms">`.

### 25. No way to navigate from affiliate dashboard back to affiliate landing
**Where:** `src/app/dashboard/affiliate/page.tsx`  
**Problem:** The affiliate dashboard has no link back to the public affiliate info page or affiliate terms.  
**Impact:** Affiliates who want to re-read terms or share the landing page have no easy path.  
**Fix:** Add a link to `/affiliate` and `/affiliate/terms` in the affiliate dashboard.

### 26. Homepage SearchInput placement is confusing
**Where:** `src/app/page.tsx`  
**Problem:** The search bar is nested inside the "Popular Enhancements" section, between the section heading and the grid. It's not in the hero where users would expect a primary search.  
**Impact:** Users may miss the search or not understand what it searches (just popular? all?).  
**Fix:** Move search to the hero section as the primary CTA, or remove it from the homepage (navbar search handles it).

### 27. No "Edit Profile" or account deletion option
**Where:** `src/app/dashboard/profile/page.tsx`  
**Problem:** There's no way to change email, change password, or delete account.  
**Impact:** Users can't manage basic account security or exercise data deletion rights.  
**Fix:** Add email/password change and account deletion options.

### 28. Inconsistent page title hierarchy
**Where:** Various pages  
**Problem:** Browse page says "Browse Templates", featured says "⭐ Featured Enhancements", new says "New Listings", seller profile uses dynamic content. There's no consistent pattern.  
**Impact:** Minor — but the mix of Templates/Enhancements/Listings is disorienting.  
**Fix:** Standardize: "Browse Templates", "Featured Templates", "New Templates".

### 29. Category grid on homepage shows fewer categories than may exist
**Where:** `src/app/page.tsx`  
**Problem:** Categories are imported from `CATEGORIES` constant and only 5 icons are mapped (Mindset, Workflows, Technical, Creative, Knowledge). If more categories exist, they get the default `Zap` icon.  
**Impact:** New categories look generic.  
**Fix:** Keep icon map updated with all categories.

### 30. Template card `<img>` tag instead of Next.js `<Image>`
**Where:** `src/components/template-card.tsx`  
**Problem:** Screenshots use raw `<img>` tags instead of `next/image`, missing optimization and lazy loading.  
**Impact:** Performance — images load without optimization, no blur placeholder, no responsive sizing.  
**Fix:** Use `next/image` with proper `sizes` attribute.

### 31. No "Sign Up as Seller" flow is clearly communicated
**Where:** Signup page  
**Problem:** The seller checkbox on signup says "Register as a Seller" with a small checkbox. The `become-seller` API is called AFTER signup, but the user may not be authenticated yet at that point (email confirmation required). This race condition could mean the seller flag isn't set.  
**Impact:** Users who check "Register as a Seller" might not actually become sellers if the API call fires before auth is confirmed.  
**Fix:** Handle seller registration as part of the auth callback or profile setup flow, not immediately after signup.

### 32. Dashboard layout requires auth but has no graceful degradation
**Where:** `src/app/dashboard/layout.tsx`  
**Problem:** Uses `redirect("/login")` which is a hard redirect with no message. User doesn't know why they were redirected.  
**Impact:** Users clicking dashboard links from footer/nav get silently bounced to login.  
**Fix:** Pass a `?redirect=/dashboard` param to login so users return to their intended destination after auth.

### 33. No redirect-back-after-login functionality
**Where:** `src/app/login/page.tsx`  
**Problem:** After login, users are always sent to `/dashboard`. If they clicked a protected link (e.g., seller dashboard, upload), they lose that intent.  
**Impact:** Extra navigation steps after every login.  
**Fix:** Accept a `?redirect=` query param and redirect there after successful login.

### 34. Promote page 24-hour cooldown UX
**Where:** `src/app/dashboard/seller/promote/page.tsx`  
**Problem:** The re-promote button shows "Available in Xh" when cooldown is active, but doesn't explain why or when the cooldown started.  
**Impact:** Sellers don't understand the 24-hour policy until they try to re-promote.  
**Fix:** Add a tooltip or info text explaining the 24-hour cooldown policy upfront.

### 35. No link from template detail to seller's other templates page
**Where:** `src/app/templates/[slug]/page.tsx`  
**Problem:** The "More by [seller]" section shows 3 templates, but there's no "View all" link to `/sellers/[username]`.  
**Impact:** Users who want to see all of a seller's work have no path.  
**Fix:** Add "View all by [seller] →" link below the "More by" section.

### 36. Seller public profile page not linked from seller dashboard
**Where:** `src/app/dashboard/seller/page.tsx`  
**Problem:** The seller dashboard has no link to view their own public profile. The sidebar has it, but it's easy to miss.  
**Impact:** Sellers can't easily preview how buyers see them.  
**Fix:** Add a "View Public Profile" button in the seller dashboard header area.

---

## Summary

**Critical issues (blocking/confusing):** #2 (dead forgot password), #4 (no mobile dashboard nav), #5 (sell link requires auth), #20 (mobile sign out might not work), #32/#33 (no redirect-back-after-login)

**High impact UX issues:** #1 (terminology), #3 (mobile nav gaps), #8 (wrong CTA for logged-in users), #16 (upload no seller check), #22 (avatar URL-only input), #31 (seller signup race condition)

**Medium polish issues:** #6, #7, #10, #11, #12, #13, #14, #15, #17, #18, #21, #23, #24, #25, #26, #27, #28, #30, #34, #35, #36

**Low priority:** #9, #19, #29
