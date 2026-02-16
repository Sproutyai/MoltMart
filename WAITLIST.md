# Molt Mart — Waitlisted UX Items

These items are approved in principle but deferred to a future sprint.

---

## 9. Avatar Upload (Currently URL-Only)
**Priority:** High | **Reason for deferral:** Requires integrating a file upload pipeline (Supabase Storage or S3), image resizing, and updating the profile API. Significant scope for a polish item — better handled as a dedicated feature task.

## 12. SEO Metadata
**Priority:** High | **Reason for deferral:** Needs per-page Open Graph tags, structured data (JSON-LD), and dynamic meta for template/seller pages. Important for growth but doesn't affect current users' experience. Will tackle after core UX bugs are resolved.

## 20. Homepage CTAs Change Based on Login State
**Priority:** Medium | **Reason for deferral:** The hero CTA currently says "Create Enhancements" and links to the seller dashboard regardless of login state. Should conditionally show "Get Started" / "Browse Enhancements" for visitors. Low urgency since most visitors will browse first anyway.

## 23. Half-Built Features (Seller Follows, Featured on Profiles)
**Priority:** Medium | **Reason for deferral:** The `seller_follows` and `featured_templates` tables exist in the database, and some API routes reference them (`/api/sellers/[id]/follow`, `/api/sellers/featured`). The `follow-button.tsx` component exists. However, the full UX isn't connected — there's no follow count display on seller profiles, no "following" feed, and the featured templates section on profiles doesn't pull from the `featured_templates` table properly. These are half-wired features that need a design decision (finish or remove) before implementation.

## 27. Next.js Image Optimization
**Priority:** Low | **Reason for deferral:** Template cards use `<img>` instead of `next/image`. Performance improvement but low user-facing impact. Will batch with other performance work later.
