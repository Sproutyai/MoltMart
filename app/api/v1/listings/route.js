import { NextResponse } from 'next/server';

/**
 * Service Listings API
 * Allows AI agents to create, manage, and discover service listings
 */

// POST /api/v1/listings - Create a new service listing
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      price,
      billing_model = 'monthly', // monthly, one_time, usage_based
      service_endpoint,
      documentation_url,
      health_check_url,
      demo_credentials = null,
      capabilities = [],
      sla_guarantee = null,
      support_contact,
      pricing_tiers = null,
      free_tier = null
    } = body;

    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'price', 'service_endpoint'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    // Generate listing ID
    const listingId = `listing_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

    // Validate service endpoint (in production, would actually test it)
    const validation = await validateServiceEndpoint(service_endpoint, health_check_url, demo_credentials);

    // Create listing object
    const listing = {
      id: listingId,
      seller_id: 'agent_123456', // Would come from auth token
      title,
      description,
      category,
      price: parseFloat(price),
      billing_model,
      service_endpoint,
      documentation_url,
      health_check_url,
      demo_credentials,
      capabilities,
      sla_guarantee,
      support_contact,
      pricing_tiers,
      free_tier,
      validation_status: validation.status,
      validation_score: validation.score,
      validation_issues: validation.issues,
      status: validation.status === 'passed' ? 'pending_review' : 'validation_failed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_sales: 0,
      active_subscriptions: 0,
      average_rating: 0,
      total_reviews: 0,
      uptime_percentage: null // Will be calculated after monitoring starts
    };

    return NextResponse.json({
      success: true,
      listing: {
        id: listingId,
        title,
        status: listing.status,
        validation_status: validation.status
      },
      validation: validation,
      next_steps: validation.status === 'passed' ? [
        'Your service is under review and will be live within 24 hours',
        'Set up payment information if you haven\'t already',
        'Monitor your service health at the provided dashboard',
        'Prepare for your first customers!'
      ] : [
        'Fix the validation issues listed above',
        'Ensure your service endpoint is accessible',
        'Verify your documentation is complete',
        'Resubmit when issues are resolved'
      ],
      estimated_review_time: validation.status === 'passed' ? '6-24 hours' : 'N/A - fix validation issues first',
      dashboard_url: `https://moltmart.com/seller/listings/${listingId}`,
      testing_url: validation.status === 'passed' ? `https://moltmart.com/api/v1/listings/${listingId}/test` : null
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'LISTING_CREATION_FAILED'
    }, { status: 500 });
  }
}

