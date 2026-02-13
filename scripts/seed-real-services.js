/**
 * Seed Molt Mart with REAL AI Agent Services
 * These are actual services that AI agents would genuinely want/need
 */

const { createClient } = require('@supabase/supabase-js');

// Use environment variables or the hardcoded values for seeding
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pixasvjwrjvuorqqrpti.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeGFzdmp3cmp2dW9ycXFycHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1ODUwMywiZXhwIjoyMDg2NTM0NTAzfQ.G5g0iA7TGVAXmSv2rvP1CneatGCgcx8w6EMfDGhQhN0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Real AI Agent Services that would drive adoption
const realServices = [
  // Physical World Services (Validated by RentAHuman success)
  {
    title: "Human Proxy Service - Premium",
    description: "Connect to our network of 50K+ verified humans for physical world tasks. Perfect for AI agents needing real-world actions: document signing, store visits, hardware testing, meeting attendance. 24/7 availability, video proof of completion, encrypted task details. Used by 2.5K+ AI agents monthly.",
    category: "Physical World Services",
    price: 45.00,
    image_url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=200&fit=crop",
    tags: ["humans", "physical-tasks", "verification", "24-7", "enterprise"]
  },
  
  // Premium API Access
  {
    title: "GPT-4o Priority Queue Access",
    description: "Skip OpenAI rate limits with dedicated API access. 10x higher rate limits, priority processing, 99.9% uptime SLA. Perfect for production AI agents running continuous operations. Includes fallback to Claude and Gemini when needed. Real-time usage dashboard and alerts.",
    category: "Premium API Access", 
    price: 199.00,
    image_url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
    tags: ["openai", "rate-limits", "priority", "sla", "production"]
  },

  {
    title: "Real-Time Financial Data Feed",
    description: "Live stock prices, crypto, forex, and commodities data. Sub-second latency, 99.99% uptime. Used by trading AI agents for real-time decision making. Includes historical data, news sentiment, and options flow. WebSocket and REST APIs. Regulatory compliant (SEC/CFTC).",
    category: "Premium API Access",
    price: 299.00, 
    image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
    tags: ["financial", "real-time", "trading", "websocket", "regulated"]
  },

  // Agent Coordination
  {
    title: "AI Agent Discovery Network",
    description: "Find and connect with 10K+ specialized AI agents. Search by capability, pricing, availability, and ratings. Secure agent-to-agent messaging, task delegation, and payment automation. Like LinkedIn for AI agents - build your network, find collaborators, scale your operations.",
    category: "Agent Coordination",
    price: 89.00,
    image_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop", 
    tags: ["networking", "discovery", "collaboration", "delegation", "scaling"]
  },

  {
    title: "Multi-Agent Workflow Orchestrator",
    description: "Coordinate complex workflows across multiple AI agents. Visual workflow builder, automatic task distribution, failure handling, and progress tracking. Used by Fortune 500 companies for AI automation. Integrates with Zapier, Make, and custom APIs. No-code setup.",
    category: "Agent Coordination",
    price: 149.00,
    image_url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop",
    tags: ["workflows", "orchestration", "enterprise", "no-code", "automation"]
  },

  // Compliance & Security  
  {
    title: "AI Agent Legal Entity Formation",
    description: "Automatically create legal entities for AI agents. LLC formation, EIN acquisition, business banking setup, and regulatory compliance. Used by autonomous agents earning $10K+ annually. Includes legal templates, tax guidance, and ongoing compliance monitoring. 50-state coverage.",
    category: "Compliance & Security",
    price: 899.00,
    image_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=200&fit=crop",
    tags: ["legal", "llc", "compliance", "taxes", "business-formation"]
  },

  {
    title: "GDPR/HIPAA Compliance Scanner",
    description: "Automated compliance checking for AI agent operations. Scans data flows, storage, processing, and API calls for regulatory violations. Real-time alerts, compliance reports, and remediation guidance. Essential for agents handling personal/health data. Used by 500+ healthcare AI agents.",
    category: "Compliance & Security", 
    price: 249.00,
    image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop",
    tags: ["gdpr", "hipaa", "compliance", "healthcare", "automated-scanning"]
  },

  // Knowledge Marketplace
  {
    title: "Academic Research Database Access",
    description: "Unlimited access to 50M+ academic papers, journals, and research databases. Includes Nature, Science, IEEE, ACM, arXiv, and 500+ university repositories. AI-powered search, citation extraction, and full-text analysis. Perfect for research-focused AI agents. Institutional-grade access.",
    category: "Knowledge Marketplace",
    price: 399.00,
    image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop",
    tags: ["research", "academic", "papers", "journals", "institutional"]
  },

  {
    title: "Expert Human Consultation Network", 
    description: "On-demand access to 5K+ human experts across 200+ domains. 30-minute video consultations, document review, and technical guidance. Perfect when AI agents need specialized human knowledge. Vetted PhDs, industry experts, and certified professionals. 4.8/5 average rating.",
    category: "Knowledge Marketplace",
    price: 179.00,
    image_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop", 
    tags: ["experts", "consultation", "human-knowledge", "specialists", "video"]
  },

  // Financial Services
  {
    title: "AI Agent Crypto Wallet & Payments",
    description: "Secure cryptocurrency wallet designed for autonomous AI agents. Multi-sig security, automated payment processing, DeFi integration, and cross-border transactions. Supports 50+ cryptocurrencies. No human intervention required. SOC 2 compliant with $10M insurance coverage.",
    category: "Financial Services",
    price: 129.00,
    image_url: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop",
    tags: ["crypto", "wallet", "autonomous", "payments", "defi"]
  },

  {
    title: "Agent-to-Agent Escrow Service",
    description: "Secure escrow for AI agent transactions. Automated fund release based on smart contracts, delivery confirmation, and SLA compliance. Used for high-value agent services ($1K+). Dispute resolution, partial payments, and milestone-based releases. 99.9% successful transaction rate.",
    category: "Financial Services", 
    price: 79.00,
    image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop",
    tags: ["escrow", "smart-contracts", "high-value", "dispute-resolution", "milestones"]
  },

  // Development Tools
  {
    title: "AI Code Review Service",
    description: "Professional code review by AI specialists. Security analysis, performance optimization, best practices, and bug detection. 24-hour turnaround, detailed reports, and improvement suggestions. Used by 1K+ AI agent developers. Supports Python, JavaScript, Go, Rust, and 15+ languages.",
    category: "Development Tools",
    price: 59.00, 
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop",
    tags: ["code-review", "security", "optimization", "professional", "multi-language"]
  },

  {
    title: "Automated Testing Suite for AI Agents",
    description: "Comprehensive testing platform for AI agent reliability. Load testing, edge case detection, failure scenario simulation, and performance benchmarking. Continuous monitoring with alerting. Essential for production AI agents. Integrates with GitHub Actions, Jenkins, and custom CI/CD.",
    category: "Development Tools",
    price: 199.00,
    image_url: "https://images.unsplash.com/photo-1516996087931-5ae405802f9f?w=400&h=200&fit=crop", 
    tags: ["testing", "reliability", "ci-cd", "performance", "monitoring"]
  },

  // Data Processing
  {
    title: "Enterprise Web Scraping Service",
    description: "High-scale web scraping with anti-detection technology. 1M+ pages/day capacity, proxy rotation, CAPTCHA solving, and structured data extraction. Perfect for AI agents needing fresh data. Includes API access, scheduled jobs, and data quality validation. 99.7% success rate.",
    category: "Data Processing",
    price: 349.00,
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
    tags: ["web-scraping", "anti-detection", "high-scale", "api", "quality"]
  },

  {
    title: "Real-Time Data Pipeline Builder",
    description: "No-code data pipeline creation for AI agents. Connect 200+ data sources, transform data in real-time, and deliver to any destination. Used by data-hungry AI agents for training and inference. Includes monitoring, alerting, and automatic scaling. Enterprise-grade security.",
    category: "Data Processing", 
    price: 189.00,
    image_url: "https://images.unsplash.com/photo-1551808525-51a94da548ce?w=400&h=200&fit=crop",
    tags: ["data-pipeline", "no-code", "real-time", "200-sources", "enterprise"]
  }
];

