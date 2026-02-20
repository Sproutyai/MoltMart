import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const VALID_REASONS = ["malicious", "misleading", "copyright", "other"] as const

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { template_id, reason, details } = body

  if (!template_id || !reason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 })
  }

  // Verify template exists
  const { data: template } = await supabase
    .from("templates")
    .select("id, seller_id")
    .eq("id", template_id)
    .single()

  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 })

  // Don't allow self-reporting
  if (template.seller_id === user.id) {
    return NextResponse.json({ error: "Cannot report your own template" }, { status: 400 })
  }

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      template_id,
      reason,
      details: details?.slice(0, 2000) || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "You have already reported this template" }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Auto-flag: check if template now has 3+ reports
  const admin = createAdminClient()
  if (admin) {
    const { count } = await admin
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("template_id", template_id)
      .eq("status", "pending")

    if (count && count >= 3) {
      await admin
        .from("templates")
        .update({ status: "flagged", requires_review: true })
        .eq("id", template_id)
    }
  }

  return NextResponse.json({ report })
}
