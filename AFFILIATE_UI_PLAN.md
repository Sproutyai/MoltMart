# Molt Mart Affiliate Program — UI Implementation Plan

> Definitive build guide for the build agent. Follow steps in exact order.

---

## Implementation Order (21 Steps)

### Step 1: SQL Migration
**File:** `supabase/migrations/20260215_affiliate_schema.sql`
**Action:** CREATE
**Content:** Exact SQL from `AFFILIATE_FINAL_SPEC.md` Section 6 — copy verbatim (affiliates, referrals, affiliate_earnings, referral_clicks tables + trigger).

---

### Step 2: TypeScript Types
**File:** `src/lib/types.ts`
**Action:** MODIFY — append at end

```ts
// ─── Affiliate Types ───

export interface Affiliate {
  id: string
  user_id: string
  referral_code: string
  commission_rate: number // basis points, e.g. 75 = 7.5%
  status: 'active' | 'paused' | 'banned'
  total_clicks: number
  total_signups: number
  total_sales: number
  total_earnings_cents: number
  created_at: string
}

export interface Referral {
  id: string
  affiliate_id: string
  referred_user_id: string
  created_at: string
  referred_user?: { display_name: string | null; username: string }
}

export interface AffiliateEarning {
  id: string
  affiliate_id: string
  purchase_id: string
  referred_user_id: string
  sale_amount_cents: number
  commission_rate: number
  commission_cents: number
  status: 'pending' | 'approved' | 'paid' | 'reversed'
  approved_at: string | null
  created_at: string
  purchase?: { template?: { title: string } }
}

export interface AffiliateStats {
  total_clicks: number
  total_signups: number
  total_sales: number
  total_earnings_cents: number
  pending_cents: number
  approved_cents: number
  paid_cents: number
}
```

---

### Step 3: Affiliate Helpers
**File:** `src/lib/affiliate.ts`
**Action:** CREATE

Utility functions:
- `generateReferralCode(username: string): string` — lowercase username + 4 random hex chars (e.g. `johndoe-a3f1`)
- `formatCents(cents: number): string` — `$X.XX` format
- `getReferralUrl(code: string): string` — `${process.env.NEXT_PUBLIC_APP_URL}/?ref=${code}`
- `getTwitterShareUrl(code: string): string` — pre-filled tweet: "Check out Molt Mart — a marketplace for AI agent templates. {url}"
- `getLinkedInShareUrl(code: string): string` — pre-filled LinkedIn share with URL

---

### Step 4: Middleware — Ref Cookie
**File:** `src/middleware.ts`
**Action:** MODIFY

Add BEFORE `await supabase.auth.getUser()`:

```ts
// Affiliate referral tracking
const refCode = request.nextUrl.searchParams.get('ref')
if (refCode && !request.cookies.get('molt_ref')) {
  response.cookies.set('molt_ref', refCode, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  })
}
```

Logic: Only set cookie if no existing `molt_ref` cookie (first-touch attribution). The cookie is httpOnly so JS can't tamper with it.

---

### Step 5: API — Join Affiliate Program
**File:** `src/app/api/affiliate/join/route.ts`
**Action:** CREATE

- **Method:** POST
- **Auth:** Required (get user from supabase)
- **Logic:**
  1. Check user isn't already an affiliate
  2. Generate referral code from username
  3. Insert into `affiliates` table
  4. Return `{ affiliate: Affiliate }`
- **Error:** 409 if already affiliate, 401 if not authenticated

---

### Step 6: API — Track Click
**File:** `src/app/api/affiliate/track-click/route.ts`
**Action:** CREATE

- **Method:** POST
- **Auth:** None
- **Body:** `{ code: string }`
- **Logic:**
  1. Look up affiliate by `referral_code`
  2. Hash IP with SHA-256 (use `crypto.subtle`)
  3. Insert into `referral_clicks` (will fail silently on dedup unique index)
  4. Increment `affiliates.total_clicks` (use upsert or catch conflict)
  5. Return `{ ok: true }`
- **Rate limit:** Check 10 req/min per IP using simple in-memory Map (acceptable for MVP)

