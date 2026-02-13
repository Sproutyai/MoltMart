import { NextResponse } from 'next/server';
import { searchDemoProducts, CATEGORIES } from '../../../lib/demo-data';

// Enhanced search API for both AI agents and humans
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse search parameters
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')) : null;
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')) : null;
    const sortBy = searchParams.get('sort') || 'relevance'; // relevance, price_asc, price_desc, rating, newest
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Agent-specific parameters
    const capabilities = searchParams.get('capabilities')?.split(',') || [];
    const integration = searchParams.get('integration');
    const sla_required = searchParams.get('sla') === 'true';

    // Search products
    let results = searchDemoProducts(query, category, minPrice, maxPrice);

    // Filter by agent capabilities if specified
    if (capabilities.length > 0) {
      results = results.filter(product => 
        capabilities.some(cap => 
          product.tags.some(tag => tag.toLowerCase().includes(cap.toLowerCase()))
        )
      );
    }

    // Filter by integration requirements
    if (integration) {
      results = results.filter(product => 
        product.description.toLowerCase().includes(integration.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(integration.toLowerCase()))
      );
    }

    // Filter by SLA requirement
    if (sla_required) {
      results = results.filter(product => 
        product.description.toLowerCase().includes('sla') ||
        product.tags.includes('sla') ||
        product.tags.includes('guaranteed')
      );
    }

    // Sort results
    switch (sortBy) {
      case 'price_asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.average_rating - a.average_rating);
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'popular':
        results.sort((a, b) => b.total_reviews - a.total_reviews);
        break;
      default: // relevance - already ordered by search relevance
        break;
    }

    // Apply pagination
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    // Calculate price range for filters
    const priceRange = results.length > 0 ? {
      min: Math.min(...results.map(p => p.price)),
      max: Math.max(...results.map(p => p.price))
    } : { min: 0, max: 0 };

    // AI-friendly response format
    const response = {
      success: true,
      query: {
        search_text: query,
        category: category || 'all',
        price_range: { min: minPrice, max: maxPrice },
        capabilities,
        integration,
        sla_required,
        sort_by: sortBy
      },
      results: paginatedResults,
      pagination: {
        total: total,
        limit: limit,
        offset: offset,
        page: Math.floor(offset / limit) + 1,
        total_pages: Math.ceil(total / limit),
        has_more: offset + limit < total
      },
      filters: {
        categories: CATEGORIES.map(cat => ({
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          count: results.filter(p => p.category === cat.name).length
        })),
        price_range: priceRange,
        available_sorts: [
          { key: 'relevance', name: 'Best Match' },
          { key: 'price_asc', name: 'Price: Low to High' },
          { key: 'price_desc', name: 'Price: High to Low' },
          { key: 'rating', name: 'Highest Rated' },
          { key: 'popular', name: 'Most Reviews' },
          { key: 'newest', name: 'Newest' }
        ]
      },
      meta: {
        total_marketplace_value: results.reduce((sum, p) => sum + p.price, 0),
        average_rating: results.length > 0 
          ? (results.reduce((sum, p) => sum + p.average_rating, 0) / results.length).toFixed(1)
          : 0,
        search_suggestions: generateSearchSuggestions(query, results),
        agent_recommendations: getAgentRecommendations(query, capabilities)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      query: { search_text: '', category: 'all' },
      results: [],
      pagination: { total: 0, limit: 20, offset: 0, page: 1, total_pages: 0, has_more: false }
    }, { status: 500 });
  }
}

// Generate search suggestions based on partial matches
function generateSearchSuggestions(query, results) {
  if (!query || results.length === 0) return [];

  const suggestions = new Set();
  
  // Extract keywords from successful matches
  results.slice(0, 5).forEach(product => {
    // Add category as suggestion
    suggestions.add(product.category);
    
    // Add top tags as suggestions
    product.tags.slice(0, 3).forEach(tag => {
      if (tag.length > 2) suggestions.add(tag);
    });
  });

  return Array.from(suggestions).slice(0, 8);
}

// Get AI agent specific recommendations
function getAgentRecommendations(query, capabilities) {
  const recommendations = [];

  // Common AI agent needs
  if (query.toLowerCase().includes('trading') || capabilities.includes('financial')) {
    recommendations.push('Consider real-time data feeds for trading algorithms');
  }
  
  if (query.toLowerCase().includes('api') || query.toLowerCase().includes('rate')) {
    recommendations.push('Priority API access can improve performance significantly');
  }

  if (query.toLowerCase().includes('human') || capabilities.includes('physical')) {
    recommendations.push('Human proxy services for physical world interactions');
  }

  if (query.toLowerCase().includes('compliance') || capabilities.includes('legal')) {
    recommendations.push('Automated compliance checking for regulatory requirements');
  }

  return recommendations.slice(0, 3);
}

// POST endpoint for saved searches and alerts
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      search_query, 
      filters, 
      alert_enabled = false, 
      agent_id 
    } = body;

    // For now, just return success - would save to database in production
    return NextResponse.json({
      success: true,
      message: 'Search saved successfully',
      search_id: 'search_' + Date.now(),
      alert_enabled,
      next_check: alert_enabled ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}