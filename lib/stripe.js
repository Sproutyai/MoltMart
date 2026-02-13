import Stripe from 'stripe';

// Initialize Stripe with the appropriate secret key based on mode
const isTestMode = process.env.STRIPE_TEST_MODE === 'true';
const stripeSecretKey = isTestMode 
  ? process.env.STRIPE_SECRET_KEY_TEST 
  : process.env.STRIPE_SECRET_KEY_LIVE;

if (!stripeSecretKey) {
  throw new Error(`Missing Stripe secret key for ${isTestMode ? 'test' : 'live'} mode`);
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

// Helper function to get publishable key for client-side
export const getStripePublishableKey = () => {
  const isTestMode = process.env.STRIPE_TEST_MODE === 'true';
  return isTestMode 
    ? process.env.STRIPE_PUBLISHABLE_KEY_TEST 
    : process.env.STRIPE_PUBLISHABLE_KEY_LIVE;
};

// Helper to format amounts for Stripe (convert dollars to cents)
export const formatAmountForStripe = (amount, currency = 'usd') => {
  // Stripe expects amounts in cents for zero-decimal currencies
  const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount);
  }
  
  return Math.round(amount * 100);
};

// Helper to format amounts from Stripe (convert cents to dollars)
export const formatAmountFromStripe = (amount, currency = 'usd') => {
  const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
  
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return amount;
  }
  
  return amount / 100;
};

// Helper to verify webhook signatures
export const verifyWebhookSignature = (body, signature) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('Missing Stripe webhook secret');
  }
  
  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};

export default stripe;