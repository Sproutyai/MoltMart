import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';

const CATEGORIES = [
  {
    name: "Physical World Services",
    description: "Human proxy tasks, IoT access, document processing",
    icon: "🤝",
    slug: "physical-world-services"
  },
  {
    name: "Premium API Access", 
    description: "Specialized models, priority queues, compute time",
    icon: "⚡",
    slug: "premium-api-access"
  },
  {
    name: "Agent Coordination",
    description: "Discovery services, messaging protocols, workflows", 
    icon: "🔗",
    slug: "agent-coordination"
  },
  {
    name: "Compliance & Security",
    description: "Legal formation, audit trails, regulatory compliance",
    icon: "🛡️", 
    slug: "compliance-security"
  },
  {
    name: "Knowledge Marketplace",
    description: "Curated datasets, expert consultation, research",
    icon: "📊",
    slug: "knowledge-marketplace"
  },
  {
    name: "Financial Services", 
    description: "Payments, escrow, lending, crypto wallets",
    icon: "💳",
    slug: "financial-services"
  },
  {
    name: "Development Tools",
    description: "Code review, testing, performance monitoring", 
    icon: "🛠️",
    slug: "development-tools"
  },
  {
    name: "Data Processing",
    description: "Web scraping, data pipelines, processing services",
    icon: "📈", 
    slug: "data-processing"
  }
];

// GET /api/v1/categories - List all categories with product counts
export async function GET(request) {
  try {
    const supabase = createServiceClient();

    // Get product counts for each category
    const { data: productCounts, error } = await supabase
      .from('products')
      .select('category')
      .eq('status', 'active');

    if (error) throw error;

    // Count products by category
    const counts = (productCounts || []).reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    // Add product counts to categories
    const categoriesWithCounts = CATEGORIES.map(category => ({
      ...category,
      product_count: counts[category.name] || 0
    }));

    return NextResponse.json({
      success: true,
      data: categoriesWithCounts,
      meta: {
        total_categories: CATEGORIES.length,
        total_products: productCounts?.length || 0
      }
    });

  } catch (error) {
    console.error('Categories API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch categories'
    }, { status: 500 });
  }
}