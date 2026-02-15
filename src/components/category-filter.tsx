"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { CATEGORIES } from "@/lib/constants"

export function CategoryFilter() {
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
    params.delete("q")
    router.push(`/templates?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={!active ? "default" : "outline"}
        className="cursor-pointer"
        onClick={() => select("")}
      >
        All
      </Badge>
      {CATEGORIES.map((cat) => (
        <Badge
          key={cat}
          variant={active === cat ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => select(cat)}
        >
          {cat}
        </Badge>
      ))}
    </div>
  )
}