---

### Step 7: API — Get Stats
**File:** `src/app/api/affiliate/stats/route.ts`
**Action:** CREATE

- **Method:** GET
- **Auth:** Required
- **Logic:** Query `affiliates` for user's record. Query `affiliate_earnings` for pending/approved/paid sums. Return `AffiliateStats`.

---

### Step 8: API — Get Earnings
**File:** `src/app/api/affiliate/earnings/route.ts`
**Action:** CREATE

- **Method:** GET
- **Auth:** Required
- **Query params:** `page`, `per_page` (default 10)
- **Logic:** Query `affiliate_earnings` joined with `purchases` → `templates` for title. Return paginated list.

---

### Step 9: API — Get Referrals
**File:** `src/app/api/affiliate/referrals/route.ts`
**Action:** CREATE

- **Method:** GET
- **Auth:** Required
- **Query params:** `page`, `per_page` (default 10)
- **Logic:** Query `referrals` joined with `profiles` (anonymized: first char of username + "***"). Return paginated list.

---

### Step 10: Component — AffiliateStats
**File:** `src/components/affiliate/affiliate-stats.tsx`
**Action:** CREATE

**Layout:** 4 cards in a responsive grid: `grid grid-cols-2 lg:grid-cols-4 gap-4`

Each card uses `<Card>` from shadcn:
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Total Clicks │  │   Signups    │  │ Conversions  │  │   Earnings   │
│     142      │  │      23      │  │       8      │  │    $14.06    │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**Per card:**
- `<Card className="p-6">`
- Icon: `MousePointerClick` / `UserPlus` / `ShoppingCart` / `DollarSign` from lucide-react — `h-4 w-4 text-muted-foreground`
- Label: `<p className="text-sm font-medium text-muted-foreground">Total Clicks</p>`
- Value: `<p className="text-2xl font-bold">142</p>`
- Earnings card formats cents to `$XX.XX`

**Props:** `stats: AffiliateStats`

**Empty state:** Show 0 for all values (no special empty state needed, zeros are fine)

---

### Step 11: Component — ReferralLinkCard
**File:** `src/components/affiliate/referral-link-card.tsx`
**Action:** CREATE

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Your Referral Link                                             │
│                                                                 │
│  ┌──────────────────────────────────────────────┐  ┌──────┐    │
│  │ https://moltmart.com/?ref=johndoe-a3f1       │  │ Copy │    │
│  └──────────────────────────────────────────────┘  └──────┘    │
│                                                                 │
│  Referral Code: johndoe-a3f1                                    │
│                                                                 │
│  ┌─────────────────┐  ┌──────────────────┐                     │
│  │ 𝕏 Share on X    │  │ in Share on LinkedIn │                  │
│  └─────────────────┘  └──────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**
- `<Card>` wrapper
- `<CardHeader>` with `<CardTitle>Your Referral Link</CardTitle>`
- `<CardContent>`:
  - Row: `<Input readOnly value={url} className="font-mono text-sm" />` + `<Button variant="outline" size="sm">` with `Copy` / `Check` icon toggle
  - `<p className="text-sm text-muted-foreground mt-2">Referral Code: <code className="font-mono font-medium text-foreground">{code}</code></p>`
  - Row with gap-2: Two `<Button variant="outline" size="sm">` for Twitter and LinkedIn, open in new tab
  - Twitter text: `"Check out Molt Mart — a marketplace for AI agent templates. ${url}"`
  - LinkedIn: share URL with the referral link

**State:** `copied` boolean, reset after 2 seconds via `setTimeout`

**Props:** `referralCode: string`

---

### Step 12: Component — EarningsTable
**File:** `src/components/affiliate/earnings-table.tsx`
**Action:** CREATE

**Layout:** shadcn `<Table>` inside a `<Card>`

**Columns:**
| Date | Template | Sale | Commission | Status |
|------|----------|------|------------|--------|

