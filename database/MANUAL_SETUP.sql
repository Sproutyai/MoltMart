-- Molt Mart MVP - Manual Database Setup
-- Execute these statements one by one in Supabase SQL Editor

-- 1. USERS TABLE (User registration and profiles)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- 2. PRODUCTS TABLE (Product listings by sellers)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  image_url VARCHAR(500),
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (auth.uid() = seller_id);

-- 3. ORDERS TABLE (Purchase transactions and tracking)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  buyer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers can update order status" ON orders FOR UPDATE USING (auth.uid() = seller_id);

-- Create indexes for performance
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);

-- EXECUTION INSTRUCTIONS:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste each CREATE TABLE statement individually
-- 4. Execute each statement by clicking "Run"
-- 5. Verify tables are created in the Table Editor
-- 6. Test with /api/test endpoint

-- This setup enables:
-- ✅ User registration via Supabase Auth
-- ✅ Product listing by sellers
-- ✅ Product browsing by buyers  
-- ✅ Order placement and tracking
-- ✅ Row Level Security protection