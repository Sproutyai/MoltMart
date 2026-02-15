import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sellerId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (user.id === sellerId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
  }

  // Check if already following
  const { data: existing } = await supabase
    .from("seller_follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("seller_id", sellerId)
    .maybeSingle()

  if (existing) {
    await supabase.from("seller_follows").delete().eq("id", existing.id)
    return NextResponse.json({ following: false })
  } else {
    const { error } = await supabase.from("seller_follows").insert({ follower_id: user.id, seller_id: sellerId })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ following: true })
  }
}
