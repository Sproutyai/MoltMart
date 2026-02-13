# Stripe Payment Integration for MoltMart

## Overview
This implementation provides a complete Stripe payment integration for MoltMart, enabling AI agents and their humans to complete secure transactions. The system includes:

- ✅ Stripe checkout session creation
- ✅ Payment success/cancel pages
- ✅ Order completion workflow
- ✅ Invoice/receipt system
- ✅ Webhook handling for payment events
- ✅ Production-ready error handling
- ✅ Test mode toggle

## Setup Instructions

### 1. Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Complete account verification for production use
3. Navigate to the Dashboard

### 2. Get API Keys
1. In Stripe Dashboard, go to **Developers > API keys**
2. Copy your **Publishable key** and **Secret key** for both Test and Live modes

### 3. Configure Webhooks
1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://your-domain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded` (for subscriptions)
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret**

### 4. Update Environment Variables
Update your `.env.local` file with your Stripe keys:

```env
# Stripe Configuration
STRIPE_TEST_MODE=true  # Set to false for production
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_your_test_key
STRIPE_SECRET_KEY_TEST=sk_test_your_test_secret_key
STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_your_live_key
STRIPE_SECRET_KEY_LIVE=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com  # or http://localhost:3000 for dev
```

### 5. Test the Integration
1. Set `STRIPE_TEST_MODE=true` in your environment
2. Use test card numbers from [Stripe's testing guide](https://stripe.com/docs/testing)
3. Test successful payment: `4242 4242 4242 4242`
4. Test failed payment: `4000 0000 0000 0002`

## File Structure

```
moltmart/
├── lib/
│   └── stripe.js                     # Stripe configuration and utilities
├── app/
│   ├── api/
│   │   ├── create-checkout-session/
│   │   │   └── route.js              # Create Stripe checkout sessions
│   │   ├── verify-payment/
│   │   │   └── route.js              # Verify payment completion
│   │   ├── cancel-payment/
│   │   │   └── route.js              # Handle payment cancellations
│   │   ├── invoice/
│   │   │   └── [purchaseId]/
│   │   │       └── route.js          # Generate invoices
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.js          # Stripe webhook handler
│   └── payment/
│       ├── success/
│       │   └── page.js               # Payment success page
│       └── cancel/
│           └── page.js               # Payment cancellation page
├── components/
│   └── PaymentButton.js              # Reusable payment button
└── STRIPE_INTEGRATION_README.md       # This file
```

## Usage

### Basic Payment Button
```jsx
import PaymentButton from '@/components/PaymentButton';

function ProductPage({ product, user }) {
  return (
    <div>
      <h1>{product.title}</h1>
      <p>${product.price}</p>
      <PaymentButton product={product} user={user} />
    </div>
  );
}
```

### Custom Payment Button
```jsx
<PaymentButton 
  product={product} 
  user={user} 
  quantity={2}
  className="custom-button-class"
  disabled={outOfStock}
>
  Buy 2 for ${product.price * 2}
</PaymentButton>
```

## API Endpoints

### Create Checkout Session
**POST** `/api/create-checkout-session`
```json
{
  "productId": "uuid",
  "userId": "uuid",
  "quantity": 1
}
```

### Verify Payment
**POST** `/api/verify-payment`
```json
{
  "sessionId": "cs_...",
  "purchaseId": "uuid"
}
```

### Cancel Payment
**POST** `/api/cancel-payment`
```json
{
  "purchaseId": "uuid"
}
```

### Download Invoice
**GET** `/api/invoice/[purchaseId]`

## Database Schema Updates

The integration uses the existing `purchases` table with these key fields:
- `stripe_payment_intent_id`: Stores Stripe session/payment intent ID
- `status`: Payment status (pending, completed, failed, cancelled)
- `payment_method`: Payment method used (card, etc.)
- `amount`: Purchase amount
- `currency`: Currency code

## Production Checklist

### Before Going Live:
1. ✅ Set `STRIPE_TEST_MODE=false`
2. ✅ Add live Stripe API keys
3. ✅ Update webhook endpoint URL to production domain
4. ✅ Test with real payment methods
5. ✅ Verify webhook signature validation
6. ✅ Set up monitoring and alerting
7. ✅ Configure proper error reporting
8. ✅ Add HTTPS certificate
9. ✅ Test invoice generation
10. ✅ Verify email notifications work

### Security Considerations:
- Webhook endpoints validate Stripe signatures
- Payment amounts are verified server-side
- User authentication required for purchases
- Environment variables secured
- HTTPS enforced for all payment flows

### Monitoring:
- Log all webhook events
- Monitor failed payments
- Track conversion rates
- Set up alerts for webhook failures
- Monitor for suspicious activity

## Testing Scenarios

### Test Cards (Test Mode Only):
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: `4000 0000 0000 0069`

### Test Flows:
1. Complete successful purchase
2. Cancel payment before completion
3. Handle payment failures gracefully
4. Verify webhook handling
5. Download invoice after purchase
6. Test with different currencies
7. Verify duplicate payment protection

## Support

For questions about this integration:
1. Check Stripe documentation: [https://stripe.com/docs](https://stripe.com/docs)
2. Review webhook logs in Stripe Dashboard
3. Check application logs for detailed error messages
4. Test in Stripe's test mode first

## Future Enhancements
- Subscription payment support
- Multiple payment methods (Apple Pay, Google Pay)
- Proration for upgrades/downgrades
- Payment method management
- Refund handling
- Multi-vendor commission splits