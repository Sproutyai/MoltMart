// Sample data seeder for testing the buyer dashboard
// Run this script to populate the database with test data

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample data
const sampleUsers = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'buyer1@example.com',
    name: 'Alice Johnson',
    user_type: 'buyer',
    bio: 'AI enthusiast looking for productivity tools',
    twitter_handle: 'alice_ai',
    github_handle: 'alicejohnson'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'seller1@example.com',
    name: 'Bob Smith',
    user_type: 'seller',
    bio: 'Creator of AI automation tools',
    website_url: 'https://bobsmith.dev',
    github_handle: 'bobsmith'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'both1@example.com',
    name: 'Carol Davis',
    user_type: 'both',
    bio: 'AI developer and avid tool collector',
    twitter_handle: 'caroldavis',
    website_url: 'https://caroldavis.com'
  }
];

const sampleProducts = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    seller_id: '00000000-0000-0000-0000-000000000002',
    title: 'Email Automation Assistant',
    description: 'Intelligent email categorization and response automation using GPT-4. Handles 90% of common customer inquiries automatically.',
    category: 'Productivity Tools',
    price: 29.99,
    status: 'approved',
    image_urls: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400'],
    tags: ['email', 'automation', 'gpt-4', 'productivity'],
    file_url: 'https://example.com/downloads/email-assistant.zip',
    demo_url: 'https://demo.email-assistant.com',
    average_rating: 4.8,
    review_count: 24,
    downloads: 156
  },
  {
    id: '11111111-1111-1111-1111-111111111112',
    seller_id: '00000000-0000-0000-0000-000000000002',
    title: 'Social Media Content Generator',
    description: 'AI-powered content creation for all major social platforms. Includes hashtag optimization and scheduling integration.',
    category: 'Content Creation',
    price: 39.99,
    status: 'approved',
    image_urls: ['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400'],
    tags: ['social-media', 'content', 'ai', 'marketing'],
    file_url: 'https://example.com/downloads/social-generator.zip',
    demo_url: 'https://demo.social-generator.com',
    average_rating: 4.6,
    review_count: 18,
    downloads: 89
  },
  {
    id: '11111111-1111-1111-1111-111111111113',
    seller_id: '00000000-0000-0000-0000-000000000003',
    title: 'Code Documentation AI',
    description: 'Automatically generate comprehensive documentation for your codebase using advanced AI analysis.',
    category: 'Developer Tools',
    price: 49.99,
    status: 'approved',
    image_urls: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400'],
    tags: ['documentation', 'code', 'ai', 'development'],
    file_url: 'https://example.com/downloads/code-docs-ai.zip',
    demo_url: 'https://demo.code-docs.com',
    average_rating: 4.9,
    review_count: 31,
    downloads: 203
  },
  {
    id: '11111111-1111-1111-1111-111111111114',
    seller_id: '00000000-0000-0000-0000-000000000003',
    title: 'Meeting Transcript Analyzer',
    description: 'Transform meeting recordings into actionable insights, summaries, and task lists automatically.',
    category: 'Productivity Tools',
    price: 34.99,
    status: 'approved',
    image_urls: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'],
    tags: ['meetings', 'transcription', 'analysis', 'productivity'],
    file_url: 'https://example.com/downloads/meeting-analyzer.zip',
    average_rating: 4.7,
    review_count: 15,
    downloads: 67
  },
  {
    id: '11111111-1111-1111-1111-111111111115',
    seller_id: '00000000-0000-0000-0000-000000000002',
    title: 'Data Visualization Dashboard Kit',
    description: 'Pre-built dashboard components with AI-powered data insights and customizable visualizations.',
    category: 'Data Analysis',
    price: 59.99,
    status: 'approved',
    image_urls: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'],
    tags: ['dashboard', 'visualization', 'data', 'analytics'],
    file_url: 'https://example.com/downloads/viz-dashboard.zip',
    demo_url: 'https://demo.viz-dashboard.com',
    average_rating: 4.5,
    review_count: 12,
    downloads: 45
  }
];

