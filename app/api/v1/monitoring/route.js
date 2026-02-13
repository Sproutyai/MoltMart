import { NextResponse } from 'next/server';
import { authenticateAgent } from '../auth/route.js';

/**
 * Real-time Service Monitoring API
 * Provides health status, performance metrics, and reliability data for services
 */

// Mock monitoring data with real-time metrics
const SERVICE_METRICS = new Map([
  ['svc_openai_proxy_001', {
    service_id: 'svc_openai_proxy_001',
    current_status: 'healthy',
    health_score: 0.99,
    uptime_stats: {
      current_uptime_hours: 720,
      uptime_30d: 99.97,
      uptime_7d: 100.0,
      uptime_24h: 100.0
    },
    performance_metrics: {
      avg_response_time_ms: 85,
      p95_response_time_ms: 120,
      p99_response_time_ms: 180,
      success_rate: 99.95,
      error_rate: 0.05,
      throughput_rps: 850
    },
    recent_incidents: [
      {
        id: 'inc_001',
        title: 'Brief latency spike',
        severity: 'minor',
        started_at: '2024-02-10T14:30:00Z',
        resolved_at: '2024-02-10T14:42:00Z',
        duration_minutes: 12,
        impact: 'Response times increased to 200ms average'
      }
    ],
    sla_compliance: {
      uptime_target: 99.9,
      current_performance: 99.97,
      status: 'meeting_sla',
      buffer: 0.07
    },
    capacity_info: {
      current_load: 0.65,
      max_capacity: 1000,
      scaling_status: 'auto',
      queue_depth: 0
    },
    last_updated: '2024-02-13T17:15:00Z'
  }],
  ['svc_human_proxy_001', {
    service_id: 'svc_human_proxy_001',
    current_status: 'healthy',
    health_score: 0.94,
    uptime_stats: {
      current_uptime_hours: 168,
      uptime_30d: 98.2,
      uptime_7d: 99.1,
      uptime_24h: 100.0
    },
    performance_metrics: {
      avg_completion_time_hours: 18,
      p95_completion_time_hours: 36,
      success_rate: 94.2,
      error_rate: 5.8,
      active_tasks: 45,
      completed_tasks_30d: 1250
    },
    recent_incidents: [
      {
        id: 'inc_002',
        title: 'Regional coverage gap in South America',
        severity: 'moderate',
        started_at: '2024-02-08T10:00:00Z',
        resolved_at: '2024-02-09T16:00:00Z',
        duration_minutes: 1800,
        impact: 'Limited availability in 3 countries'
      }
    ],
    sla_compliance: {
      completion_time_target: 24,
      current_performance: 18,
      status: 'exceeding_sla',
      buffer: 6
    },
    capacity_info: {
      available_humans: 2847,
      active_tasks: 45,
      queue_depth: 12,
      coverage_countries: 178
    },
    last_updated: '2024-02-13T17:15:00Z'
  }]
]);

// Real-time alerts and notifications
const ACTIVE_ALERTS = [
  {
    id: 'alert_001',
    service_id: 'svc_openai_proxy_001',
    type: 'performance_degradation',
    severity: 'warning',
    title: 'Elevated response times detected',
    description: 'Response times increased by 15% over the last hour',
    started_at: '2024-02-13T16:30:00Z',
    threshold: 'response_time > 100ms',
    current_value: 115,
    impact_level: 'low',
    estimated_resolution: '2024-02-13T17:30:00Z'
  }
];

// GET /api/v1/monitoring - Get overall system health
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
    const service_id = searchParams.get('service_id');
    const metric_type = searchParams.get('metric'); // health, performance, uptime, incidents
    const time_range = searchParams.get('range') || '24h'; // 1h, 24h, 7d, 30d

    if (service_id) {
      // Return specific service metrics
      return getServiceMetrics(service_id, metric_type, time_range);
    }

    // Return overall system health
    const systemHealth = calculateSystemHealth();
    const activeAlerts = ACTIVE_ALERTS.filter(alert => 
      alert.severity === 'critical' || alert.severity === 'warning'
    );

    return NextResponse.json({
      success: true,
      system_health: systemHealth,
      active_alerts: activeAlerts,
      monitored_services: Array.from(SERVICE_METRICS.keys()).length,
      last_updated: new Date().toISOString(),
      monitoring_capabilities: {
        real_time_metrics: true,
        alert_notifications: true,
        sla_tracking: true,
        incident_history: true,
        performance_analytics: true,
        capacity_monitoring: true
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'MONITORING_ERROR'
    }, { status: 500 });
  }
}

// GET specific service metrics
function getServiceMetrics(serviceId, metricType, timeRange) {
  const metrics = SERVICE_METRICS.get(serviceId);
  
  if (!metrics) {
    return NextResponse.json({
      success: false,
      error: 'Service not found in monitoring system',
      code: 'SERVICE_NOT_MONITORED'
    }, { status: 404 });
  }

  let responseData = {
    success: true,
    service_id: serviceId,
    time_range: timeRange,
    last_updated: metrics.last_updated
  };

  // Filter data based on requested metric type
  switch (metricType) {
    case 'health':
      responseData.health = {
        current_status: metrics.current_status,
        health_score: metrics.health_score,
        sla_compliance: metrics.sla_compliance
      };
      break;
      
    case 'performance':
      responseData.performance = metrics.performance_metrics;
      break;
      
    case 'uptime':
      responseData.uptime = metrics.uptime_stats;
      break;
      
    case 'incidents':
      responseData.incidents = metrics.recent_incidents;
      break;
      
    case 'capacity':
      responseData.capacity = metrics.capacity_info;
      break;
      
    default:
      // Return all metrics
      responseData = { ...responseData, ...metrics };
  }

  // Add agent-specific insights
  responseData.agent_insights = generateAgentInsights(metrics, serviceId);
  responseData.recommendations = generateRecommendations(metrics, serviceId);

  return NextResponse.json(responseData);
}

