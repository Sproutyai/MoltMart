"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DownloadButton } from "@/components/download-button"
import { TemplateCard } from "@/components/template-card"
import { SafeImage } from "@/components/safe-image"
import { CategoryPlaceholder } from "@/components/category-placeholder"
import { StarRating } from "@/components/star-rating"
import {
  ShoppingBag,
  Package,
  Search,
  ArrowUpDown,
  ExternalLink,
  Star,
  LayoutGrid,
  List,
  Calendar,
  DollarSign,
  Filter,
} from "lucide-react"
import { format } from "date-fns"
import type { Purchase, Template } from "@/lib/types"

type SortOption = "recent" | "alpha" | "category"
type ViewMode = "card" | "list"
type PriceFilter = "all" | "free" | "paid"

interface LibraryClientProps {
  purchases: Purchase[]
  reviewMap: Record<string, number>
  bookmarkedIds?: string[]
  recommendedTemplates?: (Template & { seller?: { username: string; display_name: string | null; avatar_url?: string | null; is_verified?: boolean; github_verified?: boolean; twitter_verified?: boolean } })[]
}

function getStoredViewMode(): ViewMode {
  if (typeof window === "undefined") return "card"
  return (localStorage.getItem("molt-library-view") as ViewMode) || "card"
}

export function LibraryClient({ purchases, reviewMap, bookmarkedIds = [], recommendedTemplates = [] }: LibraryClientProps) {
  const bookmarkedSet = useMemo(() => new Set(bookmarkedIds), [bookmarkedIds])
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("recent")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("card")
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all")

  // Hydrate viewMode from localStorage on mount
  useEffect(() => {
    setViewMode(getStoredViewMode())
  }, [])

  function changeViewMode(mode: ViewMode) {
    setViewMode(mode)
    localStorage.setItem("molt-library-view", mode)
  }

  // Extract unique categories from user's purchases
  const categories = useMemo(() => {
    const cats = new Set<string>()
    purchases.forEach((p) => {
      if (p.template?.category) cats.add(p.template.category)
    })
    return Array.from(cats).sort()
  }, [purchases])

  // Counts for price filter
  const freeCount = useMemo(() => purchases.filter(p => p.price_cents === 0).length, [purchases])
  const paidCount = useMemo(() => purchases.filter(p => p.price_cents > 0).length, [purchases])

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

    // Price filter
    if (priceFilter === "free") {
      items = items.filter((p) => p.price_cents === 0)
    } else if (priceFilter === "paid") {
      items = items.filter((p) => p.price_cents > 0)
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
        break
    }

    return items
  }, [purchases, search, sort, categoryFilter, priceFilter])

  // Empty state — no purchases at all
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
        <div className="flex items-center gap-2">
          {/* View toggle */}
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

      {/* Search + Sort + Price filter controls */}
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
          {/* Price filter */}
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All ({purchases.length})</option>
            <option value="free">Free ({freeCount})</option>
            <option value="paid">Paid ({paidCount})</option>
          </select>
          {/* Sort */}
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
      {(search || priceFilter !== "all") && (
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Empty filtered state */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Search className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              {priceFilter === "free"
                ? "No free enhancements in your library"
                : priceFilter === "paid"
                  ? "No paid enhancements in your library"
                  : "No matching enhancements found"}
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
      ) : viewMode === "list" ? (
        /* ── List View ── */
        <div className="border rounded-lg overflow-hidden">
          {/* Table header — hidden on mobile */}
          <div className="hidden sm:grid sm:grid-cols-[48px_1fr_120px_100px_120px_100px_80px_100px] gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
            <span></span>
            <span>Title</span>
            <span>Seller</span>
            <span>Category</span>
            <span>Purchased</span>
            <span>Cost</span>
            <span>Rating</span>
            <span></span>
          </div>
          <div className="divide-y">
            {filtered.map((purchase) => {
              const t = purchase.template as (Template & { seller?: { username: string; display_name: string | null; avatar_url?: string | null } }) | undefined
              if (!t) return null
              const templateUrl = `/templates/${t.slug}`
              const screenshot = t.screenshots?.[0]
              const rating = reviewMap[purchase.template_id]

              return (
                <div
                  key={purchase.id}
                  className="flex flex-col sm:grid sm:grid-cols-[48px_1fr_120px_100px_120px_100px_80px_100px] gap-2 sm:gap-3 px-4 py-3 items-start sm:items-center hover:bg-muted/30 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded overflow-hidden shrink-0 bg-muted">
                    {screenshot ? (
                      <SafeImage
                        src={screenshot}
                        alt={t.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full">
                        <CategoryPlaceholder category={t.category} />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="min-w-0">
                    <Link href={templateUrl} className="font-medium text-sm hover:underline truncate block">
                      {t.title}
                    </Link>
                    {/* Mobile-only: show seller + meta inline */}
                    <div className="sm:hidden flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                      {t.seller && <span>by {t.seller.display_name || t.seller.username}</span>}
                      <span>{format(new Date(purchase.created_at), "MMM d, yyyy")}</span>
                      <span>{purchase.price_cents === 0 ? "Free" : `$${(purchase.price_cents / 100).toFixed(2)}`}</span>
                    </div>
                  </div>

                  {/* Seller — desktop */}
                  <span className="hidden sm:block text-sm text-muted-foreground truncate">
                    {t.seller ? (t.seller.display_name || t.seller.username) : "—"}
                  </span>

                  {/* Category — desktop */}
                  <span className="hidden sm:block">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {t.category}
                    </Badge>
                  </span>

                  {/* Purchase date — desktop */}
                  <span className="hidden sm:block text-xs text-muted-foreground">
                    {format(new Date(purchase.created_at), "MMM d, yyyy h:mm a")}
                  </span>

                  {/* Cost — desktop */}
                  <span className="hidden sm:block text-sm font-medium">
                    {purchase.price_cents === 0 ? (
                      <span className="text-green-500">Free</span>
                    ) : (
                      `$${(purchase.price_cents / 100).toFixed(2)}`
                    )}
                  </span>

                  {/* Rating — desktop */}
                  <span className="hidden sm:block">
                    {rating !== undefined ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{rating}</span>
                      </div>
                    ) : (
                      <Link href={`${templateUrl}#reviews`} className="text-xs text-muted-foreground hover:underline">
                        Rate
                      </Link>
                    )}
                  </span>

                  {/* Download — all sizes */}
                  <div className="w-full sm:w-auto">
                    <DownloadButton
                      templateId={purchase.template_id}
                      templateSlug={t.slug}
                      templateName={t.title}
                      isLoggedIn={true}
                      hasPurchased={true}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ── Card View (existing) ── */
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

      {/* Recommended promoted templates */}
      {recommendedTemplates.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">⭐ Recommended</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedTemplates.map((t) => (
              <TemplateCard key={t.id} template={t} isFeatured />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
