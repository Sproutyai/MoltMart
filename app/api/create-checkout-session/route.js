import { NextResponse } from 'next/server';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function POST(request) {
  try {
    const { productId, userId, quantity = 1 } = await request.json();

    // Validate required fields
    if (!productId || !userId) {
      return NextResponse.json(
        { error: 'Product ID and User ID are required' },
        { status: 400 }
      );
    }

    // Fetch product details from database
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        currency,
        seller_id,
        image_urls,
        profiles!seller_id (
          name,
          email
        )
      `)
      .eq('id', productId)
      .eq('status', 'approved')
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found or not available' },
        { status: 404 }
      );
    }

    // Fetch buyer details
    const { data: buyer, error: buyerError } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', userId)
      .single();

    if (buyerError || !buyer) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      );
    }

    // Check if buyer is trying to buy their own product
    if (product.seller_id === userId) {
      return NextResponse.json(
        { error: 'Cannot purchase your own product' },
        { status: 400 }
      );
    }

    // Create purchase record in pending status
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        buyer_id: userId,
        seller_id: product.seller_id,
        product_id: productId,
        amount: product.price * quantity,
        currency: product.currency || 'USD',
        status: 'pending'
      })
      .select('id')
      .single();

    if (purchaseError) {
      console.error('Failed to create purchase record:', purchaseError);
      return NextResponse.json(
        { error: 'Failed to create purchase record' },
        { status: 500 }
      );
    }

    // Calculate line items
    const lineItems = [{
      price_data: {
        currency: (product.currency || 'USD').toLowerCase(),
        product_data: {
          name: product.title,
          description: product.description?.slice(0, 500) || undefined,
          images: product.image_urls?.slice(0, 8) || [],
          metadata: {
            product_id: productId,
            seller_id: product.seller_id,
            seller_name: product.profiles?.name || 'Unknown Seller'
          }
        },
        unit_amount: formatAmountForStripe(product.price, product.currency || 'USD'),
      },
      quantity: quantity,
    }];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&purchase_id=${purchase.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel?purchase_id=${purchase.id}`,
      customer_email: buyer.email,
      metadata: {
        purchase_id: purchase.id,
        product_id: productId,
        buyer_id: userId,
        seller_id: product.seller_id,
        moltmart_transaction: 'true'
      },
      payment_intent_data: {
        metadata: {
          purchase_id: purchase.id,
          product_id: productId,
          buyer_id: userId,
          seller_id: product.seller_id,
          moltmart_transaction: 'true'
        }
      },
      billing_address_collection: 'required',
      shipping_address_collection: product.category === 'physical' ? {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE']
      } : undefined,
      automatic_tax: {
        enabled: true,
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    });

    // Update purchase record with Stripe session ID
    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        stripe_payment_intent_id: session.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchase.id);

    if (updateError) {
      console.error('Failed to update purchase with session ID:', updateError);
      // Continue anyway, webhook will handle completion
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      purchaseId: purchase.id
    });

  } catch (error) {
    console.error('Checkout session creation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}