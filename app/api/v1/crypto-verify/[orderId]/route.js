import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../../lib/supabase';
import { CryptoPaymentProcessor } from '../../../../../lib/crypto-payments';

const crypto = new CryptoPaymentProcessor();

// POST /api/v1/crypto-verify/[orderId] - Verify crypto payment
export async function POST(request, { params }) {
  try {
    const { orderId } = params;
    const { txHash } = await request.json();

    if (!txHash) {
      return NextResponse.json({
        success: false,
        error: 'Transaction hash required'
      }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        seller:users!seller_id(wallet_address, full_name)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    if (order.status !== 'pending_payment') {
      return NextResponse.json({
        success: false,
        error: `Order status is ${order.status}, cannot verify payment`
      }, { status: 400 });
    }

    // Verify the payment transaction
    const verification = await crypto.verifyPayment(
      txHash, 
      order.total_amount, 
      order.currency
    );

    if (!verification.verified) {
      return NextResponse.json({
        success: false,
        error: `Payment verification failed: ${verification.reason}`
      }, { status: 400 });
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'payment_verified',
        payment_tx_hash: txHash,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Order update failed:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update order status'
      }, { status: 500 });
    }

    // Calculate seller payout (total - platform commission)
    const platformFee = order.total_amount * 0.12; // 12% commission
    const sellerAmount = order.total_amount - platformFee;

    // Process automatic payout to seller
    const payout = await crypto.processSellerPayout(
      order.seller.wallet_address,
      sellerAmount,
      order.currency,
      orderId
    );

    if (payout.success) {
      // Update order with payout info
      await supabase
        .from('orders')
        .update({
          status: 'completed',
          payout_tx_hash: payout.txHash,
          completed_at: new Date().toISOString(),
          platform_fee: platformFee,
          seller_amount: sellerAmount
        })
        .eq('id', orderId);
    } else {
      // Mark as needing manual payout
      await supabase
        .from('orders')
        .update({
          status: 'payout_pending',
          platform_fee: platformFee,
          seller_amount: sellerAmount,
          payout_error: payout.error
        })
        .eq('id', orderId);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        status: payout.success ? 'completed' : 'payout_pending',
        payment_verified: true,
        payment_tx: txHash,
        payout_tx: payout.success ? payout.txHash : null,
        seller_payout: payout.success ? 'automatic' : 'manual_required'
      },
      verification,
      payout: payout.success ? {
        amount: sellerAmount,
        currency: order.currency,
        recipient: order.seller.wallet_address,
        tx_hash: payout.txHash
      } : {
        status: 'failed',
        error: payout.error,
        manual_action_required: true
      }
    });

  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Verification failed'
    }, { status: 500 });
  }
}