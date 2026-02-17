import { createClient } from "@/lib/supabase/server"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LibraryClient } from "./library-client"
import type { Purchase } from "@/lib/types"

export default async function DashboardPage() {
  let purchases: Purchase[] = []
  let reviewMap: Record<string, number> = {}

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: p } = await supabase
      .from("purchases")
      .select("*, template:templates(*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, twitter_verified))")
      .eq("buyer_id", user!.id)
      .order("created_at", { ascending: false })
    purchases = (p as Purchase[]) || []

    const { data: reviews } = await supabase
      .from("reviews")
      .select("template_id, rating")
      .eq("buyer_id", user!.id)

    reviewMap = Object.fromEntries(reviews?.map((r) => [r.template_id, r.rating]) || [])
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

  return <LibraryClient purchases={purchases} reviewMap={reviewMap} />
}
