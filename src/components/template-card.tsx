import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import { SellerLink } from "@/components/seller-link"
import { Download, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { TrustBadge } from "@/components/trust-badge"
import type { Template } from "@/lib/types"

interface TemplateCardProps {
  template: Template & { seller?: { username: string; display_name: string | null; is_verified?: boolean; github_verified?: boolean; twitter_verified?: boolean } }
  showTimestamp?: boolean
}

export function TemplateCard({ template, showTimestamp }: TemplateCardProps) {
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

  return (
    <Link href={`/templates/${template.slug}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] overflow-hidden">
        {template.screenshots && template.screenshots.length > 0 && (
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img src={template.screenshots[0]} alt={template.title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-xs">{template.category}</Badge>
            {template.difficulty && (
              <Badge variant="outline" className={`text-xs ${template.difficulty === 'beginner' ? 'border-green-500 text-green-600' : template.difficulty === 'intermediate' ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'}`}>
                {template.difficulty === 'beginner' ? '🟢' : template.difficulty === 'intermediate' ? '🟡' : '🔴'} {template.difficulty}
              </Badge>
            )}
            {priceDisplay}
          </div>
          <h3 className="mt-2 font-semibold leading-tight line-clamp-1">{template.title}</h3>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
          {template.seller && (
            <div className="mt-2 flex items-center">
              <SellerLink
                username={template.seller.username}
                displayName={template.seller.display_name}
              />
              {template.seller.is_verified && (
                <TrustBadge githubVerified={template.seller.github_verified} twitterVerified={template.seller.twitter_verified} variant="inline" />
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-1 text-xs text-muted-foreground">
          {showTimestamp && (
            <div className="flex items-center gap-2">
              {isNew && (
                <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-4 gap-0.5">
                  <Sparkles size={10} />
                  NEW
                </Badge>
              )}
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
        </CardFooter>
      </Card>
    </Link>
  )
}
