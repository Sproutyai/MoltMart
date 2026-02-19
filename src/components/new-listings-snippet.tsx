import { createClient } from "@/lib/supabase/server"
import { TemplateCard } from "@/components/template-card"
import { InfiniteCarousel } from "@/components/infinite-carousel"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Template } from "@/lib/types"

export async function NewListingsSnippet() {
  const supabase = await createClient()
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const { data: templates } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url)")
    .eq("status", "published")
    .gte("created_at", weekAgo)
    .order("created_at", { ascending: false })
    .limit(20)

  if (!templates || templates.length === 0) return null

  // Fetch user bookmarks for hydration
  const bookmarkedIds = new Set<string>()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: bookmarks } = await supabase
      .from("bookmarks")
      .select("template_id")
      .eq("user_id", user.id)
      .in("template_id", templates.map(t => t.id))
    bookmarks?.forEach(b => bookmarkedIds.add(b.template_id))
  }

  const typed = templates as (Template & { seller: { username: string; display_name: string | null } })[]

  return (
    <section className="mx-auto max-w-full">
      <div className="mb-3 mx-auto max-w-6xl flex items-center justify-between px-4">
        <h2 className="text-lg font-semibold sm:text-xl">🆕 New</h2>
        <Button variant="ghost" asChild>
          <Link href="/templates/new">View All →</Link>
        </Button>
      </div>
      <InfiniteCarousel direction="left" speed={70}>
        {typed.map((t) => (
          <TemplateCard key={t.id} template={t} showTimestamp borderColor="red" initialBookmarked={bookmarkedIds.has(t.id)} />
        ))}
      </InfiniteCarousel>
    </section>
  )
}
