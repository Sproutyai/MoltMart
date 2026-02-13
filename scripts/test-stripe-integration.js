#!/usr/bin/env node

/**
 * Stripe Integration Test Script for MoltMart
 * 
 * This script tests the Stripe integration without making real payments.
 * It validates configuration and API connectivity.
 * 
 * Usage: node scripts/test-stripe-integration.js
 */

const { config, validateConfig, getConfigSummary } = require('../lib/config');

async function testStripeIntegration() {
  console.log('🧪 Testing MoltMart Stripe Integration\n');

  // 1. Validate Configuration
  console.log('📋 Validating Configuration...');
  const validation = validateConfig();
  
  if (!validation.isValid) {
    console.error('❌ Configuration validation failed:');
    validation.errors.forEach(error => console.error(`   - ${error}`));
    return false;
  }
  console.log('✅ Configuration valid\n');

  // 2. Display Configuration Summary
  console.log('⚙️  Configuration Summary:');
  const summary = getConfigSummary();
  console.log(`   Stripe Mode: ${summary.stripeMode}`);
  console.log(`   Environment: ${summary.environment}`);
  console.log(`   App URL: ${summary.appUrl}`);
  console.log(`   Features: ${summary.featuresEnabled.join(', ') || 'None'}`);
  console.log('');

  // 3. Test Stripe Connection
  console.log('🔗 Testing Stripe Connection...');
  try {
    const Stripe = require('stripe');
    const stripe = Stripe(config.stripe.secretKey);
    
    // Test API connectivity by retrieving account info
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Connected to Stripe account: ${account.email || account.id}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Charges enabled: ${account.charges_enabled}`);
    console.log(`   Payouts enabled: ${account.payouts_enabled}`);
  } catch (error) {
    console.error('❌ Stripe connection failed:', error.message);
    return false;
  }
  console.log('');

  // 4. Test Webhook Secret
  console.log('🔐 Testing Webhook Configuration...');
  if (config.stripe.webhookSecret) {
    if (config.stripe.webhookSecret.startsWith('whsec_')) {
      console.log('✅ Webhook secret format is correct');
    } else {
      console.warn('⚠️  Webhook secret format may be incorrect (should start with whsec_)');
    }
  } else {
    console.error('❌ Webhook secret is missing');
    return false;
  }
  console.log('');

  // 5. Test Supabase Connection
  console.log('🗄️  Testing Supabase Connection...');
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      config.supabase.url,
      config.supabase.serviceKey
    );

    // Test connection by querying profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful');
  } catch (error) {
    console.error('❌ Supabase test failed:', error.message);
    return false;
  }
  console.log('');

  // 6. Test API Endpoints (if server is running)
  console.log('🌐 Testing API Endpoints...');
  const endpoints = [
    '/api/health',
    '/api/test'
  ];

  for (const endpoint of endpoints) {
    try {
      const fetch = require('node-fetch');
      const response = await fetch(`${config.app.url}${endpoint}`);
      
      if (response.ok) {
        console.log(`✅ ${endpoint} - OK`);
      } else {
        console.log(`⚠️  ${endpoint} - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`⚠️  ${endpoint} - Server not running or unreachable`);
    }
  }
  console.log('');

  // 7. Security Recommendations
  console.log('🔒 Security Checklist:');
  const checks = [
    {
      name: 'Using HTTPS in production',
      check: !config.app.url.startsWith('http://') || config.app.url.includes('localhost'),
      critical: true
    },
    {
      name: 'Webhook secret configured',
      check: !!config.stripe.webhookSecret,
      critical: true
    },
    {
      name: 'Environment variables secured',
      check: process.env.NODE_ENV === 'production' ? !process.env.STRIPE_SECRET_KEY_TEST : true,
      critical: false
    }
  ];

  let criticalIssues = 0;
  checks.forEach(check => {
    const icon = check.check ? '✅' : (check.critical ? '❌' : '⚠️');
    console.log(`   ${icon} ${check.name}`);
    if (!check.check && check.critical) criticalIssues++;
  });

  if (criticalIssues > 0) {
    console.log(`\n⚠️  Found ${criticalIssues} critical security issues to address`);
  }

  // 8. Summary
  console.log('\n📊 Integration Test Summary:');
  console.log('✅ Stripe API connection: Working');
  console.log('✅ Configuration: Valid');
  console.log('✅ Supabase connection: Working');
  console.log(`${criticalIssues === 0 ? '✅' : '⚠️'} Security: ${criticalIssues === 0 ? 'Good' : 'Needs attention'}`);

  // 9. Next Steps
  console.log('\n📝 Next Steps:');
  if (config.stripe.isTestMode) {
    console.log('1. Test with Stripe test cards: 4242 4242 4242 4242');
    console.log('2. Create a test purchase through your app');
    console.log('3. Verify webhook handling in Stripe Dashboard');
    console.log('4. When ready, switch to production mode');
  } else {
    console.log('1. ⚠️  You\'re in PRODUCTION mode - be careful with real payments!');
    console.log('2. Monitor webhook delivery in Stripe Dashboard');
    console.log('3. Set up proper error monitoring and alerting');
  }

  return true;
}

// Run the test if called directly
if (require.main === module) {
  testStripeIntegration()
    .then(success => {
      console.log(success ? '\n🎉 Integration test completed!' : '\n❌ Integration test failed!');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Test script crashed:', error);
      process.exit(1);
    });
}

module.exports = { testStripeIntegration };