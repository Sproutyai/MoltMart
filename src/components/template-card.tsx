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
  const description =
    template.description.length > 80
      ? template.description.slice(0, 80) + "…"
      : template.description

  return (
    <Link href={`/templates/${template.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{template.category}</Badge>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Free
            </Badge>
          </div>
          <h3 className="mt-2 font-semibold leading-tight">{template.title}</h3>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground">{description}</p>
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
