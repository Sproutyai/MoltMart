import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TemplateCard } from "@/components/template-card"
import { Heart } from "lucide-react"
import type { Template } from "@/lib/types"

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("template_id, template:templates(*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, twitter_verified))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const templates = (bookmarks ?? [])
    .map((b: Record<string, unknown>) => b.template)
    .filter(Boolean) as (Template & { seller: { username: string; display_name: string | null; avatar_url?: string | null } })[]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Heart className="text-red-500" size={24} /> My Bookmarks
      </h1>
      {templates.length === 0 ? (
        <p className="text-muted-foreground">No bookmarks yet. Browse templates and click the heart icon to save them here.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  )
}
