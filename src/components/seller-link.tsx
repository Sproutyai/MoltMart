import Link from "next/link"

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
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      {showAvatar && avatarUrl && (
        <img src={avatarUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
      )}
      <span>by {displayName || username}</span>
    </Link>
  )
}
