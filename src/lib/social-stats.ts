interface GitHubStats {
  avatar_url: string
  public_repos: number
  followers: number
  created_at: string
}

interface TwitterStats {
  followers_count: number
  tweet_count: number
  profile_image_url: string | null
}

export async function fetchGitHubStats(username: string): Promise<GitHubStats | null> {
  try {
    const headers: Record<string, string> = { "Accept": "application/vnd.github.v3+json" }
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`
    }
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers, next: { revalidate: 0 } })
    if (!res.ok) return null
    const data = await res.json()
    return {
      avatar_url: data.avatar_url,
      public_repos: data.public_repos,
      followers: data.followers,
      created_at: data.created_at,
    }
  } catch {
    return null
  }
}

export async function fetchTwitterStats(username: string): Promise<TwitterStats | null> {
  try {
    const token = process.env.TWITTER_BEARER_TOKEN
    if (!token) return null
    const res = await fetch(
      `https://api.twitter.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=public_metrics,profile_image_url`,
      { headers: { "Authorization": `Bearer ${token}` }, next: { revalidate: 0 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const metrics = data.data?.public_metrics
    if (!metrics) return null
    // Get original size Twitter avatar by removing _normal suffix
    const rawImg = data.data?.profile_image_url as string | undefined
    const profileImageUrl = rawImg ? rawImg.replace("_normal", "") : null
    return {
      followers_count: metrics.followers_count,
      tweet_count: metrics.tweet_count,
      profile_image_url: profileImageUrl,
    }
  } catch {
    return null
  }
}
