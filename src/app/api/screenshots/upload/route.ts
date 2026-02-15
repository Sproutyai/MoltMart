import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file") as File
  const templateSlug = formData.get("template_slug") as string

  if (!file || !file.size) {
    return NextResponse.json({ error: "No file" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() || "png"
  const path = `${user.id}/${templateSlug}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from("screenshots")
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(path)
  return NextResponse.json({ url: urlData.publicUrl })
}
