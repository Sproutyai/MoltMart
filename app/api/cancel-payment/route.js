import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function POST(request) {
  try {
    const { purchaseId } = await request.json();

    if (!purchaseId) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      );
    }

    // Get purchase details with product information
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

    // Only update if the purchase is still pending
    if (purchase.status === 'pending') {
      const { error: updateError } = await supabase
        .from('purchases')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (updateError) {
        console.error('Failed to update purchase status:', updateError);
        return NextResponse.json(
          { error: 'Failed to cancel purchase' },
          { status: 500 }
        );
      }
    }

    // Return product information so the user can retry if they want
    return NextResponse.json({
      message: 'Purchase cancelled successfully',
      product: purchase.products,
      purchase: {
        id: purchase.id,
        status: 'cancelled',
        amount: purchase.amount,
        currency: purchase.currency
      }
    });

  } catch (error) {
    console.error('Payment cancellation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Payment cancellation failed',
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