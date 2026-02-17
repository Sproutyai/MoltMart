# Download Button Deep Diagnosis

## TL;DR — Root Cause

**The `record_affiliate_earning()` Postgres trigger on the `purchases` table references `NEW.seller_id`, but the `purchases` table has no `seller_id` column.** Every INSERT into `purchases` crashes the trigger, the purchase upsert fails, the admin-client fallback throws because `SUPABASE_SERVICE_ROLE_KEY` is undefined, and the entire route handler crashes with an uncaught exception.

---

## The Exact Code Path (Button Click → Error)

### Step 1: User clicks "Download Free"
**File:** `src/components/download-button.tsx` → `handleDownload()`

```tsx
setLoading(true)
try {
  const res = await fetch(`/api/templates/${templateId}/download`, { method: "POST" })
  if (!res.ok) {
    const data = await res.json()   // ← THIS THROWS when body is HTML (500 error page)
    toast.error(data.error || "Download failed")
    return
  }
  window.location.href = `/api/templates/${templateId}/download`
  toast.success("Download started!")
} catch {
  toast.error("Something went wrong")   // ← USER SEES THIS
}
```

### Step 2: POST hits the API route
**File:** `src/app/api/templates/[id]/download/route.ts`

The route handler runs through:
1. ✅ `createClient()` — server Supabase client created with cookies
2. ✅ `supabase.auth.getUser()` — user is authenticated
3. ✅ Template query — returns template with seller join
4. 💥 **Purchase upsert — FAILS**

### Step 3: Purchase upsert triggers the broken function

```ts
const { error: purchaseError } = await supabase.from("purchases").upsert(
  { buyer_id: user.id, template_id: id, price_cents: 0 },
  { onConflict: "buyer_id,template_id" }
)
```

Supabase translates this to:
```sql
INSERT INTO purchases (buyer_id, template_id, price_cents)
VALUES (...) ON CONFLICT (buyer_id, template_id) DO UPDATE SET price_cents = 0
```

The **AFTER INSERT trigger** `on_purchase_check_affiliate` fires, calling `record_affiliate_earning()`:

```sql
-- This line in the trigger function:
AND v_affiliate.user_id != NEW.seller_id
--                         ^^^^^^^^^^^^^^
-- 💥 purchases table has NO seller_id column!
```

**Postgres error:** `record "new" has no field "seller_id"`

The upsert returns `purchaseError` (truthy).

### Step 4: Admin client fallback THROWS

```ts
if (purchaseError) {
  console.error("Purchase upsert failed (RLS client):", purchaseError.message)
  const admin = createAdminClient()   // ← THROWS HERE
```

**File:** `src/lib/supabase/admin.ts`
```ts
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!   // ← undefined! Not in .env.local
  )
}
```

`createClient(url, undefined)` throws: **`Error: supabaseKey is required.`**

This throw is **NOT caught** — there's no try/catch around the admin fallback block in the route handler.

### Step 5: Route handler crashes → 500 HTML response

Next.js catches the unhandled exception and returns a **500 error page (HTML, not JSON)**.

### Step 6: Download button catch block fires

Back in `download-button.tsx`:
```ts
if (!res.ok) {                    // true (status 500)
  const data = await res.json()   // 💥 THROWS — response body is HTML, not JSON
  ...
}
```

The `.json()` parse error is caught by the outer catch:
```ts
} catch {
  toast.error("Something went wrong")   // ← THIS IS WHAT THE USER SEES
}
```

---

## Evidence (Confirmed via Database Queries)

### 1. The broken trigger exists
```
Trigger: on_purchase_check_affiliate | Event: INSERT | Timing: AFTER
Action: EXECUTE FUNCTION record_affiliate_earning()
```

The function body references `NEW.seller_id` but the purchases table columns are:
`id, buyer_id, template_id, price_cents, created_at, status, stripe_payment_intent_id, platform_fee_cents, seller_earnings_cents`

**No `seller_id` column.**

### 2. Zero purchases in the database
```sql
SELECT count(*) FROM purchases;  -- 0
```
No purchase has EVER succeeded. The trigger has blocked every insert.

### 3. Direct SQL INSERT confirms the error
```sql
INSERT INTO purchases (buyer_id, template_id, price_cents)
VALUES ('35dcf184-...', '636f71f1-...', 0)
ON CONFLICT (buyer_id, template_id) DO UPDATE SET price_cents = 0;

-- ERROR: record "new" has no field "seller_id"
```

### 4. `SUPABASE_SERVICE_ROLE_KEY` is missing from `.env.local`
Only these env vars are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

### 5. `createClient(url, undefined)` throws
```
Error: supabaseKey is required.
```

### 6. Storage files DO exist (not the issue)
```
templates/2f04a9fa-.../deep-work-mode.zip    ✓
templates/2f04a9fa-.../invoice-hound.zip     ✓
templates/2f04a9fa-.../second-brain.zip      ✓
```

### 7. Storage RLS allows authenticated downloads
```sql
-- Policy: templates_storage_select
USING: (bucket_id = 'templates' AND auth.role() = 'authenticated')
```

