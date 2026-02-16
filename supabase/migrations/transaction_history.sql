-- Add transaction tracking columns to purchases
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'refunded')),
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS platform_fee_cents integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seller_earnings_cents integer DEFAULT 0;

-- Backfill existing purchases
UPDATE public.purchases
SET platform_fee_cents = ROUND(price_cents * 0.15),
    seller_earnings_cents = price_cents - ROUND(price_cents * 0.15)
WHERE seller_earnings_cents = 0 AND price_cents > 0;