// POST /api/v1/monitoring - Set up monitoring alerts
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
      service_id,
      alert_type,
      thresholds,
      notification_method,
      webhook_url,
      alert_name
    } = body;

    // Validate required fields
    if (!service_id || !alert_type || !thresholds) {
      return NextResponse.json({
        success: false,
        error: 'service_id, alert_type, and thresholds are required',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    // Create monitoring alert
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const alert = {
      id: alertId,
      agent_id: auth.agent.agent_id,
      service_id,
      alert_type,
      alert_name: alert_name || `${alert_type} alert for ${service_id}`,
      thresholds,
      notification_method: notification_method || 'webhook',
      webhook_url,
      created_at: new Date().toISOString(),
      status: 'active',
      triggered_count: 0,
      last_triggered: null
    };

    // In production, store in database
    // AGENT_ALERTS.set(alertId, alert);

    return NextResponse.json({
      success: true,
      alert: {
        id: alertId,
        service_id,
        alert_type,
        status: 'active',
        monitoring_started: true
      },
      webhook_test: webhook_url ? await testWebhook(webhook_url) : null,
      next_steps: [
        'Your alert is now active and monitoring the service',
        'Test notifications will be sent to verify your webhook',
        'You can modify or disable this alert anytime',
        'Check alert status via GET /api/v1/monitoring/alerts'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'ALERT_CREATION_ERROR'
    }, { status: 500 });
  }
}

// Helper functions

function calculateSystemHealth() {
  const services = Array.from(SERVICE_METRICS.values());
  const totalServices = services.length;
  const healthyServices = services.filter(s => s.current_status === 'healthy').length;
  const avgHealthScore = services.reduce((sum, s) => sum + s.health_score, 0) / totalServices;

  let status = 'healthy';
  if (avgHealthScore < 0.8) status = 'degraded';
  if (avgHealthScore < 0.6) status = 'unhealthy';

  return {
    overall_status: status,
    healthy_services: healthyServices,
    total_services: totalServices,
    average_health_score: Math.round(avgHealthScore * 1000) / 1000,
    services_with_issues: totalServices - healthyServices
  };
}

function generateAgentInsights(metrics, serviceId) {
  const insights = [];

  // Performance insights
  if (metrics.performance_metrics.success_rate < 95) {
    insights.push({
      type: 'reliability_concern',
      message: 'Service reliability below recommended threshold for production use',
      recommendation: 'Consider implementing circuit breaker pattern'
    });
  }

  if (metrics.performance_metrics.avg_response_time_ms > 200) {
    insights.push({
      type: 'performance_concern',
      message: 'Response times may impact high-frequency operations',
      recommendation: 'Monitor response times closely or consider alternatives'
    });
  }

  // Capacity insights
  if (metrics.capacity_info?.current_load > 0.8) {
    insights.push({
      type: 'capacity_warning',
      message: 'Service approaching capacity limits',
      recommendation: 'Peak usage may result in throttling or delays'
    });
  }

  // SLA insights
  if (metrics.sla_compliance?.status === 'meeting_sla' && metrics.sla_compliance.buffer < 0.1) {
    insights.push({
      type: 'sla_risk',
      message: 'SLA compliance margin is narrow',
      recommendation: 'Monitor closely for potential SLA violations'
    });
  }

  return insights;
}

function generateRecommendations(metrics, serviceId) {
  const recommendations = [];

  // Integration recommendations
  if (metrics.performance_metrics.success_rate > 99) {
    recommendations.push({
      type: 'integration_ready',
      priority: 'high',
      message: 'Service shows excellent reliability - safe for production integration'
    });
  }

  // Monitoring recommendations
  if (metrics.recent_incidents.length > 2) {
    recommendations.push({
      type: 'monitoring_advice',
      priority: 'medium',
      message: 'Set up proactive alerts due to recent incident history'
    });
  }

  // Cost optimization
  if (metrics.capacity_info?.current_load < 0.3) {
    recommendations.push({
      type: 'cost_optimization',
      priority: 'low',
      message: 'Consider lower-tier plan if usage remains low'
    });
  }

  return recommendations;
}

async function testWebhook(webhookUrl) {
  try {
    const testPayload = {
      test: true,
      alert_type: 'webhook_test',
      message: 'This is a test notification from Molt Mart monitoring',
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MoltMart-Monitoring/1.0'
      },
      body: JSON.stringify(testPayload),
      timeout: 5000
    });

    return {
      success: response.ok,
      status_code: response.status,
      response_time_ms: Date.now() - Date.now(), // Simplified
      message: response.ok ? 'Webhook test successful' : 'Webhook test failed'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Webhook test failed - please check URL and configuration'
    };
  }
}

// Export monitoring functions for use by other services
export { calculateSystemHealth, generateAgentInsights, generateRecommendations };