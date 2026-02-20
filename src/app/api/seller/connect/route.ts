import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET: Check Stripe Connect status
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // TODO: Check profiles.stripe_account_id and query Stripe for account status
  // const { data: profile } = await supabase
  //   .from("profiles")
  //   .select("stripe_account_id")
  //   .eq("id", user.id)
  //   .single()
  //
  // if (profile?.stripe_account_id) {
  //   const account = await stripe.accounts.retrieve(profile.stripe_account_id)
  //   return NextResponse.json({
  //     status: account.charges_enabled ? "active" : "pending",
  //     accountId: profile.stripe_account_id,
  //     payoutsEnabled: account.payouts_enabled,
  //   })
  // }

  return NextResponse.json({ status: "not_connected" })
}

// POST: Create Stripe Connect account link
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // TODO: Create Stripe Connect account and account link
  // const account = await stripe.accounts.create({ type: "express", metadata: { userId: user.id } })
  // await supabase.from("profiles").update({ stripe_account_id: account.id }).eq("id", user.id)
  // const link = await stripe.accountLinks.create({
  //   account: account.id,
  //   refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller/payouts`,
  //   return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller/payouts`,
  //   type: "account_onboarding",
  // })
  // return NextResponse.json({ url: link.url })

  return NextResponse.json({ error: "Stripe Connect coming soon" })
}
