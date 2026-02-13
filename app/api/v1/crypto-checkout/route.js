import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';
import { CryptoPaymentProcessor } from '../../../../lib/crypto-payments';

const crypto = new CryptoPaymentProcessor();

// POST /api/v1/crypto-checkout - Create crypto payment for AI agents
export async function POST(request) {
  try {
    const supabase = createServiceClient();
    const { 
      productId, 
      buyerWallet,
      currency = 'USDC',
      quantity = 1 
    } = await request.json();

    // Validate input
    if (!productId || !buyerWallet) {
      return NextResponse.json({
        success: false,
        error: 'Product ID and buyer wallet address required'
      }, { status: 400 });
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        seller:users!seller_id(id, full_name, username, email, wallet_address)
      `)
      .eq('id', productId)
      .eq('status', 'active')
      .single();

    if (productError || !product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found or inactive'
      }, { status: 404 });
    }

    if (!product.seller.wallet_address) {
      return NextResponse.json({
        success: false,
        error: 'Seller has not configured crypto wallet'
      }, { status: 400 });
    }

    // Calculate pricing
    const totalAmount = product.price * quantity;
    
    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        buyer_wallet: buyerWallet,
        product_id: productId,
        seller_id: product.seller_id,
        quantity,
        unit_price: product.price,
        total_amount: totalAmount,
        currency,
        payment_method: 'crypto',
        status: 'pending_payment'
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Order creation failed:', orderError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create order'
      }, { status: 500 });
    }

    // Generate crypto payment request
    const paymentRequest = await crypto.createPaymentRequest(
      order.id,
      totalAmount,
      currency,
      product.seller.wallet_address
    );

    // Generate agent-friendly instructions
    const agentInstructions = crypto.generateAgentInstructions(paymentRequest);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        total: totalAmount,
        currency,
        status: 'pending_payment'
      },
      product: {
        title: product.title,
        seller: product.seller.full_name
      },
      payment: paymentRequest,
      instructions: agentInstructions,
      verification: {
        endpoint: `/api/v1/crypto-verify/${order.id}`,
        webhook: `/api/v1/webhooks/crypto-payment`
      }
    });

  } catch (error) {
    console.error('Crypto checkout failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Payment request failed'
    }, { status: 500 });
  }
}

// GET /api/v1/crypto-checkout/[orderId] - Check payment status
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({
      success: false,
      error: 'Order ID required'
    }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(title, description),
        seller:users!seller_id(full_name, wallet_address)
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        total: order.total_amount,
        currency: order.currency,
        product: order.product.title,
        seller: order.seller.full_name,
        payment_tx: order.payment_tx_hash,
        payout_tx: order.payout_tx_hash,
        created_at: order.created_at,
        completed_at: order.completed_at
      }
    });

  } catch (error) {
    console.error('Order status check failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check order status'
    }, { status: 500 });
  }
}