import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SellerProfileHeader } from "@/components/seller-profile-header"
import { FeaturedTemplates } from "@/components/featured-templates"
import { TemplateCard } from "@/components/template-card"
import { Pagination } from "@/components/pagination"
import { SortSelect } from "@/components/sort-select"
import type { Profile, SellerStats, Template } from "@/lib/types"

const PAGE_SIZE = 12

const SORT_MAP: Record<string, { column: string; ascending: boolean }> = {
  newest: { column: "created_at", ascending: false },
  popular: { column: "download_count", ascending: false },
  "top-rated": { column: "avg_rating", ascending: false },
}

export default async function SellerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ sort?: string; page?: string }>
}) {
  const { username } = await params
  const { sort, page } = await searchParams
  const supabase = await createClient()

  // 1. Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("is_seller", true)
    .single()

  if (!profile) notFound()

  const p = profile as Profile

  // 2. Get stats via RPC (graceful fallback)
  let stats: SellerStats = { total_templates: 0, total_downloads: 0, avg_rating: 0, total_reviews: 0 }
  try {
    const { data: rpcStats } = await supabase.rpc("get_seller_stats", { seller_uuid: p.id })
    if (rpcStats && Array.isArray(rpcStats) && rpcStats.length > 0) {
      stats = rpcStats[0] as SellerStats
    } else if (rpcStats && !Array.isArray(rpcStats)) {
      stats = rpcStats as SellerStats
    }
  } catch {
    // RPC not available yet - use fallback
  }

  // 3. Get featured templates (graceful fallback)
  let featuredTemplates: Template[] = []
  try {
    const { data: featured } = await supabase
      .from("featured_templates")
      .select("template:templates(*)")
      .eq("seller_id", p.id)
      .order("position")
    if (featured) {
      featuredTemplates = featured
        .map((f: Record<string, unknown>) => f.template as Template)
        .filter(Boolean)
    }
  } catch {
    // Table may not exist yet
  }

  // 4. Get all published templates (paginated)
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1)
  const sortConfig = SORT_MAP[sort || "newest"] || SORT_MAP.newest
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: templates, count } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, is_verified, github_verified, twitter_verified)", { count: "exact" })
    .eq("seller_id", p.id)
    .eq("status", "published")
    .order(sortConfig.column, { ascending: sortConfig.ascending })
    .range(from, to)

  const totalCount = count ?? 0

  // 5. Check auth + follow status
  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === p.id
  let isFollowing = false
  if (user && !isOwnProfile) {
    try {
      const { data: follow } = await supabase
        .from("seller_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("seller_id", p.id)
        .maybeSingle()
      isFollowing = !!follow
    } catch {
      // Table may not exist yet
    }
  }

  return (
    <div className="space-y-8">
      <SellerProfileHeader
        profile={p}
        stats={stats}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
      />

      {featuredTemplates.length > 0 && (
        <FeaturedTemplates templates={featuredTemplates} />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Templates</h2>
          <SortSelect />
        </div>

        {templates && templates.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(templates as (Template & { seller: { username: string; display_name: string | null } })[]).map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">No templates published yet.</p>
        )}

        <Pagination totalCount={totalCount} pageSize={PAGE_SIZE} currentPage={currentPage} />
      </div>
    </div>
  )
}
