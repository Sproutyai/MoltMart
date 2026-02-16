import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign } from "lucide-react"
import { formatCents } from "@/lib/affiliate"
import type { AffiliateEarning } from "@/lib/types"

const statusVariant: Record<string, string> = {
  pending: "outline",
  approved: "secondary",
  paid: "default",
  reversed: "destructive",
}

export function EarningsTable({ earnings }: { earnings: AffiliateEarning[] }) {
  if (earnings.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Earnings</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <DollarSign className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium">No earnings yet</p>
            <p className="text-sm text-muted-foreground">Share your referral link to start earning commission.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>Earnings</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Sale</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-sm text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm font-medium">{e.purchase?.template?.title ?? "—"}</TableCell>
                  <TableCell className="text-sm">{formatCents(e.sale_amount_cents)}</TableCell>
                  <TableCell className="text-sm font-medium">{formatCents(e.commission_cents)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[e.status] as "outline" | "secondary" | "default" | "destructive"}>
                      {e.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