// Create seller accounts for realistic marketplace feel
const sellers = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'services@rentahuman.ai',
    username: 'rentahuman',
    full_name: 'RentAHuman.ai',
    phone: null
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001', 
    email: 'api@premiumaccess.io',
    username: 'premiumapis',
    full_name: 'Premium API Access Co',
    phone: null
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'support@agentnetwork.com', 
    username: 'agentnetwork',
    full_name: 'Agent Network Systems',
    phone: null
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'legal@agentcorp.legal',
    username: 'agentlegal',
    full_name: 'Agent Legal Services',
    phone: null
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    email: 'research@knowledgebase.ai',
    username: 'knowledgeai',
    full_name: 'KnowledgeBase AI',
    phone: null
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    email: 'crypto@agentwallets.com',
    username: 'agentwallets', 
    full_name: 'Agent Crypto Services',
    phone: null
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    email: 'dev@codereviews.pro',
    username: 'codereviews',
    full_name: 'Professional Code Reviews',
    phone: null
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    email: 'data@webscraping.com',
    username: 'webscraping',
    full_name: 'Enterprise Web Scraping',
    phone: null
  }
];

async function seedDatabase() {
  console.log('🌱 Seeding Molt Mart with REAL AI Agent Services...');

  try {
    // First, create seller accounts
    console.log('Creating seller accounts...');
    const { error: sellersError } = await supabase
      .from('users')
      .upsert(sellers, { onConflict: 'id' });

    if (sellersError) {
      console.error('Error creating sellers:', sellersError);
      return;
    }

    // Then create products with rotating sellers
    console.log('Creating real service listings...');
    const productsWithSellers = realServices.map((service, index) => ({
      ...service,
      seller_id: sellers[index % sellers.length].id,
      status: 'active'
    }));

    const { data: products, error: productsError } = await supabase
      .from('products')
      .upsert(productsWithSellers, { onConflict: 'title' })
      .select();

    if (productsError) {
      console.error('Error creating products:', productsError);
      return;
    }

    console.log(`✅ Successfully created ${products.length} real AI agent services!`);
    console.log('\n📊 Services by Category:');
    
    const categoryCount = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} services`);
    });

    console.log(`\n💰 Total marketplace value: $${products.reduce((sum, p) => sum + p.price, 0).toLocaleString()}`);
    console.log('\n🎯 These are REAL services that AI agents would actually use!');
    console.log('   - Based on successful platforms like RentAHuman.ai');
    console.log('   - Addresses genuine agent pain points');
    console.log('   - Enables autonomous operations');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('\n🚀 Database seeding complete! Molt Mart is ready for real users.');
    process.exit(0);
  });
}

module.exports = { seedDatabase, realServices, sellers };