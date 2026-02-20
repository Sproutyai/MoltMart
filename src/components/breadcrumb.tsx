import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="shrink-0" />}
            {isLast || !item.href ? (
              <span className={isLast ? "text-foreground font-medium truncate" : ""}>{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