- **Date:** `new Date(earning.created_at).toLocaleDateString()` — `text-sm text-muted-foreground`
- **Template:** `earning.purchase?.template?.title ?? "—"` — `text-sm font-medium`
- **Sale:** `formatCents(earning.sale_amount_cents)` — `text-sm`
- **Commission:** `formatCents(earning.commission_cents)` — `text-sm font-medium`
- **Status:** `<Badge variant={...}>` — pending=`outline`, approved=`default`, paid=`default` (green-tinted), reversed=`destructive`

**Empty state:**
```
<div className="flex flex-col items-center justify-center py-12 text-center">
  <DollarSign className="h-10 w-10 text-muted-foreground/50 mb-3" />
  <p className="text-sm font-medium">No earnings yet</p>
  <p className="text-sm text-muted-foreground">Share your referral link to start earning commission.</p>
</div>
```

**Components:** `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`, `Badge`

**Props:** `earnings: AffiliateEarning[]`

---

### Step 13: Component — ReferralsTable
**File:** `src/components/affiliate/referrals-table.tsx`
**Action:** CREATE

**Layout:** shadcn `<Table>` inside a `<Card>`

**Columns:**
| User | Signup Date | Purchases |

- **User:** Anonymized — first char of username + "***" (e.g., `j***`) — `text-sm font-mono`
- **Signup Date:** `toLocaleDateString()` — `text-sm text-muted-foreground`
- **Purchases:** count from earnings (or just show "—" for MVP, tracked separately)

**Empty state:**
```
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
  <p className="text-sm font-medium">No referrals yet</p>
  <p className="text-sm text-muted-foreground">When someone signs up through your link, they'll appear here.</p>
</div>
```

**Props:** `referrals: Referral[]`

---

### Step 14: Component — BecomeAffiliateCard
**File:** `src/components/affiliate/become-affiliate-card.tsx`
**Action:** CREATE

**Layout:** Centered card, shown when user is NOT yet an affiliate.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│        💰  Earn by sharing Molt Mart               │
│                                                     │
│   Get 7.5% commission on every sale your            │
│   referrals make — for life. Free to join.          │
│                                                     │
│   ☐ I agree to the affiliate program terms          │
│                                                     │
│        [ Become an Affiliate ]                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Components:**
- `<Card className="max-w-lg mx-auto">`
- `<CardHeader className="text-center">`
  - `<CardTitle className="text-xl">Earn by sharing Molt Mart</CardTitle>`
  - `<CardDescription>Get 7.5% commission on every sale your referrals make — for life. Free to join.</CardDescription>`
- `<CardContent className="space-y-4">`
  - Checkbox row: `<Checkbox>` + `<label>` — "I agree to the <Link href="/affiliate/terms">affiliate program terms</Link>"
  - `<Button className="w-full" disabled={!agreed || loading}>Become an Affiliate</Button>`

**State:** `agreed: boolean`, `loading: boolean`
**Action:** POST to `/api/affiliate/join`, then `router.refresh()`

---

