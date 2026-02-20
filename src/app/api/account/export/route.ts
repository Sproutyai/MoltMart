import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const uid = user.id

  const [profile, templates, reviews, purchases, bookmarks, affiliate] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).single(),
    supabase.from("templates").select("*").eq("seller_id", uid),
    supabase.from("reviews").select("*").eq("buyer_id", uid),
    supabase.from("purchases").select("*").eq("buyer_id", uid),
    supabase.from("bookmarks").select("*").eq("user_id", uid),
    supabase.from("affiliates").select("*").eq("user_id", uid).maybeSingle(),
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    userId: uid,
    profile: profile.data,
    templates: templates.data ?? [],
    reviews: reviews.data ?? [],
    purchases: purchases.data ?? [],
    bookmarks: bookmarks.data ?? [],
    affiliate: affiliate.data,
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="molt-mart-data-export.json"',
    },
  })
}
