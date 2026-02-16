CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id),
  promoted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  amount_paid_cents INTEGER NOT NULL DEFAULT 2500,
  stripe_session_id TEXT,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS promotions_template_id_idx ON promotions(template_id);
CREATE INDEX IF NOT EXISTS promotions_promoted_at_idx ON promotions(promoted_at DESC);
CREATE INDEX IF NOT EXISTS promotions_seller_id_idx ON promotions(seller_id);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read' AND tablename = 'promotions') THEN
    CREATE POLICY "Public read" ON promotions FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Seller insert' AND tablename = 'promotions') THEN
    CREATE POLICY "Seller insert" ON promotions FOR INSERT WITH CHECK (seller_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Seller update' AND tablename = 'promotions') THEN
    CREATE POLICY "Seller update" ON promotions FOR UPDATE USING (seller_id = auth.uid());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION increment_promotion_stat(p_template_id UUID, p_field TEXT)
RETURNS void AS $$
BEGIN
  IF p_field = 'impressions' THEN
    UPDATE promotions SET impressions = impressions + 1 WHERE template_id = p_template_id;
  ELSIF p_field = 'clicks' THEN
    UPDATE promotions SET clicks = clicks + 1 WHERE template_id = p_template_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
