import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import JSZip from "jszip"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("is_seller").eq("id", user.id).single()
  if (!profile?.is_seller) return NextResponse.json({ error: "Not a seller" }, { status: 403 })

  const formData = await request.formData()
  const title = formData.get("title") as string
  const slug = formData.get("slug") as string
  const description = formData.get("description") as string
  const longDescription = formData.get("long_description") as string
  const category = formData.get("category") as string
  const tagsRaw = formData.get("tags") as string
  const file = formData.get("file") as File

  if (!title || !slug || !description || !category || !file) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (!file.name.endsWith(".zip")) {
    return NextResponse.json({ error: "Only .zip files allowed" }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
  }

  // Extract preview data from zip
  const buffer = Buffer.from(await file.arrayBuffer())
  const previewData: { soul_md?: string; agents_md?: string; file_list?: string[] } = {}

  try {
    const zip = await JSZip.loadAsync(buffer)
    const fileList = Object.keys(zip.files).filter((f) => !zip.files[f].dir)
    previewData.file_list = fileList.slice(0, 50)

    for (const name of fileList) {
      const lower = name.toLowerCase()
      if (lower.endsWith("soul.md") && !previewData.soul_md) {
        previewData.soul_md = (await zip.files[name].async("string")).slice(0, 2000)
      }
      if (lower.endsWith("agents.md") && !previewData.agents_md) {
        previewData.agents_md = (await zip.files[name].async("string")).slice(0, 2000)
      }
    }
  } catch {
    return NextResponse.json({ error: "Invalid zip file" }, { status: 400 })
  }

  const filePath = `templates/${user.id}/${slug}.zip`
  const { error: uploadError } = await supabase.storage
    .from("templates")
    .upload(filePath, buffer, { contentType: "application/zip", upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed: " + uploadError.message }, { status: 500 })
  }

  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : []

  const { data: template, error: insertError } = await supabase
    .from("templates")
    .insert({
      seller_id: user.id,
      title,
      slug,
      description,
      long_description: longDescription || null,
      category,
      tags,
      price_cents: 0,
      file_path: filePath,
      preview_data: previewData,
      status: "published",
      compatibility: "openclaw",
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ template })
}
