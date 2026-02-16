import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const templateId = session.metadata?.template_id
      const sellerId = session.metadata?.seller_id

      if (templateId && sellerId) {
        const supabase = createAdminClient()

        await supabase
          .from('promotions')
          .upsert(
            {
              template_id: templateId,
              seller_id: sellerId,
              promoted_at: new Date().toISOString(),
              amount_paid_cents: 2500,
              stripe_session_id: session.id,
            },
            { onConflict: 'template_id' }
          )
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
