"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import { SellerLink } from "@/components/seller-link"
import { Download, Sparkles, Star, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { TrustBadge } from "@/components/trust-badge"
import { BookmarkButton } from "@/components/bookmark-button"
import { CategoryPlaceholder } from "@/components/category-placeholder"
import type { Template } from "@/lib/types"
import type { ReactNode } from "react"

interface TemplateCardProps {
  template: Template & { seller?: { username: string; display_name: string | null; avatar_url?: string | null; is_verified?: boolean; github_verified?: boolean; twitter_verified?: boolean } }
  showTimestamp?: boolean
  isFeatured?: boolean
  borderColor?: "amber" | "green" | "red"
  initialBookmarked?: boolean
  onBookmarkRemove?: () => void
  /** "default" = full card, "compact" = search/promoted contexts, "library" = dashboard purchases */
  variant?: "default" | "compact" | "library"
  /** Extra actions rendered in footer (e.g. download button, review link) */
  actions?: ReactNode
  /** For library variant: purchase date string */
  purchaseDate?: string
  /** For library variant: user's existing rating */
  userRating?: number
  /** Preview mode: renders in a div instead of Link, disables bookmark & beacon */
  isPreview?: boolean
}

export function TemplateCard({
  template,
  showTimestamp,
  isFeatured,
  borderColor,
  initialBookmarked,
  onBookmarkRemove,
  variant = "default",
  actions,
  purchaseDate,
  userRating,
  isPreview,
}: TemplateCardProps) {
  const isNew = Date.now() - new Date(template.created_at).getTime() < 48 * 60 * 60 * 1000

  const priceDisplay =
    template.price_cents === 0 ? (
      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
        Free
      </Badge>
    ) : (
      <span className="font-semibold text-sm">
        ${(template.price_cents / 100).toFixed(2)}
      </span>
    )

  const ringClass =
    borderColor === "green" ? "border-2 border-emerald-400 dark:border-emerald-500"
    : borderColor === "red" ? "border-2 border-rose-400 dark:border-rose-500"
    : (borderColor === "amber" || isFeatured) ? "border-2 border-amber-400 dark:border-amber-500"
    : ""

  const templateUrl = `/templates/${template.slug}`

  function handleBeacon(e: React.MouseEvent) {
    if (isFeatured) {
      navigator.sendBeacon("/api/promote/track", JSON.stringify({ templateId: template.id, type: "click" }))
    }
  }

  // ── Compact variant (search popup / promoted) ──
  if (variant === "compact") {
    const Wrapper = isPreview ? "div" : Link
    const wrapperProps = isPreview ? { className: "block" } : { href: templateUrl, onClick: handleBeacon, className: "block" }
    return (
      <Wrapper {...(wrapperProps as any)}>
        <div className="rounded-lg border border-border/60 bg-card p-2 hover:bg-accent/50 transition-colors cursor-pointer text-left w-full shadow-sm overflow-hidden">
          <div className="w-full aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {template.screenshots?.[0] ? (
              <img src={template.screenshots[0]} alt={template.title} className="w-full h-full object-cover" />
            ) : (
              <CategoryPlaceholder category={template.category} />
            )}
          </div>
          <p className="font-semibold text-sm line-clamp-1 mt-1.5 min-w-0 truncate">{template.title}</p>
          <div className="flex items-center justify-between mt-1 gap-1 min-w-0 overflow-hidden">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink min-w-0 truncate">{template.category}</Badge>
            {priceDisplay}
          </div>
          {template.review_count > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="size-2.5 fill-yellow-500 text-yellow-500" />
              <span className="text-[10px] text-muted-foreground">
                {template.avg_rating.toFixed(1)} ({template.review_count})
              </span>
            </div>
          )}
        </div>
      </Wrapper>
    )
  }

  // ── Default + Library variants ──
  const OuterWrapper = isPreview ? "div" : Link
  const outerProps = isPreview ? { className: "block h-full" } : { href: templateUrl, onClick: handleBeacon, className: "block h-full" }
  return (
    <OuterWrapper {...(outerProps as any)}>
      <Card className={`h-full flex flex-col transition-shadow ${isPreview ? "" : "hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.07)] cursor-pointer"} overflow-hidden pt-0 ${ringClass}`}>
        {/* Thumbnail — always rendered for uniform height */}
        <div className="aspect-video w-full overflow-hidden bg-muted relative">
          {template.screenshots && template.screenshots.length > 0 ? (
            <img src={template.screenshots[0]} alt={template.title} className="w-full h-full object-cover" />
          ) : (
            <CategoryPlaceholder category={template.category} />
          )}
          {/* Overlay badges */}
          {showTimestamp && isNew && (
            <Badge className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-4 gap-0.5">
              <Sparkles size={10} />
              NEW
            </Badge>
          )}
          {isFeatured && (
            <Badge className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-1.5 py-0 h-4">
              ⭐ Featured
            </Badge>
          )}
        </div>

        <CardHeader className="pb-2 min-w-0">
          <div className="flex items-center gap-2 flex-nowrap min-w-0 overflow-hidden">
            <Badge variant="outline" className="text-xs shrink min-w-0 truncate">{template.category}</Badge>
            <div className="shrink-0">{priceDisplay}</div>
          </div>
          <div className="mt-2 flex items-start justify-between gap-2 min-w-0 overflow-hidden">
            <h3 className="font-semibold leading-tight line-clamp-1 min-w-0 hover:underline">{template.title}</h3>
            {!isPreview && (
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.preventDefault()}>
                <BookmarkButton templateId={template.id} size={16} initialBookmarked={initialBookmarked} onRemove={onBookmarkRemove} />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-2 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
          {template.seller && (
            <div className="mt-2 flex items-center" onClick={(e) => e.preventDefault()}>
              <SellerLink
                username={template.seller.username}
                displayName={template.seller.display_name}
                avatarUrl={template.seller.avatar_url}
                showAvatar
              />
              {template.seller.is_verified && (
                <TrustBadge githubVerified={template.seller.github_verified} twitterVerified={template.seller.twitter_verified} variant="inline" />
              )}
            </div>
          )}
          {purchaseDate && (
            <p className="mt-2 text-xs text-muted-foreground">
              Downloaded on {new Date(purchaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
        </CardContent>

        <CardFooter className="mt-auto flex flex-col items-stretch gap-1 text-xs text-muted-foreground">
          {showTimestamp && (
            <div className="flex items-center gap-2">
              <span>{formatDistanceToNow(new Date(template.created_at), { addSuffix: true })}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <StarRating value={template.avg_rating} size={12} />
              <span>({template.review_count})</span>
            </div>
            <div className="flex items-center gap-1">
              <Download size={12} />
              <span>{template.download_count}</span>
            </div>
          </div>
          {userRating !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>Your rating: {userRating}/5</span>
            </div>
          )}
          {actions && (
            <div className="mt-1" onClick={(e) => e.preventDefault()}>
              {actions}
            </div>
          )}
        </CardFooter>
      </Card>
    </OuterWrapper>
  )
}
