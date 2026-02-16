import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Verify seller
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_seller")
    .eq("id", user.id)
    .single()
  if (!profile?.is_seller) return NextResponse.json({ error: "Not a seller" }, { status: 403 })

  const params = request.nextUrl.searchParams
  const period = params.get("period") || "all"
  const templateId = params.get("template_id")
  const status = params.get("status")
  const sort = params.get("sort") || "date"
  const order = params.get("order") || "desc"
  const page = Math.max(1, parseInt(params.get("page") || "1"))
  const perPage = Math.min(100, Math.max(1, parseInt(params.get("per_page") || "20")))

  // Build base query
  let query = supabase
    .from("purchases")
    .select(`
      id,
      price_cents,
      platform_fee_cents,
      seller_earnings_cents,
      status,
      created_at,
      template:templates!inner(id, title, slug, seller_id),
      buyer:profiles!purchases_buyer_id_fkey(username, display_name)
    `, { count: "exact" })
    .eq("template.seller_id", user.id)

  // Period filter
  const now = new Date()
  if (period === "week") {
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    query = query.gte("created_at", weekAgo.toISOString())
  } else if (period === "month") {
    const monthAgo = new Date(now)
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    query = query.gte("created_at", monthAgo.toISOString())
  } else if (period === "year") {
    const yearAgo = new Date(now)
    yearAgo.setFullYear(yearAgo.getFullYear() - 1)
    query = query.gte("created_at", yearAgo.toISOString())
  }

  if (templateId) query = query.eq("template_id", templateId)
  if (status) query = query.eq("status", status)

  // Sort
  const sortColumn = sort === "amount" ? "price_cents" : sort === "template" ? "created_at" : "created_at"
  query = query.order(sortColumn, { ascending: order === "asc" })

  // Pagination
  const from = (page - 1) * perPage
  query = query.range(from, from + perPage - 1)

  const { data: rawTransactions, count, error } = await query

  if (error) {
    console.error("Transaction query error:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transactions = (rawTransactions || []).map((p: any) => ({
    id: p.id,
    price_cents: p.price_cents,
    platform_fee_cents: p.platform_fee_cents,
    seller_earnings_cents: p.seller_earnings_cents,
    status: p.status,
    created_at: p.created_at,
    template_id: p.template?.id,
    template_title: p.template?.title,
    template_slug: p.template?.slug,
    buyer_username: p.buyer?.username,
    buyer_display_name: p.buyer?.display_name,
  }))

  // Summary queries
  const { data: allPurchases } = await supabase
    .from("purchases")
    .select("price_cents, seller_earnings_cents, status, created_at, template:templates!inner(id, title, seller_id)")
    .eq("template.seller_id", user.id)
    .eq("status", "completed")

  const completed = allPurchases || []
  const totalEarnings = completed.reduce((s, p) => s + (p.seller_earnings_cents || 0), 0)
  const totalTransactions = completed.length
  const avgSale = totalTransactions > 0 ? Math.round(totalEarnings / totalTransactions) : 0

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const earningsThisMonth = completed
    .filter(p => new Date(p.created_at) >= monthStart)
    .reduce((s, p) => s + (p.seller_earnings_cents || 0), 0)
  const earningsThisWeek = completed
    .filter(p => new Date(p.created_at) >= weekStart)
    .reduce((s, p) => s + (p.seller_earnings_cents || 0), 0)

  // Top template
  const templateCounts: Record<string, { id: string; title: string; count: number }> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const p of completed as any[]) {
    const tid = p.template?.id
    if (!tid) continue
    if (!templateCounts[tid]) templateCounts[tid] = { id: tid, title: p.template.title, count: 0 }
    templateCounts[tid].count++
  }
  const topTemplate = Object.values(templateCounts).sort((a, b) => b.count - a.count)[0] || null

  // Get seller's templates for filter dropdown
  const { data: sellerTemplates } = await supabase
    .from("templates")
    .select("id, title")
    .eq("seller_id", user.id)
    .order("title")

  return NextResponse.json({
    transactions,
    summary: {
      total_earnings_cents: totalEarnings,
      earnings_this_month_cents: earningsThisMonth,
      earnings_this_week_cents: earningsThisWeek,
      total_transactions: totalTransactions,
      avg_sale_cents: avgSale,
      top_template: topTemplate ? { id: topTemplate.id, title: topTemplate.title, sales_count: topTemplate.count } : null,
    },
    pagination: {
      page,
      per_page: perPage,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / perPage),
    },
    templates: sellerTemplates || [],
  })
}
