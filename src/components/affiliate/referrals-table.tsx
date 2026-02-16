import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users } from "lucide-react"
import type { Referral } from "@/lib/types"

export function ReferralsTable({ referrals }: { referrals: Referral[] }) {
  if (referrals.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Referrals</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium">No referrals yet</p>
            <p className="text-sm text-muted-foreground">When someone signs up through your link, they&apos;ll appear here.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>Referrals</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Signup Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((r) => {
                const username = r.referred_user?.username || "unknown"
                const anonymized = username[0] + "***"
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm font-mono">{anonymized}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
