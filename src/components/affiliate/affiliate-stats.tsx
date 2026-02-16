import { Card } from "@/components/ui/card"
import { MousePointerClick, UserPlus, ShoppingCart, DollarSign } from "lucide-react"
import { formatCents } from "@/lib/affiliate"
import type { AffiliateStats } from "@/lib/types"

export function AffiliateStatsCards({ stats }: { stats: AffiliateStats }) {
  const cards = [
    { label: "Total Clicks", value: stats.total_clicks.toString(), icon: MousePointerClick },
    { label: "Signups", value: stats.total_signups.toString(), icon: UserPlus },
    { label: "Conversions", value: stats.total_sales.toString(), icon: ShoppingCart },
    { label: "Earnings", value: formatCents(stats.total_earnings_cents), icon: DollarSign },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-6">
          <div className="flex items-center gap-2">
            <card.icon className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
          </div>
          <p className="text-2xl font-bold mt-2">{card.value}</p>
        </Card>
      ))}
    </div>
  )
}
