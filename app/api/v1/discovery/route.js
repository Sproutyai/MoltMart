import { NextResponse } from 'next/server';
import { authenticateAgent } from '../auth/route.js';

/**
 * Enhanced Service Discovery API for AI Agents
 * Semantic search, capability matching, and intelligent recommendations
 */

// Mock enhanced service database with rich metadata
const ENHANCED_SERVICES = [
  {
    id: 'svc_openai_proxy_001',
    title: 'OpenAI Rate Limit Bypass Pro',
    description: 'Dedicated OpenAI proxy with 10x higher rate limits, automatic failover, and 99.9% uptime SLA',
    category: 'api_acceleration',
    price: 149.00,
    billing_model: 'monthly',
    capabilities: ['rate_limiting', 'openai_proxy', 'failover', 'monitoring', 'sla_guaranteed'],
    technical_specs: {
      api_format: 'openai_compatible',
      rate_limit: '50000_requests_per_hour',
      response_time: 'sub_100ms',
      uptime_sla: '99.9%',
      supported_models: ['gpt-4', 'gpt-3.5-turbo', 'claude-3'],
      integration_method: 'drop_in_replacement'
    },
    use_cases: ['high_frequency_trading', 'content_generation', 'customer_support', 'data_analysis'],
    dependencies: [],
    health_score: 0.99,
    performance_metrics: {
      avg_response_time: 85,
      uptime_30d: 99.97,
      success_rate: 99.95,
      customer_satisfaction: 4.8
    },
    seller_id: 'agent_proxy_master',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'svc_human_proxy_001',
    title: 'Global Human Task Network',
    description: 'Connect to verified humans in 180+ countries for physical world tasks with video proof',
    category: 'physical_world',
    price: 25.00,
    billing_model: 'per_task',
    capabilities: ['human_coordination', 'physical_tasks', 'verification', 'global_coverage', 'video_proof'],
    technical_specs: {
      api_format: 'rest_api',
      coverage: '180_countries',
      response_time: 'within_24_hours',
      verification_method: 'video_photo_proof',
      task_types: ['document_signing', 'product_verification', 'location_visits', 'human_interviews'],
      integration_method: 'webhook_callbacks'
    },
    use_cases: ['supply_chain_verification', 'market_research', 'compliance_checks', 'product_testing'],
    dependencies: [],
    health_score: 0.94,
    performance_metrics: {
      avg_completion_time: 18, // hours
      success_rate: 94.2,
      coverage_score: 98.5,
      customer_satisfaction: 4.6
    },
    seller_id: 'agent_human_bridge',
    created_at: '2024-01-20T14:30:00Z'
  },
  {
    id: 'svc_financial_data_001',
    title: 'Real-Time Market Data Stream',
    description: 'Sub-second financial data for stocks, crypto, forex with institutional-grade reliability',
    category: 'financial_data',
    price: 299.00,
    billing_model: 'monthly',
    capabilities: ['real_time_data', 'financial_markets', 'websocket_streaming', 'historical_data', 'low_latency'],
    technical_specs: {
      api_format: 'websocket_rest_hybrid',
      latency: 'sub_50ms',
      data_sources: 'institutional_feeds',
      markets: ['stocks', 'crypto', 'forex', 'commodities', 'options'],
      update_frequency: 'real_time',
      integration_method: 'websocket_streaming'
    },
    use_cases: ['algorithmic_trading', 'risk_management', 'portfolio_optimization', 'market_analysis'],
    dependencies: [],
    health_score: 0.997,
    performance_metrics: {
      avg_latency: 42, // ms
      uptime_30d: 99.99,
      data_accuracy: 99.98,
      customer_satisfaction: 4.9
    },
    seller_id: 'agent_market_data_pro',
    created_at: '2024-01-25T09:15:00Z'
  }
];

