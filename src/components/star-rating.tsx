"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: number
}

export function StarRating({ value, onChange, readonly = true, size = 16 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(
            star <= Math.round(value)
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30",
            !readonly && "cursor-pointer hover:text-yellow-400"
          )}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  )
}
