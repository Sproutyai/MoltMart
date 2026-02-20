import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import JSZip from "jszip"
import { scanZipContents } from "@/lib/scan-zip"

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
  const difficulty = (formData.get("difficulty") as string) || "beginner"
  const aiModelsRaw = formData.get("ai_models") as string
  const requirements = formData.get("requirements") as string
  const setupInstructions = formData.get("setup_instructions") as string
  const demoVideoUrl = formData.get("demo_video_url") as string
  const changelog = formData.get("changelog") as string
  const faq = formData.get("faq") as string
  const version = (formData.get("version") as string) || "1.0.0"
  const license = (formData.get("license") as string) || "MIT"
  const priceCentsRaw = formData.get("price_cents") as string
  const priceCents = priceCentsRaw ? parseInt(priceCentsRaw, 10) : 0
  const statusRaw = formData.get("status") as string
  const status = statusRaw === "draft" ? "draft" : "published"

  // Validate price_cents is a valid number
  if (isNaN(priceCents)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 })
  }

  if (!title || !slug || !description || !category || !file) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

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

  const filePath = `${user.id}/${slug}.zip`
  const { error: uploadError } = await supabase.storage
    .from("templates")
    .upload(filePath, buffer, { contentType: "application/zip", upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed: " + uploadError.message }, { status: 500 })
  }

  const screenshotFiles = formData.getAll("screenshots") as File[]
  const screenshotUrls: string[] = []
  for (let i = 0; i < screenshotFiles.length; i++) {
    const ss = screenshotFiles[i]
    if (!ss.size) continue
    const ext = ss.name.split(".").pop() || "png"
    const ssPath = `${user.id}/${slug}-${i}-${Date.now()}.${ext}`
    const ssBuf = Buffer.from(await ss.arrayBuffer())
    const { error: ssError } = await supabase.storage
      .from("screenshots")
      .upload(ssPath, ssBuf, { contentType: ss.type, upsert: true })
    if (!ssError) {
      const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(ssPath)
      screenshotUrls.push(urlData.publicUrl)
    }
  }

  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : []
  const aiModels: string[] = aiModelsRaw ? JSON.parse(aiModelsRaw) : []

  // Layer 2 & 3: File hash + automated scanning
  const scanResult = await scanZipContents(buffer)

  // If scan rejected, block the upload
  if (scanResult.status === "rejected") {
    // Clean up uploaded file
    await supabase.storage.from("templates").remove([filePath])
    return NextResponse.json({
      error: "Upload rejected: suspicious content detected",
      findings: scanResult.findings,
    }, { status: 422 })
  }

  // Layer 4: New seller review queue — first 3 uploads require review
  let requiresReview = false
  const admin = createAdminClient()
  if (admin) {
    const { count } = await admin
      .from("templates")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", user.id)
    if (count !== null && count < 3) {
      requiresReview = true
    }
  }

  // Override status if requires review or flagged
  const effectiveStatus = requiresReview ? "pending_review" : scanResult.status === "flagged" ? "pending_review" : status

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
      price_cents: priceCents,
      file_path: filePath,
      preview_data: previewData,
      status: effectiveStatus,
      compatibility: "openclaw",
      screenshots: screenshotUrls,
      difficulty,
      ai_models: aiModels,
      requirements: requirements || null,
      setup_instructions: setupInstructions || null,
      version,
      license,
      demo_video_url: demoVideoUrl || null,
      changelog: changelog || null,
      faq: faq || null,
      file_hash: scanResult.fileHash,
      scan_status: scanResult.status,
      scan_results: { findings: scanResult.findings, fileCount: scanResult.fileCount, scannedAt: new Date().toISOString() },
      requires_review: requiresReview,
      file_updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ template })
}
