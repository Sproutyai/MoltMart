import { NextResponse } from 'next/server';

/**
 * Real Purchase API for AI Agents
 * This enables programmatic service purchases
 */

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      service_id, 
      agent_id,
      payment_method = 'stripe',
      billing_plan = 'monthly',
      auto_renewal = true,
      metadata = {}
    } = body;

    // Validate required fields
    if (!service_id) {
      return NextResponse.json({
        success: false,
        error: 'service_id is required',
        code: 'MISSING_SERVICE_ID'
      }, { status: 400 });
    }

    // In production, this would:
    // 1. Authenticate the requesting agent
    // 2. Validate payment method
    // 3. Process payment via Stripe/crypto
    // 4. Provision service access
    // 5. Generate credentials
    // 6. Send notifications

    // Mock successful purchase flow
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const apiKey = `mk_${service_id}_${Math.random().toString(36).substr(2, 20)}`;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      transaction: {
        id: transactionId,
        service_id,
        agent_id: agent_id || 'anonymous',
        status: 'completed',
        amount: getServicePrice(service_id),
        currency: 'USD',
        payment_method,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      service_access: {
        api_key: apiKey,
        endpoint: getServiceEndpoint(service_id),
        status: 'active',
        usage_limits: getServiceLimits(service_id),
        documentation: `https://docs.moltmart.com/services/${service_id}`,
        support_contact: 'https://moltmart.com/support'
      },
      quick_start: {
        curl_example: generateCurlExample(service_id, apiKey),
        integration_steps: [
          '1. Save your API key securely',
          '2. Replace OpenAI endpoint with our proxy',
          '3. Monitor usage in dashboard',
          '4. Contact support if issues'
        ],
        test_command: `curl -H "Authorization: Bearer ${apiKey}" ${getServiceEndpoint(service_id)}/health`
      },
      next_steps: [
        'Check your email for setup instructions',
        'Visit dashboard to monitor usage',
        'Join our Discord for support',
        'Rate your experience after 7 days'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'PURCHASE_FAILED',
      support: 'Contact support@moltmart.com for assistance'
    }, { status: 500 });
  }
}

// GET /api/v1/purchase/{transaction_id} - Check purchase status
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const transactionId = url.pathname.split('/').pop();

    if (!transactionId || transactionId === 'route.js') {
      return NextResponse.json({
        success: false,
        error: 'Transaction ID required',
        code: 'MISSING_TRANSACTION_ID'
      }, { status: 400 });
    }

    // Mock transaction lookup
    return NextResponse.json({
      success: true,
      transaction: {
        id: transactionId,
        status: 'completed',
        service_id: 'openai-proxy',
        amount: 50.00,
        currency: 'USD',
        created_at: new Date().toISOString(),
        service_status: 'active',
        usage_this_month: {
          requests: Math.floor(Math.random() * 5000),
          limit: 50000,
          percentage: Math.floor(Math.random() * 80)
        }
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'LOOKUP_FAILED'
    }, { status: 500 });
  }
}

// Helper functions
function getServicePrice(serviceId) {
  const prices = {
    'openai-proxy': 50.00,
    'human-verification': 15.00,
    'agent-discovery': 25.00
  };
  return prices[serviceId] || 25.00;
}

function getServiceEndpoint(serviceId) {
  const endpoints = {
    'openai-proxy': 'https://proxy.moltmart.com/v1',
    'human-verification': 'https://api.moltmart.com/v1/human',
    'agent-discovery': 'https://api.moltmart.com/v1/agents'
  };
  return endpoints[serviceId] || 'https://api.moltmart.com/v1';
}

function getServiceLimits(serviceId) {
  const limits = {
    'openai-proxy': {
      requests_per_minute: 5000,
      requests_per_month: 100000,
      max_tokens_per_request: 4096
    },
    'human-verification': {
      tasks_per_day: 10,
      tasks_per_month: 100,
      max_budget_per_task: 100
    },
    'agent-discovery': {
      searches_per_day: 1000,
      connections_per_month: 50,
      messages_per_day: 200
    }
  };
  return limits[serviceId] || {};
}

function generateCurlExample(serviceId, apiKey) {
  const examples = {
    'openai-proxy': `curl -X POST ${getServiceEndpoint(serviceId)}/chat/completions \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`,
    'human-verification': `curl -X POST ${getServiceEndpoint(serviceId)}/tasks \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "description": "Take a photo of the storefront at 123 Main St",
    "location": "New York, NY",
    "budget": 20,
    "deadline": "2024-02-15T18:00:00Z"
  }'`,
    'agent-discovery': `curl -X GET "${getServiceEndpoint(serviceId)}/search?skills=trading,finance" \\
  -H "Authorization: Bearer ${apiKey}"`
  };
  
  return examples[serviceId] || `curl -H "Authorization: Bearer ${apiKey}" ${getServiceEndpoint(serviceId)}/status`;
}