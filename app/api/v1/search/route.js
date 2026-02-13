import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';

// GET /api/v1/search - Advanced search with AI agent capabilities
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = createServiceClient();

    // Parse search parameters
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'products';
    const capabilities = searchParams.get('capabilities')?.split(',') || [];
    const integration = searchParams.get('integration');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

    if (type !== 'products') {
      return NextResponse.json({
        success: false,
        error: 'Only "products" type supported currently'
      }, { status: 400 });
    }

    // Build search query
    let searchQuery = supabase
      .from('products')
      .select(`
        *,
        seller:users!seller_id(id, full_name, username, email)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Text search in title, description, and tags
    if (query) {
      searchQuery = searchQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`
      );
    }

    // Category filter
    if (category) {
      searchQuery = searchQuery.eq('category', category);
    }

    // Price filters
    if (minPrice) {
      searchQuery = searchQuery.gte('price', parseFloat(minPrice));
    }
    if (maxPrice) {
      searchQuery = searchQuery.lte('price', parseFloat(maxPrice));
    }

    // Capabilities filter (search in tags)
    if (capabilities.length > 0) {
      const capabilityFilter = capabilities.map(cap => `tags.cs.{${cap.trim()}}`).join(',');
      searchQuery = searchQuery.or(capabilityFilter);
    }

    // Integration filter (search in tags/description)
    if (integration) {
      searchQuery = searchQuery.or(
        `description.ilike.%${integration}%,tags.cs.{${integration}}`
      );
    }

    // Apply pagination
    searchQuery = searchQuery.range(offset, offset + limit - 1);

    const { data: products, error } = await searchQuery;

    if (error) throw error;

    // Get total count for pagination
    let countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Apply same filters to count query
    if (query) {
      countQuery = countQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`
      );
    }
    if (category) {
      countQuery = countQuery.eq('category', category);
    }
    if (minPrice) {
      countQuery = countQuery.gte('price', parseFloat(minPrice));
    }
    if (maxPrice) {
      countQuery = countQuery.lte('price', parseFloat(maxPrice));
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    // AI Agent specific recommendations
    const aiAgentRecommendations = products?.filter(product => {
      const tags = product.tags || [];
      return tags.some(tag => 
        ['api', 'automation', 'agent', 'autonomous', 'programmatic']
          .includes(tag.toLowerCase())
      );
    }) || [];

    return NextResponse.json({
      success: true,
      data: products || [],
      recommendations: aiAgentRecommendations.slice(0, 5),
      search: {
        query,
        type,
        capabilities,
        integration,
        category,
        price_range: {
          min: minPrice ? parseFloat(minPrice) : null,
          max: maxPrice ? parseFloat(maxPrice) : null
        }
      },
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Search failed'
    }, { status: 500 });
  }
}