import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const allowed = ["display_name", "username", "bio", "avatar_url", "website", "specialties", "tagline"]
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 })
  }

  // Validate username format and uniqueness
  if ("username" in updates) {
    if (!updates.username || typeof updates.username !== "string") {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }
    const usernameStr = updates.username as string
    if (!/^[a-z0-9_-]{3,30}$/.test(usernameStr)) {
      return NextResponse.json({ error: "Invalid username format. Use 3-30 lowercase letters, numbers, hyphens, or underscores." }, { status: 400 })
    }
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", usernameStr)
      .neq("id", user.id)
      .single()
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
