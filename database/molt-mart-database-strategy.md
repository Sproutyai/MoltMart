# Molt Mart MVP - Minimal Database Setup Strategy

## Overview
This strategy focuses on the 3 essential tables needed for basic marketplace functionality:
1. **Users** - User registration and profiles
2. **Products** - Product listings by sellers
3. **Orders** - Purchase transactions

## Core User Flows Covered
- ✅ User registration/login
- ✅ Product listing by sellers  
- ✅ Product browsing by buyers
- ✅ Basic purchase/order creation
- ✅ Order tracking

## Database Schema

### 1. Users Table
Handles user registration, authentication, and basic profile info.

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
```

### 2. Products Table  
Handles product listings, pricing, and basic inventory.

```sql
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

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (auth.uid() = seller_id);
```

### 3. Orders Table
Handles purchase transactions and order tracking.

```sql
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

-- Enable RLS  
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers can update order status" ON orders FOR UPDATE USING (auth.uid() = seller_id);
```

## Execution Steps in Supabase Dashboard

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy and paste each CREATE TABLE statement** one at a time
3. **Execute each statement** by clicking "Run"
4. **Verify tables** are created in the Table Editor

## What This Enables

### Immediate Functionality:
- User signup/login (via Supabase Auth + users table)
- Product creation and listing
- Basic product search/browse
- Order placement and tracking
- Basic seller dashboard (their products + orders)
- Basic buyer dashboard (their orders)

### Missing (Can Add Later):
- Payment processing integration
- Reviews/ratings system  
- Advanced search/filtering
- Messaging between users
- Shipping/logistics tracking
- Admin panel

## Next Steps After Setup
1. Set up Supabase Auth policies
2. Test user registration flow
3. Test product creation
4. Test order placement
5. Build basic frontend interfaces for these flows

## Notes
- Uses Supabase's built-in auth system (auth.uid())
- Row Level Security (RLS) enabled for data protection
- UUID primary keys for better scalability
- Basic constraints to ensure data integrity
- Designed for manual execution in Supabase dashboard