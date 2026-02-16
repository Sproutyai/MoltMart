import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchGitHubStats, fetchTwitterStats } from "@/lib/social-stats"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("github_username, github_verified, twitter_username, twitter_verified").eq("id", user.id).single()
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const updates: Record<string, unknown> = { social_stats_updated_at: new Date().toISOString() }

  if (profile.github_verified && profile.github_username) {
    const stats = await fetchGitHubStats(profile.github_username)
    if (stats) {
      updates.github_avatar_url = stats.avatar_url
      updates.github_repos_count = stats.public_repos
      updates.github_followers_count = stats.followers
      updates.github_created_at = stats.created_at
    }
  }

  if (profile.twitter_verified && profile.twitter_username) {
    const stats = await fetchTwitterStats(profile.twitter_username)
    if (stats) {
      updates.twitter_avatar_url = stats.profile_image_url
      updates.twitter_followers_count = stats.followers_count
      updates.twitter_tweet_count = stats.tweet_count
    }
  }

  await supabase.from("profiles").update(updates).eq("id", user.id)
  return NextResponse.json({ success: true })
}
