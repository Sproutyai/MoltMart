import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify template exists
  const { data: template } = await supabase
    .from("templates")
    .select("id, file_path")
    .eq("id", id)
    .eq("status", "published")
    .single()

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  }

  // Upsert purchase record
  await supabase.from("purchases").upsert(
    {
      buyer_id: user.id,
      template_id: id,
      price_cents: 0,
    },
    { onConflict: "buyer_id,template_id" }
  )

  // Increment download count
  await supabase.rpc("increment_download_count", { template_id: id })

  // Create signed URL
  const { data: signedUrl, error: storageError } = await supabase.storage
    .from("templates")
    .createSignedUrl(template.file_path, 60)

  if (storageError || !signedUrl) {
    return NextResponse.json({ error: "Could not generate download URL" }, { status: 500 })
  }

  return NextResponse.json({ url: signedUrl.signedUrl })
}
