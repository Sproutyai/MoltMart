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
    .limit(10)

  if (!templates || templates.length === 0) return null

  const typed = templates as (Template & { seller: { username: string; display_name: string | null } })[]

  return (
    <section className="mx-auto max-w-full overflow-hidden">
      <div className="mb-6 mx-auto max-w-6xl flex items-center justify-between px-4">
        <h2 className="text-2xl font-bold sm:text-3xl">🆕 New Enhancements</h2>
        <Button variant="ghost" asChild>
          <Link href="/templates/new">View All →</Link>
        </Button>
      </div>
      <InfiniteCarousel direction="left" speed={35}>
        {typed.map((t) => (
          <TemplateCard key={t.id} template={t} showTimestamp />
        ))}
      </InfiniteCarousel>
    </section>
  )
}
