import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt } from "lucide-react"

export default function TransactionsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <Receipt className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Transaction history coming soon</p>
          <p className="text-sm text-muted-foreground">Your purchases and sales will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
