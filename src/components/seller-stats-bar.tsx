import { Download, Star, Users, Package } from "lucide-react"
import type { SellerStats } from "@/lib/types"

interface SellerStatsBarProps {
  stats: SellerStats
  followerCount: number
  memberSince: string
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

export function SellerStatsBar({ stats, followerCount, memberSince }: SellerStatsBarProps) {
  const items = [
    { icon: Package, label: "Templates", value: stats.total_templates },
    { icon: Download, label: "Downloads", value: formatCount(stats.total_downloads) },
    { icon: Star, label: "Avg Rating", value: stats.avg_rating > 0 ? stats.avg_rating.toFixed(1) : "—" },
    { icon: Users, label: "Followers", value: formatCount(followerCount) },
  ]

  return (
    <div className="flex flex-wrap gap-6 text-sm">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-muted-foreground">
          <item.icon size={14} />
          <span className="font-medium text-foreground">{item.value}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
