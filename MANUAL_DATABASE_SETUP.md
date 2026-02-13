# 🔧 SUPABASE DATABASE MANUAL SETUP
*Fix "unhealthy" database status by creating tables*

## 📋 ISSUE SUMMARY
- **Problem**: Supabase dashboard shows database as "unhealthy"
- **Cause**: No tables created yet (empty database)
- **Solution**: Execute SQL commands in Supabase SQL Editor

---

## 🛠️ STEP-BY-STEP FIX

### 1. Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select the **Molt Mart project** (pixasvjwrjvuorqqrpti)
4. Click **"SQL Editor"** in the left sidebar

### 2. Execute These SQL Commands
Copy and paste **each section below** into the SQL Editor and click **"Run"** after each one:

---

#### 📋 **STEP 1: Create Users Table**
```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  wallet_address VARCHAR(42),
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 📦 **STEP 2: Create Products Table**
```sql
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  currency VARCHAR(10) DEFAULT 'USD',
  image_url VARCHAR(500),
  category VARCHAR(100),
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 🛒 **STEP 3: Create Orders Table**
```sql
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method VARCHAR(20) DEFAULT 'stripe',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'completed')),
  buyer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### ⚡ **STEP 4: Create Performance Indexes**
```sql
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
```

#### 🔒 **STEP 5: Enable Row Level Security**
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
```

#### 🛡️ **STEP 6: Create Security Policies**
```sql
-- Users policies
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- Products policies  
CREATE POLICY IF NOT EXISTS "Anyone can view active products" 
ON public.products FOR SELECT 
USING (status = 'active');

CREATE POLICY IF NOT EXISTS "Sellers can manage own products" 
ON public.products FOR ALL 
USING (auth.uid() = seller_id);

-- Orders policies
CREATE POLICY IF NOT EXISTS "Users can view own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY IF NOT EXISTS "Buyers can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);
```

#### 📝 **STEP 7: Insert Sample Data**
```sql
-- Demo user
INSERT INTO public.users (id, email, username, full_name)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'demo@moltmart.com', 'demo', 'Demo User')
ON CONFLICT (id) DO NOTHING;

-- Demo product
INSERT INTO public.products (seller_id, title, description, price, category, status)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'GPT-4 Priority Access', 'Skip OpenAI rate limits with dedicated API access', 199.99, 'Premium API Access', 'active')
ON CONFLICT DO NOTHING;
```

---

## ✅ VERIFICATION STEPS

### After Running All SQL Commands:

1. **Check Tables**: Go to **"Table Editor"** tab - you should see:
   - ✅ `users` table
   - ✅ `products` table  
   - ✅ `orders` table

2. **Check Health**: Database status should change from "unhealthy" to **"healthy"** ✅

3. **Test Data**: In Table Editor, you should see:
   - 1 demo user in `users` table
   - 1 demo product in `products` table

4. **Test API**: Try this API endpoint:
   ```
   https://molt-mart-ioajk3gaq-sproutys-projects.vercel.app/api/health
   ```

---

## 🎯 EXPECTED RESULT
- ✅ **Database Status**: Healthy
- ✅ **Tables Created**: 3 tables with proper relationships
- ✅ **Security**: Row Level Security enabled
- ✅ **Sample Data**: Demo records inserted
- ✅ **API Access**: Database queries will work

---

## 🆘 IF YOU NEED HELP
- **Can't access Supabase?** Send me your login details
- **SQL errors?** Copy/paste the exact error message
- **Still unhealthy?** Check if all tables appear in Table Editor

The database will be fully functional once these steps are complete!