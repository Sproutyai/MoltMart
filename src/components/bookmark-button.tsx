"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { toast } from "sonner"

interface BookmarkButtonProps {
  templateId: string
  initialBookmarked?: boolean
  size?: number
  onRemove?: () => void
}

export function BookmarkButton({ templateId, initialBookmarked = false, size = 20, onRemove }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const next = !bookmarked
    setBookmarked(next) // optimistic

    startTransition(async () => {
      try {
        const res = await fetch("/api/bookmarks", {
          method: next ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId }),
        })
        if (!res.ok) {
          const data = await res.json()
          if (res.status === 401) {
            toast.error("Sign in to bookmark templates")
          } else {
            toast.error(data.error || "Something went wrong")
          }
          setBookmarked(!next) // revert
          return
        }
        toast.success(next ? "Bookmarked!" : "Removed from bookmarks")
        if (!next && onRemove) onRemove()
      } catch {
        setBookmarked(!next) // revert
        toast.error("Something went wrong")
      }
    })
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle() }}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-muted disabled:opacity-50"
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Heart
        size={size}
        className={bookmarked ? "fill-red-500 text-red-500" : "text-muted-foreground"}
      />
    </button>
  )
}