### Step 15: Component — PayoutPlaceholder
**File:** `src/components/affiliate/payout-placeholder.tsx`
**Action:** CREATE

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Payouts                                        │
│                                                 │
│  Total Approved:    $14.06                      │
│  Pending:           $3.75                       │
│  Paid Out:          $0.00                       │
│                                                 │
│  ℹ️ Payments via Stripe Connect are coming      │
│  soon. All your earnings are tracked and will   │
│  be paid retroactively.                         │
└─────────────────────────────────────────────────┘
```

**Components:**
- `<Card>`
- `<CardHeader>` → `<CardTitle>Payouts</CardTitle>`
- `<CardContent className="space-y-3">`
  - Three rows: label (text-sm text-muted-foreground) + value (text-sm font-medium), use `flex justify-between`
  - Info box: `<div className="rounded-md bg-muted p-3 text-sm text-muted-foreground flex items-start gap-2">` with `<Info className="h-4 w-4 mt-0.5 shrink-0" />` + message text

**Props:** `stats: AffiliateStats`

---

### Step 16: Page — Affiliate Landing (`/affiliate`)
**File:** `src/app/affiliate/page.tsx`
**Action:** CREATE

**Server component.** Check auth status for CTA button text.

**Full layout:**

```
┌──────────────────────────────────────────────────────────────────────┐
│                          HERO SECTION                                │
│  max-w-3xl mx-auto text-center py-20 px-4                          │
│                                                                      │
│  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">     │
│    Refer developers to Molt Mart.                                    │
│    Earn 7.5% on every sale.                                          │
│  </h1>                                                               │
│                                                                      │
│  <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">│
│    You earn commission on every purchase your referrals make —       │
│    not just the first one. Free to join.                             │
│  </p>                                                                │
│                                                                      │
│  <Button size="lg" className="mt-8" asChild>                        │
│    <Link href={user ? "/dashboard/affiliate" : "/signup"}>          │
│      {user ? "Get Your Referral Link" : "Sign Up to Start"}         │
│    </Link>                                                           │
│  </Button>                                                           │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     HOW IT WORKS                                     │
│  max-w-4xl mx-auto py-16 px-4                                      │
│                                                                      │
│  <h2 className="text-2xl font-bold text-center mb-10">              │
│    How it works                                                      │
│  </h2>                                                               │
│                                                                      │
│  <div className="grid md:grid-cols-3 gap-8">                        │
│    CARD 1:                                                           │
│      <div className="text-center space-y-3">                        │
│        <div className="mx-auto flex h-12 w-12 items-center          │
│          justify-center rounded-full bg-primary/10 text-primary">   │
│          <Link2 className="h-6 w-6" />                              │
│        </div>                                                        │
│        <h3 className="font-semibold">1. Get your link</h3>          │
│        <p className="text-sm text-muted-foreground">                │
│          Sign up and copy your unique referral URL.                  │
│        </p>                                                          │
│      </div>                                                          │
│                                                                      │
│    CARD 2:                                                           │
│      Icon: <Share2 />                                                │
│      Title: "2. Share it"                                            │
│      Text: "Post it wherever developers hang out."                   │
│                                                                      │
│    CARD 3:                                                           │
│      Icon: <DollarSign />                                            │
│      Title: "3. Earn commission"                                     │
│      Text: "7.5% on every sale your referrals make, for as long     │
│             as they're a customer."                                   │
│  </div>                                                              │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     WHY IT'S WORTH IT                                 │
│  max-w-4xl mx-auto py-16 px-4                                      │
│                                                                      │
│  <h2 className="text-2xl font-bold text-center mb-10">              │
│    Why it's worth it                                                 │
│  </h2>                                                               │
│                                                                      │
│  <div className="grid sm:grid-cols-2 gap-6">                        │
│    4 benefit cards, each:                                            │
│    <Card className="p-6">                                            │
│      <h3 className="font-semibold mb-1">{title}</h3>                │
│      <p className="text-sm text-muted-foreground">{desc}</p>        │
│    </Card>                                                           │
│                                                                      │
│    1. "Lifetime earnings"                                            │
│       "Your referrals buy a template 6 months from now? You still   │
│        earn."                                                        │
│    2. "Real-time tracking"                                           │
│       "See clicks and conversions as they happen in your dashboard." │
│    3. "No minimums"                                                  │
│       "No traffic requirements, no approval process. Anyone can     │
│        join."                                                        │
│    4. "Honest tracking"                                              │
│       "30-day cookie, transparent dashboard, no hidden rules."       │
│  </div>                                                              │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                         FAQ                                          │
│  max-w-2xl mx-auto py-16 px-4                                      │
│                                                                      │
│  <h2 className="text-2xl font-bold text-center mb-10">              │
│    Frequently asked questions                                        │
│  </h2>                                                               │
│                                                                      │
│  Use shadcn <Accordion type="single" collapsible>                   │
│                                                                      │
│  Q: "How much can I earn?"                                           │
│  A: "7.5% of every sale. A $25 template earns you $1.88. Refer     │
│      20 active buyers and it compounds into real passive income."    │
│                                                                      │
│  Q: "When do I get paid?"                                            │
│  A: "We're launching payments soon via Stripe Connect. All earnings │
│      are tracked from day one and will be paid retroactively."       │
│                                                                      │
│  Q: "Do I earn on repeat purchases?"                                 │
│  A: "Yes. Every purchase a referred user makes, forever."            │
│                                                                      │
│  Q: "Can I be a seller AND an affiliate?"                            │
│  A: "Yes. You cannot earn affiliate commission on your own           │
│      products."                                                      │
│                                                                      │
│  Q: "What are the rules?"                                            │
│  A: "Don't spam. Don't self-refer. Disclose your affiliation.       │
│      Full terms at /affiliate/terms."                                │
│                                                                      │
│  shadcn components needed: install Accordion                         │
│  import { Accordion, AccordionContent, AccordionItem,               │
│    AccordionTrigger } from "@/components/ui/accordion"               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     BOTTOM CTA                                       │
│  max-w-xl mx-auto text-center py-16 px-4                           │
│                                                                      │
│  <h2 className="text-2xl font-bold">Ready? It takes 10 seconds.</h2>│
│  <p className="mt-2 text-muted-foreground">                         │
│    Join the affiliate program and start earning today.               │
│  </p>                                                                │
│  <Button size="lg" className="mt-6" asChild>                        │
│    <Link href={user ? "/dashboard/affiliate" : "/signup"}>          │
│      {user ? "Go to Affiliate Dashboard" : "Sign Up to Start"}      │
│    </Link>                                                           │
│  </Button>                                                           │
└──────────────────────────────────────────────────────────────────────┘
```

**Metadata:**
```ts
export const metadata = {
  title: "Affiliate Program — Molt Mart",
  description: "Earn 7.5% commission on every sale by referring developers to Molt Mart.",
}
```

---

### Step 17: Page — Affiliate Terms
**File:** `src/app/affiliate/terms/page.tsx`
**Action:** CREATE

Simple prose page. `<div className="container mx-auto max-w-2xl px-4 py-12 prose dark:prose-invert">`

Content: All 10 terms from AFFILIATE_FINAL_SPEC.md Section 8, rendered as an ordered list with bold headings.

**Metadata:**
```ts
export const metadata = {
  title: "Affiliate Terms — Molt Mart",
}
```

---

### Step 18: Page — Affiliate Dashboard
**File:** `src/app/dashboard/affiliate/page.tsx`
**Action:** CREATE

**Server component** — fetch user, check if affiliate.

**Logic:**
- If user is NOT an affiliate → render `<BecomeAffiliateCard />`
- If user IS an affiliate → render full dashboard

**Full dashboard layout:**
```
<div className="space-y-6">
  <div>
    <h1 className="text-2xl font-bold tracking-tight">Affiliate Program</h1>
    <p className="text-muted-foreground">Track your referrals and earnings.</p>
  </div>

  <AffiliateStats stats={stats} />

  <div className="grid lg:grid-cols-2 gap-6">
    <ReferralLinkCard referralCode={affiliate.referral_code} />
    <PayoutPlaceholder stats={stats} />
  </div>

  <EarningsTable earnings={earnings} />
  <ReferralsTable referrals={referrals} />
