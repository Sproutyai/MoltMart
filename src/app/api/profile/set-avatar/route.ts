import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PREMADE_AVATARS } from "@/lib/constants"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { source, avatarId } = body as {
    source: "github" | "twitter" | "premade"
    avatarId?: string
  }

  let avatarUrl: string | null = null

  if (source === "premade") {
    const avatar = PREMADE_AVATARS.find((a) => a.id === avatarId)
    if (!avatar) return NextResponse.json({ error: "Invalid avatar" }, { status: 400 })
    avatarUrl = avatar.url
  } else if (source === "github" || source === "twitter") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("github_verified, github_avatar_url, twitter_verified, twitter_avatar_url")
      .eq("id", user.id)
      .single()

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    if (source === "github") {
      if (!profile.github_verified) return NextResponse.json({ error: "GitHub not connected" }, { status: 400 })
      avatarUrl = profile.github_avatar_url
    } else {
      if (!profile.twitter_verified) return NextResponse.json({ error: "Twitter not connected" }, { status: 400 })
      avatarUrl = profile.twitter_avatar_url
    }
  }

  if (!avatarUrl) return NextResponse.json({ error: "No avatar available" }, { status: 400 })

  const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, avatar_url: avatarUrl })
}
