# Molt Mart Revision Plan

Generated: 2026-02-20

---

## 1. Codebase Analysis

### Tech Stack
- **Framework:** Next.js 16.1.6 (App Router) + React 19 + Tailwind v4
- **Auth/DB:** Supabase (project: `pixasvjwrjvuorqqrpti`)
- **Payments:** Stripe (checkout, seller connect, promotions)
- **Hosting:** Vercel
- **Domain:** moltmart.bot

### Key Directory Structure
```
src/
├── app/
│   ├── api/                    # Route handlers
│   │   ├── account/            # delete, export, notifications
│   │   ├── checkout/           # Stripe checkout + webhook
│   │   ├── payments/methods/   # Payment method CRUD
│   │   ├── profile/            # set-avatar, become-seller, social linking
│   │   ├── seller/             # products, transactions, analytics, connect
│   │   ├── templates/          # upload, download, CRUD, replace-file
│   │   ├── reviews/            # review CRUD + seller response
│   │   ├── affiliate/          # join, stats, track, earnings
│   │   └── promote/            # checkout, webhook, positions, track
│   ├── dashboard/
│   │   ├── page.tsx            # Purchases/Library (server component → LibraryClient)
│   │   ├── library-client.tsx  # Client-side purchases display (card grid)
│   │   ├── settings/page.tsx   # Account settings (password, notifications, delete)
│   │   ├── payment/page.tsx    # Payment methods + billing address
│   │   ├── transactions/       # Transaction history (seller-oriented)
│   │   ├── seller/             # Seller dashboard, products, edit, upload, analytics
│   │   └── account/            # Redirects to settings/profile
│   ├── signup/page.tsx         # Client-side signup form
│   ├── login/page.tsx          # Login
│   ├── auth/                   # callback, forgot-password, reset-password
│   └── templates/              # Browse, detail, featured, new
├── components/
│   ├── template-card.tsx       # Main card component (default/compact/library variants)
│   ├── infinite-carousel.tsx   # Auto-scrolling carousel
│   ├── featured-section.tsx    # Featured/promoted templates section
│   ├── new-listings-snippet.tsx # New listings carousel
│   ├── explore-client.tsx      # Explore/browse page
│   ├── user-avatar.tsx         # Avatar display component
│   ├── upload-form.tsx         # Template upload
│   └── ui/                     # shadcn/ui primitives
├── lib/
│   ├── supabase/               # client.ts, server.ts, admin.ts
│   ├── stripe.ts               # Stripe instance
│   ├── types.ts                # All TypeScript interfaces
│   └── types/payment.ts        # PaymentMethod, BillingAddress types
└── middleware.ts               # Auth refresh + basic rate limiting + affiliate tracking
```

### Database Schema (Core Tables)
- **profiles** — id, username, display_name, bio, avatar_url, is_seller, social fields, billing_address
- **templates** — id, seller_id, title, slug, description, category, price_cents, file_path, screenshots, status, version, etc.
- **purchases** — id, buyer_id, template_id, price_cents, created_at (unique on buyer+template)
- **reviews** — id, buyer_id, template_id, rating, comment, seller_response
- **promotions** — template promotions/featured listings
- **bookmarks** — user bookmarks
- **affiliates/referrals/affiliate_earnings** — affiliate system

### Current Rate Limiting
Middleware has basic in-memory IP rate limiting (30 req/min) on select API routes. Not production-grade (resets on deploy, no per-route granularity).

### Current Avatar System
`set-avatar` API only supports pulling from connected GitHub/Twitter accounts. No custom upload, no premade avatars.

---

## 2. Implementation Chunks

### CHUNK A: Rate Limiting & Security Foundation
**Includes:** Revision #1 (Signup Rate Limiting), #3 (General Rate Limiting)
**Risk:** Low | **Complexity:** Medium

#### Files Affected
- `src/middleware.ts` — overhaul rate limiting
- `src/app/signup/page.tsx` — add client-side throttle
- `src/app/api/templates/[id]/download/route.ts` — add per-user download limiting
- `src/app/api/account/export/route.ts` — add rate limit
- `package.json` — potentially add `@upstash/ratelimit` + `@upstash/redis`

