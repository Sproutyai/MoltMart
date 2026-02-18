import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { templateIds } = await request.json()
  if (!Array.isArray(templateIds) || templateIds.length === 0) {
    return NextResponse.json({})
  }

  // Fetch all promotions ordered by recency to compute position rankings
  const { data: allPromos } = await supabase
    .from("promotions")
    .select("template_id")
    .order("promoted_at", { ascending: false })

  const positions: Record<string, number> = {}
  const requestedSet = new Set(templateIds)
  allPromos?.forEach((p, i) => {
    if (requestedSet.has(p.template_id)) {
      positions[p.template_id] = i + 1
    }
  })

  return NextResponse.json(positions)
}
