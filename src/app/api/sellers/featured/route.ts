import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const templateIds: string[] = body.template_ids || []

  if (templateIds.length > 6) {
    return NextResponse.json({ error: "Maximum 6 featured templates" }, { status: 400 })
  }

  // Delete existing
  await supabase.from("featured_templates").delete().eq("seller_id", user.id)

  // Insert new
  if (templateIds.length > 0) {
    const rows = templateIds.map((tid, i) => ({
      seller_id: user.id,
      template_id: tid,
      position: i,
    }))
    const { error } = await supabase.from("featured_templates").insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
