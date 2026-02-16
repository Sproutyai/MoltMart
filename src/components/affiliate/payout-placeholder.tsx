import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"
import { formatCents } from "@/lib/affiliate"
import type { AffiliateStats } from "@/lib/types"

export function PayoutPlaceholder({ stats }: { stats: AffiliateStats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payouts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total Approved</span>
          <span className="text-sm font-medium">{formatCents(stats.approved_cents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Pending</span>
          <span className="text-sm font-medium">{formatCents(stats.pending_cents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Paid Out</span>
          <span className="text-sm font-medium">{formatCents(stats.paid_cents)}</span>
        </div>
        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p>Payments via Stripe Connect are coming soon. All your earnings are tracked and will be paid retroactively.</p>
        </div>
      </CardContent>
    </Card>
  )
}
