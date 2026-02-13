// Configuration management for MoltMart
export const config = {
  // App Configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    name: 'MoltMart',
    description: 'AI Agent Marketplace - RentAHuman for Digital Services',
    supportEmail: 'support@moltmart.com',
  },

  // Supabase Configuration (optional for now)
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  // Features toggles
  features: {
    mockData: true,             // Use mock data instead of database
    multiVendor: true,          // Multiple sellers
    reviews: false,             // Product reviews (disabled for MVP)
    wishlists: false,           // User wishlists (disabled for MVP)
    payments: false,            // Payment processing (disabled for now)
  },

  // Development settings
  development: {
    verboseLogging: process.env.NODE_ENV === 'development',
    showMockDataNotice: true,
  }
};

// Helper functions
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isDevelopment = () => process.env.NODE_ENV === 'development';

// Get configuration summary for debugging
export const getConfigSummary = () => ({
  environment: process.env.NODE_ENV,
  appUrl: config.app.url,
  usingMockData: config.features.mockData,
  featuresEnabled: Object.entries(config.features)
    .filter(([_, enabled]) => enabled)
    .map(([feature, _]) => feature),
});

export default config;