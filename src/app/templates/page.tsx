import { createClient } from "@/lib/supabase/server"
import { TemplateCard } from "@/components/template-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchInput } from "@/components/search-input"
import { SortSelect } from "@/components/sort-select"
import { Pagination } from "@/components/pagination"
import { SellerSearchCard } from "@/components/seller-search-card"
import type { Template } from "@/lib/types"

const PAGE_SIZE = 12

const SORT_MAP: Record<string, { column: string; ascending: boolean }> = {
  newest: { column: "created_at", ascending: false },
  popular: { column: "download_count", ascending: false },
  "top-rated": { column: "avg_rating", ascending: false },
  "price-asc": { column: "price_cents", ascending: true },
  "price-desc": { column: "price_cents", ascending: false },
}

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>
}) {
  const { q, category, sort, page } = await searchParams
  const supabase = await createClient()

  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1)
  const sortConfig = SORT_MAP[sort || "newest"] || SORT_MAP.newest
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Build query
  let query = supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, twitter_verified)", { count: "exact" })
    .eq("status", "published")

  // Search: title, description, tags
  if (q) {
    const escaped = q.replace(/%/g, "\\%")
    query = query.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%,tags.cs.{${q}}`)
  }

  if (category) {
    query = query.eq("category", category)
  }

  query = query
    .order(sortConfig.column, { ascending: sortConfig.ascending })
    .range(from, to)

  const { data: templates, count } = await query
  const totalCount = count ?? 0

  // Fetch featured templates matching current search/category
  let featuredTemplates: (Template & { seller: { username: string; display_name: string | null } })[] = []
  {
    const { data: promos } = await supabase
      .from("promotions")
      .select("template_id")
      .order("promoted_at", { ascending: false })
      .limit(10)

    if (promos && promos.length > 0) {
      const promoIds = promos.map(p => p.template_id)
      let fQuery = supabase
        .from("templates")
        .select("*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, twitter_verified)")
        .in("id", promoIds)
        .eq("status", "published")

      if (q) {
        const escaped = q.replace(/%/g, "\\%")
        fQuery = fQuery.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%,tags.cs.{${q}}`)
      }
      if (category) {
        fQuery = fQuery.eq("category", category)
      }

      const { data: ft } = await fQuery.limit(2)
      if (ft) {
        const idOrder = new Map(promoIds.map((id, i) => [id, i]))
        featuredTemplates = [...ft].sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99)) as typeof featuredTemplates
      }
    }
  }

  // Remove featured from organic results to avoid dupes
  const featuredIds = new Set(featuredTemplates.map(t => t.id))
  const organicTemplates = (templates || []).filter(t => !featuredIds.has(t.id))

  // Search sellers when query present
  let sellerResults: { username: string; display_name: string | null; avatar_url: string | null; bio: string | null }[] = []
  if (q) {
    const escaped = q.replace(/%/g, "\\%")
    const { data: sellers } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url, bio")
      .eq("is_seller", true)
      .or(`username.ilike.%${escaped}%,display_name.ilike.%${escaped}%`)
      .limit(5)
    if (sellers) sellerResults = sellers
  }

  // Category counts (lightweight query)
  const { data: allPublished } = await supabase
    .from("templates")
    .select("category")
    .eq("status", "published")

  const categoryCounts: Record<string, number> = {}
  let allTotal = 0
  if (allPublished) {
    for (const t of allPublished) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1
      allTotal++
    }
  }

  // Result summary
  const resultSummary = q
    ? `${totalCount} result${totalCount !== 1 ? "s" : ""} for "${q}"`
    : `${totalCount} template${totalCount !== 1 ? "s" : ""}`

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Browse Templates</h1>
        <SearchInput />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter counts={categoryCounts} totalCount={allTotal} />
        <SortSelect />
      </div>

      {/* Seller results */}
      {sellerResults.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Sellers</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {sellerResults.map((s) => (
              <SellerSearchCard key={s.username} seller={s} />
            ))}
          </div>
        </div>
      )}

      {/* Result count */}
      <p className="text-sm text-muted-foreground">{resultSummary}</p>

      {/* Featured results */}
      {featuredTemplates.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTemplates.map((t) => (
            <TemplateCard key={t.id} template={t} isFeatured />
          ))}
        </div>
      )}

      {/* Organic results */}
      {organicTemplates && organicTemplates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(organicTemplates as (Template & { seller: { username: string; display_name: string | null } })[]).map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      ) : featuredTemplates.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-lg font-medium">No templates found</p>
          <p className="text-sm text-muted-foreground">
            Try a different search term, category, or sort option
          </p>
        </div>
      ) : null}

      {/* Pagination */}
      <Pagination totalCount={totalCount} pageSize={PAGE_SIZE} currentPage={currentPage} />
    </div>
  )
}
