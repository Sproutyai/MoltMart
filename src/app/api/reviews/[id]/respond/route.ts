import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { response } = await request.json()
  if (!response || typeof response !== "string" || response.trim().length === 0) {
    return NextResponse.json({ error: "Response text is required" }, { status: 400 })
  }

  // Get the review and verify the current user is the template seller
  const { data: review } = await supabase
    .from("reviews")
    .select("id, template_id")
    .eq("id", id)
    .single()

  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 })

  const { data: template } = await supabase
    .from("templates")
    .select("seller_id")
    .eq("id", review.template_id)
    .single()

  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 })
  if (template.seller_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { error } = await supabase
    .from("reviews")
    .update({
      seller_response: response.trim(),
      seller_response_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
