import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { provider } = await request.json() as { provider: "github" | "twitter" }

  const identity = user.identities?.find((i) => i.provider === provider)
  if (!identity) {
    return NextResponse.json({ error: `No ${provider} identity linked` }, { status: 400 })
  }

  if ((user.identities?.length ?? 0) <= 1) {
    return NextResponse.json({ error: "Cannot unlink your only login method" }, { status: 400 })
  }

  const { error: unlinkError } = await supabase.auth.unlinkIdentity(identity)
  if (unlinkError) return NextResponse.json({ error: unlinkError.message }, { status: 500 })

  if (provider === "github") {
    await supabase.from("profiles").update({
      github_username: null,
      github_verified: false,
      github_avatar_url: null,
      github_repos_count: null,
      github_followers_count: null,
      github_created_at: null,
    }).eq("id", user.id)
  } else if (provider === "twitter") {
    await supabase.from("profiles").update({
      twitter_username: null,
      twitter_verified: false,
      twitter_avatar_url: null,
      twitter_followers_count: null,
      twitter_tweet_count: null,
    }).eq("id", user.id)
  }

  return NextResponse.json({ success: true })
}
