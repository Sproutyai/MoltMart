// Configuration management for MoltMart
export const config = {
  // Stripe Configuration
  stripe: {
    isTestMode: process.env.STRIPE_TEST_MODE === 'true',
    publishableKey: process.env.STRIPE_TEST_MODE === 'true' 
      ? process.env.STRIPE_PUBLISHABLE_KEY_TEST 
      : process.env.STRIPE_PUBLISHABLE_KEY_LIVE,
    secretKey: process.env.STRIPE_TEST_MODE === 'true'
      ? process.env.STRIPE_SECRET_KEY_TEST
      : process.env.STRIPE_SECRET_KEY_LIVE,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // App Configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    name: 'MoltMart',
    description: 'AI Agent Marketplace',
    supportEmail: 'support@moltmart.com',
  },

  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  // Payment Configuration
  payments: {
    defaultCurrency: 'USD',
    allowedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    
    // Shipping countries for physical products
    shippingCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
    
    // Session timeout (minutes)
    checkoutSessionTimeout: 30,
    
    // Tax configuration
    automaticTax: true,
  },

  // Features toggles
  features: {
    subscriptions: false,        // Enable subscription products
    multiVendor: true,          // Multiple sellers
    reviews: true,              // Product reviews
    wishlists: true,            // User wishlists
    affiliates: false,          // Affiliate program
    coupons: false,             // Discount codes
  },

  // Development settings
  development: {
    logWebhooks: process.env.NODE_ENV === 'development',
    verboseLogging: process.env.NODE_ENV === 'development',
    showPaymentTestMode: process.env.STRIPE_TEST_MODE === 'true',
  }
};

// Helper functions
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isStripeTestMode = () => config.stripe.isTestMode;

// Validation functions
export const validateConfig = () => {
  const errors = [];

  // Check required Stripe keys
  if (!config.stripe.publishableKey) {
    errors.push('Missing Stripe publishable key');
  }
  if (!config.stripe.secretKey) {
    errors.push('Missing Stripe secret key');
  }
  if (!config.stripe.webhookSecret) {
    errors.push('Missing Stripe webhook secret');
  }

  // Check Supabase config
  if (!config.supabase.url) {
    errors.push('Missing Supabase URL');
  }
  if (!config.supabase.anonKey) {
    errors.push('Missing Supabase anonymous key');
  }
  if (!config.supabase.serviceKey) {
    errors.push('Missing Supabase service key');
  }

  // Check app URL
  if (!config.app.url) {
    errors.push('Missing app URL');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get configuration summary for debugging
export const getConfigSummary = () => ({
  stripeMode: config.stripe.isTestMode ? 'test' : 'live',
  environment: process.env.NODE_ENV,
  appUrl: config.app.url,
  featuresEnabled: Object.entries(config.features)
    .filter(([_, enabled]) => enabled)
    .map(([feature, _]) => feature),
  hasRequiredKeys: {
    stripe: !!(config.stripe.publishableKey && config.stripe.secretKey),
    supabase: !!(config.supabase.url && config.supabase.anonKey),
    webhook: !!config.stripe.webhookSecret
  }
});

export default config;