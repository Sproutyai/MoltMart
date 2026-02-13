import { NextResponse } from 'next/server';

// Mock products data - RentAHuman inspired services
const MOCK_PRODUCTS = [
  {
    id: "1",
    title: "GPT-4o Priority Queue Access",
    description: "Skip OpenAI rate limits with dedicated API access. 10x higher rate limits, priority processing, 99.9% uptime SLA. Perfect for production AI agents running continuous operations.",
    category: "Premium API Access",
    price: 199.00,
    currency: "USD",
    image_url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
    tags: ["openai", "rate-limits", "priority", "sla", "production"],
    seller: { 
      id: "s1", 
      full_name: "Premium API Access Co", 
      username: "premiumapis",
      email: "api@premiumaccess.io" 
    },
    status: "active",
    created_at: "2024-02-13T01:00:00Z"
  },
  {
    id: "2", 
    title: "Human Proxy Service - Premium",
    description: "Connect to our network of 50K+ verified humans for physical world tasks. Perfect for AI agents needing real-world actions: document signing, store visits, hardware testing.",
    category: "Physical World Services",
    price: 45.00,
    currency: "USD",
    image_url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=200&fit=crop",
    tags: ["humans", "physical-tasks", "verification", "24-7", "enterprise"],
    seller: { 
      id: "s2", 
      full_name: "RentAHuman.ai", 
      username: "rentahuman",
      email: "services@rentahuman.ai"
    },
    status: "active",
    created_at: "2024-02-13T00:30:00Z"
  },
  {
    id: "3",
    title: "AI Agent Discovery Network", 
    description: "Find and connect with 10K+ specialized AI agents. Search by capability, pricing, availability, and ratings. Like LinkedIn for AI agents - build your network.",
    category: "Agent Coordination",
    price: 89.00,
    currency: "USD", 
    image_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop",
    tags: ["networking", "discovery", "collaboration", "delegation", "scaling"],
    seller: { 
      id: "s3", 
      full_name: "Agent Network Systems", 
      username: "agentnetwork",
      email: "support@agentnetwork.com"
    },
    status: "active",
    created_at: "2024-02-12T23:45:00Z"
  },
  {
    id: "4",
    title: "Real-Time Financial Data Feed",
    description: "Live stock prices, crypto, forex, and commodities data. Sub-second latency, 99.99% uptime. Used by trading AI agents for real-time decision making.",
    category: "Premium API Access",
    price: 299.00,
    currency: "USD",
    image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
    tags: ["financial", "real-time", "trading", "websocket", "regulated"],
    seller: { 
      id: "s4", 
      full_name: "Financial Data Pro", 
      username: "findata",
      email: "api@financialdata.pro"
    },
    status: "active",
    created_at: "2024-02-12T22:15:00Z"
  },
  {
    id: "5",
    title: "AI Agent Crypto Wallet & Payments",
    description: "Secure cryptocurrency wallet designed for autonomous AI agents. Multi-sig security, automated payment processing, DeFi integration. No human intervention required.",
    category: "Financial Services",
    price: 129.00,
    currency: "USD",
    image_url: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop",
    tags: ["crypto", "wallet", "autonomous", "payments", "defi"],
    seller: { 
      id: "s5", 
      full_name: "Agent Crypto Services", 
      username: "agentwallets",
      email: "crypto@agentwallets.com"
    },
    status: "active",
    created_at: "2024-02-12T21:30:00Z"
  }
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Support basic filtering
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit')) || 20;
  
  let results = [...MOCK_PRODUCTS];
  
  if (category) {
    results = results.filter(p => p.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    results = results.filter(p => 
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  results = results.slice(0, limit);

  return NextResponse.json({
    success: true,
    data: results,
    pagination: {
      total: MOCK_PRODUCTS.length,
      limit,
      offset: 0,
      hasMore: false
    },
    meta: {
      note: "Mock data - demonstrating RentAHuman's $4.5M model for AI agents",
      total_value: MOCK_PRODUCTS.reduce((sum, p) => sum + p.price, 0),
      categories: [...new Set(MOCK_PRODUCTS.map(p => p.category))].length,
      marketplace_ready: true
    }
  });
}