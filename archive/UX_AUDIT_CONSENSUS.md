# Molt Mart — UX Audit Consensus Analysis

**Date:** February 16, 2026  
**Method:** Two independent auditors reviewed the full source code. This document merges their findings.

---

## Consensus Issues (Both Auditors Flagged)

| # | Issue | Sub1 | Sub2 | Verdict |
|---|-------|------|------|---------|
| 1 | "Templates" vs "Enhancements" terminology chaos | #1 | #1, #11, #15, #39 | **KEEP — Critical.** Both flagged as top-tier. Single biggest brand coherence problem. |
| 2 | Forgot password link is dead (`href="#"`) | #2 | #2 | **KEEP — Critical.** Both flagged identically. |
| 3 | No mobile dashboard navigation (sidebar `hidden md:block`) | #4 | #5 | **KEEP — Critical.** Both flagged identically. Entire dashboard broken on mobile. |
| 4 | "Sell" nav link goes to auth-required page, no landing page | #5, #9 | #8, #9 | **KEEP — High.** Both flagged. Easy win for conversion. |
| 5 | Hardcoded hero stats ("2,000+ Enhancements") are fake | #7 | #6 | **KEEP — High.** Both flagged. Trust killer for a new marketplace. |
| 6 | Duplicate/redundant search bars on homepage | #10, #26 | #7 | **KEEP — Medium.** Both noticed. |
| 7 | No active state on nav links or dashboard sidebar | #11, #12 | #16 | **KEEP — Medium.** Both flagged. |
| 8 | Seller signup race condition (become-seller call before auth) | #31 | #14 | **KEEP — High.** Both flagged. Could silently fail. |
| 9 | No mobile search | (implicit in #3) | #12 | **KEEP — High.** Sub2 explicit, Sub1 covered under mobile nav gaps. |
| 10 | Avatar/banner require URL paste, no upload | #22 | #24 | **KEEP — High.** Both flagged. Huge friction. |
| 11 | No archive confirmation dialog | #17 | #21 | **KEEP — Medium.** Both flagged. |
| 12 | Seller dashboard not responsive on mobile | #18 | #22 | **KEEP — High.** Both flagged. Compounds with #3. |
| 13 | `#reviews` anchor doesn't exist on template detail | #14 | #27 | **KEEP — Medium.** Both flagged. |
| 14 | Footer shows auth links regardless of login state | #6 | #13 | **KEEP — Low.** Both flagged but minor. |
| 15 | Affiliate FAQ "/affiliate/terms" is plain text, not a link | #24 | #29 | **KEEP — Low.** Both flagged. Trivial fix. |
| 16 | Auth route structure inconsistency | #19, #20 | #10 | **CUT.** Not user-facing enough to act on. |
| 17 | Mobile sign-out may not work (form POST to /auth/signout) | #20 | (implicit in #10) | **KEEP — High.** If sign-out is broken, that's critical. Needs verification. |
| 18 | No redirect-back-after-login | #32, #33 | (implicit in #8) | **KEEP — High.** Both describe the jarring login redirect. |
| 19 | Homepage CTA "Create Enhancements" wrong for logged-in users | #8 | #9 | **KEEP — Medium.** Both flagged the conditional CTA issue. |
| 20 | Upload page has no seller check | #16 | #18 (dropdown shows upload to non-sellers) | **KEEP — Medium.** Both flagged from different angles. |

## Unique to Sub1 (Worth Keeping)

| # | Issue | Sub1 | Verdict |
|---|-------|------|---------|
| 21 | Mobile nav missing Profile/Settings/Transactions links | #3 | **KEEP — High.** Compounds with #3 above. Merge into mobile nav overhaul. |
| 22 | No breadcrumbs on template detail page | #13 | **KEEP — Medium.** |
| 23 | Dropdown menu missing Profile link | #15 | **KEEP — Low.** Quick fix. Merge with #20 (seller-only items). |
| 24 | No error states for client-side pages | #21 | **KEEP — Medium.** |
| 25 | Promote cooldown not explained upfront | #34 | **CUT.** Too niche for now. |
| 26 | No "View all" link from template detail to seller profile | #35 | **CUT.** Minor polish. |
| 27 | No account deletion/email change | #27 | **KEEP — Medium.** Privacy/compliance concern. |

## Unique to Sub2 (Worth Keeping)

| # | Issue | Sub2 | Verdict |
|---|-------|------|---------|
| 28 | Download button says "Free" for paid templates | #4 | **KEEP — Critical.** Huge UX/revenue bug. Sub1 missed this. |
| 29 | Nested `<a>` tags in template card (SellerLink inside Link) | #33 | **KEEP — High.** Invalid HTML, broken clicks. |
| 30 | No SEO metadata on key pages | #42 | **KEEP — High.** Directly impacts discoverability. |
| 31 | Seller dashboard "Est. Earnings" based on downloads not purchases | #20 | **KEEP — High.** Misleading data. |
| 32 | No custom 404/error pages | #28 | **KEEP — Medium.** |
| 33 | Sidebar shows seller links to non-sellers | #17 | **KEEP — Medium.** Merge with #20. |
| 34 | No `/sellers` browse page | #3 | **CUT.** Feature request, not a bug. |
| 35 | Category counts query is O(n) | #36 | **CUT.** Premature optimization for MVP. |
| 36 | Seller profile references tables that may not exist | #37 | **KEEP — Medium.** Half-built features = confusing. |
| 37 | Homepage Suspense fallbacks are `null` (layout shift) | #35 | **CUT.** Low impact. |
| 38 | `<img>` instead of `next/image` | Sub1 #30 | **KEEP — Low.** Performance, easy fix. |
| 39 | Username availability check missing | #25 | **CUT.** Nice-to-have. |

---

## Items Cut (Not Worth Doing Now)

- Auth route structure consistency (not user-facing)
- Promote cooldown explanation (niche)
- "View all by seller" link (minor)
- `/sellers` browse page (feature, not bug)
- Category count optimization (premature)
- Suspense skeleton loaders (low impact)
- Username availability check (nice-to-have)
- Pagination inconsistency between pages (low impact)
- Search placeholder text differences (trivial)
- Negative margin fragility (dev concern only)
- Beacon tracking reliability (analytics concern only)
- Featured section on seller profiles with missing tables (merged into #36)
- Template card using `<img>` vs `next/image` (low priority but kept)

---

## Final Merge Summary

**22 actionable items** distilled from 78 combined issues (36 + 42). Aggressive merging of duplicates and cutting of noise. See `UX_FINAL_PROPOSALS.md` for the clean list.
