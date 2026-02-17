import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    const { templateIds, type } = await req.json()
    if (
      !Array.isArray(templateIds) ||
      templateIds.length === 0 ||
      !["impression", "click"].includes(type)
    ) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: "Admin client unavailable" }, { status: 503 })
    }

    const field = type === "impression" ? "impressions" : "clicks"

    await Promise.all(
      templateIds.map((id: string) =>
        supabase.rpc("increment_promotion_stat", {
          p_template_id: id,
          p_field: field,
        })
      )
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Batch track error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
