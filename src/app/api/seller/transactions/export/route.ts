import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
    `)
    .eq("template.seller_id", user.id)
    .order("created_at", { ascending: false })

  const now = new Date()
  if (period === "week") {
    const d = new Date(now); d.setDate(d.getDate() - 7)
    query = query.gte("created_at", d.toISOString())
  } else if (period === "month") {
    const d = new Date(now); d.setMonth(d.getMonth() - 1)
    query = query.gte("created_at", d.toISOString())
  } else if (period === "year") {
    const d = new Date(now); d.setFullYear(d.getFullYear() - 1)
    query = query.gte("created_at", d.toISOString())
  }

  if (templateId) query = query.eq("template_id", templateId)
  if (status) query = query.eq("status", status)

  const { data: rows, error } = await query
  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 })

  const fmt = (cents: number) => (cents / 100).toFixed(2)
  const csvRows = [
    "Transaction ID,Date,Template,Buyer,Sale Price,Platform Fee,Net Earnings,Status",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(rows || []).map((p: any) =>
      [
        p.id,
        format(new Date(p.created_at), "yyyy-MM-dd HH:mm:ss"),
        `"${(p.template?.title || "").replace(/"/g, '""')}"`,
        p.buyer?.display_name || p.buyer?.username || "",
        fmt(p.price_cents),
        fmt(p.platform_fee_cents || 0),
        fmt(p.seller_earnings_cents || 0),
        p.status,
      ].join(",")
    ),
  ].join("\n")

  const dateStr = format(new Date(), "yyyy-MM-dd")
  return new NextResponse(csvRows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=molt-mart-transactions-${dateStr}.csv`,
    },
  })
}
