/**
 * Automated Database Setup for Molt Mart
 * Creates tables using Supabase service role
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pixasvjwrjvuorqqrpti.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeGFzdmp3cmp2dW9ycXFycHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1ODUwMywiZXhwIjoyMDg2NTM0NTAzfQ.G5g0iA7TGVAXmSv2rvP1CneatGCgcx8w6EMfDGhQhN0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🔧 Setting up Molt Mart database...');

  try {
    // Create simplified tables without auth constraints for now
    console.log('Creating users table...');
    await supabase.rpc('exec_sql', { sql: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `});

    console.log('Creating products table...');
    await supabase.rpc('exec_sql', { sql: `
      CREATE TABLE IF NOT EXISTS products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL CHECK (price > 0),
        image_url VARCHAR(500),
        category VARCHAR(100),
        tags TEXT[],
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `});

    console.log('Creating orders table...');
    await supabase.rpc('exec_sql', { sql: `
      CREATE TABLE IF NOT EXISTS orders (
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
    `});

    console.log('Creating indexes...');
    await supabase.rpc('exec_sql', { sql: `
      CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
      CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
      CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
    `});

    console.log('✅ Database setup complete!');
    return true;

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('\n💡 Manual setup required:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Execute the SQL from /database/MANUAL_SETUP.sql');
    console.log('3. Then run seed-real-services.js');
    return false;
  }
}

module.exports = { setupDatabase };

if (require.main === module) {
  setupDatabase().then(() => {
    process.exit(0);
  });
}