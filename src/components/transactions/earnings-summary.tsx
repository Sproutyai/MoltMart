"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar, Hash } from "lucide-react"
import type { TransactionSummary } from "@/lib/types"

const fmt = (cents: number) => "$" + (cents / 100).toFixed(2)

export function EarningsSummary({ summary }: { summary: TransactionSummary }) {
  const cards = [
    { label: "Total Earnings", value: fmt(summary.total_earnings_cents), icon: DollarSign, color: "text-green-500" },
    { label: "This Month", value: fmt(summary.earnings_this_month_cents), icon: TrendingUp, color: "text-blue-500" },
    { label: "This Week", value: fmt(summary.earnings_this_week_cents), icon: Calendar, color: "text-purple-500" },
    { label: "Total Sales", value: summary.total_transactions.toString(), icon: Hash, color: "text-orange-500" },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">All-Time Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="text-2xl font-bold">{c.value}</p>
                </div>
                <c.icon className={`h-8 w-8 ${c.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {(summary.avg_sale_cents > 0 || summary.top_template) && (
        <p className="text-sm text-muted-foreground px-1">
          {summary.avg_sale_cents > 0 && <>Avg sale: {fmt(summary.avg_sale_cents)}</>}
          {summary.top_template && (
            <> · Top seller: {summary.top_template.title} ({summary.top_template.sales_count} sales)</>
          )}
        </p>
      )}
    </div>
  )
}
