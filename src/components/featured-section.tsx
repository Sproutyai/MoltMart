import { createClient } from "@/lib/supabase/server"
import { TemplateCard } from "@/components/template-card"
import { InfiniteCarousel } from "@/components/infinite-carousel"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Template } from "@/lib/types"

export async function FeaturedSection() {
  const supabase = await createClient()

  const { data: promotions } = await supabase
    .from("promotions")
    .select("template_id, promoted_at")
    .order("promoted_at", { ascending: false })
    .limit(10)

  if (!promotions || promotions.length === 0) return null

  const templateIds = promotions.map(p => p.template_id)

  const { data: templates } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url)")
    .in("id", templateIds)
    .eq("status", "published")

  if (!templates || templates.length === 0) return null

  // Sort by promotion order
  const idOrder = new Map(templateIds.map((id, i) => [id, i]))
  const sorted = [...templates].sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99))

  // Track impressions
  for (const id of templateIds) {
    await supabase.rpc("increment_promotion_stat", { p_template_id: id, p_field: "impressions" })
  }

  return (
    <section className="mx-auto max-w-full overflow-hidden">
      <div className="mb-6 mx-auto max-w-6xl flex items-center justify-between px-4">
        <h2 className="text-2xl font-bold sm:text-3xl">⭐ Featured</h2>
        <Button variant="ghost" asChild>
          <Link href="/templates/featured">View All →</Link>
        </Button>
      </div>
      <InfiniteCarousel direction="left" speed={35}>
        {sorted.map((t) => (
          <TemplateCard key={t.id} template={t as Template & { seller: { username: string; display_name: string | null } }} isFeatured borderColor="amber" />
        ))}
      </InfiniteCarousel>
    </section>
  )
}
