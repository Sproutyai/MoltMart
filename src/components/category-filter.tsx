"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { CATEGORIES } from "@/lib/constants"

interface CategoryFilterProps {
  counts?: Record<string, number>
  totalCount?: number
}

export function CategoryFilter({ counts, totalCount }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get("category") || ""

  function select(category: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set("category", category)
    } else {
      params.delete("category")
    }
    params.delete("page")
    router.push(`/templates?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto">
      <Badge
        variant={!active ? "default" : "outline"}
        className="cursor-pointer shrink-0"
        onClick={() => select("")}
      >
        All{totalCount != null ? ` (${totalCount})` : ""}
      </Badge>
      {CATEGORIES.map((cat) => (
        <Badge
          key={cat}
          variant={active === cat ? "default" : "outline"}
          className="cursor-pointer shrink-0"
          onClick={() => select(cat)}
        >
          {cat}{counts?.[cat] != null ? ` (${counts[cat]})` : ""}
        </Badge>
      ))}
    </div>
  )
}
