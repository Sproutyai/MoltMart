import { Badge } from "@/components/ui/badge"
import { SellerSocialLinks } from "@/components/seller-social-links"
import { SellerTrustSection } from "@/components/seller-trust-section"
import { SellerStatsBar } from "@/components/seller-stats-bar"
import { FollowButton } from "@/components/follow-button"
import { ActivityIndicator } from "@/components/activity-indicator"
import { ShareProfileButton } from "@/components/share-profile-button"
import { ContactSellerButton } from "@/components/contact-seller-button"
import { CheckCircle } from "lucide-react"
import { OfficialBadge, isOfficialSeller } from "@/components/official-badge"
import type { Profile, SellerStats } from "@/lib/types"

interface SellerProfileHeaderProps {
  profile: Profile
  stats: SellerStats
  isOwnProfile: boolean
  isFollowing: boolean
}

export function SellerProfileHeader({ profile, stats, isOwnProfile, isFollowing }: SellerProfileHeaderProps) {
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })

  // Generate a unique gradient based on username
  const nameHash = (profile.username || "a").split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  const hue1 = nameHash % 360
  const hue2 = (nameHash + 60) % 360

  return (
    <div className="space-y-6">
      {/* Dynamic gradient header */}
      <div
        className="relative h-32 sm:h-40 w-full overflow-hidden rounded-lg"
        style={{
          background: `linear-gradient(135deg, hsl(${hue1}, 60%, 85%), hsl(${hue2}, 50%, 90%))`,
        }}
      />

      {/* Avatar + info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6 -mt-12 px-4 sm:px-6">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-4 border-background bg-muted">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
              {(profile.display_name || profile.username)?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
            {isOfficialSeller(profile.username) ? (
              <OfficialBadge size={22} />
            ) : profile.is_verified ? (
              <CheckCircle className="h-5 w-5 text-blue-500" />
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            @{profile.username} · Member since {memberSince}
          </p>
          <ActivityIndicator lastActiveAt={profile.last_active_at ?? null} createdAt={profile.created_at} />
          {profile.tagline && (
            <p className="text-sm text-primary/80 italic">{profile.tagline}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isOwnProfile && (
            <>
              <FollowButton sellerId={profile.id} initialFollowing={isFollowing} />
              <ContactSellerButton
                twitterUsername={profile.twitter_username}
                githubUsername={profile.github_username}
                website={profile.website}
              />
            </>
          )}
          <ShareProfileButton username={profile.username} displayName={profile.display_name || profile.username} />
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-muted-foreground px-4">{profile.bio}</p>
      )}

      {/* Social links */}
      <div className="px-4">
        <SellerSocialLinks
          website={profile.website}
          github_username={profile.github_username}
          twitter_username={profile.twitter_username}
        />
      </div>

      {/* Trust Section */}
      <div className="px-4">
        <SellerTrustSection
          github_verified={profile.github_verified}
          github_username={profile.github_username}
          github_avatar_url={profile.github_avatar_url}
          github_repos_count={profile.github_repos_count}
          github_followers_count={profile.github_followers_count}
          github_created_at={profile.github_created_at}
          twitter_verified={profile.twitter_verified}
          twitter_username={profile.twitter_username}
          twitter_followers_count={profile.twitter_followers_count}
          twitter_tweet_count={profile.twitter_tweet_count}
        />
      </div>

      {/* Specialties */}
      {profile.specialties && profile.specialties.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4">
          {profile.specialties.map((s) => (
            <Badge key={s} variant="secondary">{s}</Badge>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="px-4">
        <SellerStatsBar
          stats={stats}
          followerCount={profile.follower_count ?? 0}
          memberSince={memberSince}
        />
      </div>
    </div>
  )
}
