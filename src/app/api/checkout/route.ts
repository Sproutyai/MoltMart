import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { templateId } = await request.json()

  if (!templateId) {
    return NextResponse.json({ error: "Missing templateId" }, { status: 400 })
  }

  // Check if already purchased
  const { data: existing } = await supabase
    .from("purchases")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("template_id", templateId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: "You already own this template" })
  }

  // TODO: Create Stripe Checkout Session here
  // const session = await stripe.checkout.sessions.create({
  //   mode: "payment",
  //   line_items: [{ price: template.stripe_price_id, quantity: 1 }],
  //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/templates/${templateSlug}?purchased=true`,
  //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/templates/${templateSlug}`,
  //   metadata: { templateId, buyerId: user.id },
  //   payment_intent_data: {
  //     application_fee_amount: Math.round(priceCents * 0.10), // 10% platform fee
  //     transfer_data: { destination: sellerStripeAccountId },
  //   },
  // })
  // return NextResponse.json({ url: session.url })

  return NextResponse.json({
    error: "Payment processing will be available soon. Free templates can be downloaded now!",
  })
}
