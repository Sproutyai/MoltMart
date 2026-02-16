# Molt Mart — UX Fix Groups

## Group 1: Homepage & Global UI Fixes
**Files:** `src/app/page.tsx`, `src/components/navbar-search.tsx`, `src/components/mobile-nav.tsx`, `src/components/footer`, `src/app/layout.tsx`

1. **#2** — Unify terminology to "Enhancements" sitewide
2. **#7** — Make hero stats real (query actual DB counts)
3. **#16** — Remove duplicate search bar on homepage
4. **#25** — Fix footer showing "Log In" to logged-in users
5. **#5** — Add search to mobile

## Group 2: Template Cards & Download Fixes
**Files:** `src/components/template-card.tsx`, `src/components/seller-link.tsx`, `src/app/templates/[slug]/page.tsx`, `src/app/api/templates/[id]/download/route.ts`

1. **#1** — Download button says "Free" on paid templates
2. **#11** — Fix nested links in template cards
3. **#14** — Fix seller earnings — if $0 show $0

## Group 3: Mobile Dashboard & Navigation
**Files:** `src/app/dashboard/layout.tsx`, `src/app/dashboard/seller/page.tsx`, `src/components/seller-stats-bar.tsx`, `src/components/mobile-nav.tsx`

1. **#4** — Add proper mobile dashboard navigation
2. **#10** — Fix seller dashboard for mobile
3. **#18** — Hide seller-only features from non-sellers

## Group 4: Auth & Seller Signup
**Files:** `src/components/auth-form.tsx`, `src/app/api/profile/become-seller/route.ts`, `src/app/signup/page.tsx`, `src/app/login/page.tsx`

1. **#3** — "Forgot password?" — configure with Supabase auth
2. **#8** — Fix seller signup race condition

## Group 5: Dashboard Polish & Error Handling
**Files:** `src/app/dashboard/*`, `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/dashboard/seller/promote/page.tsx`

1. **#19** — Add confirmation dialog before archiving templates
2. **#21** — Add error states on dashboard pages
3. **#24** — Add custom 404/error pages
4. **#26** — Create a proper FAQ page
