import { createClient } from "@/lib/supabase/server"
import { TemplateCard } from "@/components/template-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { isToday, isThisWeek, isThisMonth } from "date-fns"
import type { Template } from "@/lib/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "New Listings | Molt Mart",
  description: "Discover the latest AI agent templates added to Molt Mart.",
}

export const revalidate = 60

const PAGE_SIZE = 20

type TemplateWithSeller = Template & { seller: { username: string; display_name: string | null } }

function groupByTime(templates: TemplateWithSeller[]) {
  const groups: { label: string; items: TemplateWithSeller[] }[] = [
    { label: "Today", items: [] },
    { label: "This Week", items: [] },
    { label: "This Month", items: [] },
    { label: "Older", items: [] },
  ]

  for (const t of templates) {
    const date = new Date(t.created_at)
    if (isToday(date)) groups[0].items.push(t)
    else if (isThisWeek(date, { weekStartsOn: 1 })) groups[1].items.push(t)
    else if (isThisMonth(date)) groups[2].items.push(t)
    else groups[3].items.push(t)
  }

  return groups.filter((g) => g.items.length > 0)
}

export default async function NewListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1)
  const supabase = await createClient()

  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: templates, count } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name)", { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(from, to)

  const totalCount = count ?? 0
  const hasMore = totalCount > currentPage * PAGE_SIZE

  if (!templates || templates.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Listings</h1>
          <p className="mt-1 text-muted-foreground">Fresh templates added to Molt Mart</p>
        </div>
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-lg font-medium">No templates yet</p>
          <p className="text-sm text-muted-foreground">Check back soon for new listings!</p>
          <Button asChild className="mt-4">
            <Link href="/templates">Browse All Templates</Link>
          </Button>
        </div>
      </div>
    )
  }

  const groups = groupByTime(templates as TemplateWithSeller[])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">New Listings</h1>
        <p className="mt-1 text-muted-foreground">
          Fresh templates added to Molt Mart · {totalCount} total
        </p>
      </div>

      {groups.map((group) => (
        <section key={group.label} className="space-y-4">
          <h2 className="text-xl font-semibold">
            {group.label}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({group.items.length})
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((t) => (
              <TemplateCard key={t.id} template={t} showTimestamp />
            ))}
          </div>
        </section>
      ))}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 pt-4">
        {currentPage > 1 && (
          <Button variant="outline" asChild>
            <Link href={`/templates/new?page=${currentPage - 1}`}>← Previous</Link>
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {Math.ceil(totalCount / PAGE_SIZE)}
        </span>
        {hasMore && (
          <Button variant="outline" asChild>
            <Link href={`/templates/new?page=${currentPage + 1}`}>Next →</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
