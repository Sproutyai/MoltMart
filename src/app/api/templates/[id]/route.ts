import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Verify ownership
  const { data: template } = await supabase
    .from("templates")
    .select("id, seller_id")
    .eq("id", id)
    .single()

  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (template.seller_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const allowed = ["title", "description", "long_description", "category", "tags", "price_cents", "status", "difficulty", "ai_models", "requirements", "setup_instructions", "screenshots", "demo_video_url", "version", "license", "file_path", "preview_data", "changelog", "faq"]
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 })
  }

  updates.updated_at = new Date().toISOString()

  // Use admin client to bypass RLS for this trusted server-side operation
  const admin = createAdminClient()
  const updateClient = admin || supabase
  const { error } = await updateClient.from("templates").update(updates).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: template } = await supabase
    .from("templates")
    .select("id, seller_id, file_path")
    .eq("id", id)
    .single()

  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (template.seller_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Check if any purchases exist — prevent hard delete if so
  const admin = createAdminClient()
  if (admin) {
    const { count } = await admin
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .eq("template_id", id)
    if (count && count > 0) {
      return NextResponse.json(
        { error: "This product has been purchased by buyers. You can archive it but not delete it." },
        { status: 409 }
      )
    }
  } else {
    // Fallback: try with user client (may fail due to RLS but safer than allowing delete)
    const { count } = await supabase
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .eq("template_id", id)
    if (count && count > 0) {
      return NextResponse.json(
        { error: "This product has been purchased by buyers. You can archive it but not delete it." },
        { status: 409 }
      )
    }
  }

  // Delete storage file
  if (template.file_path) {
    await supabase.storage.from("templates").remove([template.file_path])
  }

  // Delete template record
  const { error } = await supabase.from("templates").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
