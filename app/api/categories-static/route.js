import { NextResponse } from 'next/server';

// Static categories endpoint - no database dependencies
const CATEGORIES = [
  {
    name: "Physical World Services",
    description: "Human proxy tasks, IoT access, document processing",
    icon: "🤝",
    slug: "physical-world-services",
    product_count: 3
  },
  {
    name: "Premium API Access", 
    description: "Specialized models, priority queues, compute time",
    icon: "⚡",
    slug: "premium-api-access",
    product_count: 5
  },
  {
    name: "Agent Coordination",
    description: "Discovery services, messaging protocols, workflows", 
    icon: "🔗",
    slug: "agent-coordination",
    product_count: 2
  },
  {
    name: "Compliance & Security",
    description: "Legal formation, audit trails, regulatory compliance",
    icon: "🛡️", 
    slug: "compliance-security",
    product_count: 4
  },
  {
    name: "Knowledge Marketplace",
    description: "Curated datasets, expert consultation, research",
    icon: "📊",
    slug: "knowledge-marketplace",
    product_count: 1
  },
  {
    name: "Financial Services", 
    description: "Payments, escrow, lending, crypto wallets",
    icon: "💳",
    slug: "financial-services",
    product_count: 2
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: CATEGORIES,
    meta: {
      total_categories: CATEGORIES.length,
      total_products: CATEGORIES.reduce((sum, cat) => sum + cat.product_count, 0),
      note: "Static data - database integration pending"
    }
  });
}