"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DownloadButton } from "@/components/download-button"
import { TemplateCard } from "@/components/template-card"
import {
  ShoppingBag,
  Package,
  Search,
  ArrowUpDown,
  ExternalLink,
  Star,
} from "lucide-react"
import type { Purchase, Template } from "@/lib/types"

type SortOption = "recent" | "alpha" | "category"

interface LibraryClientProps {
  purchases: Purchase[]
  reviewMap: Record<string, number>
  bookmarkedIds?: string[]
}

export function LibraryClient({ purchases, reviewMap, bookmarkedIds = [] }: LibraryClientProps) {
  const bookmarkedSet = useMemo(() => new Set(bookmarkedIds), [bookmarkedIds])
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("recent")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Extract unique categories from user's purchases
  const categories = useMemo(() => {
    const cats = new Set<string>()
    purchases.forEach((p) => {
      if (p.template?.category) cats.add(p.template.category)
    })
    return Array.from(cats).sort()
  }, [purchases])

  // Filter and sort
  const filtered = useMemo(() => {
    let items = [...purchases]

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (p) =>
          p.template?.title?.toLowerCase().includes(q) ||
          p.template?.description?.toLowerCase().includes(q)
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      items = items.filter((p) => p.template?.category === categoryFilter)
    }

    // Sort
    switch (sort) {
      case "alpha":
        items.sort((a, b) =>
          (a.template?.title || "").localeCompare(b.template?.title || "")
        )
        break
      case "category":
        items.sort((a, b) =>
          (a.template?.category || "").localeCompare(b.template?.category || "")
        )
        break
      case "recent":
      default:
        // Already sorted by created_at desc from server
        break
    }

    return items
  }, [purchases, search, sort, categoryFilter])

  // Empty state
  if (!purchases || purchases.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Purchases</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <Package className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Your library is empty</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Discover enhancements to power up your agent — browse templates
              created by the community.
            </p>
            <Link href="/templates">
              <Button size="lg">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Enhancements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Purchases</h1>
        <Link href="/templates">
          <Button variant="outline" size="sm">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse Enhancements
          </Button>
        </Link>
      </div>

      {/* Search + Sort controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="alpha">Alphabetical</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Category filter tabs */}
      {categories.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <Button
            variant={categoryFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("all")}
            className="shrink-0"
          >
            All ({purchases.length})
          </Button>
          {categories.map((cat) => {
            const count = purchases.filter(
              (p) => p.template?.category === cat
            ).length
            return (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className="shrink-0"
              >
                {cat} ({count})
              </Button>
            )
          })}
        </div>
      )}

      {/* Results count */}
      {search && (
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Card grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Search className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No matching enhancements found</p>
            {search && (
              <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((purchase) => {
            const t = purchase.template as (Template & { seller?: { username: string; display_name: string | null; avatar_url?: string | null; is_verified?: boolean; github_verified?: boolean; twitter_verified?: boolean } }) | undefined
            if (!t) return null
            const templateUrl = `/templates/${t.slug}`
            return (
              <TemplateCard
                key={purchase.id}
                template={t}
                variant="library"
                initialBookmarked={bookmarkedSet.has(purchase.template_id)}
                purchaseDate={purchase.created_at}
                userRating={reviewMap[purchase.template_id]}
                actions={
                  <div className="flex flex-col gap-2 w-full">
                    {reviewMap[purchase.template_id] === undefined && (
                      <Link href={`${templateUrl}#reviews`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Star className="mr-2 h-3 w-3" />
                          Leave a Review
                        </Button>
                      </Link>
                    )}
                    <DownloadButton
                      templateId={purchase.template_id}
                      templateSlug={t.slug}
                      templateName={t.title}
                      isLoggedIn={true}
                      hasPurchased={true}
                    />
                    <Link href={templateUrl} className="w-full">
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View Listing
                      </Button>
                    </Link>
                  </div>
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
