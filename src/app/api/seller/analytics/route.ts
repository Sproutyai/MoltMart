import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "all"

  // Get all seller's templates
  const { data: templates, error } = await supabase
    .from("templates")
    .select("id, title, slug, download_count, avg_rating, review_count, price_cents, status, created_at, updated_at, category")
    .eq("seller_id", user.id)
    .order("download_count", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get transactions for revenue data
  const { data: transactions } = await supabase
    .from("purchases")
    .select("price_cents, created_at, template_id")
    .in("template_id", (templates || []).map(t => t.id))

  // Calculate period filter date
  let periodStart: Date | null = null
  const now = new Date()
  if (period === "7d") periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  else if (period === "30d") periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  else if (period === "90d") periodStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const filteredTransactions = periodStart
    ? (transactions || []).filter(t => new Date(t.created_at) >= periodStart!)
    : transactions || []

  // Build per-template revenue map
  const revenueMap = new Map<string, number>()
  for (const tx of filteredTransactions) {
    revenueMap.set(tx.template_id, (revenueMap.get(tx.template_id) || 0) + tx.price_cents)
  }

  const totalRevenueCents = filteredTransactions.reduce((sum, t) => sum + t.price_cents, 0)
  const totalDownloads = (templates || []).reduce((sum, t) => sum + t.download_count, 0)
  const totalReviews = (templates || []).reduce((sum, t) => sum + t.review_count, 0)

  // Per-template stats
  const productStats = (templates || []).map(t => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    category: t.category,
    status: t.status,
    downloads: t.download_count,
    avgRating: t.avg_rating,
    reviewCount: t.review_count,
    priceCents: t.price_cents,
    revenueCents: revenueMap.get(t.id) || 0,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }))

  return NextResponse.json({
    overview: {
      totalDownloads,
      totalRevenueCents,
      totalReviews,
      totalProducts: (templates || []).length,
      publishedProducts: (templates || []).filter(t => t.status === "published").length,
      // Views placeholder — will be wired up with real tracking later
      totalViews: null,
      viewsThisMonth: null,
      conversionRate: null,
    },
    products: productStats,
    period,
  })
}
