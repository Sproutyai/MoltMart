"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TemplateCard } from "@/components/template-card"
import { SellerSearchCard } from "@/components/seller-search-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Loader2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { CATEGORIES } from "@/lib/constants"
import type { Template } from "@/lib/types"
import { TemplateCardSkeleton } from "@/components/template-card-skeleton"
import Link from "next/link"

type TemplateWithSeller = Template & {
  seller?: {
    username: string
    display_name: string | null
    avatar_url?: string | null
    is_verified?: boolean
    github_verified?: boolean
    twitter_verified?: boolean
  }
}

type SellerResult = {
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "top-rated", label: "Top Rated" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
] as const

const SORT_MAP: Record<string, { column: string; ascending: boolean }> = {
  newest: { column: "created_at", ascending: false },
  popular: { column: "download_count", ascending: false },
  "top-rated": { column: "avg_rating", ascending: false },
  "price-asc": { column: "price_cents", ascending: true },
  "price-desc": { column: "price_cents", ascending: false },
}

const SELECT_QUERY = "*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, twitter_verified)"

interface ExploreClientProps {
  initialTemplates: TemplateWithSeller[]
  initialFeatured: TemplateWithSeller[]
  initialSellers: SellerResult[]
  initialCategoryCounts: Record<string, number>
  initialTotalCount: number
  initialAllTotal: number
}

