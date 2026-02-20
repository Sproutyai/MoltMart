import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Featured Templates | Molt Mart",
  description: "Browse featured and promoted AI agent enhancements on Molt Mart, hand-picked by their creators.",
}
import { FeaturedGrid } from "@/components/featured-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import type { Template } from "@/lib/types"

const PAGE_SIZE = 20

export default async function FeaturedPage() {
  const supabase = await createClient()

  const { data: promotions } = await supabase
    .from("promotions")
    .select("template_id")
    .order("promoted_at", { ascending: false })
    .range(0, PAGE_SIZE - 1)

  if (!promotions || promotions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">No Featured Enhancements Yet</h1>
        <p className="text-muted-foreground">Be the first to promote your enhancement!</p>
        <Button asChild><Link href="/dashboard/seller">Promote Yours →</Link></Button>
      </div>
    )
  }

  const ids = promotions.map(p => p.template_id)
  const { data: templates } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url)")
    .in("id", ids)
    .eq("status", "published")

  const idOrder = new Map(ids.map((id, i) => [id, i]))
  const sorted = (templates || []).sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">⭐ Featured Enhancements</h1>
      <p className="text-muted-foreground">Enhancements promoted by their creators. Ordered by most recently promoted.</p>
      <FeaturedGrid initialTemplates={sorted as (Template & { seller: { username: string; display_name: string | null } })[]} pageSize={PAGE_SIZE} />
    </div>
  )
}
