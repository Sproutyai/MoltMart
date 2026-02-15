import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/star-rating"
import type { Review } from "@/lib/types"

interface ReviewListProps {
  reviews: (Review & { buyer?: { username: string; avatar_url: string | null } })[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews.length) {
    return <p className="text-sm text-muted-foreground">No reviews yet.</p>
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
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
          </div>
        </div>
      ))}
    </div>
  )
}
