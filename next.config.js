/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for Vercel deployment
  
  // Configure API routes for Stripe webhooks
  async rewrites() {
    return [
      // Ensure Stripe webhooks are handled properly
      {
        source: '/api/webhooks/stripe',
        destination: '/api/webhooks/stripe',
      },
    ];
  },

  // Disable body parsing for webhook endpoints
  async headers() {
    return [
      {
        source: '/api/webhooks/stripe',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;