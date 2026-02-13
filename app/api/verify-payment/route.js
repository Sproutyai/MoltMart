import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function POST(request) {
  try {
    const { sessionId, purchaseId } = await request.json();

    if (!sessionId || !purchaseId) {
      return NextResponse.json(
        { error: 'Session ID and Purchase ID are required' },
        { status: 400 }
      );
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Payment session not found' },
        { status: 404 }
      );
    }

    // Verify the payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get purchase details with related data
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select(`
        *,
        products (
          id,
          title,
          description,
          price,
          currency,
          image_urls,
          category
        ),
        buyer:profiles!buyer_id (
          id,
          name,
          email
        ),
        seller:profiles!seller_id (
          id,
          name,
          email
        )
      `)
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Update purchase record if not already completed
    if (purchase.status !== 'completed') {
      const { error: updateError } = await supabase
        .from('purchases')
        .update({
          status: 'completed',
          payment_method: session.payment_method_types?.[0] || 'card',
          stripe_payment_intent_id: sessionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (updateError) {
        console.error('Failed to update purchase status:', updateError);
      }

      // Update product download count
      const { error: productUpdateError } = await supabase
        .from('products')
        .update({
          downloads: (purchase.products.downloads || 0) + 1
        })
        .eq('id', purchase.product_id);

      if (productUpdateError) {
        console.error('Failed to update product downloads:', productUpdateError);
      }
    }

    // Prepare response data
    const responseData = {
      purchase: {
        ...purchase,
        status: 'completed'
      },
      product: purchase.products,
      buyer: purchase.buyer,
      seller: purchase.seller,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_email,
        created: session.created
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Payment verification failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Payment verification failed',
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