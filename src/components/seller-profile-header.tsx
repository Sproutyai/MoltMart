import { Badge } from "@/components/ui/badge"
import { SellerSocialLinks } from "@/components/seller-social-links"
import { SellerStatsBar } from "@/components/seller-stats-bar"
import { FollowButton } from "@/components/follow-button"
import { CheckCircle } from "lucide-react"
import type { Profile, SellerStats } from "@/lib/types"

interface SellerProfileHeaderProps {
  profile: Profile
  stats: SellerStats
  isOwnProfile: boolean
  isFollowing: boolean
}

export function SellerProfileHeader({ profile, stats, isOwnProfile, isFollowing }: SellerProfileHeaderProps) {
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative h-40 w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary/20 to-primary/5">
        {profile.banner_url && (
          <img src={profile.banner_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      {/* Avatar + info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6 -mt-12 px-4">
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
            {profile.is_verified && (
              <CheckCircle className="h-5 w-5 text-blue-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            @{profile.username} · Member since {memberSince}
          </p>
        </div>

        {!isOwnProfile && (
          <FollowButton sellerId={profile.id} initialFollowing={isFollowing} />
        )}
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
