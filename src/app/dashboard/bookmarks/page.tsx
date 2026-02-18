import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookmarksClient } from "./bookmarks-client"
import type { Template } from "@/lib/types"

export default async function BookmarksPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: bookmarks, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select("template_id, template:templates(*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, twitter_verified))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (bookmarksError) throw bookmarksError

    const templates = (bookmarks ?? [])
      .map((b: Record<string, unknown>) => b.template)
      .filter(Boolean) as (Template & { seller: { username: string; display_name: string | null; avatar_url?: string | null } })[]

    // Fetch purchased template IDs to show "Purchased" badges
    const { data: purchases } = await supabase
      .from("purchases")
      .select("template_id")
      .eq("buyer_id", user.id)

    const purchasedIds = (purchases ?? []).map((p: { template_id: string }) => p.template_id)

    return <BookmarksClient templates={templates} purchasedIds={purchasedIds} />
  } catch (error) {
    console.error("Failed to load bookmarks:", error)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-lg font-medium">Failed to load your bookmarks</p>
        <p className="text-sm text-muted-foreground">Please refresh the page to try again.</p>
        <Link href="/dashboard/bookmarks">
          <Button>Refresh</Button>
        </Link>
      </div>
    )
  }
}
