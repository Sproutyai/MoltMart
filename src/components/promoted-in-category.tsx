import { createClient } from "@/lib/supabase/server"
import { TemplateCard } from "@/components/template-card"
import type { Template } from "@/lib/types"

interface PromotedInCategoryProps {
  category: string
  currentTemplateId: string
}

export async function PromotedInCategory({ category, currentTemplateId }: PromotedInCategoryProps) {
  const supabase = await createClient()

  // Get promoted template IDs
  const { data: promos } = await supabase
    .from("promotions")
    .select("template_id")
    .order("promoted_at", { ascending: false })
    .limit(20)

  if (!promos || promos.length === 0) return null

  const promoIds = promos.map(p => p.template_id)

  const { data } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, twitter_verified)")
    .in("id", promoIds)
    .eq("category", category)
    .eq("status", "published")
    .neq("id", currentTemplateId)
    .limit(3)

  if (!data || data.length === 0) return null

  // Track impressions server-side
  const templateIds = data.map(t => t.id)
  for (const id of templateIds) {
    try { await supabase.rpc("increment_promotion_stat", { p_template_id: id, p_stat: "impressions" }) } catch {}
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">⭐ Featured in {category}</h2>
      <div className="grid gap-3">
        {(data as (Template & { seller: { username: string; display_name: string | null; avatar_url?: string | null } })[]).map((t) => (
          <TemplateCard key={t.id} template={t} isFeatured variant="compact" />
        ))}
      </div>
    </div>
  )
}
