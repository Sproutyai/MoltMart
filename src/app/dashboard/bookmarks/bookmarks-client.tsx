"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TemplateCard } from "@/components/template-card"
import { Heart, Search, ArrowUpDown, ShoppingBag, Filter, LayoutGrid, List, Star, ExternalLink } from "lucide-react"
import { SafeImage } from "@/components/safe-image"
import { CategoryPlaceholder } from "@/components/category-placeholder"
import type { Template } from "@/lib/types"

type SortOption = "recent" | "alpha" | "category"
type PriceFilter = "all" | "free" | "paid"
type ViewMode = "card" | "list"

function getStoredViewMode(): ViewMode {
  if (typeof window === "undefined") return "card"
  return (localStorage.getItem("molt-bookmarks-view") as ViewMode) || "card"
}

interface BookmarksClientProps {
  templates: (Template & { seller?: { username: string; display_name: string | null; avatar_url?: string | null; is_verified?: boolean; github_verified?: boolean; twitter_verified?: boolean } })[]
  purchasedIds?: string[]
}

export function BookmarksClient({ templates: initialTemplates, purchasedIds = [] }: BookmarksClientProps) {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("recent")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all")
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>("card")

  useEffect(() => {
    setViewMode(getStoredViewMode())
  }, [])

  function changeViewMode(mode: ViewMode) {
    setViewMode(mode)
    localStorage.setItem("molt-bookmarks-view", mode)
  }

  async function handleUnbookmark(templateId: string) {
    try {
      await fetch("/api/bookmarks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ templateId }) })
      setRemovedIds((prev) => new Set(prev).add(templateId))
    } catch {
      // silently fail
    }
  }

  const purchasedSet = useMemo(() => new Set(purchasedIds), [purchasedIds])

  // Filter out removed bookmarks (optimistic removal)
  const templates = useMemo(
    () => initialTemplates.filter((t) => !removedIds.has(t.id)),
    [initialTemplates, removedIds]
  )

  const freeCount = useMemo(() => templates.filter(t => t.price_cents === 0).length, [templates])
  const paidCount = useMemo(() => templates.filter(t => t.price_cents > 0).length, [templates])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    templates.forEach((t) => { if (t.category) cats.add(t.category) })
    return Array.from(cats).sort()
  }, [templates])

  const filtered = useMemo(() => {
    let items = [...templates]

    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      )
    }

    if (categoryFilter !== "all") {
      items = items.filter((t) => t.category === categoryFilter)
    }

    if (priceFilter === "free") {
      items = items.filter((t) => t.price_cents === 0)
    } else if (priceFilter === "paid") {
      items = items.filter((t) => t.price_cents > 0)
    }

    switch (sort) {
      case "alpha":
        items.sort((a, b) => (a.title || "").localeCompare(b.title || ""))
        break
      case "category":
        items.sort((a, b) => (a.category || "").localeCompare(b.category || ""))
        break
      case "recent":
      default:
        break
    }

    return items
  }, [templates, search, sort, categoryFilter, priceFilter])

  // Empty state — no bookmarks at all
  if (templates.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Heart className="text-red-500" size={24} /> My Bookmarks
        </h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <Heart className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No bookmarks yet</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Browse enhancements and click the heart icon to save them here for later.
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="text-red-500" size={24} /> My Bookmarks
          <span className="text-base font-normal text-muted-foreground">({templates.length})</span>
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "card" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2 rounded-r-none"
              onClick={() => changeViewMode("card")}
              title="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2 rounded-l-none"
              onClick={() => changeViewMode("list")}
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Link href="/templates">
            <Button variant="outline" size="sm">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Enhancements
            </Button>
          </Link>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Price filter pills */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={priceFilter === "all" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 rounded-r-none text-xs whitespace-nowrap"
              onClick={() => setPriceFilter("all")}
            >
              All ({templates.length})
            </Button>
            <Button
              variant={priceFilter === "free" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 rounded-none border-x text-xs whitespace-nowrap"
              onClick={() => setPriceFilter("free")}
            >
              Free ({freeCount})
            </Button>
            <Button
              variant={priceFilter === "paid" ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 rounded-l-none text-xs whitespace-nowrap"
              onClick={() => setPriceFilter("paid")}
            >
              Paid ({paidCount})
            </Button>
          </div>
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
            All ({templates.length})
          </Button>
          {categories.map((cat) => {
            const count = templates.filter((t) => t.category === cat).length
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
      {(search || priceFilter !== "all") && (
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Search className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              {priceFilter === "free"
                ? "No free bookmarked enhancements"
                : priceFilter === "paid"
                  ? "No paid bookmarked enhancements"
                  : "No matching bookmarks found"}
            </p>
            <div className="flex gap-2">
              {search && (
                <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              )}
              {priceFilter !== "all" && (
                <Button variant="outline" size="sm" onClick={() => setPriceFilter("all")}>
                  Show all
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        viewMode === "list" ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-[48px_1fr_100px_90px_80px_60px_auto] gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
              <span></span>
              <span>Title</span>
              <span>Seller</span>
              <span>Category</span>
              <span>Price</span>
              <span>Rating</span>
              <span></span>
            </div>
            <div className="divide-y">
              {filtered.map((t) => {
                const templateUrl = `/templates/${t.slug}`
                const screenshot = t.screenshots?.[0]
                return (
                  <div
                    key={t.id}
                    className="flex flex-col sm:grid sm:grid-cols-[48px_1fr_100px_90px_80px_60px_auto] gap-2 sm:gap-3 px-4 py-3 items-start sm:items-center hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded overflow-hidden shrink-0 bg-muted">
                      {screenshot ? (
                        <SafeImage src={screenshot} alt={t.title} width={48} height={48} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full"><CategoryPlaceholder category={t.category} /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link href={templateUrl} className="font-medium text-sm hover:underline truncate block">{t.title}</Link>
                      <div className="sm:hidden flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                        {t.seller && <span>by {t.seller.display_name || t.seller.username}</span>}
                        <span>{t.price_cents === 0 ? "Free" : `$${(t.price_cents / 100).toFixed(2)}`}</span>
                        {purchasedSet.has(t.id) && <span className="text-emerald-500 font-medium">✓ Purchased</span>}
                      </div>
                    </div>
                    <span className="hidden sm:block text-sm text-muted-foreground truncate min-w-0">
                      {t.seller ? (t.seller.display_name || t.seller.username) : "—"}
                    </span>
                    <span className="hidden sm:block min-w-0">
                      <Badge variant="secondary" className="text-xs font-normal max-w-full truncate block">{t.category}</Badge>
                    </span>
                    <span className="hidden sm:block text-sm font-medium">
                      {t.price_cents === 0 ? <span className="text-green-500">Free</span> : `$${(t.price_cents / 100).toFixed(2)}`}
                    </span>
                    <span className="hidden sm:block">
                      {t.avg_rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{t.avg_rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </span>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {purchasedSet.has(t.id) && (
                        <Badge className="hidden sm:inline-flex bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-5">✓ Purchased</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleUnbookmark(t.id)}
                        title="Remove bookmark"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                      <Link href={templateUrl}>
                        <Button variant="outline" size="sm" className="h-8">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => {
              const templateUrl = `/templates/${t.slug}`
              return (
                <TemplateCard
                  key={t.id}
                  template={t}
                  variant="library"
                  initialBookmarked={true}
                  onBookmarkRemove={() => setRemovedIds((prev) => new Set(prev).add(t.id))}
                  actions={
                    <div className="flex flex-col gap-2 w-full">
                      {purchasedSet.has(t.id) && (
                        <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-5 w-fit">✓ Purchased</Badge>
                      )}
                      <Link href={templateUrl}>
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="mr-2 h-3 w-3" />
                          View Listing
                        </Button>
                      </Link>
                    </div>
                  }
                />
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
