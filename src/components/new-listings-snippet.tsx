import { createClient } from "@/lib/supabase/server"
import { TemplateCard } from "@/components/template-card"
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
    .limit(4)

  if (!templates || templates.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold sm:text-3xl">🆕 Just Added</h2>
        <Button variant="ghost" asChild>
          <Link href="/templates/new">View All →</Link>
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {(templates as (Template & { seller: { username: string; display_name: string | null } })[]).map((t) => (
          <TemplateCard key={t.id} template={t} showTimestamp />
        ))}
      </div>
    </section>
  )
}
