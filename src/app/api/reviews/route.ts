import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { template_id, rating, comment } = await request.json()

  if (!template_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
  }

  // Verify purchase exists
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, created_at")
    .eq("buyer_id", user.id)
    .eq("template_id", template_id)
    .single()

  if (!purchase) {
    return NextResponse.json({ error: "You must download this template before reviewing" }, { status: 403 })
  }

  // Review integrity: minimum 1 hour between purchase and review
  const purchaseTime = new Date(purchase.created_at).getTime()
  const now = Date.now()
  const oneHourMs = 60 * 60 * 1000
  if (now - purchaseTime < oneHourMs) {
    const minutesLeft = Math.ceil((oneHourMs - (now - purchaseTime)) / 60000)
    return NextResponse.json({
      error: `Please wait at least 1 hour after purchase before reviewing. ${minutesLeft} minute(s) remaining.`
    }, { status: 429 })
  }

  // Upsert review
  const { data: review, error } = await supabase
    .from("reviews")
    .upsert(
      { buyer_id: user.id, template_id, rating, comment },
      { onConflict: "buyer_id,template_id" }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ review })
}
