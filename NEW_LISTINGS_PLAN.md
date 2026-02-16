# New Listings Feature — Implementation Plan

## Overview
Add a `/templates/new` page, homepage snippet, navbar link, and timestamp support on template cards.

---

## File-by-File Implementation Order

### Step 1: Modify `src/components/template-card.tsx`

**Action:** Modify  
**Why first:** Other files depend on the updated props.

**Changes:**
- Add `showTimestamp?: boolean` to props interface
- Import `formatDistanceToNow` from `date-fns`
- Render timestamp + "NEW" badge when enabled

```tsx
// Updated interface
interface TemplateCardProps {
  template: Template & { seller?: { username: string; display_name: string | null } }
  showTimestamp?: boolean
}

// Add import at top:
import { formatDistanceToNow } from "date-fns"
import { Sparkles } from "lucide-react"

// In the component function, add this helper:
const isNew = Date.now() - new Date(template.created_at).getTime() < 48 * 60 * 60 * 1000

// In CardFooter, BEFORE the existing flex div, add:
{showTimestamp && (
  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
    {isNew && (
      <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-4 gap-0.5">
        <Sparkles size={10} />
        NEW
      </Badge>
    )}
    <span>{formatDistanceToNow(new Date(template.created_at), { addSuffix: true })}</span>
  </div>
)}
```

Specifically, replace the current `<CardFooter>` block with:

```tsx
<CardFooter className="flex flex-col items-stretch gap-1 text-xs text-muted-foreground">
  {showTimestamp && (
    <div className="flex items-center gap-2">
      {isNew && (
        <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-4 gap-0.5">
          <Sparkles size={10} />
          NEW
        </Badge>
      )}
      <span>{formatDistanceToNow(new Date(template.created_at), { addSuffix: true })}</span>
    </div>
  )}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-1">
      <StarRating value={template.avg_rating} size={12} />
      <span>({template.review_count})</span>
    </div>
    <div className="flex items-center gap-1">
      <Download size={12} />
      <span>{template.download_count}</span>
    </div>
  </div>
</CardFooter>
```

---

### Step 2: Create `src/app/templates/new/page.tsx`

**Action:** Create new file

```tsx
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

export const revalidate = 60 // ISR: revalidate every 60 seconds

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
```

---

### Step 3: Create `src/app/templates/new/loading.tsx`

**Action:** Create new file

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function NewListingsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-72" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-24" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-lg border p-4">
              <Skeleton className="aspect-video w-full rounded" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

### Step 4: Create `src/components/new-listings-snippet.tsx`

**Action:** Create new file

```tsx
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
    .select("*, seller:profiles!seller_id(username, display_name)")
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
```

---

### Step 5: Modify `src/app/page.tsx`

**Action:** Modify

**Changes:**
1. Add import at top: `import { NewListingsSnippet } from "@/components/new-listings-snippet"`
2. Add `<Suspense fallback={null}><NewListingsSnippet /></Suspense>` between the "Browse by Category" section and the "How It Works" section.

Specifically, find:
```tsx
        {/* How it works */}
```

Insert before it:
```tsx
        {/* New Listings */}
        <Suspense fallback={null}>
          <NewListingsSnippet />
        </Suspense>

```

---

### Step 6: Modify `src/components/navbar.tsx`

**Action:** Modify

Add a "New" link between "Browse Templates" and "Sell" in the desktop nav.

Find:
```tsx
            <Link href="/templates" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Browse Templates
            </Link>
            <Link href="/dashboard/seller" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Sell
            </Link>
```

Replace with:
```tsx
            <Link href="/templates" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Browse Templates
            </Link>
            <Link href="/templates/new" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              New
            </Link>
            <Link href="/dashboard/seller" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Sell
            </Link>
```

---

### Step 7: Modify `src/components/mobile-nav.tsx`

**Action:** Modify

Find:
```tsx
          <Link href="/templates" onClick={close} className="text-lg font-medium">Browse Templates</Link>
          <Link href="/dashboard/seller" onClick={close} className="text-lg font-medium">Sell</Link>
```

Replace with:
```tsx
          <Link href="/templates" onClick={close} className="text-lg font-medium">Browse Templates</Link>
          <Link href="/templates/new" onClick={close} className="text-lg font-medium">New Listings</Link>
          <Link href="/dashboard/seller" onClick={close} className="text-lg font-medium">Sell</Link>
```

---

## Auto-Refresh Strategy

Use Next.js ISR with `revalidate = 60` on the `/templates/new` page (already specified in Step 2). The homepage snippet inherits the default revalidation of the parent page. No client-side polling needed for MVP — ISR at 60s is sufficient for a marketplace where listings trickle in.

---

## Summary of Files

| # | File | Action |
|---|------|--------|
| 1 | `src/components/template-card.tsx` | Modify — add `showTimestamp` prop, NEW badge |
| 2 | `src/app/templates/new/page.tsx` | Create — new listings page with time groups |
| 3 | `src/app/templates/new/loading.tsx` | Create — loading skeleton |
| 4 | `src/components/new-listings-snippet.tsx` | Create — homepage snippet component |
| 5 | `src/app/page.tsx` | Modify — add snippet between Categories and How It Works |
| 6 | `src/components/navbar.tsx` | Modify — add "New" link |
| 7 | `src/components/mobile-nav.tsx` | Modify — add "New Listings" link |
