import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TemplateCard } from "@/components/template-card"
import { InfiniteCarousel } from "@/components/infinite-carousel"
import { FeaturedSection } from "@/components/featured-section"
import { NewListingsSnippet } from "@/components/new-listings-snippet"
import { createClient } from "@/lib/supabase/server"
import { CATEGORIES } from "@/lib/constants"
import { Search, Download, Zap } from "lucide-react"
import { CATEGORY_ICONS } from "@/lib/category-icons"
import type { Template } from "@/lib/types"

export default async function HomePage() {
  const supabase = await createClient()

  // Real hero stats
  const [{ count: enhancementCount }, { data: creatorsData }, { data: downloadsData }] = await Promise.all([
    supabase.from("templates").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("templates").select("seller_id").eq("status", "published"),
    supabase.from("templates").select("download_count").eq("status", "published"),
  ])
  const creatorCount = new Set(creatorsData?.map((t) => t.seller_id)).size
  const totalDownloads = downloadsData?.reduce((sum, t) => sum + (t.download_count || 0), 0) ?? 0

  const { data: templates } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url)")
    .eq("status", "published")
    .order("download_count", { ascending: false })
    .limit(20)

  // Fetch user bookmarks for carousel hydration
  const bookmarkedIds = new Set<string>()
  const { data: { user } } = await supabase.auth.getUser()
  if (user && templates) {
    const { data: bookmarks } = await supabase
      .from("bookmarks")
      .select("template_id")
      .eq("user_id", user.id)
      .in("template_id", templates.map(t => t.id))
    bookmarks?.forEach(b => bookmarkedIds.add(b.template_id))
  }

  return (
    <div className="-mx-4 -my-6">
      {/* Hero */}
      <section className="hero-gradient px-4 pt-24 pb-[84px] sm:pt-32 sm:pb-[104px]">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="animate-float logo-glow">
            <Image
              src="/logo/Moltmartlogo.png"
              alt="Molt Mart Logo"
              width={140}
              height={140}
              priority
            /></div>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            The <span className="text-gradient-brand">Enhancement Store</span> for
            <br />
            AI Agents
          </h1>
          <p className="mt-4 text-xl font-medium text-muted-foreground sm:text-2xl">
            Download new abilities for your AI agent
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Discover, download, and install powerful enhancements for OpenClaw agents.
            Upgrade your agent&apos;s capabilities — or create and sell your own.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="text-base font-semibold" asChild>
              <Link href="/templates">Browse Enhancements</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base font-semibold" asChild>
              <Link href="/signup">Create Enhancements</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span><strong className="text-foreground">{(enhancementCount ?? 0).toLocaleString()}</strong> Enhancements</span>
            <span className="text-border">•</span>
            <span><strong className="text-foreground">{creatorCount.toLocaleString()}</strong> Creators</span>
            <span className="text-border">•</span>
            <span><strong className="text-foreground">{totalDownloads.toLocaleString()}</strong> Downloads</span>
          </div>
        </div>
      </section>

      <div className="space-y-12 px-4 pt-0 pb-16">
        <div>
          <div className="space-y-6">
            {/* Featured Templates */}
            <Suspense fallback={null}>
              <FeaturedSection />
            </Suspense>

            {/* Popular Enhancements — carousel L→R */}
            {templates && templates.length > 0 && (
              <section className="mx-auto max-w-full">
                <div className="mb-3 mx-auto max-w-6xl flex items-center justify-between px-4">
                  <h2 className="text-lg font-semibold sm:text-xl">🔥 Popular</h2>
                  <Button variant="ghost" asChild>
                    <Link href="/templates">View All →</Link>
                  </Button>
                </div>
                <InfiniteCarousel direction="right" speed={60}>
                  {(templates as (Template & { seller: { username: string; display_name: string | null } })[]).map((t) => (
                    <TemplateCard key={t.id} template={t} borderColor="green" initialBookmarked={bookmarkedIds.has(t.id)} />
                  ))}
                </InfiniteCarousel>
              </section>
            )}

            {/* New Enhancements — carousel R→L */}
            <Suspense fallback={null}>
              <NewListingsSnippet />
            </Suspense>
          </div>
        </div>

        {/* Categories */}
        <section className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">Enhancement Categories</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 sm:overflow-visible sm:flex-wrap sm:justify-center">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] ?? Zap
              return (
                <Link key={cat} href={`/templates?category=${encodeURIComponent(cat)}`} className="min-w-[140px] flex-shrink-0 sm:min-w-0 sm:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-5rem)/6)]">
                  <Card className="group cursor-pointer border transition-colors hover:border-primary hover:bg-primary/5 h-full">
                    <CardContent className="flex flex-col items-center gap-2 py-4">
                      <Icon className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                      <span className="text-sm font-medium text-center">{cat}</span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">How Enhancements Work</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: Search, step: "1", title: "Find Enhancements", desc: "Browse by category or search. Find the perfect upgrade for your agent." },
              { icon: Download, step: "2", title: "Install in One Click", desc: "Download and drop into your OpenClaw workspace. Instant setup." },
              { icon: Zap, step: "3", title: "Agent Enhanced", desc: "Your agent gains new abilities. Customize and make it yours." },
            ].map(({ icon: Icon, step, title, desc }) => (
              <Card key={step} className="relative overflow-hidden border-0 bg-muted/50">
                <CardContent className="flex flex-col items-center gap-3 pt-8 text-center">
                  <span className="absolute right-4 top-3 text-4xl font-black text-muted-foreground/15">{step}</span>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* For Sellers */}
        <section className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 px-6 py-12 text-center dark:from-red-950/30 dark:to-orange-950/30 sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Create & Sell Enhancements</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Built a powerful enhancement? List it on Molt Mart and earn from your AI expertise.
            Join a growing community of enhancement creators.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Start Selling Today</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard/seller">Seller Dashboard</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
