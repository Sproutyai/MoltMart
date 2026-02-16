import { Github, Twitter, ExternalLink } from "lucide-react"

interface SellerTrustSectionProps {
  github_verified?: boolean
  github_username?: string | null
  github_avatar_url?: string | null
  github_repos_count?: number | null
  github_followers_count?: number | null
  github_created_at?: string | null
  twitter_verified?: boolean
  twitter_username?: string | null
  twitter_followers_count?: number | null
  twitter_tweet_count?: number | null
}

function formatCount(n: number | null | undefined): string {
  if (n == null) return "—"
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

export function SellerTrustSection(props: SellerTrustSectionProps) {
  const hasGithub = props.github_verified && props.github_username
  const hasTwitter = props.twitter_verified && props.twitter_username
  if (!hasGithub && !hasTwitter) return null

  const ghYear = props.github_created_at
    ? new Date(props.github_created_at).getFullYear()
    : null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Verified Accounts</h3>

      {hasGithub && (
        <a
          href={`https://github.com/${props.github_username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
        >
          {props.github_avatar_url ? (
            <img src={props.github_avatar_url} alt="" className="h-10 w-10 rounded-full" />
          ) : (
            <Github size={24} className="mt-1" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Github size={14} className="text-green-500" />
              @{props.github_username}
              <ExternalLink size={12} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCount(props.github_repos_count)} repos · {formatCount(props.github_followers_count)} followers
              {ghYear && ` · Since ${ghYear}`}
            </p>
          </div>
        </a>
      )}

      {hasTwitter && (
        <a
          href={`https://x.com/${props.twitter_username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
        >
          <Twitter size={24} className="mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Twitter size={14} className="text-blue-500" />
              @{props.twitter_username}
              <ExternalLink size={12} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCount(props.twitter_followers_count)} followers · {formatCount(props.twitter_tweet_count)} tweets
            </p>
          </div>
        </a>
      )}
    </div>
  )
}