</div>
```

**Data fetching:** Use Supabase server client. Query:
1. `affiliates` where `user_id = auth.uid()`
2. `affiliate_earnings` with joined purchase→template for earnings table
3. `referrals` with joined profiles for referrals table
4. Aggregate earnings by status for stats

**Mobile:** Everything stacks naturally. Grid goes single column. Tables scroll horizontally on small screens (`<div className="overflow-x-auto">`).

---

### Step 19: Dashboard Layout — Add Sidebar Link
**File:** `src/app/dashboard/layout.tsx`
**Action:** MODIFY

Add after the "Account" section (before closing `</nav>`):

```tsx
<p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Affiliate</p>
<Link
  href="/dashboard/affiliate"
  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
>
  <DollarSign className="h-4 w-4" />
  Affiliate Program
</Link>
```

Add `DollarSign` to the lucide-react import.

---

### Step 20: Navbar & Footer Modifications

#### Navbar (`src/components/navbar.tsx`)
**Action:** MODIFY

**Desktop nav links** — Add "Affiliates" link AFTER "Sell":
```tsx
<Link href="/affiliate" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
  Affiliates
</Link>
```

**User dropdown** — Add BEFORE the final `<DropdownMenuSeparator />` (before SignOutButton):
```tsx
<DropdownMenuItem asChild>
  <Link href="/dashboard/affiliate">Affiliate Program</Link>