export function ExploreClient({
  initialTemplates,
  initialFeatured,
  initialSellers,
  initialCategoryCounts,
  initialTotalCount,
  initialAllTotal,
}: ExploreClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [sort, setSort] = useState(searchParams.get("sort") || "newest")
  const [priceFilter, setPriceFilter] = useState("")

  const [templates, setTemplates] = useState<TemplateWithSeller[]>(initialTemplates)
  const [featured, setFeatured] = useState<TemplateWithSeller[]>(initialFeatured)
  const [sellers, setSellers] = useState<SellerResult[]>(initialSellers)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [categoryCounts, setCategoryCounts] = useState(initialCategoryCounts)
  const [allTotal, setAllTotal] = useState(initialAllTotal)
  const [loading, setLoading] = useState(false)

  const staffPicksRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  // Sync URL params
  const updateUrl = useCallback((q: string, cat: string, s: string) => {
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (cat) params.set("category", cat)
    if (s && s !== "newest") params.set("sort", s)
    const str = params.toString()
    router.replace(`/templates${str ? `?${str}` : ""}`, { scroll: false })
  }, [router])

  // Fetch data from Supabase
  const fetchData = useCallback(async (q: string, cat: string, s: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    try {
      const sortConfig = SORT_MAP[s] || SORT_MAP.newest

      // Main query
      let mainQ = supabase
        .from("templates")
        .select(SELECT_QUERY, { count: "exact" })
        .eq("status", "published")

      if (q.trim()) {
        const escaped = q.trim().replace(/%/g, "\\%")
        mainQ = mainQ.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%,tags.cs.{${q.trim()}}`)
      }
      if (cat) mainQ = mainQ.eq("category", cat)
      mainQ = mainQ.order(sortConfig.column, { ascending: sortConfig.ascending }).limit(50)

      // Featured query
      const promoQ = supabase
        .from("promotions")
        .select("template_id")
        .order("promoted_at", { ascending: false })
        .limit(10)

      // Seller query (only if searching)
      const sellerPromise = q.trim()
        ? supabase
            .from("profiles")
            .select("username, display_name, avatar_url, bio")
            .eq("is_seller", true)
            .or(`username.ilike.%${q.trim().replace(/%/g, "\\%")}%,display_name.ilike.%${q.trim().replace(/%/g, "\\%")}%`)
            .limit(5)
        : Promise.resolve({ data: [] as SellerResult[] })

      // Category counts
      const countsQ = supabase
        .from("templates")
        .select("category")
        .eq("status", "published")

      const [mainRes, promoRes, sellerRes, countsRes] = await Promise.all([
        mainQ,
        promoQ,
        sellerPromise,
        countsQ,
      ])

      if (controller.signal.aborted) return

      // Process category counts
      const counts: Record<string, number> = {}
      let total = 0
      if (countsRes.data) {
        for (const t of countsRes.data) {
          counts[t.category] = (counts[t.category] || 0) + 1
          total++
        }
      }
      setCategoryCounts(counts)
      setAllTotal(total)

      // Process featured
      let featuredList: TemplateWithSeller[] = []
      if (promoRes.data && promoRes.data.length > 0) {
        const promoIds = promoRes.data.map(p => p.template_id)
        let fQ = supabase
          .from("templates")
          .select(SELECT_QUERY)
          .in("id", promoIds)
          .eq("status", "published")

        if (q.trim()) {
          const escaped = q.trim().replace(/%/g, "\\%")
          fQ = fQ.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%,tags.cs.{${q.trim()}}`)
        }
        if (cat) fQ = fQ.eq("category", cat)

        const { data: ft } = await fQ.limit(4)
        if (!controller.signal.aborted && ft) {
          const idOrder = new Map(promoIds.map((id, i) => [id, i]))
          featuredList = [...ft].sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99)) as TemplateWithSeller[]
        }
      }

      if (controller.signal.aborted) return

      const featuredIds = new Set(featuredList.map(t => t.id))
      const organic = ((mainRes.data || []) as TemplateWithSeller[]).filter(t => !featuredIds.has(t.id))

      setTemplates(organic)
      setFeatured(featuredList)
      setTotalCount(mainRes.count ?? 0)
      setSellers((sellerRes.data || []) as SellerResult[])
    } catch {
      // silently handle aborted requests
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [supabase])

  // Debounced search on query change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateUrl(query, category, sort)
      fetchData(query, category, sort)
    }, 250)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, category, sort, updateUrl, fetchData])

  // Category change (immediate)
  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
  }

  const handleSortChange = (s: string) => {
    setSort(s)
  }

  // Filter categories with counts > 0
  const visibleCategories = CATEGORIES.filter(cat => (categoryCounts[cat] || 0) > 0)

  // Client-side price filtering
  const filteredTemplates = useMemo(() => {
    if (!priceFilter) return templates
    return templates.filter((t) => {
      switch (priceFilter) {
        case "free": return t.price_cents === 0
        case "under5": return t.price_cents > 0 && t.price_cents < 500
        case "under10": return t.price_cents > 0 && t.price_cents < 1000
        case "10plus": return t.price_cents >= 1000
        default: return true
      }
    })
  }, [templates, priceFilter])

  const displayCount = priceFilter ? filteredTemplates.length : totalCount
  const resultSummary = query.trim()
    ? `${displayCount} result${displayCount !== 1 ? "s" : ""} for "${query.trim()}"`
    : `Showing ${displayCount} enhancement${displayCount !== 1 ? "s" : ""}`

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Explore</h1>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
          )}
          <Input
            placeholder="Search enhancements by name, description, or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Category pills — horizontal scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <Badge
          variant={!category ? "default" : "outline"}
          className="cursor-pointer shrink-0 whitespace-nowrap"
          onClick={() => handleCategoryChange("")}
        >
          All ({allTotal})
        </Badge>
        {visibleCategories.map((cat) => (
          <Badge
            key={cat}
            variant={category === cat ? "default" : "outline"}
            className="cursor-pointer shrink-0 whitespace-nowrap"
            onClick={() => handleCategoryChange(cat)}
          >
            {cat} ({categoryCounts[cat] || 0})
          </Badge>
        ))}
      </div>

      {/* Seller results */}
      {sellers.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Sellers</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {sellers.map((s) => (
              <SellerSearchCard key={s.username} seller={s} />
            ))}
          </div>
        </div>
      )}

      {/* Staff Picks — horizontal carousel */}
      {featured.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <span>⭐</span> Staff Picks
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => staffPicksRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
                className="rounded-full p-1 hover:bg-muted transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => staffPicksRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
                className="rounded-full p-1 hover:bg-muted transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          <div
            ref={staffPicksRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory py-2 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {featured.map((t) => (
              <div key={t.id} className="w-[200px] flex-shrink-0 snap-start">
                <TemplateCard template={t} isFeatured />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sort bar + filters + result count */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">{resultSummary}</p>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Price filter pills */}
          {(["free", "under5", "under10", "10plus"] as const).map((pf) => {
            const labels: Record<string, string> = { free: "Free", under5: "Under $5", under10: "Under $10", "10plus": "$10+" }
            return (
              <Badge
                key={pf}
                variant={priceFilter === pf ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setPriceFilter(priceFilter === pf ? "" : pf)}
              >
                {labels[pf]}
              </Badge>
            )
          })}
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[160px] h-8 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main grid */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <TemplateCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredTemplates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
          {/* CTA card */}
          <Link href="/sell" className="block h-full">
            <div className="h-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-4 text-center transition-colors hover:border-muted-foreground/40 hover:bg-muted/50 min-h-[180px]">
              <div className="rounded-full bg-primary/10 p-3">
                <Plus className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Want to sell your own templates?</p>
                <p className="text-xs text-muted-foreground mt-1">Share your enhancements with the community</p>
              </div>
              <Button variant="outline" size="sm">Start Selling →</Button>
            </div>
          </Link>
        </div>
      ) : !loading && featured.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-lg font-medium">No templates found</p>
          <p className="text-sm text-muted-foreground">
            Try a different search term, category, or sort option
          </p>
        </div>
      ) : null}
    </div>
  )
}
