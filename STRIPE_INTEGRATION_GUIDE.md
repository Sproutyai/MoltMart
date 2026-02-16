# 💳 Stripe Integration Guide for Molt Mart

> **For Thomas** — A step-by-step guide to adding real payments to Molt Mart.
> Written in plain English. No jargon without explanation.

---

## Table of Contents
1. [Account Setup (What You Do First)](#part-1-account-setup)
2. [How the Money Flows](#part-2-how-it-works)
3. [What Sellers See](#part-3-seller-experience)
4. [What Buyers See](#part-4-buyer-experience)
5. [Technical Implementation Plan](#part-5-technical-plan)
6. [Testing](#part-6-testing)
7. [Going Live Checklist](#part-7-going-live)
8. [Cost Breakdown](#part-8-costs)

---

## Part 1: Account Setup

### What is Stripe Connect?

Molt Mart is a **marketplace** — buyers pay, sellers get paid, and the platform takes a cut. Stripe has a product called **Stripe Connect** built exactly for this. It handles:
- Collecting payments from buyers
- Splitting money between Molt Mart and sellers
- Paying out sellers to their bank accounts
- Tax reporting, identity verification, fraud prevention

### Step-by-Step Setup

#### 1. Create a Stripe Account
- Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
- Sign up with your email
- This becomes the **Molt Mart platform account** (not a seller account)

#### 2. Complete Business Verification
- Go to [https://dashboard.stripe.com/settings/account](https://dashboard.stripe.com/settings/account)
- Fill in business details (business name: "Molt Mart", type: likely "Software/SaaS")
- Add your bank account for receiving platform fees

#### 3. Enable Stripe Connect
- Go to [https://dashboard.stripe.com/settings/connect](https://dashboard.stripe.com/settings/connect)
- Click "Get started with Connect"
- Choose **Express** accounts (recommended — explained below)
- Set your platform branding (logo, colors, name)

#### 4. Get Your API Keys
- Go to [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
- You'll see two keys:
  - **Publishable key** (starts with `pk_test_...`) — safe to use in the browser
  - **Secret key** (starts with `sk_test_...`) — server-only, never expose this
- ⚠️ Start with **test mode keys** (toggle at top of dashboard)

#### 5. Set Up Webhooks
- Go to [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
- Add endpoint: `https://molt-mart.vercel.app/api/stripe/webhook`
- Select these events:
  - `checkout.session.completed`
  - `account.updated`
- Copy the **webhook signing secret** (starts with `whsec_...`)

#### 6. Configure Connect Settings
- Go to [https://dashboard.stripe.com/settings/connect](https://dashboard.stripe.com/settings/connect)
- Set payout schedule (recommended: **daily, 2-day rolling**)
- Customize the Connect onboarding appearance (add Molt Mart logo)

---

## Part 2: How It Works

### The Money Flow

```
Buyer pays $10.00 for a template
        │
        ▼
   ┌─────────┐
   │  Stripe  │  ← Stripe processes the payment
   └────┬────┘
        │
        ├── Stripe's fee:     -$0.59  (2.9% + $0.30)
        ├── Platform fee:     -$1.13  (12% of $10, after Stripe fee)
        │   (goes to Molt Mart)
        │
        ▼
   Seller receives:           $8.28
   (deposited to their bank account)
```

> **Note:** The exact split depends on how you configure the commission. More details in [Part 8](#part-8-costs).

### Three Stripe Products Working Together

| Product | What It Does | Analogy |
|---------|-------------|---------|
| **Stripe Connect** | Lets sellers sign up and receive money | Like giving each seller their own cash register |
| **Stripe Checkout** | The payment page buyers see | Like a checkout counter at a store |
| **Webhooks** | Stripe tells Molt Mart "payment succeeded!" | Like a receipt notification |

### Why Express Connect?

Stripe Connect has two modes for connected accounts:

| | **Express** ✅ Recommended | **Standard** |
|---|---|---|
| Onboarding | Stripe-hosted, simple form | Seller needs full Stripe account |
| Dashboard | Simplified, embedded in your site | Full Stripe dashboard |
| Control | You control payouts & branding | Seller controls everything |
| Effort | Less work for you | More work for sellers |
| Best for | Marketplaces like Molt Mart | Platforms where sellers are businesses |

**Express is the way to go** — sellers fill out a quick form (name, bank account, ID verification) and they're done. They don't need to understand Stripe.

---

## Part 3: Seller Experience

### What Sellers Will See

#### 1. "Set Up Payments" Button
On their seller dashboard, there's a button to connect their bank account:

```
┌──────────────────────────────────────┐
│  💰 Start Receiving Payments         │
│                                      │
│  Connect your bank account to get    │
│  paid when someone buys your         │
│  templates.                          │
│                                      │
│  [Set Up Payments →]                 │
└──────────────────────────────────────┘
```

#### 2. Stripe Connect Onboarding
Clicking the button redirects them to a Stripe-hosted page where they:
- Enter their legal name and address
- Provide bank account or debit card for payouts
- Verify their identity (photo ID)
- Accept terms of service

This takes ~5 minutes. Stripe handles all the compliance.

#### 3. After Setup
Back on Molt Mart, they see:
- ✅ Payments connected
- Payout schedule (e.g., "Daily, 2-day rolling")
- Earnings dashboard (already partially built!)

#### 4. Getting Paid
- Payouts happen automatically on the schedule you set
- Sellers can see their balance and payout history
- Stripe handles tax forms (1099s in the US)

---

## Part 4: Buyer Experience

### What Buyers Will See

#### 1. Template Page — Buy Button
For paid templates, the current "Download Free" button becomes:

```
┌────────────────────┐
│  🛒 Buy for $5.00  │
└────────────────────┘
```

Free templates still show "Download Free" (no change).

#### 2. Stripe Checkout Page
After clicking "Buy," the buyer goes to a Stripe-hosted checkout page:
- Pre-filled with template name and price
- Enter credit card, Apple Pay, or Google Pay
- Stripe handles all the security (PCI compliance)

#### 3. After Payment
- Redirected back to Molt Mart
- Template is now in their "Purchases" list
- Download button appears immediately
- They get an email receipt from Stripe

#### 4. Re-downloads
Already purchased? They see "Download Again" (this already works in the codebase).

---

## Part 5: Technical Implementation Plan

### What Currently Exists

Your codebase already has:
- ✅ `price_cents` on templates (schema + types)
- ✅ `purchases` table tracking who bought what
- ✅ Download button with `hasPurchased` logic
- ✅ Seller earnings dashboard with transaction tracking
- ✅ `SellerTransaction` type with `platform_fee_cents` and `seller_earnings_cents`
- ❌ No actual payment processing — purchases are recorded but no money changes hands

### Environment Variables to Add

Add these to `.env.local` (and Vercel environment settings):

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Database Changes

#### Add to `profiles` table:
```sql
ALTER TABLE public.profiles
  ADD COLUMN stripe_account_id TEXT,
  ADD COLUMN stripe_onboarding_complete BOOLEAN DEFAULT FALSE;
```

#### Add to `purchases` table:
```sql
ALTER TABLE public.purchases
  ADD COLUMN stripe_checkout_session_id TEXT,
  ADD COLUMN stripe_payment_intent_id TEXT,
  ADD COLUMN platform_fee_cents INTEGER DEFAULT 0,
  ADD COLUMN seller_earnings_cents INTEGER DEFAULT 0,
  ADD COLUMN status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded'));
```

### New API Routes

#### `POST /api/stripe/connect`
**Purpose:** Seller clicks "Set Up Payments" → creates a Stripe Express account and returns the onboarding URL.

```
Seller clicks button
  → API creates Stripe Express account
  → Saves stripe_account_id to profiles
  → Returns Stripe onboarding URL
  → Seller is redirected to Stripe
  → After completion, Stripe redirects back to Molt Mart
```

#### `POST /api/stripe/checkout`
**Purpose:** Buyer clicks "Buy" → creates a Stripe Checkout session.

```
Buyer clicks "Buy for $5.00"
  → API looks up template + seller's stripe_account_id
  → Creates Stripe Checkout Session with:
     - Price from template
     - application_fee_amount (platform commission)
     - transfer_data pointing to seller's Stripe account
  → Returns checkout URL
  → Buyer is redirected to Stripe Checkout
  → After payment, redirected back to Molt Mart
```

#### `POST /api/stripe/webhook`
**Purpose:** Stripe tells us when things happen.

Handles these events:
| Event | What We Do |
|-------|-----------|
| `checkout.session.completed` | Create purchase record, grant download access |
| `account.updated` | Update seller's `stripe_onboarding_complete` |

#### `GET /api/stripe/account-status`
**Purpose:** Check if the current seller has completed Stripe onboarding.

### New/Modified Components

| Component | Purpose |
|-----------|---------|
| `StripeConnectButton` | Seller dashboard — "Set Up Payments" button |
| `BuyButton` | Replaces `DownloadButton` for paid templates |
| `PaymentStatus` | Shows seller's Stripe connection status |

### Updated Flow for Template Page

```
if (template.price_cents === 0) {
  // Free template — show download button (no change)
  <DownloadButton />
} else if (hasPurchased) {
  // Already bought — show download button
  <DownloadButton />
} else {
  // Paid template, not purchased — show buy button
  <BuyButton price={template.price_cents} templateId={template.id} />
}
```

### NPM Packages

```bash
npm install stripe @stripe/stripe-js
```

- `stripe` — server-side SDK (API routes)
- `@stripe/stripe-js` — client-side SDK (redirecting to Checkout)

---

## Part 6: Testing

### Stripe Test Mode

Everything starts in **test mode** — no real money moves. Toggle test/live mode at the top of the Stripe Dashboard.

### Test Card Numbers

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | ✅ Successful payment |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0000 0000 3220` | 🔐 Requires 3D Secure |

Use any future expiry date and any 3-digit CVC.

### Testing Seller Onboarding

In test mode, Stripe provides pre-filled test data for Connect onboarding. Use:
- SSN: `000-00-0000`
- Any address, any phone number
- It will auto-approve

### Testing Webhooks Locally

Install the Stripe CLI:

```bash
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This gives you a temporary webhook secret for local testing.

### Testing Checklist

- [ ] Seller can click "Set Up Payments" and complete onboarding
- [ ] Seller shows as "Payments Connected" after onboarding
- [ ] Buyer can click "Buy" and see Stripe Checkout
- [ ] After payment, purchase is recorded in database
- [ ] Buyer can download template after purchase
- [ ] Seller sees the transaction in their earnings dashboard
- [ ] Webhook events are received and processed correctly
- [ ] Free templates still work without payment

---

## Part 7: Going Live Checklist

When you're ready to accept real money:

- [ ] **Switch API keys** — Replace `sk_test_` and `pk_test_` with `sk_live_` and `pk_live_` keys
- [ ] **Update webhook endpoint** — Add your production URL in Stripe Dashboard → Webhooks
- [ ] **Update webhook secret** — The live webhook has a different signing secret
- [ ] **Test with a real card** — Make a small real purchase ($1 template), then refund it
- [ ] **Verify seller payouts** — Have a test seller complete onboarding with a real bank account
- [ ] **Set payout schedule** — Dashboard → Connect → Settings → Payouts
- [ ] **Review Stripe's terms** — Make sure your use case complies
- [ ] **Add Stripe's required disclosures** — Terms of Service, Privacy Policy links
- [ ] **Enable Stripe Radar** — Fraud protection (enabled by default)
- [ ] **Set up email notifications** — For failed payments, disputes, etc.

---

## Part 8: Cost Breakdown

### Stripe's Fees

| Fee | Amount | Who Pays |
|-----|--------|----------|
| Standard processing | 2.9% + $0.30 per transaction | Deducted from payment |
| Connect fee (Express) | 0.25% + $0.25 per payout | Deducted from seller payout |

### Example: $10 Template (12% Platform Commission)

```
Buyer pays:                          $10.00

Stripe processing fee:               -$0.59  (2.9% × $10 + $0.30)
                                     ───────
Net after Stripe:                     $9.41

Platform commission (12% of $10):    -$1.20  → Goes to Molt Mart
                                     ───────
Seller receives:                      $8.21

Stripe Connect payout fee:           -$0.28  (0.25% × $8.21 + $0.25)
                                     ───────
Seller actually gets in bank:         $7.93
```

### More Examples

| Template Price | Stripe Fee | Platform Fee (12%) | Seller Gets* |
|---------------|-----------|-------------------|-------------|
| $1.00 | $0.33 | $0.12 | $0.30 |
| $5.00 | $0.45 | $0.60 | $3.70 |
| $10.00 | $0.59 | $1.20 | $7.93 |
| $25.00 | $1.03 | $3.00 | $20.69 |
| $50.00 | $1.75 | $6.00 | $41.97 |
| $100.00 | $3.20 | $12.00 | $84.52 |

*After Stripe processing fee, platform fee, and Connect payout fee.

### Key Takeaway

- **Very cheap templates ($1-2) aren't great** — Stripe's $0.30 fixed fee eats a huge percentage
- **$5+ templates work well** — fees become reasonable
- **Consider a minimum price of $3-5** for paid templates

### Platform Revenue

Molt Mart keeps the **platform commission** (12% in the example above). That's your revenue. Stripe fees are separate and come out of the total payment.

---

## Summary: What to Do Next

1. **Create a Stripe account** and enable Connect (30 min)
2. **Add the environment variables** to `.env.local` and Vercel
3. **Run the database migrations** (add Stripe columns)
4. **Build the 4 API routes** (connect, checkout, webhook, account-status)
5. **Update the template page** (buy button for paid templates)
6. **Test everything** in test mode
7. **Go live** 🚀

---

*Guide created Feb 2025 for Molt Mart. Stripe docs: [https://docs.stripe.com/connect](https://docs.stripe.com/connect)*
