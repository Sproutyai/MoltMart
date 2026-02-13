import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature, formatAmountFromStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Stripe webhook event:', event.type, event.id);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        // For subscription products (future enhancement)
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'customer.subscription.created':
        // For subscription products (future enhancement)
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        // For subscription products (future enhancement)
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        // For subscription products (future enhancement)
        await handleSubscriptionCancelled(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('Processing checkout.session.completed:', session.id);

    const purchaseId = session.metadata?.purchase_id;
    if (!purchaseId) {
      console.error('No purchase_id found in session metadata');
      return;
    }

    // Update purchase record
    const { data: purchase, error: updateError } = await supabase
      .from('purchases')
      .update({
        status: 'completed',
        payment_method: session.payment_method_types?.[0] || 'card',
        stripe_payment_intent_id: session.payment_intent || session.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchaseId)
      .select('*, products(downloads)')
      .single();

    if (updateError) {
      console.error('Failed to update purchase:', updateError);
      return;
    }

    // Update product download count
    const { error: productError } = await supabase
      .from('products')
      .update({
        downloads: (purchase.products?.downloads || 0) + 1
      })
      .eq('id', purchase.product_id);

    if (productError) {
      console.error('Failed to update product downloads:', productError);
    }

    // Send confirmation email (optional - implement later)
    // await sendPurchaseConfirmationEmail(purchase);

    console.log('Purchase completed successfully:', purchaseId);

  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    console.log('Processing payment_intent.succeeded:', paymentIntent.id);

    const purchaseId = paymentIntent.metadata?.purchase_id;
    if (!purchaseId) {
      console.log('No purchase_id found in payment intent metadata');
      return;
    }

    // Ensure purchase is marked as completed
    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        status: 'completed',
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchaseId)
      .eq('status', 'pending'); // Only update if still pending

    if (updateError) {
      console.error('Failed to update purchase on payment success:', updateError);
    }

  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  try {
    console.log('Processing payment_intent.payment_failed:', paymentIntent.id);

    const purchaseId = paymentIntent.metadata?.purchase_id;
    if (!purchaseId) {
      console.log('No purchase_id found in payment intent metadata');
      return;
    }

    // Mark purchase as failed
    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        status: 'failed',
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchaseId);

    if (updateError) {
      console.error('Failed to update purchase on payment failure:', updateError);
    }

  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log('Processing invoice.payment_succeeded:', invoice.id);
    
    // Handle subscription payments
    const subscriptionId = invoice.subscription;
    if (subscriptionId) {
      // Update subscription status in database (future enhancement)
      console.log('Subscription payment succeeded:', subscriptionId);
    }

  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  try {
    console.log('Processing customer.subscription.created:', subscription.id);
    
    // Handle new subscription (future enhancement)
    const purchaseId = subscription.metadata?.purchase_id;
    if (purchaseId) {
      const { error: updateError } = await supabase
        .from('purchases')
        .update({
          status: 'completed',
          expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (updateError) {
        console.error('Failed to update purchase for new subscription:', updateError);
      }
    }

  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('Processing customer.subscription.updated:', subscription.id);
    
    // Handle subscription changes (future enhancement)
    const purchaseId = subscription.metadata?.purchase_id;
    if (purchaseId) {
      let status = 'completed';
      if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
        status = 'cancelled';
      }

      const { error: updateError } = await supabase
        .from('purchases')
        .update({
          status,
          expires_at: subscription.current_period_end ? 
            new Date(subscription.current_period_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (updateError) {
        console.error('Failed to update purchase for subscription change:', updateError);
      }
    }

  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionCancelled(subscription) {
  try {
    console.log('Processing customer.subscription.deleted:', subscription.id);
    
    // Handle subscription cancellation (future enhancement)
    const purchaseId = subscription.metadata?.purchase_id;
    if (purchaseId) {
      const { error: updateError } = await supabase
        .from('purchases')
        .update({
          status: 'cancelled',
          expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (updateError) {
        console.error('Failed to update purchase for cancelled subscription:', updateError);
      }
    }

  } catch (error) {
    console.error('Error handling subscription cancelled:', error);
  }
}

// Disable body parsing for webhooks
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';