#### Dependencies
None — this is foundational infrastructure.

#### Implementation Brief
1. **Replace in-memory rate limiting with Upstash Redis** (or use Vercel KV if already available). The current `Map`-based approach resets on every deploy and doesn't work across serverless instances.
   - Create Upstash Redis instance (free tier sufficient)
   - Install `@upstash/ratelimit` and `@upstash/redis`
   - Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local` and Vercel env vars

2. **Signup-specific rate limiting:**
   - IP-based: max 5 signups per IP per hour
   - Since signup happens client-side via `supabase.auth.signUp()`, we can't easily intercept it server-side without a custom API route
   - **Option A (recommended):** Create `/api/auth/signup` route that wraps `supabase.auth.admin.createUser()` with rate limiting, then redirect signup page to use it
   - **Option B:** Use Supabase's built-in rate limiting (Dashboard → Auth → Rate Limits) — check current settings first and tighten them
   - Also add invisible honeypot field to signup form (bot trap)

3. **General rate limiting tiers in middleware:**
   - `/api/auth/*`, `/api/account/delete` → 5 req/min/IP (strict)
   - `/api/templates/*/download` → 20 req/min/user (per authenticated user)
   - `/api/account/export` → 2 req/hour/user
   - `/api/checkout/*` → 10 req/min/IP
   - Default API routes → 60 req/min/IP (generous)

4. **Return proper headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

---

### CHUNK B: Auth Email Branding
**Includes:** Revision #2 (Auth Email Branding)
**Risk:** Low | **Complexity:** Low

#### Files Affected
- Supabase Dashboard configuration (not code)
- Potentially DNS records for moltmart.bot

#### Dependencies
None

#### Implementation Brief
1. **Supabase Dashboard → Auth → Email Templates:**
   - Go to project settings → Auth → SMTP Settings
   - Enable Custom SMTP
   - Options:
     - **Option A (Recommended):** Use a transactional email service (Resend, Postmark, or Amazon SES) configured for `moltmart.bot`
     - **Option B:** Use Supabase's built-in SMTP but customize the sender name/templates
   
2. **DNS Configuration for moltmart.bot:**
   - Add SPF, DKIM, and DMARC records for the chosen SMTP provider
   - Set sender to `no-reply@moltmart.bot`

3. **Customize email templates** in Supabase Dashboard → Auth → Email Templates:
   - Confirmation email
   - Password reset email
   - Magic link email (if used)
   - Add Molt Mart branding (logo, colors, footer)

4. **Test thoroughly** — send test emails to multiple providers (Gmail, Outlook, Yahoo) to verify deliverability.

**Note:** This is entirely a Supabase Dashboard + DNS task. No code changes needed unless custom email templates require a server endpoint.

---

### CHUNK C: Profile Avatars (Premade)
**Includes:** Revision #4 (Profile Avatars)
**Risk:** Low | **Complexity:** Medium

#### Files Affected
- `public/avatars/` — new directory for generated images
- `src/app/api/profile/set-avatar/route.ts` — extend to support premade selection
- `src/app/dashboard/profile/page.tsx` or `src/app/dashboard/account/profile/page.tsx` — avatar picker UI
- `src/components/user-avatar.tsx` — ensure it handles new avatar paths
- `src/lib/constants.ts` — avatar list

#### Dependencies
None

#### Implementation Brief
1. **Generate 5 avatar images using Replicate Flux Pro:**
   - API key: [REDACTED]
   - Model: `black-forest-labs/flux-pro`
   - Prompts should create diverse, professional, gender-neutral avatar illustrations that match Molt Mart's dark/tech aesthetic. Suggestions:
     - A stylized chameleon/lizard (brand mascot tie-in to "Molt")
     - An abstract geometric face
     - A robot/AI agent avatar
     - A cosmic/nebula silhouette
     - A pixel art character
   - Generate at 512×512 or 1024×1024, then optimize to WebP
   - Save to `public/avatars/avatar-1.webp` through `avatar-5.webp`

2. **Create avatar constants:**
   ```ts
   // src/lib/constants.ts
   export const PREMADE_AVATARS = [
     { id: 'chameleon', url: '/avatars/avatar-1.webp', label: 'Chameleon' },
     { id: 'geometric', url: '/avatars/avatar-2.webp', label: 'Geometric' },
     // ...
   ]
   ```

3. **Update `set-avatar` API route:**
   - Accept `{ source: 'premade', avatarId: string }` in addition to existing github/twitter sources
   - Validate avatarId against PREMADE_AVATARS list
   - Set `avatar_url` to the static path (e.g., `/avatars/avatar-1.webp`)

4. **Update profile page UI:**
   - Remove any custom upload functionality
   - Show grid of 5 premade avatars + GitHub/Twitter options (if connected)
   - Highlight currently selected avatar
   - Click to select, save button to confirm

5. **Remove image-upload.tsx** if it's only used for avatars (check usage first).

---

### CHUNK D: Account Settings Fixes
**Includes:** Revision #7 (Account Settings Fixes)
**Risk:** Low | **Complexity:** Low

#### Files Affected
- `src/app/dashboard/settings/page.tsx` — main settings page

#### Dependencies
None

#### Implementation Brief
1. **Show current email:**
   - Add `useEffect` to fetch `supabase.auth.getUser()` and display email at top of settings
   - Show as read-only field with "Change Email" button beside it

2. **Email change functionality:**
   - Add email change form (new email input + confirm button)
   - Use `supabase.auth.updateUser({ email: newEmail })` — Supabase sends confirmation to both old and new email
   - Show info text: "A confirmation will be sent to your new email address"

3. **Fix "email rate limit exceeded" on password change:**
   - Current code calls `supabase.auth.resetPasswordForEmail()` which sends an email each time
   - Add client-side cooldown: disable the "Change Password" button for 60 seconds after click
   - Store last-clicked timestamp in state or localStorage
   - Show countdown: "You can request another reset in Xs"
   - Catch the specific Supabase rate limit error and show a friendly message instead of generic error

4. **Mark notification preferences as "Coming Soon":**
   - Wrap the notification toggles section in a container with `opacity-50 pointer-events-none`
   - Add a "Coming Soon" badge above or next to the section header
   - Keep the toggle UI intact (for when email is set up later)
   - Add tooltip or small text: "Email notifications will be available once our email system is configured"

---

### CHUNK E: Purchases Section Redesign
**Includes:** Revision #5 (Purchases Section Redesign)
**Risk:** Low | **Complexity:** Medium

#### Files Affected
- `src/app/dashboard/library-client.tsx` — add list view + toggle + filter
- `src/lib/types.ts` — Purchase type already has `price_cents` and `created_at`
- Possibly new component: `src/components/purchase-list-item.tsx`

#### Dependencies
None

#### Implementation Brief
1. **Add view toggle (card/list):**
   - Add state: `const [viewMode, setViewMode] = useState<'card' | 'list'>('card')`
   - Add toggle buttons (grid icon / list icon) next to existing sort controls
   - Persist preference in localStorage

2. **Card view:** Keep existing `TemplateCard` grid (current behavior)

3. **List view:** Create itemized table/list showing:
   - Template thumbnail (small, ~48px)
   - Template title (linked)
   - Seller name
   - Category badge
   - Purchase date/time (formatted with `date-fns`: "Feb 15, 2026 at 3:42 PM")
   - Cost ("Free" or "$X.XX")
   - Download button
   - Rating (if reviewed)

4. **Free vs paid filter:**
   - Add filter dropdown or toggle pills: "All" | "Free" | "Paid"
   - Filter logic: `price_cents === 0` → free, `price_cents > 0` → paid
   - Combine with existing category and search filters

5. **Empty states:** Different messaging for filtered-empty vs truly-empty

---

### CHUNK F: Payment Info & Transaction Fixes
**Includes:** Revision #6 (Payment Info Section Fixes)
**Risk:** Low | **Complexity:** Low

#### Files Affected
- `src/app/dashboard/payment/page.tsx` — fix transaction link + billing address
- `src/app/dashboard/transactions/page.tsx` — check if it works for non-sellers

#### Dependencies
Chunk E (purchases list view should exist for redirect target)

#### Implementation Brief
1. **Fix "View transaction history" redirect:**
   - Currently links to `/dashboard/transactions` (line 198 in payment page)
   - `/dashboard/transactions` is seller-oriented (shows sales)
   - For non-sellers: redirect to `/dashboard` (purchases/library) instead
   - Implementation: Check if user `is_seller` and conditionally set the link:
     ```tsx
     const txLink = profile?.is_seller ? "/dashboard/transactions" : "/dashboard"
     ```
   - Better: create unified view or add query param `/dashboard?view=list` to default to list view

2. **Billing address international formatting:**
   - Current form has US-centric fields: addressLine1, addressLine2, city, state, postalCode, country
   - Check: Does Stripe handle billing address collection during checkout? → Yes, Stripe Checkout collects billing address automatically
   - The on-site billing address form stores to `profiles.billing_address` (jsonb) — this is for display/records only
   - Fix: Make "State" field label dynamic ("State / Province / Region")
   - Make postal code label "Postal / ZIP Code"
   - Add country selector dropdown (use a standard list)
   - Conditionally show/hide state field based on country
   - Or simpler: just note "Billing address is collected during checkout by Stripe" and remove the manual form if it's redundant

---

### CHUNK G: Seller Dashboard & Products Redesign
**Includes:** Revision #8 (Seller Dashboard Redesign), #9 (My Products Section)
**Risk:** Medium | **Complexity:** High

#### Files Affected
- `src/app/dashboard/seller/page.tsx` — seller dashboard overview
- `src/app/dashboard/seller/products/page.tsx` — my products list
- `src/app/dashboard/seller/edit/[id]/page.tsx` — edit product
- `src/components/edit-template-form.tsx` — edit form
- `src/app/api/templates/[id]/route.ts` — PATCH/DELETE handlers
- `src/app/api/seller/products/route.ts` — product listing API
- Database: potentially new `template_versions` table

#### Dependencies
None for UI work. Versioning (below) is its own sub-task.

#### Implementation Brief

**8. Seller Dashboard Redesign:**
1. Current product cards in seller dashboard are basic text cards
2. Add product images to listing cards:
   - Use first screenshot from `template.screenshots[0]` 
   - Fall back to `getTemplateImage(category)` (already exists in code)
   - Display as thumbnail in card header
3. Redesign product cards:
   - Show image, title, status badge, price, downloads, rating, last updated
   - Add quick-action buttons: Edit, View Live, Copy Link
   - Color-code by status (green=published, yellow=draft, gray=archived)

**9. My Products Section Enhancements:**
1. **List/card toggle:** Same pattern as Chunk E purchases
2. **Edit buttons:** Already exist in dropdown menu — make them more prominent (dedicated edit button on card)
3. **Archived product warnings:** Show yellow banner on archived products: "This product is archived and not visible to buyers"
4. **Product versioning** — see Deep Analysis below

---

### CHUNK H: Product Card Descriptions
**Includes:** Revision #10 (Product Card Descriptions)
**Risk:** Low | **Complexity:** Low

#### Files Affected
- `src/components/template-card.tsx` — add description display
- `src/components/featured-section.tsx` — passes data to TemplateCard
- `src/components/new-listings-snippet.tsx` — passes data to TemplateCard
- `src/components/explore-client.tsx` — explore grid cards

#### Dependencies
None

#### Implementation Brief
1. **Add `short_description` or truncate existing `description`:**
   - Templates already have a `description` field
   - In `TemplateCard`, add 1-2 lines of description text below the title
   - Truncate with CSS: `line-clamp-2` (Tailwind)
   - Show in all variants: default, compact (maybe 1 line only for compact)

2. **Implementation in TemplateCard:**
   ```tsx
   {template.description && (
     <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
       {template.description}
     </p>
   )}
   ```

3. **Carousel cards:** The carousel uses TemplateCard, so the description will appear automatically. Check that card height doesn't break carousel layout — may need fixed height on carousel cards.

4. **Test:** Ensure long descriptions don't break card layouts in grid, carousel, and compact views.

---

## 3. Deep Analysis

### 3A. Product Versioning (Revision #9 — Critical)

**The Problem:** What happens when a seller edits or deletes a product that buyers already purchased?

**Current Behavior:**
- Edit: Changes propagate immediately to all views including buyer's library (since `purchases` references `template_id` and template data is fetched live)
- Delete: `ON DELETE CASCADE` in purchases table means **purchases are deleted** — buyers lose access entirely
- Archive: Template shows only to seller (RLS: `status = 'published' or auth.uid() = seller_id`), but purchases still exist. Buyers can likely still download via direct API call since download route checks `status = 'published'` — **archived products would break downloads for buyers**

**How Other Marketplaces Handle This:**

| Platform | Edit Policy | Delete Policy | File Versioning |
|----------|-------------|---------------|-----------------|
| **Gumroad** | Edits instant, buyers get latest. No version lock. | Products can be "unpublished" but not deleted while purchases exist | No formal versioning, but old files remain accessible |
| **Envato/ThemeForest** | Updates go through review. Buyers get all versions. | Cannot delete products with sales | Full version history, buyers can download any version |
| **Etsy (Digital)** | Instant edits. Buyers get version at time of purchase | Cannot delete, only deactivate | Buyers get the file version they purchased |
| **Unity Asset Store** | Updates reviewed. Buyers get latest | Cannot delete, only deprecate | Version history maintained |
| **GitHub Marketplace** | Instant edits | Can remove but existing users keep access | Git-based versioning inherent |

**Recommended Approach for Molt Mart:**

**Phase 1 (Implement Now — Low Risk):**
1. **Prevent hard delete of products with purchases:**
   - In `DELETE /api/templates/[id]`, check if any purchases exist
   - If yes, return error: "This product has been purchased. You can archive it but not delete it."
   - Allow hard delete only for products with 0 purchases

2. **Fix archived product downloads:**
   - Modify download route: allow download if user has a purchase record, regardless of status
   ```sql
   -- Change download logic:
   -- Current: template.status = 'published'
   -- New: template.status = 'published' OR EXISTS(purchase for this user+template)
   ```

3. **Snapshot price at purchase time:**
   - Already done! `purchases.price_cents` stores the price paid

**Phase 2 (Future — Medium Complexity):**
4. **File version snapshots:**
   - Create `template_versions` table:
   ```sql
   CREATE TABLE template_versions (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     template_id uuid REFERENCES templates(id),
     version text NOT NULL,
     file_path text NOT NULL,
     changelog text,
     created_at timestamptz DEFAULT now()
   );
   ```
   - On file replace (`/api/templates/replace-file`), insert old version into `template_versions`
   - Add `version_id` to purchases to track which version was bought
   - Let buyers choose: "Download latest" or "Download purchased version"

5. **Edit notifications:**
   - When seller edits a purchased product significantly (title, description, file), notify buyers
   - Queue notification (for when email system exists)

**Phase 1 is the minimum viable protection. Phase 2 is ideal but can wait.**

---

### 3B. Anti-Malicious Content / Scam Prevention (Revision #11 — Deep)

**Threat Model:**

1. **Bait-and-switch:** Seller uploads good product, gets positive reviews, then swaps the file with malicious/low-quality content
2. **Malicious files:** Templates containing harmful code (data exfiltration, prompt injection, destructive commands)
3. **Copyright infringement:** Uploading stolen templates
4. **Fake reviews:** Seller creates accounts to leave positive reviews
5. **Misleading listings:** Screenshots/descriptions don't match actual product

**How Other Marketplaces Handle This:**

| Platform | Approach |
|----------|----------|
| **Envato** | Manual review queue for all submissions + updates. Dedicated review team. |
| **WordPress.org** | Full code review for initial submission. Updates auto-published but spot-checked. |
| **Chrome Web Store** | Automated scanning + manual review for flagged items. Review on updates. |
| **npm** | No pre-review. Post-hoc: malware scanning, community reports, `npm audit` |
| **VS Code Marketplace** | Automated scanning (virus, telemetry). Manual review for flagged items. |
| **Shopify App Store** | Manual review for all submissions and major updates |

**Recommended Multi-Layer Strategy:**

**Layer 1: File Integrity (Implement Now)**
- **Version locking after purchase:** Once a buyer purchases, store a SHA-256 hash of the file. If the seller replaces the file, the old hash is preserved and buyers can verify/download original.
- **Implementation:** Add `file_hash` column to `templates` (and `template_versions`). Compute hash on upload. Store in purchase record.

**Layer 2: Automated Scanning (Implement Now)**
- OpenClaw templates are typically `.zip` files containing `.md` files and configs
- On upload, automatically:
  1. Extract and list all files
  2. Check for suspicious patterns:
     - Shell commands (`rm -rf`, `curl | bash`, etc.)
     - Credential harvesting patterns
     - Obfuscated code
     - Unexpected binary files
     - External URL fetches in agent configs
  3. Flag for manual review if any patterns match
- Store scan results in DB: `template_scans` table with `status: 'clean' | 'flagged' | 'rejected'`

**Layer 3: Approval Queue (Implement Soon)**
- **For new sellers:** First 3 uploads require manual approval before going live
- **For established sellers:** Auto-publish, but file replacements trigger a review window
  - "Update pending review" status — old version remains available
  - Auto-approve after 48h if no flags
- **Implementation:** Add `requires_review` boolean to templates, `review_status` field

**Layer 4: Community Reporting (Implement Now — Easy)**
- Add "Report" button on template detail pages
- Create `reports` table:
  ```sql
  CREATE TABLE reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id uuid REFERENCES profiles(id),
    template_id uuid REFERENCES templates(id),
    reason text NOT NULL, -- 'malicious', 'misleading', 'copyright', 'other'
    details text,
    status text DEFAULT 'pending', -- 'pending', 'reviewed', 'action_taken', 'dismissed'
    created_at timestamptz DEFAULT now()
  );
  ```
- Auto-flag templates with 3+ reports for admin review
- Send notification to admin

**Layer 5: Update Monitoring (Future)**
- Track file replacement frequency — flag sellers who replace files frequently after reviews
- "Verified" badge for templates that haven't changed since reviews
- Show "File updated since reviews" warning on product pages

**Layer 6: Review Integrity (Future)**
- Require purchase before review (already implemented ✓)
- Minimum time between purchase and review (e.g., 1 hour)
- Flag accounts that only leave 5-star reviews
- Weight reviews by account age and purchase history

**Priority Implementation Order:**
1. Community reporting (Layer 4) — easiest, immediate value
2. File hash tracking (Layer 1) — critical for trust
3. Basic automated scanning (Layer 2) — catches obvious issues
4. New seller approval queue (Layer 3) — prevents drive-by scams
5. Update monitoring (Layer 5) — addresses bait-and-switch specifically

---

## 4. Recommended Execution Order

```
1. CHUNK A: Rate Limiting & Security Foundation
   ↳ No dependencies, hardens the platform immediately
   
2. CHUNK B: Auth Email Branding  
   ↳ No dependencies, quick config task, can parallel with A
   
3. CHUNK D: Account Settings Fixes
   ↳ No dependencies, small scope, quick win
   
4. CHUNK C: Profile Avatars
   ↳ No dependencies, needs Replicate API calls (one-time generation)
   
5. CHUNK H: Product Card Descriptions
   ↳ No dependencies, small change with big visual impact
   
6. CHUNK E: Purchases Section Redesign
   ↳ No dependencies, creates list view needed by Chunk F
   
7. CHUNK F: Payment Info & Transaction Fixes
   ↳ Soft dependency on E (redirect target)
   
8. CHUNK G: Seller Dashboard & Products Redesign
   ↳ Largest chunk, includes versioning analysis implementation
   ↳ Phase 1 versioning protection should be part of this
```

**Parallelization:** Chunks A+B, C+D, E+H can all run in parallel within their groups.

**Total estimated effort:** ~3-4 days for a single developer, or ~1.5 days with parallelized sub-agents.
