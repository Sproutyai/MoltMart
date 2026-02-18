import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LibraryClient } from "./library-client"
import type { Purchase, Template } from "@/lib/types"

export default async function DashboardPage() {
  let purchases: Purchase[] = []
  let reviewMap: Record<string, number> = {}
  let bookmarkedIds: string[] = []
  let recommendedTemplates: (Template & { seller: { username: string; display_name: string | null; avatar_url?: string | null; is_verified?: boolean; github_verified?: boolean; twitter_verified?: boolean } })[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: p } = await supabase
      .from("purchases")
      .select("*, template:templates(*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, twitter_verified))")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false })
    purchases = (p as Purchase[]) || []

    const { data: reviews } = await supabase
      .from("reviews")
      .select("template_id, rating")
      .eq("buyer_id", user.id)

    reviewMap = Object.fromEntries(reviews?.map((r) => [r.template_id, r.rating]) || [])

    // Fetch bookmarked template IDs for heart state
    const { data: bookmarks } = await supabase
      .from("bookmarks")
      .select("template_id")
      .eq("user_id", user.id)

    bookmarkedIds = (bookmarks ?? []).map((b: { template_id: string }) => b.template_id)

    // Fetch promoted templates the user hasn't purchased
    const purchasedIds = purchases.map(p => p.template_id)
    const { data: promos } = await supabase
      .from("promotions")
      .select("template_id")
      .order("promoted_at", { ascending: false })
      .limit(20)

    if (promos && promos.length > 0) {
      const promoIds = promos.map(p => p.template_id).filter(id => !purchasedIds.includes(id))
      if (promoIds.length > 0) {
        const { data: recTemplates } = await supabase
          .from("templates")
          .select("*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, twitter_verified)")
          .in("id", promoIds)
          .eq("status", "published")
          .limit(3)
        if (recTemplates) {
          recommendedTemplates = recTemplates as typeof recommendedTemplates
        }
      }
    }
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-lg font-medium">Failed to load your library</p>
        <p className="text-sm text-muted-foreground">Please refresh the page to try again.</p>
        <Link href="/dashboard">
          <Button>Refresh</Button>
        </Link>
      </div>
    )
  }

  return <LibraryClient purchases={purchases} reviewMap={reviewMap} bookmarkedIds={bookmarkedIds} recommendedTemplates={recommendedTemplates} />
}
