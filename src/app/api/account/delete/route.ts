import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = user.id

    // 1. Delete reviews
    await supabase.from("reviews").delete().eq("user_id", userId)

    // 2. Delete bookmarks
    await supabase.from("bookmarks").delete().eq("user_id", userId)

    // 3. Delete purchases
    await supabase.from("purchases").delete().eq("buyer_id", userId)

    // 4. Delete affiliate_clicks for user's affiliates
    const { data: affiliates } = await supabase
      .from("affiliates")
      .select("id")
      .eq("user_id", userId)

    if (affiliates && affiliates.length > 0) {
      const affiliateIds = affiliates.map((a) => a.id)
      await supabase.from("affiliate_clicks").delete().in("affiliate_id", affiliateIds)

      // 5. Delete affiliate_referrals
      await supabase.from("affiliate_referrals").delete().in("affiliate_id", affiliateIds)
    }

    // 6. Delete affiliates
    await supabase.from("affiliates").delete().eq("user_id", userId)

    // 7. Delete promotions for user's templates
    const { data: templates } = await supabase
      .from("templates")
      .select("id")
      .eq("seller_id", userId)

    if (templates && templates.length > 0) {
      const templateIds = templates.map((t) => t.id)
      await supabase.from("promotions").delete().in("template_id", templateIds)
    }

    // 8. Soft-delete templates (preserve purchase history for buyers)
    await supabase
      .from("templates")
      .update({ status: "deleted" })
      .eq("seller_id", userId)

    // 9. Delete profile
    await supabase.from("profiles").delete().eq("id", userId)

    // 10. Delete auth user via admin client
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
