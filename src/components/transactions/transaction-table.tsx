"use client"

import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import type { SellerTransaction } from "@/lib/types"

const fmt = (cents: number) => "$" + (cents / 100).toFixed(2)

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  refunded: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

interface Props {
  transactions: SellerTransaction[]
  sort: string
  order: string
  onSort: (col: string) => void
}

export function TransactionTable({ transactions, sort, order, onSort }: Props) {
  const SortIcon = order === "asc" ? ArrowUp : ArrowDown

  const header = (label: string, col: string) => (
    <th
      className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sort === col && <SortIcon className="h-3 w-3" />}
      </span>
    </th>
  )

  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            {header("Date", "date")}
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Enhancement</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Buyer</th>
            {header("Amount", "amount")}
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Fee</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Net</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 text-sm whitespace-nowrap">
                {format(new Date(t.created_at), "MMM d, yyyy h:mm a")}
              </td>
              <td className="px-4 py-3 text-sm max-w-[200px]">
                <Link href={`/templates/${t.template_slug}`} className="text-primary hover:underline truncate block">
                  {t.template_title}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm max-w-[150px] truncate">{t.buyer_display_name || t.buyer_username}</td>
              <td className="px-4 py-3 text-sm font-medium">{fmt(t.price_cents)}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{fmt(t.platform_fee_cents)}</td>
              <td className="px-4 py-3 text-sm font-medium">{fmt(t.seller_earnings_cents)}</td>
              <td className="px-4 py-3 text-sm">
                <Badge variant="secondary" className={statusColors[t.status] || ""}>
                  {t.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
