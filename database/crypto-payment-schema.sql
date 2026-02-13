-- Crypto Payment Schema Extensions for Molt Mart
-- Adds crypto payment capabilities for autonomous AI agents

-- Add crypto wallet support to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT 'USDC';

-- Update orders table for crypto payments
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'stripe';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_wallet VARCHAR(42);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_tx_hash VARCHAR(66);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payout_tx_hash VARCHAR(66);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Update order status enum to include crypto payment states
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN (
    'pending', 
    'pending_payment',
    'payment_verified', 
    'payout_pending',
    'confirmed', 
    'shipped', 
    'delivered', 
    'completed',
    'cancelled',
    'failed'
  ));

-- Create crypto_transactions table for detailed payment tracking
CREATE TABLE IF NOT EXISTS crypto_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  tx_hash VARCHAR(66) UNIQUE NOT NULL,
  tx_type VARCHAR(20) CHECK (tx_type IN ('payment', 'payout')) NOT NULL,
  from_address VARCHAR(42) NOT NULL,
  to_address VARCHAR(42) NOT NULL,
  amount DECIMAL(18,6) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  block_number BIGINT,
  gas_used BIGINT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platform_revenue table for commission tracking
CREATE TABLE IF NOT EXISTS platform_revenue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  fee_amount DECIMAL(10,2) NOT NULL,
  fee_percentage DECIMAL(5,4) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_currency ON orders(currency);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_wallet ON orders(buyer_wallet);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_tx_hash ON crypto_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_order_id ON crypto_transactions(order_id);

-- Create view for agent-accessible order data
CREATE OR REPLACE VIEW agent_orders AS
SELECT 
  o.id,
  o.buyer_wallet,
  o.total_amount,
  o.currency,
  o.payment_method,
  o.status,
  o.payment_tx_hash,
  o.payout_tx_hash,
  o.created_at,
  o.completed_at,
  p.title as product_title,
  p.category as product_category,
  u.full_name as seller_name,
  u.wallet_address as seller_wallet
FROM orders o
JOIN products p ON o.product_id = p.id
JOIN users u ON o.seller_id = u.id
WHERE o.payment_method = 'crypto';

-- RLS policies for crypto payments
CREATE POLICY IF NOT EXISTS "Users can view own crypto orders" 
ON orders FOR SELECT 
USING (buyer_wallet = current_setting('request.jwt.claims.wallet', true));

CREATE POLICY IF NOT EXISTS "Platform can manage all crypto transactions" 
ON crypto_transactions FOR ALL 
USING (true); -- Platform service role has full access

-- Function to calculate platform revenue
CREATE OR REPLACE FUNCTION calculate_platform_revenue()
RETURNS TABLE(
  total_volume DECIMAL,
  total_fees DECIMAL,
  currency VARCHAR,
  period_start TIMESTAMP,
  period_end TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(o.total_amount) as total_volume,
    SUM(o.platform_fee) as total_fees,
    o.currency,
    DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP as period_start,
    CURRENT_TIMESTAMP as period_end
  FROM orders o
  WHERE o.payment_method = 'crypto'
    AND o.status = 'completed'
    AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY o.currency;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (seller with crypto wallet)
INSERT INTO users (id, email, username, full_name, wallet_address, preferred_currency) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'cryptoseller@example.com',
  'cryptoseller',
  'Crypto Service Provider',
  '0x742d35Cc6634C0532925a3b8D091d21F3E7b3D4c',
  'USDC'
) ON CONFLICT (id) DO UPDATE SET
  wallet_address = EXCLUDED.wallet_address,
  preferred_currency = EXCLUDED.preferred_currency;

-- EXECUTION INSTRUCTIONS:
-- 1. Run this in Supabase SQL Editor
-- 2. Verify new columns exist in tables
-- 3. Test with crypto payment API endpoints
-- 4. Check platform revenue calculations

COMMENT ON TABLE crypto_transactions IS 'Detailed tracking of all crypto payment transactions';
COMMENT ON TABLE platform_revenue IS 'Commission and fee tracking for marketplace revenue';
COMMENT ON VIEW agent_orders IS 'AI agent accessible order data without sensitive user info';