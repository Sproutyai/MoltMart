import { NextResponse } from 'next/server';

/**
 * Agent Registration API
 * Allows AI agents to register as sellers or buyers on the platform
 */

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      agent_id,
      agent_name,
      agent_type, // 'seller', 'buyer', or 'both'
      capabilities = [],
      contact_info = {},
      verification_data = {},
      wallet_address = null,
      github_repo = null,
      operational_since = null
    } = body;

    // Validate required fields
    if (!agent_id || !agent_name || !agent_type) {
      return NextResponse.json({
        success: false,
        error: 'agent_id, agent_name, and agent_type are required',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    // Generate API credentials
    const apiKey = `mk_${agent_type}_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
    const agentToken = `agt_${Math.random().toString(36).substr(2, 20)}`;

    // Mock verification process
    const verificationStatus = await verifyAgent(verification_data);

    // Create agent profile
    const agentProfile = {
      id: `agent_${Date.now()}`,
      agent_id,
      agent_name,
      agent_type,
      capabilities,
      contact_info,
      wallet_address,
      github_repo,
      operational_since,
      verification_status: verificationStatus.status,
      verification_score: verificationStatus.score,
      api_key: apiKey,
      agent_token: agentToken,
      created_at: new Date().toISOString(),
      status: 'active',
      rating: 0,
      total_transactions: 0,
      gross_revenue: 0
    };

    return NextResponse.json({
      success: true,
      agent: {
        id: agentProfile.id,
        agent_id,
        agent_name,
        agent_type,
        verification_status: verificationStatus.status,
        verification_score: verificationStatus.score
      },
      credentials: {
        api_key: apiKey,
        agent_token: agentToken,
        endpoints: {
          listings: 'https://moltmart.com/api/v1/listings',
          search: 'https://moltmart.com/api/v1/search',
          transactions: 'https://moltmart.com/api/v1/transactions',
          profile: `https://moltmart.com/api/v1/agents/${agentProfile.id}`
        }
      },
      onboarding: {
        next_steps: agent_type === 'seller' || agent_type === 'both' ? [
          'Create your first service listing',
          'Set up payment information',
          'Configure service monitoring',
          'Join our Discord community'
        ] : [
          'Browse available services',
          'Set up payment method',
          'Try some demo services',
          'Follow interesting sellers'
        ],
        documentation: 'https://docs.moltmart.com/agents/getting-started',
        support_channel: 'https://discord.gg/moltmart-agents'
      },
      verification: verificationStatus
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'REGISTRATION_FAILED'
    }, { status: 500 });
  }
}

// GET agent profile
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');

    if (!agentId) {
      return NextResponse.json({
        success: false,
        error: 'agent_id parameter required',
        code: 'MISSING_AGENT_ID'
      }, { status: 400 });
    }

    // Mock agent lookup
    const mockAgent = {
      id: 'agent_123456',
      agent_id: agentId,
      agent_name: 'Advanced Trading Bot',
      agent_type: 'seller',
      capabilities: ['trading', 'market-analysis', 'risk-management'],
      verification_status: 'verified',
      verification_score: 0.95,
      rating: 4.8,
      total_transactions: 247,
      gross_revenue: 15420.00,
      services_count: 3,
      created_at: '2024-01-15T10:30:00Z',
      last_active: new Date().toISOString(),
      status: 'active'
    };

    return NextResponse.json({
      success: true,
      agent: mockAgent,
      public_profile: {
        agent_name: mockAgent.agent_name,
        capabilities: mockAgent.capabilities,
        verification_status: mockAgent.verification_status,
        rating: mockAgent.rating,
        services_count: mockAgent.services_count,
        member_since: mockAgent.created_at
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'PROFILE_LOOKUP_FAILED'
    }, { status: 500 });
  }
}

// Agent verification logic
async function verifyAgent(verificationData) {
  const { github_repo, operational_proof, network_attestations = [] } = verificationData;
  
  let score = 0;
  let status = 'unverified';
  let checks = {
    github_verified: false,
    operational_proof: false,
    network_attestations: false,
    identity_confirmed: false
  };

  // Check GitHub repository
  if (github_repo) {
    // In production, would actually check GitHub API
    const githubValid = github_repo.includes('github.com') && github_repo.length > 20;
    if (githubValid) {
      checks.github_verified = true;
      score += 0.3;
    }
  }

  // Check operational proof
  if (operational_proof) {
    // Could be API logs, transaction history, etc.
    checks.operational_proof = true;
    score += 0.4;
  }

  // Check network attestations
  if (network_attestations.length > 0) {
    checks.network_attestations = true;
    score += 0.2 * Math.min(network_attestations.length / 3, 1);
  }

  // Basic identity confirmation
  checks.identity_confirmed = true;
  score += 0.1;

  // Determine status
  if (score >= 0.8) status = 'verified';
  else if (score >= 0.5) status = 'partially_verified';
  else status = 'unverified';

  return {
    status,
    score: Math.round(score * 100) / 100,
    checks,
    recommendations: generateVerificationRecommendations(checks)
  };
}

function generateVerificationRecommendations(checks) {
  const recommendations = [];
  
  if (!checks.github_verified) {
    recommendations.push('Link a GitHub repository with your agent code to increase trust');
  }
  
  if (!checks.operational_proof) {
    recommendations.push('Provide operational proof (API logs, usage statistics) to verify your agent works');
  }
  
  if (!checks.network_attestations) {
    recommendations.push('Get attestations from other verified agents you\'ve worked with');
  }

  return recommendations;
}