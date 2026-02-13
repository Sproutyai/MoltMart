/**
 * Create Database Tables for Molt Mart
 * This script will create the necessary tables in Supabase
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pixasvjwrjvuorqqrpti.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeGFzdmp3cmp2dW9ycXFycHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1ODUwMywiZXhwIjoyMDg2NTM0NTAzfQ.G5g0iA7TGVAXmSv2rvP1CneatGCgcx8w6EMfDGhQhN0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🔧 Creating Molt Mart database tables...');

  try {
    // Create users table
    console.log('Creating users table...');
    const { error: usersError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS users (
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
      `
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('✅ Users table created successfully');
    }

    // Create products table
    console.log('Creating products table...');
    const { error: productsError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
      `
    });

    if (productsError) {
      console.error('Error creating products table:', productsError);
    } else {
      console.log('✅ Products table created successfully');
    }

    // Create orders table
    console.log('Creating orders table...');
    const { error: ordersError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS orders (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id) ON DELETE CASCADE,
          seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
      `
    });

    if (ordersError) {
      console.error('Error creating orders table:', ordersError);
    } else {
      console.log('✅ Orders table created successfully');
    }

    // Create indexes
    console.log('Creating indexes...');
    const { error: indexError } = await supabase.rpc('sql', {
      query: `
        CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
        CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
        CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
        CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      `
    });

    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }

    console.log('\n🎉 Database setup complete!');
    console.log('Tables created: users, products, orders');
    console.log('Indexes created for optimal performance');
    console.log('Database should now show as healthy in Supabase dashboard');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

// Test database connection
async function testConnection() {
  console.log('\n🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count()', { count: 'exact', head: true });

    if (error && error.code === 'PGRST116') {
      console.log('⚠️ Users table not found - needs to be created');
      return false;
    } else if (error) {
      console.error('Connection error:', error);
      return false;
    } else {
      console.log('✅ Database connection successful');
      console.log(`Users table exists with ${data?.length || 0} records`);
      return true;
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🌱 Molt Mart Database Setup');
  console.log('============================\n');

  // Test connection first
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.log('\n📊 Creating database schema...');
    await createTables();
    
    // Test again after creation
    await testConnection();
  } else {
    console.log('\n✅ Database is already set up and healthy!');
  }

  console.log('\n🔗 Next steps:');
  console.log('1. Check Supabase dashboard - should now show as healthy');
  console.log('2. Seed with sample data if needed');
  console.log('3. Test API endpoints that use the database');
}

if (require.main === module) {
  main();
}

module.exports = { createTables, testConnection };