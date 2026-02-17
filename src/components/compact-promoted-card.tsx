"use client"

import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Template } from "@/lib/types"

interface CompactPromotedCardProps {
  template: Template
  onClick?: () => void
}

export function CompactPromotedCard({ template, onClick }: CompactPromotedCardProps) {
  const router = useRouter()

  const handleClick = () => {
    onClick?.()
    router.push(`/templates/${template.slug}`)
  }

  const price =
    template.price_cents === 0 ? (
      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-500/15 text-green-600 dark:text-green-400 border-0">
        Free
      </Badge>
    ) : (
      <span className="text-xs font-semibold">${(template.price_cents / 100).toFixed(2)}</span>
    )

  return (
    <button
      onClick={handleClick}
      className="rounded-lg border border-border/60 bg-white dark:bg-zinc-800 p-2 hover:bg-accent/50 transition-colors cursor-pointer text-left w-full shadow-sm"
    >
      {/* Thumbnail */}
      <div className="w-full aspect-[3/2] rounded-md overflow-hidden bg-muted flex items-center justify-center">
        {template.screenshots?.[0] ? (
          <img
            src={template.screenshots[0]}
            alt={template.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs font-medium text-muted-foreground">{template.category}</span>
        )}
      </div>

      {/* Title */}
      <p className="font-semibold text-sm line-clamp-1 mt-1.5">{template.title}</p>

      {/* Category + Price */}
      <div className="flex items-center justify-between mt-1 gap-1">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
          {template.category}
        </Badge>
        {price}
      </div>

      {/* Rating (only if reviews exist) */}
      {template.review_count > 0 && (
        <div className="flex items-center gap-1 mt-1">
          <Star className="size-2.5 fill-yellow-500 text-yellow-500" />
          <span className="text-[10px] text-muted-foreground">
            {template.avg_rating.toFixed(1)} ({template.review_count})
          </span>
        </div>
      )}
    </button>
  )
}
