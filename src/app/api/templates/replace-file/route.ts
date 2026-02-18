import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import JSZip from "jszip"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file") as File
  const templateId = formData.get("templateId") as string

  if (!file || !templateId) {
    return NextResponse.json({ error: "Missing file or templateId" }, { status: 400 })
  }

  // Verify ownership
  const { data: template } = await supabase
    .from("templates")
    .select("id, seller_id, slug, file_path")
    .eq("id", templateId)
    .single()

  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (template.seller_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  if (!file.name.endsWith(".zip")) {
    return NextResponse.json({ error: "Only .zip files allowed" }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
  }

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

  const filePath = `${user.id}/${template.slug}.zip`
  const { error: uploadError } = await supabase.storage
    .from("templates")
    .upload(filePath, buffer, { contentType: "application/zip", upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed: " + uploadError.message }, { status: 500 })
  }

  return NextResponse.json({ file_path: filePath, preview_data: previewData })
}
