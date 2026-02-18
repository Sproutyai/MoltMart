# Molt Mart — Proposed Changes

## Critical
1. Download button says "Download Free" on paid templates — users think everything is free (revenue bug)
2. Pick ONE product term ("Templates" or "Enhancements") and use it everywhere — right now both are used on every page
3. "Forgot password?" link does nothing — locked-out users have no way to recover their account
4. Dashboard has zero navigation on mobile — the sidebar is completely hidden with no alternative

## High
5. No search on mobile — the search bar is hidden on small screens, killing discoverability
6. "Sell" link dumps visitors on a login page instead of a landing page explaining how selling works
7. Hero stats ("2,000+ Enhancements, 500+ Creators") are hardcoded and likely fake — kills trust
8. Seller signup checkbox may silently fail due to a race condition with email confirmation
9. Profile avatar/banner requires pasting a URL instead of uploading an image — most users can't do this
10. Seller dashboard is unusable on mobile (everything crammed in one horizontal row)
11. Nested links in template cards cause broken/unpredictable click behavior (invalid HTML)
12. No SEO metadata on homepage, browse, or template pages — hurts Google ranking and social sharing
13. No redirect back to intended page after login — users always land on dashboard instead of where they were going
14. Seller earnings stat is calculated from downloads, not actual purchases — shows fake numbers
15. Verify mobile sign-out actually works (form posts to a route that may not exist)

## Medium
16. Remove duplicate search bar on homepage (navbar search + inline search is confusing)
17. Nav links and dashboard sidebar don't highlight the current page — users lose their place
18. Upload page and nav dropdown show seller-only features to non-sellers — confusing dead ends
19. No confirmation dialog before archiving a template — one misclick unpublishes it
20. Homepage CTAs ("Create Enhancements", "Seller Dashboard") should change based on login state
21. No error states when dashboard pages fail to load — users just see a blank screen
22. Add breadcrumbs on template detail page so users can navigate back to browse results
23. Half-built features (seller follows, featured on profiles) reference database tables that don't exist — remove or finish them
24. No custom 404 or error pages — broken URLs show an ugly default page

## Low
25. Footer shows "Log In" and "Sign Up" to already-logged-in users
26. Affiliate FAQ mentions "/affiliate/terms" as plain text instead of a clickable link
27. Template card images use basic `<img>` instead of optimized Next.js `<Image>` component
