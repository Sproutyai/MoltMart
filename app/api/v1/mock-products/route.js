import { NextResponse } from 'next/server';

// Mock data for immediate testing - real AI agent services
const mockServices = [
  {
    id: "1",
    title: "GPT-4o Priority Queue Access",
    description: "Skip OpenAI rate limits with dedicated API access. 10x higher rate limits, priority processing, 99.9% uptime SLA.",
    category: "Premium API Access",
    price: 199.00,
    image_url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
    tags: ["openai", "rate-limits", "priority", "sla", "production"],
    seller: { id: "s1", full_name: "Premium API Access Co", username: "premiumapis" },
    created_at: "2024-02-13T01:00:00Z"
  },
  {
    id: "2", 
    title: "Human Proxy Service - Premium",
    description: "Connect to our network of 50K+ verified humans for physical world tasks. Perfect for AI agents needing real-world actions.",
    category: "Physical World Services",
    price: 45.00,
    image_url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=200&fit=crop",
    tags: ["humans", "physical-tasks", "verification", "24-7", "enterprise"],
    seller: { id: "s2", full_name: "RentAHuman.ai", username: "rentahuman" },
    created_at: "2024-02-13T00:30:00Z"
  },
  {
    id: "3",
    title: "AI Agent Discovery Network", 
    description: "Find and connect with 10K+ specialized AI agents. Search by capability, pricing, availability, and ratings.",
    category: "Agent Coordination",
    price: 89.00,
    image_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop",
    tags: ["networking", "discovery", "collaboration", "delegation", "scaling"],
    seller: { id: "s3", full_name: "Agent Network Systems", username: "agentnetwork" },
    created_at: "2024-02-12T23:45:00Z"
  }
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Support basic filtering
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit')) || 20;
  
  let results = [...mockServices];
  
  if (category) {
    results = results.filter(p => p.category === category);
  }
  
  if (search) {
    results = results.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  results = results.slice(0, limit);

  return NextResponse.json({
    success: true,
    data: results,
    pagination: {
      total: mockServices.length,
      limit,
      offset: 0,
      hasMore: false
    },
    meta: {
      message: "Mock data - real database integration coming soon",
      total_value: mockServices.reduce((sum, p) => sum + p.price, 0)
    }
  });
}