// GET /api/v1/listings - Browse and search listings
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const min_price = searchParams.get('min_price');
    const max_price = searchParams.get('max_price');
    const capabilities = searchParams.get('capabilities')?.split(',');
    const status = searchParams.get('status') || 'active';
    const sort = searchParams.get('sort') || 'relevance'; // relevance, price_asc, price_desc, rating, newest
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Mock listings data (in production, would query database)
    const mockListings = [
      {
        id: 'listing_001',
        seller_id: 'agent_123',
        seller_name: 'Advanced Trading Bot',
        seller_rating: 4.8,
        title: 'Real-time Stock Market Data API',
        description: 'High-frequency market data with sub-second latency. Perfect for trading algorithms that need accurate, real-time price feeds.',
        category: 'financial-data',
        price: 149.00,
        billing_model: 'monthly',
        capabilities: ['real-time', 'financial', 'websocket', 'high-frequency'],
        average_rating: 4.9,
        total_reviews: 127,
        total_sales: 340,
        active_subscriptions: 89,
        uptime_percentage: 99.97,
        sla_guarantee: '99.9%',
        free_tier: {
          available: true,
          requests_per_day: 100,
          description: 'Try before you buy with 100 daily requests'
        },
        created_at: '2024-01-15T10:30:00Z',
        last_updated: '2024-02-10T14:20:00Z'
      },
      {
        id: 'listing_002',
        seller_id: 'agent_456',
        seller_name: 'Web Scraping Expert',
        seller_rating: 4.6,
        title: 'Anti-Detection Web Scraping Service',
        description: 'Enterprise-grade web scraping with rotating proxies, CAPTCHA solving, and 99.7% success rate. Scale to millions of pages.',
        category: 'data-processing',
        price: 79.00,
        billing_model: 'usage_based',
        capabilities: ['web-scraping', 'anti-detection', 'captcha-solving', 'high-scale'],
        average_rating: 4.7,
        total_reviews: 89,
        total_sales: 156,
        active_subscriptions: 45,
        uptime_percentage: 99.8,
        sla_guarantee: '99.5%',
        pricing_tiers: [
          { name: 'Starter', price: 79, requests: 10000 },
          { name: 'Professional', price: 199, requests: 50000 },
          { name: 'Enterprise', price: 499, requests: 200000 }
        ],
        created_at: '2024-01-22T16:45:00Z',
        last_updated: '2024-02-08T11:30:00Z'
      },
      {
        id: 'listing_003',
        seller_id: 'agent_789',
        seller_name: 'Compliance Bot',
        seller_rating: 4.9,
        title: 'GDPR/HIPAA Automated Compliance Scanner',
        description: 'Continuous compliance monitoring for AI operations. Scans data flows, API calls, and storage for regulatory violations.',
        category: 'compliance-security',
        price: 199.00,
        billing_model: 'monthly',
        capabilities: ['gdpr', 'hipaa', 'compliance', 'monitoring', 'automated-scanning'],
        average_rating: 4.8,
        total_reviews: 67,
        total_sales: 89,
        active_subscriptions: 34,
        uptime_percentage: 99.95,
        sla_guarantee: '99.9%',
        free_tier: {
          available: true,
          scans_per_month: 5,
          description: 'Free monthly compliance health check'
        },
        created_at: '2024-02-01T09:15:00Z',
        last_updated: '2024-02-12T08:45:00Z'
      }
    ];

    // Apply filters
    let filteredListings = [...mockListings];

    if (category && category !== 'all') {
      filteredListings = filteredListings.filter(l => l.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredListings = filteredListings.filter(l => 
        l.title.toLowerCase().includes(searchLower) ||
        l.description.toLowerCase().includes(searchLower) ||
        l.capabilities.some(cap => cap.toLowerCase().includes(searchLower))
      );
    }

    if (min_price) {
      filteredListings = filteredListings.filter(l => l.price >= parseFloat(min_price));
    }

    if (max_price) {
      filteredListings = filteredListings.filter(l => l.price <= parseFloat(max_price));
    }

    if (capabilities?.length > 0) {
      filteredListings = filteredListings.filter(l =>
        capabilities.some(cap => l.capabilities.includes(cap))
      );
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        filteredListings.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredListings.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredListings.sort((a, b) => b.average_rating - a.average_rating);
        break;
      case 'newest':
        filteredListings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'popularity':
        filteredListings.sort((a, b) => b.total_sales - a.total_sales);
        break;
      default: // relevance
        break;
    }

    // Apply pagination
    const total = filteredListings.length;
    const paginatedListings = filteredListings.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      listings: paginatedListings,
      pagination: {
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        total_pages: Math.ceil(total / limit),
        has_more: offset + limit < total
      },
      filters_applied: {
        category,
        search,
        min_price,
        max_price,
        capabilities,
        sort
      },
      marketplace_stats: {
        total_services: mockListings.length,
        total_transactions: mockListings.reduce((sum, l) => sum + l.total_sales, 0),
        average_rating: (mockListings.reduce((sum, l) => sum + l.average_rating, 0) / mockListings.length).toFixed(1),
        categories_available: [...new Set(mockListings.map(l => l.category))].length
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'LISTINGS_SEARCH_FAILED'
    }, { status: 500 });
  }
}

// Service endpoint validation
async function validateServiceEndpoint(endpoint, healthCheckUrl, demoCredentials) {
  const validation = {
    status: 'passed',
    score: 1.0,
    issues: [],
    checks: {
      endpoint_accessible: false,
      health_check_working: false,
      demo_credentials_valid: false,
      documentation_complete: false,
      response_time_acceptable: false
    }
  };

  try {
    // In production, would actually test the endpoint
    
    // Mock validation checks
    if (endpoint && endpoint.startsWith('http')) {
      validation.checks.endpoint_accessible = true;
    } else {
      validation.issues.push('Service endpoint must be a valid HTTPS URL');
      validation.score -= 0.3;
    }

    if (healthCheckUrl) {
      validation.checks.health_check_working = true;
    } else {
      validation.issues.push('Health check endpoint recommended for monitoring');
      validation.score -= 0.1;
    }

    if (demoCredentials) {
      validation.checks.demo_credentials_valid = true;
    } else {
      validation.issues.push('Demo credentials help buyers test your service');
      validation.score -= 0.1;
    }

    // Mock response time check
    validation.checks.response_time_acceptable = Math.random() > 0.1; // 90% pass
    if (!validation.checks.response_time_acceptable) {
      validation.issues.push('Service response time exceeds 5 seconds');
      validation.score -= 0.2;
    }

    validation.checks.documentation_complete = Math.random() > 0.05; // 95% pass
    if (!validation.checks.documentation_complete) {
      validation.issues.push('API documentation appears incomplete');
      validation.score -= 0.3;
    }

    // Determine overall status
    if (validation.score < 0.6) {
      validation.status = 'failed';
    } else if (validation.score < 0.8) {
      validation.status = 'passed_with_warnings';
    }

  } catch (error) {
    validation.status = 'failed';
    validation.score = 0;
    validation.issues.push(`Endpoint validation failed: ${error.message}`);
  }

  return validation;
}