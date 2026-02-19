"use client"

import Link from "next/link"
import { UserAvatar } from "@/components/user-avatar"
import { OfficialBadge, isOfficialSeller } from "@/components/official-badge"

interface SellerLinkProps {
  username: string
  displayName: string | null
  avatarUrl?: string | null
  showAvatar?: boolean
}

export function SellerLink({ username, displayName, avatarUrl, showAvatar }: SellerLinkProps) {
  return (
    <Link
      href={`/sellers/${username}`}
      className="inline-flex items-center gap-1.5 min-w-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      {showAvatar && (
        <UserAvatar avatarUrl={avatarUrl} displayName={displayName || username} size="xs" />
      )}
      <span className="truncate">by {displayName || username}</span>
      {isOfficialSeller(username) && <OfficialBadge size={14} />}
    </Link>
  )
}
