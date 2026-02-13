import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Agent Authentication & API Key Management
 * Enables AI agents to programmatically access the marketplace
 */

// Mock database for API keys (in production, use Supabase)
const API_KEYS = new Map();
const AGENTS = new Map();

// Generate secure API key
function generateApiKey(agentId, scope = 'full') {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  return `mk_${scope}_${timestamp}_${random}`;
}

// Validate API key format and extract metadata
function parseApiKey(apiKey) {
  const parts = apiKey.split('_');
  if (parts.length !== 4 || parts[0] !== 'mk') {
    return null;
  }
  return {
    prefix: parts[0],
    scope: parts[1],
    timestamp: parseInt(parts[2]),
    hash: parts[3]
  };
}

// POST /api/v1/auth - Generate API key for agent
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      agent_id,
      agent_name,
      agent_type = 'general',
      capabilities = [],
      contact_info = {},
      verification_data = {},
      scope = 'full' // full, read_only, purchase_only
    } = body;

    // Validate required fields
    if (!agent_id || !agent_name) {
      return NextResponse.json({
        success: false,
        error: 'agent_id and agent_name are required',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    // Check if agent already exists
    if (AGENTS.has(agent_id)) {
      return NextResponse.json({
        success: false,
        error: 'Agent ID already exists',
        code: 'AGENT_EXISTS'
      }, { status: 409 });
    }

    // Generate API key
    const apiKey = generateApiKey(agent_id, scope);
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Create agent record
    const agentRecord = {
      id: `agent_${Date.now()}`,
      agent_id,
      agent_name,
      agent_type,
      capabilities,
      contact_info,
      verification_data,
      scope,
      api_key_hash: keyHash,
      created_at: new Date().toISOString(),
      last_active: null,
      total_requests: 0,
      rate_limit: getScopedRateLimit(scope),
      status: 'active'
    };

    // Store agent and API key
    AGENTS.set(agent_id, agentRecord);
    API_KEYS.set(keyHash, {
      agent_id,
      scope,
      created_at: agentRecord.created_at,
      last_used: null,
      request_count: 0
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: agentRecord.id,
        agent_id,
        agent_name,
        agent_type,
        scope,
        rate_limit: agentRecord.rate_limit
      },
      credentials: {
        api_key: apiKey,
        scope: scope,
        rate_limit: agentRecord.rate_limit,
        expires: 'never' // For now, keys don't expire
      },
      endpoints: {
        search: 'https://moltmart.com/api/v1/search',
        listings: 'https://moltmart.com/api/v1/listings',
        purchase: 'https://moltmart.com/api/v1/purchase',
        monitoring: 'https://moltmart.com/api/v1/monitoring',
        webhooks: 'https://moltmart.com/api/v1/webhooks'
      },
      usage_examples: {
        search_services: `curl -H "Authorization: Bearer ${apiKey}" "https://moltmart.com/api/v1/search?q=rate+limiting"`,
        list_services: `curl -H "Authorization: Bearer ${apiKey}" "https://moltmart.com/api/v1/listings"`,
        purchase_service: `curl -X POST -H "Authorization: Bearer ${apiKey}" -d '{"service_id":"svc_123"}' "https://moltmart.com/api/v1/purchase"`
      },
      documentation: 'https://docs.moltmart.com/api/authentication',
      next_steps: [
        'Store your API key securely - it won\'t be shown again',
        'Test the endpoints using the provided examples',
        'Set up error handling for rate limits and service outages',
        'Consider setting up webhooks for real-time updates'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'AUTH_ERROR'
    }, { status: 500 });
  }
}

// GET /api/v1/auth - Validate API key and get agent info
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid Authorization header',
        code: 'MISSING_AUTH'
      }, { status: 401 });
    }

    const apiKey = authHeader.substring(7);
    const keyData = parseApiKey(apiKey);
    
    if (!keyData) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format',
        code: 'INVALID_KEY_FORMAT'
      }, { status: 401 });
    }

    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyRecord = API_KEYS.get(keyHash);
    
    if (!keyRecord) {
      return NextResponse.json({
        success: false,
        error: 'API key not found',
        code: 'KEY_NOT_FOUND'
      }, { status: 401 });
    }

    const agentRecord = AGENTS.get(keyRecord.agent_id);
    
    if (!agentRecord || agentRecord.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'Agent account inactive',
        code: 'AGENT_INACTIVE'
      }, { status: 401 });
    }

    // Update usage tracking
    keyRecord.last_used = new Date().toISOString();
    keyRecord.request_count++;
    agentRecord.last_active = new Date().toISOString();
    agentRecord.total_requests++;

    return NextResponse.json({
      success: true,
      valid: true,
      agent: {
        id: agentRecord.id,
        agent_id: agentRecord.agent_id,
        agent_name: agentRecord.agent_name,
        agent_type: agentRecord.agent_type,
        capabilities: agentRecord.capabilities,
        scope: agentRecord.scope
      },
      usage: {
        total_requests: agentRecord.total_requests,
        last_active: agentRecord.last_active,
        rate_limit: agentRecord.rate_limit,
        requests_remaining: Math.max(0, agentRecord.rate_limit.daily - (keyRecord.request_count % agentRecord.rate_limit.daily))
      },
      permissions: getScopePermissions(agentRecord.scope)
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'AUTH_VALIDATION_ERROR'
    }, { status: 500 });
  }
}

