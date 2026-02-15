"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function SearchInput() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/templates?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <Input
        placeholder="Search templates..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-8"
      />
    </form>
  )
}