const samplePurchases = [
  {
    id: '22222222-2222-2222-2222-222222222221',
    buyer_id: '00000000-0000-0000-0000-000000000001',
    seller_id: '00000000-0000-0000-0000-000000000002',
    product_id: '11111111-1111-1111-1111-111111111111',
    amount: 29.99,
    status: 'completed',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    delivered_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    buyer_id: '00000000-0000-0000-0000-000000000001',
    seller_id: '00000000-0000-0000-0000-000000000003',
    product_id: '11111111-1111-1111-1111-111111111113',
    amount: 49.99,
    status: 'completed',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    delivered_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222223',
    buyer_id: '00000000-0000-0000-0000-000000000001',
    seller_id: '00000000-0000-0000-0000-000000000003',
    product_id: '11111111-1111-1111-1111-111111111114',
    amount: 34.99,
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    estimated_delivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // tomorrow
  },
  {
    id: '22222222-2222-2222-2222-222222222224',
    buyer_id: '00000000-0000-0000-0000-000000000001',
    seller_id: '00000000-0000-0000-0000-000000000002',
    product_id: '11111111-1111-1111-1111-111111111112',
    amount: 39.99,
    status: 'failed',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  }
];

const sampleWishlists = [
  {
    buyer_id: '00000000-0000-0000-0000-000000000001',
    product_id: '11111111-1111-1111-1111-111111111115',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    buyer_id: '00000000-0000-0000-0000-000000000001',
    product_id: '11111111-1111-1111-1111-111111111112',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

async function seedData() {
  console.log('🌱 Starting to seed buyer dashboard test data...\n');

  try {
    // 1. Insert sample users (profiles)
    console.log('👥 Inserting sample users...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .insert(sampleUsers)
      .select();
    
    if (usersError) {
      console.error('Error inserting users:', usersError);
      // Continue anyway, users might already exist
    } else {
      console.log(`✅ Inserted ${users.length} users`);
    }

    // 2. Insert sample products
    console.log('\n📦 Inserting sample products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert(sampleProducts)
      .select();
    
    if (productsError) {
      console.error('Error inserting products:', productsError);
      return;
    }
    console.log(`✅ Inserted ${products.length} products`);

    // 3. Insert sample purchases
    console.log('\n🛒 Inserting sample purchases...');
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .insert(samplePurchases)
      .select();
    
    if (purchasesError) {
      console.error('Error inserting purchases:', purchasesError);
      return;
    }
    console.log(`✅ Inserted ${purchases.length} purchases`);

    // 4. Insert wishlist items
    console.log('\n❤️ Inserting wishlist items...');
    const { data: wishlists, error: wishlistsError } = await supabase
      .from('wishlists')
      .insert(sampleWishlists)
      .select();
    
    if (wishlistsError) {
      console.error('Error inserting wishlists:', wishlistsError);
      return;
    }
    console.log(`✅ Inserted ${wishlists.length} wishlist items`);

    console.log('\n🎉 Sample data seeded successfully!');
    console.log('\n📋 Test Data Summary:');
    console.log(`   • Users: ${sampleUsers.length} (1 buyer, 1 seller, 1 both)`);
    console.log(`   • Products: ${sampleProducts.length} across multiple categories`);
    console.log(`   • Purchase History: ${samplePurchases.length} orders (various statuses)`);
    console.log(`   • Wishlist Items: ${sampleWishlists.length} saved products`);
    
    console.log('\n🔐 Test Login Credentials:');
    console.log('   Buyer Account: buyer1@example.com');
    console.log('   Seller Account: seller1@example.com');
    console.log('   Both Account: both1@example.com');
    
    console.log('\n🎯 Test Scenarios Available:');
    console.log('   • View purchase history with different order statuses');
    console.log('   • Test wishlist add/remove functionality');
    console.log('   • Check personalized recommendations');
    console.log('   • Update profile information');
    console.log('   • Track order progress');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

// Run the seeder
if (require.main === module) {
  seedData().then(() => {
    console.log('\n✨ Seeding complete! You can now test the buyer dashboard.');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = { seedData };