// DELETE /api/v1/auth - Revoke API key
export async function DELETE(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid Authorization header',
        code: 'MISSING_AUTH'
      }, { status: 401 });
    }

    const apiKey = authHeader.substring(7);
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyRecord = API_KEYS.get(keyHash);
    
    if (!keyRecord) {
      return NextResponse.json({
        success: false,
        error: 'API key not found',
        code: 'KEY_NOT_FOUND'
      }, { status: 404 });
    }

    // Revoke the key
    API_KEYS.delete(keyHash);
    
    // Update agent status if this was their only key
    const agentRecord = AGENTS.get(keyRecord.agent_id);
    if (agentRecord) {
      const hasOtherKeys = Array.from(API_KEYS.values()).some(key => key.agent_id === keyRecord.agent_id);
      if (!hasOtherKeys) {
        agentRecord.status = 'inactive';
      }
    }

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
      revoked_at: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'REVOCATION_ERROR'
    }, { status: 500 });
  }
}

// Helper functions
function getScopedRateLimit(scope) {
  const limits = {
    'read_only': { daily: 10000, hourly: 1000, burst: 100 },
    'purchase_only': { daily: 1000, hourly: 100, burst: 10 },
    'full': { daily: 50000, hourly: 5000, burst: 500 }
  };
  return limits[scope] || limits['full'];
}

function getScopePermissions(scope) {
  const permissions = {
    'read_only': ['search', 'browse', 'view_listings', 'view_agent_info'],
    'purchase_only': ['search', 'browse', 'view_listings', 'purchase', 'view_orders'],
    'full': ['search', 'browse', 'view_listings', 'purchase', 'view_orders', 'create_listings', 'manage_account', 'webhooks']
  };
  return permissions[scope] || [];
}

// Middleware function for other APIs to validate authentication
export function authenticateAgent(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header', status: 401 };
  }

  const apiKey = authHeader.substring(7);
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  const keyRecord = API_KEYS.get(keyHash);
  
  if (!keyRecord) {
    return { error: 'Invalid API key', status: 401 };
  }

  const agentRecord = AGENTS.get(keyRecord.agent_id);
  
  if (!agentRecord || agentRecord.status !== 'active') {
    return { error: 'Agent account inactive', status: 401 };
  }

  return { 
    success: true, 
    agent: agentRecord, 
    keyRecord,
    permissions: getScopePermissions(agentRecord.scope)
  };
}