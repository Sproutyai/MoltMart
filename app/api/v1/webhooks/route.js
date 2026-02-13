import { NextResponse } from 'next/server';
import { authenticateAgent } from '../auth/route.js';
import crypto from 'crypto';

/**
 * Webhook Management API for Event-Driven Architecture
 * Enables AI agents to receive real-time notifications instead of polling
 */

// Mock webhook storage (in production, use database)
const WEBHOOKS = new Map();
const WEBHOOK_EVENTS = new Map();

// Supported webhook event types
const EVENT_TYPES = [
  'service.purchased',
  'service.activated', 
  'service.suspended',
  'service.health.degraded',
  'service.health.recovered',
  'payment.completed',
  'payment.failed',
  'monitoring.alert.triggered',
  'monitoring.alert.resolved',
  'listing.approved',
  'listing.rejected',
  'review.created',
  'system.maintenance'
];

// POST /api/v1/webhooks - Register a new webhook
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
      url,
      events,
      secret,
      description,
      active = true,
      retry_policy = 'exponential_backoff'
    } = body;

    // Validate required fields
    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json({
        success: false,
        error: 'url and events array are required',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    // Validate event types
    const invalidEvents = events.filter(event => !EVENT_TYPES.includes(event));
    if (invalidEvents.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Invalid event types: ${invalidEvents.join(', ')}`,
        valid_events: EVENT_TYPES,
        code: 'INVALID_EVENT_TYPES'
      }, { status: 400 });
    }

    // Generate webhook ID and signing secret
    const webhookId = `wh_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const signingSecret = secret || generateSigningSecret();

    // Test webhook endpoint
    const testResult = await testWebhookEndpoint(url, signingSecret);
    if (!testResult.success && active) {
      return NextResponse.json({
        success: false,
        error: 'Webhook endpoint test failed',
        test_result: testResult,
        code: 'WEBHOOK_TEST_FAILED'
      }, { status: 400 });
    }

    // Create webhook configuration
    const webhook = {
      id: webhookId,
      agent_id: auth.agent.agent_id,
      url,
      events,
      secret: signingSecret,
      description: description || 'AI Agent webhook',
      active,
      retry_policy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stats: {
        total_deliveries: 0,
        successful_deliveries: 0,
        failed_deliveries: 0,
        last_delivery: null,
        last_success: null,
        last_failure: null
      },
      configuration: {
        timeout_seconds: 30,
        max_retries: 3,
        retry_delays: [1000, 5000, 15000], // ms
        headers: {
          'User-Agent': 'MoltMart-Webhooks/1.0',
          'Content-Type': 'application/json'
        }
      }
    };

    // Store webhook
    WEBHOOKS.set(webhookId, webhook);

    return NextResponse.json({
      success: true,
      webhook: {
        id: webhookId,
        url: webhook.url,
        events: webhook.events,
        active: webhook.active,
        created_at: webhook.created_at
      },
      signing_secret: signingSecret,
      test_result: testResult,
      setup_instructions: {
        verify_signature: 'Verify webhook signatures using HMAC SHA-256',
        retry_logic: 'Implement exponential backoff for failed deliveries',
        timeout_handling: 'Respond within 30 seconds to avoid retries',
        example_verification: generateSignatureExample(signingSecret)
      },
      next_steps: [
        'Save the signing secret securely - it won\'t be shown again',
        'Implement signature verification in your webhook handler',
        'Test your endpoint with the provided example',
        'Monitor webhook deliveries via the dashboard'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'WEBHOOK_CREATION_ERROR'
    }, { status: 500 });
  }
}

// GET /api/v1/webhooks - List agent's webhooks
export async function GET(request) {
  try {
    const auth = authenticateAgent(request);
    if (auth.error) {
      return NextResponse.json({
        success: false,
        error: auth.error,
        code: 'AUTHENTICATION_FAILED'
      }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const webhook_id = searchParams.get('id');

    if (webhook_id) {
      // Return specific webhook details
      const webhook = WEBHOOKS.get(webhook_id);
      if (!webhook || webhook.agent_id !== auth.agent.agent_id) {
        return NextResponse.json({
          success: false,
          error: 'Webhook not found',
          code: 'WEBHOOK_NOT_FOUND'
        }, { status: 404 });
      }

      // Get recent deliveries for this webhook
      const recentDeliveries = getRecentDeliveries(webhook_id);

      return NextResponse.json({
        success: true,
        webhook: {
          ...webhook,
          secret: 'hidden' // Don't expose secret in GET response
        },
        recent_deliveries: recentDeliveries,
        health_check: await performWebhookHealthCheck(webhook)
      });
    }

    // Return all webhooks for this agent
    const agentWebhooks = Array.from(WEBHOOKS.values())
      .filter(wh => wh.agent_id === auth.agent.agent_id)
      .map(wh => ({
        ...wh,
        secret: 'hidden' // Don't expose secrets
      }));

    return NextResponse.json({
      success: true,
      webhooks: agentWebhooks,
      total: agentWebhooks.length,
      available_events: EVENT_TYPES,
      webhook_limits: {
        max_webhooks_per_agent: 10,
        current_count: agentWebhooks.length
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'WEBHOOK_LIST_ERROR'
    }, { status: 500 });
  }
}

// PUT /api/v1/webhooks/:id - Update webhook configuration
export async function PUT(request) {
  try {
    const auth = authenticateAgent(request);
    if (auth.error) {
      return NextResponse.json({
        success: false,
        error: auth.error,
        code: 'AUTHENTICATION_FAILED'
      }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const webhook_id = searchParams.get('id');
    const body = await request.json();

    if (!webhook_id) {
      return NextResponse.json({
        success: false,
        error: 'Webhook ID is required',
        code: 'MISSING_WEBHOOK_ID'
      }, { status: 400 });
    }

    const webhook = WEBHOOKS.get(webhook_id);
    if (!webhook || webhook.agent_id !== auth.agent.agent_id) {
      return NextResponse.json({
        success: false,
        error: 'Webhook not found',
        code: 'WEBHOOK_NOT_FOUND'
      }, { status: 404 });
    }

    // Update allowed fields
    const updates = {};
    if (body.url !== undefined) updates.url = body.url;
    if (body.events !== undefined) updates.events = body.events;
    if (body.active !== undefined) updates.active = body.active;
    if (body.description !== undefined) updates.description = body.description;

    // Validate events if provided
    if (updates.events) {
      const invalidEvents = updates.events.filter(event => !EVENT_TYPES.includes(event));
      if (invalidEvents.length > 0) {
        return NextResponse.json({
          success: false,
          error: `Invalid event types: ${invalidEvents.join(', ')}`,
          valid_events: EVENT_TYPES,
          code: 'INVALID_EVENT_TYPES'
        }, { status: 400 });
      }
    }

    // Test new URL if provided
    if (updates.url && updates.url !== webhook.url) {
      const testResult = await testWebhookEndpoint(updates.url, webhook.secret);
      if (!testResult.success) {
        return NextResponse.json({
          success: false,
          error: 'New webhook URL test failed',
          test_result: testResult,
          code: 'WEBHOOK_TEST_FAILED'
        }, { status: 400 });
      }
    }

    // Apply updates
    Object.assign(webhook, updates, {
      updated_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      webhook: {
        ...webhook,
        secret: 'hidden'
      },
      message: 'Webhook updated successfully'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'WEBHOOK_UPDATE_ERROR'
    }, { status: 500 });
  }
}

// DELETE /api/v1/webhooks/:id - Delete webhook
export async function DELETE(request) {
  try {
    const auth = authenticateAgent(request);
    if (auth.error) {
      return NextResponse.json({
        success: false,
        error: auth.error,
        code: 'AUTHENTICATION_FAILED'
      }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const webhook_id = searchParams.get('id');

    if (!webhook_id) {
      return NextResponse.json({
        success: false,
        error: 'Webhook ID is required',
        code: 'MISSING_WEBHOOK_ID'
      }, { status: 400 });
    }

    const webhook = WEBHOOKS.get(webhook_id);
    if (!webhook || webhook.agent_id !== auth.agent.agent_id) {
      return NextResponse.json({
        success: false,
        error: 'Webhook not found',
        code: 'WEBHOOK_NOT_FOUND'
      }, { status: 404 });
    }

    // Delete webhook
    WEBHOOKS.delete(webhook_id);

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully',
      deleted_at: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'WEBHOOK_DELETE_ERROR'
    }, { status: 500 });
  }
}

// Helper functions

function generateSigningSecret() {
  return crypto.randomBytes(32).toString('hex');
}

async function testWebhookEndpoint(url, secret) {
  try {
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'This is a test webhook from Molt Mart'
      }
    };

    const signature = generateSignature(JSON.stringify(testPayload), secret);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MoltMart-Webhooks/1.0',
        'X-MoltMart-Signature': signature,
        'X-MoltMart-Event': 'webhook.test'
      },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    return {
      success: response.ok,
      status_code: response.status,
      response_time_ms: Date.now() - Date.now(), // Simplified
      message: response.ok ? 'Webhook endpoint is reachable' : `HTTP ${response.status}: ${response.statusText}`
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to connect to webhook endpoint'
    };
  }
}

function generateSignature(payload, secret) {
  return 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

function generateSignatureExample(secret) {
  const examplePayload = {
    event: 'service.purchased',
    timestamp: '2024-02-13T17:00:00Z',
    data: {
      service_id: 'svc_123',
      agent_id: 'your_agent_id',
      purchase_id: 'pur_456'
    }
  };

  const payloadString = JSON.stringify(examplePayload);
  const signature = generateSignature(payloadString, secret);

  return {
    payload: examplePayload,
    payload_string: payloadString,
    expected_signature: signature,
    verification_code: `
// Verify webhook signature in your handler
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Example usage
const isValid = verifyWebhookSignature(
  req.body, 
  req.headers['x-moltmart-signature'], 
  '${secret}'
);
    `.trim()
  };
}

function getRecentDeliveries(webhookId, limit = 10) {
  // In production, this would query the database
  // For now, return mock data
  return [
    {
      id: 'del_001',
      webhook_id: webhookId,
      event: 'service.purchased',
      status: 'success',
      response_code: 200,
      response_time_ms: 145,
      delivered_at: '2024-02-13T16:45:00Z',
      attempts: 1
    },
    {
      id: 'del_002',
      webhook_id: webhookId,
      event: 'monitoring.alert.triggered',
      status: 'failed',
      response_code: 500,
      response_time_ms: 30000,
      delivered_at: '2024-02-13T15:30:00Z',
      attempts: 3,
      error: 'Internal server error'
    }
  ];
}

async function performWebhookHealthCheck(webhook) {
  // Simplified health check
  const recentDeliveries = getRecentDeliveries(webhook.id, 50);
  const successRate = recentDeliveries.length > 0 ? 
    recentDeliveries.filter(d => d.status === 'success').length / recentDeliveries.length : 1;

  return {
    status: successRate > 0.9 ? 'healthy' : 'degraded',
    success_rate: Math.round(successRate * 100),
    last_successful_delivery: recentDeliveries.find(d => d.status === 'success')?.delivered_at,
    recommendation: successRate < 0.8 ? 'Check webhook endpoint reliability' : 'Webhook performing well'
  };
}

// Function to send webhook events (called by other services)
export async function sendWebhookEvent(eventType, eventData) {
  const relevantWebhooks = Array.from(WEBHOOKS.values())
    .filter(wh => wh.active && wh.events.includes(eventType));

  const deliveryPromises = relevantWebhooks.map(webhook => 
    deliverWebhook(webhook, eventType, eventData)
  );

  const results = await Promise.allSettled(deliveryPromises);
  
  return {
    event_type: eventType,
    webhooks_triggered: relevantWebhooks.length,
    successful_deliveries: results.filter(r => r.status === 'fulfilled').length,
    failed_deliveries: results.filter(r => r.status === 'rejected').length
  };
}

async function deliverWebhook(webhook, eventType, eventData) {
  const payload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    webhook_id: webhook.id,
    data: eventData
  };

  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString, webhook.secret);

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        ...webhook.configuration.headers,
        'X-MoltMart-Signature': signature,
        'X-MoltMart-Event': eventType,
        'X-MoltMart-Webhook-ID': webhook.id
      },
      body: payloadString,
      signal: AbortSignal.timeout(webhook.configuration.timeout_seconds * 1000)
    });

    // Update webhook stats
    webhook.stats.total_deliveries++;
    if (response.ok) {
      webhook.stats.successful_deliveries++;
      webhook.stats.last_success = new Date().toISOString();
    } else {
      webhook.stats.failed_deliveries++;
      webhook.stats.last_failure = new Date().toISOString();
    }
    webhook.stats.last_delivery = new Date().toISOString();

    return {
      success: response.ok,
      webhook_id: webhook.id,
      status_code: response.status
    };

  } catch (error) {
    webhook.stats.total_deliveries++;
    webhook.stats.failed_deliveries++;
    webhook.stats.last_failure = new Date().toISOString();
    webhook.stats.last_delivery = new Date().toISOString();

    throw error;
  }
}

export { EVENT_TYPES, sendWebhookEvent };