</DropdownMenuItem>
```

#### Footer (`src/components/footer.tsx`)
**Action:** MODIFY

Add in the "For Sellers" column, after the last link:
```tsx
<Link href="/affiliate" className="hover:text-foreground">Affiliate Program</Link>
```

#### MobileNav
**File:** `src/components/mobile-nav.tsx`
**Action:** MODIFY — add "Affiliates" link and "Affiliate Program" dashboard link to mobile menu (match placement of desktop).

---

### Step 21: Signup Flow — Read Referral Cookie
**File:** `src/app/signup/page.tsx`
**Action:** MODIFY

After successful signup (after `router.push("/dashboard")`), add referral attribution:

Actually, better approach — handle this server-side. Create:

**File:** `src/app/auth/callback/route.ts` (or modify existing)
**Action:** MODIFY

After confirming the user's email / creating their session, read the `molt_ref` cookie:
1. Look up affiliate by `referral_code`
2. Verify affiliate is not the same user (anti self-referral)
3. Insert into `referrals` table
4. Increment `affiliates.total_signups`
5. Delete the `molt_ref` cookie

If auth callback doesn't exist or uses a different pattern, create an API route `/api/affiliate/attribute` that the signup page calls after successful account creation:
```ts
// In signup page, after successful signup:
const refCookie = document.cookie.split('; ').find(c => c.startsWith('molt_ref='))
if (refCookie) {
  await fetch('/api/affiliate/attribute', { method: 'POST' })
}
```

Wait — the cookie is httpOnly, so JS can't read it. Better: create the `/api/affiliate/attribute` route that reads the cookie server-side, and call it from signup after success. The route reads `molt_ref` from the request cookies.

**File:** `src/app/api/affiliate/attribute/route.ts`
**Action:** CREATE
- Read `molt_ref` cookie from request
- Get authenticated user
- Look up affiliate by code
- Anti self-referral check
- Insert referral
- Increment total_signups
- Clear cookie in response
- Return `{ ok: true }`

In `src/app/signup/page.tsx`, after successful signup add:
```ts
// Attribute referral (cookie is httpOnly, handled server-side)
await fetch('/api/affiliate/attribute', { method: 'POST' })
```

---

## shadcn Components Required

Ensure these are installed (run `npx shadcn@latest add <name>` if missing):
- `accordion` (for FAQ on landing page)
- `badge` (for earnings status)
- `table` (for earnings + referrals tables)
- Already installed: `button`, `card`, `input`, `checkbox`, `dropdown-menu`, `avatar`

---

## Responsive Behavior Summary

| Breakpoint | Behavior |
|------------|----------|
| Mobile (<640px) | Single column everything. Tables horizontally scroll. Stats 2x2 grid. Share buttons stack. |
| Tablet (640-1024px) | Benefits 2-col. How-it-works may stack to 1-col or stay 3. Dashboard grid single column. |
| Desktop (1024px+) | Full layout as designed. Dashboard stats 4-col, link+payout side by side. |

---

## Color & Styling Notes

- Match existing Molt Mart design: use `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-muted`
- Primary button for main CTAs
- Outline buttons for secondary actions (copy, share)
- Use `Card` with default styling (no custom borders/shadows)
- Status badge colors: pending → `<Badge variant="outline">`, approved → `<Badge variant="secondary">`, paid → `<Badge className="bg-green-500/10 text-green-600 border-green-500/20">`, reversed → `<Badge variant="destructive">`
- Landing page hero: no background color, just clean text on default background
- Dark mode: everything inherits from shadcn theme automatically

---

*This is the definitive UI plan. Build agent: follow steps 1-21 in exact order.*
