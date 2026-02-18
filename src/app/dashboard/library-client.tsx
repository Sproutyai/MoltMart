"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DownloadButton } from "@/components/download-button"
import { StarRating } from "@/components/star-rating"
import { SellerLink } from "@/components/seller-link"
import { BookmarkButton } from "@/components/bookmark-button"
import {
  ShoppingBag,
  Package,
  Search,
  ArrowUpDown,
  ExternalLink,
  Star,
  Download,
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
          {filtered.map((purchase) => (
            <LibraryCard
              key={purchase.id}
              purchase={purchase}
              userRating={reviewMap[purchase.template_id]}
              isBookmarked={bookmarkedSet.has(purchase.template_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Individual Library Card (rich, matches TemplateCard style) ─── */

function LibraryCard({
  purchase,
  userRating,
  isBookmarked = false,
}: {
  purchase: Purchase
  userRating?: number
  isBookmarked?: boolean
}) {
  const t = purchase.template as (Template & { seller?: { username: string; display_name: string | null; avatar_url?: string | null; is_verified?: boolean; github_verified?: boolean; twitter_verified?: boolean } }) | undefined
  if (!t) return null

  const templateUrl = `/templates/${t.slug}`

  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] overflow-hidden">
      {/* Screenshot thumbnail */}
      {t.screenshots && t.screenshots.length > 0 && (
        <Link href={templateUrl}>
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img
              src={t.screenshots[0]}
              alt={t.title}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs">
            {t.category}
          </Badge>
          {t.difficulty && (
            <Badge
              variant="outline"
              className={`text-xs ${
                t.difficulty === "beginner"
                  ? "border-green-500 text-green-600"
                  : t.difficulty === "intermediate"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-red-500 text-red-600"
              }`}
            >
              {t.difficulty === "beginner"
                ? "🟢"
                : t.difficulty === "intermediate"
                  ? "🟡"
                  : "🔴"}{" "}
              {t.difficulty}
            </Badge>
          )}
          {t.price_cents === 0 ? (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            >
              Free
            </Badge>
          ) : (
            <span className="font-semibold text-sm">
              ${(t.price_cents / 100).toFixed(2)}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-1">
          <Link href={templateUrl} className="block min-w-0">
            <h3 className="font-semibold leading-tight line-clamp-1 hover:underline">
              {t.title}
            </h3>
          </Link>
          <BookmarkButton templateId={t.id} size={16} initialBookmarked={isBookmarked} />
        </div>
      </CardHeader>

      <CardContent className="pb-2 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {t.description}
        </p>
        {t.seller && (
          <div className="mt-2 flex items-center">
            <SellerLink
              username={t.seller.username}
              displayName={t.seller.display_name}
              avatarUrl={t.seller.avatar_url}
              showAvatar
            />
          </div>
        )}
        {/* Downloaded on date */}
        <p className="mt-2 text-xs text-muted-foreground">
          Downloaded on{" "}
          {new Date(purchase.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-2 pt-2">
        {/* Ratings row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <StarRating value={t.avg_rating} size={12} />
            <span>({t.review_count})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={12} />
            <span>{t.download_count}</span>
          </div>
        </div>

        {/* User's rating or leave review */}
        {userRating !== undefined ? (
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>Your rating: {userRating}/5</span>
          </div>
        ) : (
          <Link href={`${templateUrl}#reviews`}>
            <Button variant="outline" size="sm" className="w-full">
              <Star className="mr-2 h-3 w-3" />
              Leave a Review
            </Button>
          </Link>
        )}

        {/* Quick actions */}
        <div className="flex gap-2">
          <div className="flex-1">
            <DownloadButton
              templateId={purchase.template_id}
              templateSlug={t.slug}
              templateName={t.title}
              isLoggedIn={true}
              hasPurchased={true}
            />
          </div>
        </div>
        <Link href={templateUrl} className="w-full">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            <ExternalLink className="mr-1 h-3 w-3" />
            View Listing
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
