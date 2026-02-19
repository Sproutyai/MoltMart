import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const sort = searchParams.get("sort") || "newest"

  let query = supabase
    .from("templates")
    .select("id, title, slug, description, category, price_cents, status, download_count, avg_rating, review_count, screenshots, created_at, updated_at")
    .eq("seller_id", user.id)

  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  if (search) {
    query = query.ilike("title", `%${search}%`)
  }

  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true })
      break
    case "most_sales":
      query = query.order("download_count", { ascending: false })
      break
    case "title_az":
      query = query.order("title", { ascending: true })
      break
    case "newest":
    default:
      query = query.order("created_at", { ascending: false })
      break
  }

  const { data: products, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ products: products || [] })
}
