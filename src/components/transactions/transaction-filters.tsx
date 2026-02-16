"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface Props {
  period: string
  templateId: string
  status: string
  templates: { id: string; title: string }[]
  onChange: (key: string, value: string) => void
  onExport: () => void
}

export function TransactionFilters({ period, templateId, status, templates, onChange, onExport }: Props) {
  const selectClass = "rounded-md border bg-background px-3 py-2 text-sm"

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select className={selectClass} value={period} onChange={(e) => onChange("period", e.target.value)}>
        <option value="all">All Time</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="year">This Year</option>
      </select>

      <select className={selectClass} value={templateId} onChange={(e) => onChange("template_id", e.target.value)}>
        <option value="">All Templates</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>{t.title}</option>
        ))}
      </select>

      <select className={selectClass} value={status} onChange={(e) => onChange("status", e.target.value)}>
        <option value="">All Statuses</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="refunded">Refunded</option>
      </select>

      <div className="ml-auto">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>
    </div>
  )
}
