"use client"

import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { useState } from "react"

export function NavbarSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/templates?q=${encodeURIComponent(query.trim())}`)
      setQuery("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="hidden md:block">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search templates..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 w-64 rounded-full border border-input bg-muted/50 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:w-80"
        />
      </div>
    </form>
  )
}
