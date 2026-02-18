"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Receipt } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EarningsSummary } from "@/components/transactions/earnings-summary"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { TransactionPagination } from "@/components/transactions/transaction-pagination"
import type { SellerTransaction, TransactionSummary } from "@/lib/types"

interface ApiResponse {
  transactions: SellerTransaction[]
  summary: TransactionSummary
  pagination: { page: number; per_page: number; total: number; total_pages: number }
  templates: { id: string; title: string }[]
}

export default function TransactionsPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("all")
  const [templateId, setTemplateId] = useState("")
  const [status, setStatus] = useState("")
  const [sort, setSort] = useState("date")
  const [order, setOrder] = useState("desc")
  const [page, setPage] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ period, sort, order, page: String(page), per_page: "20" })
    if (templateId) params.set("template_id", templateId)
    if (status) params.set("status", status)

    try {
      const res = await fetch(`/api/seller/transactions?${params}`)
      if (res.ok) setData(await res.json())
    } catch (e) {
      console.error("Failed to fetch transactions", e)
    } finally {
      setLoading(false)
    }
  }, [period, templateId, status, sort, order, page])

  useEffect(() => { fetchData() }, [fetchData])

  const handleFilterChange = (key: string, value: string) => {
    setPage(1)
    if (key === "period") setPeriod(value)
    else if (key === "template_id") setTemplateId(value)
    else if (key === "status") setStatus(value)
  }

  const handleSort = (col: string) => {
    if (sort === col) setOrder(order === "asc" ? "desc" : "asc")
    else { setSort(col); setOrder("desc") }
    setPage(1)
  }

  const handleExport = () => {
    const params = new URLSearchParams({ period })
    if (templateId) params.set("template_id", templateId)
    if (status) params.set("status", status)
    window.open(`/api/seller/transactions/export?${params}`, "_blank")
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Sales</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const hasTransactions = data && data.pagination.total > 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sales</h1>

      {data && <EarningsSummary summary={data.summary} />}

      <TransactionFilters
        period={period}
        templateId={templateId}
        status={status}
        templates={data?.templates || []}
        onChange={handleFilterChange}
        onExport={handleExport}
      />

      {hasTransactions ? (
        <>
          <TransactionTable
            transactions={data.transactions}
            sort={sort}
            order={order}
            onSort={handleSort}
          />
          <TransactionPagination
            page={data.pagination.page}
            totalPages={data.pagination.total_pages}
            onChange={setPage}
          />
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Receipt className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">No transactions yet</p>
            <p className="text-sm text-muted-foreground">
              Sales will appear here once customers purchase your templates.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
