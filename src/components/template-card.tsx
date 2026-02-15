import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import { Download } from "lucide-react"
import type { Template } from "@/lib/types"

interface TemplateCardProps {
  template: Template & { seller?: { username: string; display_name: string | null } }
}

export function TemplateCard({ template }: TemplateCardProps) {
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
      <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-xs">{template.category}</Badge>
            {priceDisplay}
          </div>
          <h3 className="mt-2 font-semibold leading-tight line-clamp-1">{template.title}</h3>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
          {template.seller && (
            <p className="mt-2 text-xs text-muted-foreground">
              by {template.seller.display_name || template.seller.username}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <StarRating value={template.avg_rating} size={12} />
            <span>({template.review_count})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={12} />
            <span>{template.download_count}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
