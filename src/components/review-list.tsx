"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/star-rating"
import { Loader2, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import type { Review } from "@/lib/types"

interface ReviewListProps {
  reviews: (Review & { buyer?: { username: string; avatar_url: string | null } })[]
  /** If provided, shows reply buttons on reviews for this seller */
  currentSellerId?: string
}

export function ReviewList({ reviews, currentSellerId }: ReviewListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [localReviews, setLocalReviews] = useState(reviews)

  if (!localReviews.length) {
    return <p className="text-sm text-muted-foreground">No reviews yet.</p>
  }

  async function handleSubmitReply(reviewId: string) {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: replyText }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to submit reply")
        return
      }
      toast.success("Reply posted!")
      setLocalReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, seller_response: replyText, seller_response_at: new Date().toISOString() }
            : r
        )
      )
      setReplyingTo(null)
      setReplyText("")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {localReviews.map((review) => (
        <div key={review.id} className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={review.buyer?.avatar_url ?? undefined} />
            <AvatarFallback>
              {review.buyer?.username?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {review.buyer?.username ?? "Anonymous"}
              </span>
              <StarRating value={review.rating} size={12} />
            </div>
            {review.comment && (
              <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString()}
            </p>

            {/* Seller response */}
            {review.seller_response && (
              <div className="mt-2 ml-4 pl-3 border-l-2 border-primary/30">
                <p className="text-xs font-medium text-primary">Seller Response</p>
                <p className="text-sm text-muted-foreground mt-0.5">{review.seller_response}</p>
                {review.seller_response_at && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(review.seller_response_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Reply button for seller */}
            {currentSellerId && !review.seller_response && (
              <>
                {replyingTo === review.id ? (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your response..."
                      rows={2}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSubmitReply(review.id)} disabled={submitting || !replyText.trim()}>
                        {submitting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                        Post Reply
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText("") }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1 h-7 text-xs"
                    onClick={() => setReplyingTo(review.id)}
                  >
                    <MessageSquare className="mr-1 h-3 w-3" />
                    Reply
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
