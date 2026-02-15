import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Template } from "@/lib/types"

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
}

export function SellerTemplateRow({ template }: { template: Template }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{template.title}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(template.created_at).toLocaleDateString()}
          </div>
        </div>
        <Badge variant={statusColors[template.status] || "secondary"}>{template.status}</Badge>
        <div className="text-sm text-muted-foreground w-20 text-right">{template.download_count} DLs</div>
        <div className="text-sm text-muted-foreground w-16 text-right">★ {template.avg_rating.toFixed(1)}</div>
      </CardContent>
    </Card>
  )
}