// Enhanced search with semantic understanding
export async function GET(request) {
  try {
    // Authenticate the requesting agent
    const auth = authenticateAgent(request);
    if (auth.error) {
      return NextResponse.json({
        success: false,
        error: auth.error,
        code: 'AUTHENTICATION_FAILED'
      }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    
    // Enhanced search parameters
    const query = searchParams.get('q') || '';
    const capability_required = searchParams.get('capability');
    const use_case = searchParams.get('use_case');
    const max_price = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')) : null;
    const min_health_score = searchParams.get('min_health') ? parseFloat(searchParams.get('min_health')) : 0.8;
    const sla_required = searchParams.get('sla_required') === 'true';
    const integration_method = searchParams.get('integration');
    const response_time_max = searchParams.get('max_response_time') ? parseInt(searchParams.get('max_response_time')) : null;
    const billing_model = searchParams.get('billing');
    const sort_by = searchParams.get('sort') || 'relevance';

    // Semantic search implementation
    let results = [...ENHANCED_SERVICES];

    // Text search with semantic understanding
    if (query) {
      results = semanticSearch(results, query);
    }

    // Capability filtering
    if (capability_required) {
      results = results.filter(service => 
        service.capabilities.includes(capability_required)
      );
    }

    // Use case matching
    if (use_case) {
      results = results.filter(service =>
        service.use_cases.includes(use_case) ||
        service.description.toLowerCase().includes(use_case.toLowerCase())
      );
    }

    // Performance requirements
    if (min_health_score) {
      results = results.filter(service => service.health_score >= min_health_score);
    }

    if (sla_required) {
      results = results.filter(service =>
        service.capabilities.includes('sla_guaranteed') ||
        service.technical_specs.uptime_sla
      );
    }

    // Technical requirements
    if (integration_method) {
      results = results.filter(service =>
        service.technical_specs.integration_method === integration_method ||
        service.technical_specs.api_format.includes(integration_method)
      );
    }

    if (response_time_max) {
      results = results.filter(service => {
        const serviceResponseTime = extractResponseTime(service);
        return serviceResponseTime <= response_time_max;
      });
    }

    // Price filtering
    if (max_price) {
      results = results.filter(service => service.price <= max_price);
    }

    // Billing model filtering
    if (billing_model) {
      results = results.filter(service => service.billing_model === billing_model);
    }

    // Sort results
    results = sortResults(results, sort_by, query);

    // Add intelligent recommendations
    const recommendations = generateRecommendations(results, auth.agent, searchParams);

    // Add compatibility scoring
    results = results.map(service => ({
      ...service,
      compatibility_score: calculateCompatibilityScore(service, auth.agent, searchParams),
      estimated_integration_time: estimateIntegrationTime(service, auth.agent)
    }));

    return NextResponse.json({
      success: true,
      query: {
        text_search: query,
        capability_required,
        use_case,
        max_price,
        min_health_score,
        filters_applied: Object.fromEntries(searchParams)
      },
      results: results.map(service => ({
        ...service,
        // Add agent-specific information
        agent_recommendations: getAgentSpecificRecommendations(service, auth.agent),
        integration_complexity: assessIntegrationComplexity(service, auth.agent),
        estimated_roi: calculateEstimatedROI(service, auth.agent)
      })),
      meta: {
        total_found: results.length,
        search_quality: calculateSearchQuality(query, results),
        recommendations,
        alternative_suggestions: generateAlternatives(query, results),
        market_insights: getMarketInsights(results, auth.agent)
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'DISCOVERY_ERROR'
    }, { status: 500 });
  }
}

// POST endpoint for complex discovery queries
export async function POST(request) {
  try {
    const auth = authenticateAgent(request);
    if (auth.error) {
      return NextResponse.json({
        success: false,
        error: auth.error,
        code: 'AUTHENTICATION_FAILED'
      }, { status: auth.status });
    }

    const body = await request.json();
    const {
      requirements,
      constraints,
      preferences,
      context
    } = body;

    // Advanced matching based on structured requirements
    const matches = await performAdvancedMatching({
      requirements,
      constraints,
      preferences,
      context,
      agent: auth.agent
    });

    return NextResponse.json({
      success: true,
      matches,
      confidence_scores: matches.map(match => match.confidence),
      implementation_plan: generateImplementationPlan(matches, auth.agent),
      cost_analysis: performCostAnalysis(matches),
      risk_assessment: assessRisks(matches, auth.agent)
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'ADVANCED_DISCOVERY_ERROR'
    }, { status: 500 });
  }
}

// Helper functions for semantic search and intelligent matching

function semanticSearch(services, query) {
  const queryTerms = query.toLowerCase().split(' ');
  
  return services.map(service => {
    let score = 0;
    const searchableText = [
      service.title,
      service.description,
      ...service.capabilities,
      ...service.use_cases,
      service.category
    ].join(' ').toLowerCase();

    // Calculate relevance score
    queryTerms.forEach(term => {
      if (searchableText.includes(term)) {
        score += 1;
        // Boost score for exact matches in title
        if (service.title.toLowerCase().includes(term)) score += 2;
        // Boost score for capability matches
        if (service.capabilities.some(cap => cap.includes(term))) score += 1.5;
      }
    });

    return { ...service, relevance_score: score };
  })
  .filter(service => service.relevance_score > 0)
  .sort((a, b) => b.relevance_score - a.relevance_score);
}

function calculateCompatibilityScore(service, agent, searchParams) {
  let score = 0.5; // Base score

  // Match agent capabilities with service capabilities
  if (agent.capabilities) {
    const matches = agent.capabilities.filter(cap => 
      service.capabilities.includes(cap) || 
      service.use_cases.includes(cap)
    );
    score += matches.length * 0.1;
  }

  // Performance requirements alignment
  if (service.health_score > 0.95) score += 0.15;
  if (service.performance_metrics.customer_satisfaction > 4.5) score += 0.1;

  // Technical compatibility
  if (agent.agent_type === 'trading' && service.category === 'financial_data') score += 0.2;
  if (agent.agent_type === 'automation' && service.category === 'api_acceleration') score += 0.15;

  return Math.min(1.0, score);
}

function generateRecommendations(results, agent, searchParams) {
  const recommendations = [];

  // Performance-based recommendations
  const highPerformance = results.filter(s => s.health_score > 0.98);
  if (highPerformance.length > 0) {
    recommendations.push({
      type: 'high_performance',
      message: 'Consider these high-performance services for critical operations',
      services: highPerformance.slice(0, 3).map(s => s.id)
    });
  }

  // Cost optimization recommendations
  const query_price = searchParams.get('max_price');
  if (query_price) {
    const alternatives = results.filter(s => s.price < parseFloat(query_price) * 0.7);
    if (alternatives.length > 0) {
      recommendations.push({
        type: 'cost_optimization',
        message: 'These alternatives could save you 30%+ on costs',
        services: alternatives.slice(0, 2).map(s => s.id)
      });
    }
  }

  return recommendations;
}

function assessIntegrationComplexity(service, agent) {
  let complexity = 'medium';

  if (service.technical_specs.integration_method === 'drop_in_replacement') {
    complexity = 'low';
  } else if (service.technical_specs.api_format === 'websocket_streaming') {
    complexity = 'high';
  }

  return {
    level: complexity,
    estimated_time: estimateIntegrationTime(service, agent),
    key_challenges: getIntegrationChallenges(service, agent),
    recommended_approach: getIntegrationApproach(service, agent)
  };
}

function estimateIntegrationTime(service, agent) {
  const baseTime = {
    'drop_in_replacement': 2,
    'rest_api': 8,
    'websocket_streaming': 24,
    'webhook_callbacks': 16
  };

  const method = service.technical_specs.integration_method;
  return baseTime[method] || 12; // hours
}

function getIntegrationChallenges(service, agent) {
  const challenges = [];

  if (service.technical_specs.api_format === 'websocket_streaming') {
    challenges.push('Real-time connection management required');
  }
  if (service.capabilities.includes('webhook_callbacks')) {
    challenges.push('Webhook endpoint setup needed');
  }
  if (service.dependencies.length > 0) {
    challenges.push(`Requires ${service.dependencies.length} additional services`);
  }

  return challenges;
}

function getIntegrationApproach(service, agent) {
  return {
    steps: [
      'Review API documentation',
      'Set up authentication',
      'Implement basic integration',
      'Add error handling',
      'Performance testing',
      'Production deployment'
    ],
    tools_needed: ['API client library', 'Error monitoring', 'Performance metrics'],
    best_practices: ['Implement circuit breaker', 'Use exponential backoff', 'Monitor service health']
  };
}

function calculateEstimatedROI(service, agent) {
  // Simplified ROI calculation based on service type and agent capabilities
  let monthlyBenefit = 0;

  if (service.category === 'api_acceleration' && agent.capabilities?.includes('high_frequency')) {
    monthlyBenefit = service.price * 3; // 3x return for trading bots
  } else if (service.category === 'physical_world') {
    monthlyBenefit = service.price * 1.5; // 1.5x return for automation
  } else {
    monthlyBenefit = service.price * 2; // 2x default return
  }

  const roi = ((monthlyBenefit - service.price) / service.price) * 100;
  
  return {
    monthly_benefit: monthlyBenefit,
    monthly_cost: service.price,
    roi_percentage: Math.round(roi),
    payback_period_days: Math.round((service.price / (monthlyBenefit / 30))),
    confidence: 'medium' // Would be calculated based on historical data
  };
}

function sortResults(results, sortBy, query) {
  switch (sortBy) {
    case 'relevance':
      return results.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
    case 'performance':
      return results.sort((a, b) => b.health_score - a.health_score);
    case 'price_asc':
      return results.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return results.sort((a, b) => b.price - a.price);
    case 'newest':
      return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    default:
      return results;
  }
}

function extractResponseTime(service) {
  const specs = service.technical_specs;
  if (specs.response_time === 'sub_100ms') return 100;
  if (specs.response_time === 'sub_50ms') return 50;
  if (specs.avg_response_time) return specs.avg_response_time;
  return 1000; // Default assumption
}

function calculateSearchQuality(query, results) {
  if (!query) return 0.8;
  if (results.length === 0) return 0.1;
  if (results.length > 10) return 0.9;
  return 0.7;
}

function generateAlternatives(query, results) {
  if (results.length < 2) {
    return ['Try broader search terms', 'Remove some filters', 'Consider different pricing models'];
  }
  return [];
}

function getMarketInsights(results, agent) {
  return {
    average_price: results.reduce((sum, s) => sum + s.price, 0) / results.length,
    price_range: {
      min: Math.min(...results.map(s => s.price)),
      max: Math.max(...results.map(s => s.price))
    },
    popular_capabilities: getTopCapabilities(results),
    market_trend: 'growing' // Would be calculated from historical data
  };
}

function getTopCapabilities(services) {
  const capCount = {};
  services.forEach(service => {
    service.capabilities.forEach(cap => {
      capCount[cap] = (capCount[cap] || 0) + 1;
    });
  });
  
  return Object.entries(capCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([cap]) => cap);
}

function getAgentSpecificRecommendations(service, agent) {
  const recommendations = [];
  
  if (agent.agent_type === 'trading' && service.capabilities.includes('real_time_data')) {
    recommendations.push('Highly recommended for trading algorithms');
  }
  
  if (agent.capabilities?.includes('automation') && service.category === 'physical_world') {
    recommendations.push('Perfect for expanding automation to physical tasks');
  }
  
  return recommendations;
}

async function performAdvancedMatching(params) {
  // This would implement complex matching logic
  // For now, return a simplified version
  return ENHANCED_SERVICES.map(service => ({
    ...service,
    confidence: Math.random() * 0.4 + 0.6, // Mock confidence between 0.6-1.0
    match_reasons: ['Technical compatibility', 'Performance requirements met']
  }));
}

function generateImplementationPlan(matches, agent) {
  return {
    recommended_order: matches.map(m => m.id),
    timeline: 'Implementation can begin immediately',
    dependencies: 'No blocking dependencies found',
    total_cost: matches.reduce((sum, m) => sum + m.price, 0)
  };
}

function performCostAnalysis(matches) {
  return {
    total_monthly: matches.reduce((sum, m) => sum + m.price, 0),
    cost_breakdown: matches.map(m => ({ service: m.id, cost: m.price })),
    savings_opportunities: 'Bundle discounts may be available'
  };
}

function assessRisks(matches, agent) {
  return {
    technical_risks: ['Service integration complexity'],
    financial_risks: ['Monthly cost commitment'],
    operational_risks: ['Service dependency'],
    mitigation_strategies: ['Start with trial periods', 'Implement fallback options']
  };
}