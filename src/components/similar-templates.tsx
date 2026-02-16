import { createClient } from "@/lib/supabase/server"
import { TemplateCard } from "@/components/template-card"
import type { Template } from "@/lib/types"

interface SimilarTemplatesProps {
  category: string
  currentTemplateId: string
}

export async function SimilarTemplates({ category, currentTemplateId }: SimilarTemplatesProps) {
  const supabase = await createClient()

  const { data } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, twitter_verified)")
    .eq("category", category)
    .eq("status", "published")
    .neq("id", currentTemplateId)
    .order("download_count", { ascending: false })
    .limit(4)

  if (!data || data.length === 0) return null

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Similar Enhancements</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(data as (Template & { seller: { username: string; display_name: string | null; avatar_url?: string | null } })[]).map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </div>
  )
}
