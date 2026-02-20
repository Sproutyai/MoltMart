import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Browse AI Agent Templates | Molt Mart",
  description: "Discover and download AI agent templates, prompts, and enhancements for OpenClaw. Free and premium options available.",
}
import { ExploreClient } from "@/components/explore-client"
import type { Template } from "@/lib/types"

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
  const { q, category, sort } = await searchParams
  const supabase = await createClient()
  const sortConfig = SORT_MAP[sort || "newest"] || SORT_MAP.newest

  // Build query
  let query = supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, twitter_verified)", { count: "exact" })
    .eq("status", "published")

  if (q) {
    const escaped = q.replace(/%/g, "\\%")
    query = query.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%,tags.cs.{${q}}`)
  }

  if (category) {
    query = query.eq("category", category)
  }

  query = query
    .order(sortConfig.column, { ascending: sortConfig.ascending })
    .limit(50)

  const { data: templates, count } = await query
  const totalCount = count ?? 0

  // Fetch featured templates
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

      const { data: ft } = await fQuery.limit(4)
      if (ft) {
        const idOrder = new Map(promoIds.map((id, i) => [id, i]))
        featuredTemplates = [...ft].sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99)) as typeof featuredTemplates
      }
    }
  }

  // Remove featured from organic results
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

  // Category counts
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

  return (
    <ExploreClient
      initialTemplates={organicTemplates as any}
      initialFeatured={featuredTemplates as any}
      initialSellers={sellerResults}
      initialCategoryCounts={categoryCounts}
      initialTotalCount={totalCount}
      initialAllTotal={allTotal}
    />
  )
}
