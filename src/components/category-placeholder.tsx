import { Zap } from "lucide-react"
import { CATEGORY_ICONS, CATEGORY_GRADIENTS } from "@/lib/category-icons"

interface CategoryPlaceholderProps {
  category: string
}

export function CategoryPlaceholder({ category }: CategoryPlaceholderProps) {
  const Icon = CATEGORY_ICONS[category] ?? Zap
  const gradient = CATEGORY_GRADIENTS[category] ?? "from-muted to-muted/50"

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2`}>
      <Icon className="h-8 w-8 text-muted-foreground/50" />
      <span className="text-[10px] font-medium text-muted-foreground/50">{category}</span>
    </div>
  )
}
