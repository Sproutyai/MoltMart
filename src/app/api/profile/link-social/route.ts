import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchGitHubStats, fetchTwitterStats } from "@/lib/social-stats"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { provider } = await request.json() as { provider: "github" | "twitter" }

  const identity = user.identities?.find((i) => i.provider === provider)
  if (!identity) {
    return NextResponse.json({ error: `No ${provider} identity linked` }, { status: 400 })
  }

  // Check current avatar to decide if we should auto-set
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single()
  const hasAvatar = !!currentProfile?.avatar_url

  const identityData = identity.identity_data as Record<string, unknown>

  if (provider === "github") {
    const username = (identityData.user_name || identityData.preferred_username) as string
    if (!username) return NextResponse.json({ error: "Could not extract GitHub username" }, { status: 400 })

    const stats = await fetchGitHubStats(username)
    const avatarUrl = stats?.avatar_url || (identityData.avatar_url as string) || `https://github.com/${username}.png`

    const updates: Record<string, unknown> = {
      github_username: username,
      github_verified: true,
      github_avatar_url: avatarUrl,
      github_repos_count: stats?.public_repos ?? null,
      github_followers_count: stats?.followers ?? null,
      github_created_at: stats?.created_at ?? null,
      social_stats_updated_at: new Date().toISOString(),
    }

    // Auto-set profile avatar if user doesn't have one
    if (!hasAvatar) {
      updates.avatar_url = avatarUrl
    }

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, username, avatar_auto_set: !hasAvatar })
  }

  if (provider === "twitter") {
    const username = (identityData.user_name || identityData.preferred_username || identityData.name) as string
    if (!username) return NextResponse.json({ error: "Could not extract Twitter username" }, { status: 400 })

    const stats = await fetchTwitterStats(username)
    const avatarUrl = stats?.profile_image_url || (identityData.avatar_url as string) || null

    const updates: Record<string, unknown> = {
      twitter_username: username,
      twitter_verified: true,
      twitter_avatar_url: avatarUrl,
      twitter_followers_count: stats?.followers_count ?? null,
      twitter_tweet_count: stats?.tweet_count ?? null,
      social_stats_updated_at: new Date().toISOString(),
    }

    // Auto-set profile avatar if user doesn't have one
    if (!hasAvatar && avatarUrl) {
      updates.avatar_url = avatarUrl
    }

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, username, avatar_auto_set: !hasAvatar })
  }

  return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
}
