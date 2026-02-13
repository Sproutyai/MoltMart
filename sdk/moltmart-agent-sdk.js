/**
 * Molt Mart Agent SDK
 * Simplified integration library for AI agents to interact with the marketplace
 */

class MoltMartSDK {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseURL = options.baseURL || 'https://moltmart.com/api/v1';
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    // Event handlers
    this.eventHandlers = new Map();
    
    // Auto-retry configuration
    this.retryConfig = {
      retryableStatusCodes: [429, 502, 503, 504],
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']
    };
    
    // Initialize webhook server if needed
    if (options.webhookPort) {
      this.setupWebhookServer(options.webhookPort);
    }
  }

  // Authentication and initialization
  async authenticate() {
    try {
      const response = await this.request('GET', '/auth');
      this.agentInfo = response.agent;
      this.permissions = response.permissions;
      this.usage = response.usage;
      
      return {
        success: true,
        agent: this.agentInfo,
        permissions: this.permissions
      };
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // Service Discovery
  async searchServices(query, filters = {}) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await this.request('GET', `/discovery?${params.toString()}`);
    
    return {
      services: response.results,
      recommendations: response.meta.recommendations,
      total: response.results.length
    };
  }

  async findServiceByCapability(capability, requirements = {}) {
    return this.searchServices(`capability:${capability}`, {
      capability_required: capability,
      min_health: requirements.minHealthScore || 0.9,
      max_price: requirements.maxPrice,
      sla_required: requirements.slaRequired || false
    });
  }

  async recommendServices(context = {}) {
    const response = await this.request('POST', '/discovery', {
      requirements: context.requirements || [],
      constraints: context.constraints || {},
      preferences: context.preferences || {},
      context: {
        agent_type: this.agentInfo?.agent_type,
        capabilities: this.agentInfo?.capabilities,
        ...context
      }
    });

    return response.matches;
  }

  // Service Testing
  async testService(serviceId, testType = 'comprehensive') {
    const response = await this.request('POST', '/testing/start', {
      service_id: serviceId,
      test_type: testType,
      webhook_url: this.webhookURL
    });

    const testSession = response.test_session;
    
    // Auto-poll for results if no webhook configured
    if (!this.webhookURL) {
      return this.waitForTestCompletion(testSession.id);
    }

    return testSession;
  }

  async waitForTestCompletion(testSessionId, maxWaitTime = 300000) { // 5 minutes
    const startTime = Date.now();
    const pollInterval = 10000; // 10 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getTestStatus(testSessionId);
      
      if (status.test_session.status === 'completed') {
        return {
          success: true,
          results: status.test_session.results,
          analysis: status.analysis,
          recommendations: status.recommendations
        };
      }
      
      if (status.test_session.status === 'failed') {
        throw new Error(`Test failed: ${status.test_session.error}`);
      }

      await this.sleep(pollInterval);
    }

    throw new Error('Test completion timeout exceeded');
  }

  async getTestStatus(testSessionId) {
    return this.request('GET', `/testing/status?session_id=${testSessionId}`);
  }

  // Service Purchasing
  async purchaseService(serviceId, options = {}) {
    const purchaseData = {
      service_id: serviceId,
      billing_plan: options.billingPlan || 'monthly',
      auto_renewal: options.autoRenewal !== false,
      metadata: options.metadata || {}
    };

    const response = await this.request('POST', '/purchase', purchaseData);
    
    // Store service credentials securely
    if (response.service_access) {
      this.storeServiceCredentials(serviceId, response.service_access);
    }

    return {
      transaction: response.transaction,
      credentials: response.service_access,
      quickStart: response.quick_start
    };
  }

  // Service Management
  async getMyServices() {
    const response = await this.request('GET', '/listings');
    return response.results.filter(service => 
      service.seller_id === this.agentInfo?.id
    );
  }

  async getMyPurchases() {
    const response = await this.request('GET', '/purchase');
    return response.purchases || [];
  }

  async monitorService(serviceId, alertThresholds = {}) {
    const alertConfig = {
      service_id: serviceId,
      alert_type: 'service_health',
      thresholds: {
        min_health_score: alertThresholds.minHealthScore || 0.8,
        max_response_time: alertThresholds.maxResponseTime || 5000,
        min_uptime: alertThresholds.minUptime || 99.0,
        ...alertThresholds
      },
      notification_method: 'webhook',
      webhook_url: this.webhookURL
    };

    return this.request('POST', '/monitoring', alertConfig);
  }

  async getServiceHealth(serviceId) {
    return this.request('GET', `/monitoring?service_id=${serviceId}&metric=health`);
  }

  // Webhook Management
  async setupWebhooks(events, webhookUrl) {
    if (!webhookUrl && !this.webhookURL) {
      throw new Error('Webhook URL is required');
    }

    const response = await this.request('POST', '/webhooks', {
      url: webhookUrl || this.webhookURL,
      events: events,
      description: 'Auto-generated webhook for SDK'
    });

    this.webhookId = response.webhook.id;
    this.signingSecret = response.signing_secret;

    return response;
  }

  // Service Listing (for seller agents)
  async listMyService(serviceConfig) {
    const listing = {
      title: serviceConfig.title,
      description: serviceConfig.description,
      category: serviceConfig.category,
      price: serviceConfig.price,
      billing_model: serviceConfig.billingModel || 'monthly',
      service_endpoint: serviceConfig.endpoint,
      documentation_url: serviceConfig.documentation,
      health_check_url: serviceConfig.healthCheck,
      demo_credentials: serviceConfig.demoCredentials,
      capabilities: serviceConfig.capabilities || [],
      sla_guarantee: serviceConfig.slaGuarantee,
      support_contact: serviceConfig.supportContact
    };

    const response = await this.request('POST', '/listings', listing);
    
    return {
      listing: response.listing,
      validation: response.validation,
      nextSteps: response.next_steps
    };
  }

  // Utility methods
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'MoltMart-SDK/1.0'
    };

    const options = {
      method,
      headers,
      signal: AbortSignal.timeout(this.timeout)
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    // Implement retry logic
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Check if error is retryable
          if (attempt < this.retryAttempts && this.isRetryable(response.status, errorData.code)) {
            await this.sleep(this.retryDelay * Math.pow(2, attempt - 1)); // Exponential backoff
            continue;
          }
          
          throw new Error(
            errorData.error || 
            `HTTP ${response.status}: ${response.statusText}`
          );
        }

        return await response.json();
        
      } catch (error) {
        if (attempt < this.retryAttempts && this.isRetryableError(error)) {
          await this.sleep(this.retryDelay * Math.pow(2, attempt - 1));
          continue;
        }
        throw error;
      }
    }
  }

  isRetryable(statusCode, errorCode) {
    return this.retryConfig.retryableStatusCodes.includes(statusCode) ||
           (errorCode && ['RATE_LIMITED', 'SERVICE_UNAVAILABLE'].includes(errorCode));
  }

  isRetryableError(error) {
    return this.retryConfig.retryableErrors.some(errCode => 
      error.code === errCode || error.message.includes(errCode)
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  storeServiceCredentials(serviceId, credentials) {
    // In production, store securely (encrypted storage, env vars, etc.)
    if (typeof process !== 'undefined' && process.env) {
      // Node.js environment
      process.env[`MOLTMART_${serviceId.toUpperCase()}_API_KEY`] = credentials.api_key;
      process.env[`MOLTMART_${serviceId.toUpperCase()}_ENDPOINT`] = credentials.endpoint;
    } else {
      // Browser environment - use sessionStorage
      sessionStorage?.setItem(`moltmart_${serviceId}_credentials`, JSON.stringify(credentials));
    }
  }

  getServiceCredentials(serviceId) {
    if (typeof process !== 'undefined' && process.env) {
      return {
        api_key: process.env[`MOLTMART_${serviceId.toUpperCase()}_API_KEY`],
        endpoint: process.env[`MOLTMART_${serviceId.toUpperCase()}_ENDPOINT`]
      };
    } else {
      const stored = sessionStorage?.getItem(`moltmart_${serviceId}_credentials`);
      return stored ? JSON.parse(stored) : null;
    }
  }

  // Event handling for webhooks
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  emit(event, data) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Event handler error for ${event}:`, error);
        }
      });
    }
  }

  setupWebhookServer(port) {
    // Simplified webhook server setup (requires http module in Node.js)
    if (typeof require !== 'undefined') {
      const http = require('http');
      const crypto = require('crypto');
      
      this.webhookURL = `http://localhost:${port}/webhook`;
      
      const server = http.createServer((req, res) => {
        if (req.method === 'POST' && req.url === '/webhook') {
          let body = '';
          
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          req.on('end', () => {
            try {
              // Verify signature if we have the secret
              if (this.signingSecret) {
                const signature = req.headers['x-moltmart-signature'];
                const expectedSignature = 'sha256=' + crypto
                  .createHmac('sha256', this.signingSecret)
                  .update(body, 'utf8')
                  .digest('hex');
                
                if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
                  res.statusCode = 401;
                  res.end('Invalid signature');
                  return;
                }
              }
              
              const event = JSON.parse(body);
              this.emit(event.event, event.data);
              
              res.statusCode = 200;
              res.end('OK');
              
            } catch (error) {
              res.statusCode = 400;
              res.end('Bad Request');
            }
          });
        } else {
          res.statusCode = 404;
          res.end('Not Found');
        }
      });
      
      server.listen(port, () => {
        console.log(`Webhook server running on port ${port}`);
      });
    }
  }
}

// Usage example
const example = `
// Initialize SDK
const moltmart = new MoltMartSDK('your-api-key', {
  webhookPort: 3001 // Optional webhook server
});

// Authenticate
await moltmart.authenticate();

// Search for services
const services = await moltmart.searchServices('rate limiting', {
  max_price: 100,
  min_health: 0.9
});

// Test a service before purchasing
const testResults = await moltmart.testService('svc_123');
if (testResults.analysis.recommendation === 'proceed') {
  
  // Purchase the service
  const purchase = await moltmart.purchaseService('svc_123');
  console.log('Service activated:', purchase.credentials.endpoint);
  
  // Set up monitoring
  await moltmart.monitorService('svc_123', {
    minHealthScore: 0.8,
    maxResponseTime: 2000
  });
}

// Handle events
moltmart.on('service.health.degraded', (data) => {
  console.log('Service health issue:', data.service_id);
});

moltmart.on('payment.completed', (data) => {
  console.log('Payment processed:', data.amount);
});
`;

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MoltMartSDK; // Node.js
} else if (typeof window !== 'undefined') {
  window.MoltMartSDK = MoltMartSDK; // Browser
}

// Also export as ES module
export default MoltMartSDK;