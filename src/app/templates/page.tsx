import { createClient } from "@/lib/supabase/server"
import { TemplateCard } from "@/components/template-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchInput } from "@/components/search-input"
import type { Template } from "@/lib/types"

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const { q, category } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name)")
    .eq("status", "published")
    .order("download_count", { ascending: false })

  if (q) {
    query = query.ilike("title", `%${q}%`)
  }
  if (category) {
    query = query.eq("category", category)
  }

  const { data: templates } = await query

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Templates</h1>
        <p className="text-muted-foreground">
          {q ? `Results for "${q}"` : category ? `Category: ${category}` : "All templates"}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter />
        <div className="sm:w-64">
          <SearchInput />
        </div>
      </div>

      {templates && templates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(templates as (Template & { seller: { username: string; display_name: string | null } })[]).map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-lg font-medium">No templates found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or category filter
          </p>
        </div>
      )}
    </div>
  )
}