---

## The Three Bugs (in order of severity)

### Bug 1 (PRIMARY): Broken trigger function
**File:** Database trigger `record_affiliate_earning()`
**Line:** `AND v_affiliate.user_id != NEW.seller_id`
**Problem:** `purchases` has no `seller_id` column → every INSERT fails

**Fix:**
```sql
CREATE OR REPLACE FUNCTION record_affiliate_earning()
RETURNS trigger AS $$
declare
  v_affiliate record;
  v_commission integer;
  v_seller_id uuid;
begin
  -- Look up seller_id from the template, since purchases doesn't have it
  SELECT seller_id INTO v_seller_id
  FROM public.templates
  WHERE id = NEW.template_id;

  select a.id, a.commission_rate, a.user_id
  into v_affiliate
  from public.referrals r
  join public.affiliates a on a.id = r.affiliate_id
  where r.referred_user_id = NEW.buyer_id
    and a.status = 'active'
  limit 1;

  if v_affiliate.id is not null
    and NEW.price_cents > 0
    and v_affiliate.user_id != v_seller_id      -- ← fixed reference
  then
    v_commission := (NEW.price_cents * v_affiliate.commission_rate) / 1000;

    insert into public.affiliate_earnings
      (affiliate_id, purchase_id, referred_user_id, sale_amount_cents, commission_rate, commission_cents)
    values
      (v_affiliate.id, NEW.id, NEW.buyer_id, NEW.price_cents, v_affiliate.commission_rate, v_commission);

    update public.affiliates
    set total_earnings_cents = total_earnings_cents + v_commission,
        total_sales = total_sales + 1
    where id = v_affiliate.id;
  end if;

  return NEW;
end;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Bug 2 (SECONDARY): Missing `SUPABASE_SERVICE_ROLE_KEY`
**File:** `.env.local` (and likely Vercel env vars too)
**Problem:** `createAdminClient()` throws when the key is undefined

**Fix (code-level):** Wrap the admin fallback in try/catch in `route.ts`:
```ts
if (purchaseError) {
  console.error("Purchase upsert failed (RLS client):", purchaseError.message, purchaseError.code)
  try {
    const admin = createAdminClient()
    const { error: adminError } = await admin.from("purchases").upsert(...)
    if (adminError) {
      console.error("Purchase upsert failed (admin client):", adminError.message)
    }
  } catch (e) {
    console.error("Admin client unavailable:", e)
  }
}
```

**Fix (env-level):** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` and Vercel environment variables.

### Bug 3 (DEFENSIVE): No top-level try/catch in route handler
**File:** `src/app/api/templates/[id]/download/route.ts`
**Problem:** Any uncaught throw returns 500 HTML, which `res.json()` in the button component can't parse

**Fix:** Wrap the POST handler body in try/catch:
```ts
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ... existing code ...
  } catch (error) {
    console.error("Download route error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
```

---

## Why Previous Fix Attempts Failed

The previous fixes addressed:
1. ✅ Switching from `window.open(signedUrl)` to `window.location.href` (solved browser popup blocking)
2. ✅ Adding preview_data fallback for when storage files don't exist (good idea but storage files actually DO exist)
3. ✅ Adding admin client fallback for RLS-blocked purchase upserts (correct instinct but `SUPABASE_SERVICE_ROLE_KEY` is undefined)

None of them addressed the **real cause**: the `record_affiliate_earning()` trigger crashing because `purchases.seller_id` doesn't exist. This is a database-level bug that can't be fixed by changing application code alone — the trigger must be fixed in Postgres.

---

## Minimum Fix to Unblock Downloads

Apply this single SQL statement to fix the trigger:

```sql
CREATE OR REPLACE FUNCTION record_affiliate_earning()
RETURNS trigger AS $$
declare
  v_affiliate record;
  v_commission integer;
  v_seller_id uuid;
begin
  SELECT seller_id INTO v_seller_id FROM public.templates WHERE id = NEW.template_id;

  select a.id, a.commission_rate, a.user_id
  into v_affiliate
  from public.referrals r
  join public.affiliates a on a.id = r.affiliate_id
  where r.referred_user_id = NEW.buyer_id
    and a.status = 'active'
  limit 1;

  if v_affiliate.id is not null
    and NEW.price_cents > 0
    and v_affiliate.user_id != v_seller_id
  then
    v_commission := (NEW.price_cents * v_affiliate.commission_rate) / 1000;

    insert into public.affiliate_earnings
      (affiliate_id, purchase_id, referred_user_id, sale_amount_cents, commission_rate, commission_cents)
    values
      (v_affiliate.id, NEW.id, NEW.buyer_id, NEW.price_cents, v_affiliate.commission_rate, v_commission);

    update public.affiliates
    set total_earnings_cents = total_earnings_cents + v_commission,
        total_sales = total_sales + 1
    where id = v_affiliate.id;
  end if;

  return NEW;
end;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Then also wrap the admin client fallback in a try/catch (Bug 2 fix) and add a top-level try/catch to the route handler (Bug 3 fix) for robustness.
