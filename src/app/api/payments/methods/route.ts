import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { PaymentMethod } from "@/lib/types/payment"

// GET /api/payments/methods — List saved payment methods
// TODO: Replace with Stripe SDK call: stripe.paymentMethods.list({ customer: stripeCustomerId, type: 'card' })
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Placeholder: return empty array until Stripe is connected
  const methods: PaymentMethod[] = []
  return NextResponse.json({ methods })
}

// POST /api/payments/methods — Attach a new payment method
// TODO: Replace with Stripe SDK call:
//   1. stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId })
//   2. Optionally set as default: stripe.customers.update(stripeCustomerId, { invoice_settings: { default_payment_method: paymentMethodId } })
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Placeholder: Stripe integration pending
  return NextResponse.json(
    { error: "Stripe integration not yet configured" },
    { status: 501 }
  )
}

// DELETE handler would go here:
// TODO: stripe.paymentMethods.detach(paymentMethodId)
