import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TemplateCard } from "@/components/template-card"
import { createClient } from "@/lib/supabase/server"
import { CATEGORIES, SITE_DESCRIPTION } from "@/lib/constants"
import { Search, Download, Puzzle } from "lucide-react"
import type { Template } from "@/lib/types"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: templates } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name)")
    .eq("status", "published")
    .order("download_count", { ascending: false })
    .limit(6)

  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {SITE_DESCRIPTION}
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Discover, download, and share AI agent templates for OpenClaw — all free.
        </p>
        <Button size="lg" asChild>
          <Link href="/templates">Browse Templates</Link>
        </Button>
      </section>

      {/* Featured */}
      {templates && templates.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-semibold">Featured Templates</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(templates as (Template & { seller: { username: string; display_name: string | null } })[]).map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section>
        <h2 className="mb-6 text-center text-2xl font-semibold">How It Works</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { icon: Search, title: "Browse", desc: "Find templates by category or search" },
            { icon: Download, title: "Download", desc: "Get the template .zip with one click" },
            { icon: Puzzle, title: "Install", desc: "Drop it into your OpenClaw workspace" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="mb-6 text-center text-2xl font-semibold">Categories</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat) => (
            <Link key={cat} href={`/templates?category=${encodeURIComponent(cat)}`}>
              <Badge variant="outline" className="cursor-pointer px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground">
                {cat}
              </Badge>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
