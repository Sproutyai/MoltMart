import { NextResponse } from "next/server"

// TODO: Stripe webhook secret from env
// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()

  // TODO: Verify Stripe webhook signature
  // const sig = request.headers.get("stripe-signature")!
  // const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)

  // TODO: Handle checkout.session.completed
  // - Parse event.data.object for templateId, buyerId from metadata
  // - Insert row into `purchases` table
  // - Insert row into `transactions` table
  // - Notify seller (email or in-app notification)
  // - Grant download access

  console.log("[Stripe Webhook] Received event (stub)", body.slice(0, 100))

  return NextResponse.json({ received: true })
}
