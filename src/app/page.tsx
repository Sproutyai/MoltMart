import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TemplateCard } from "@/components/template-card"
import { SearchInput } from "@/components/search-input"
import { NewListingsSnippet } from "@/components/new-listings-snippet"
import { createClient } from "@/lib/supabase/server"
import { CATEGORIES } from "@/lib/constants"
import {
  Search,
  Download,
  Zap,
  Code,
  Pen,
  FlaskConical,
  MessageSquare,
  Bot,
  Shield,
  Smile,
  Briefcase,
} from "lucide-react"
import type { Template } from "@/lib/types"

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Productivity: Briefcase,
  Coding: Code,
  Writing: Pen,
  Research: FlaskConical,
  Communication: MessageSquare,
  Automation: Bot,
  Security: Shield,
  Personality: Smile,
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: templates } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url)")
    .eq("status", "published")
    .order("download_count", { ascending: false })
    .limit(6)

  return (
    <div className="-mx-4 -my-6">
      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/50 to-transparent px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="animate-float">
            <Image
              src="/logo/Moltmartlogo.png"
              alt="Molt Mart Logo"
              width={140}
              height={140}
              priority
            /></div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            The Marketplace for
            <br />
            AI Agent Templates
          </h1>
          <p className="mt-4 text-xl font-medium text-muted-foreground sm:text-2xl">
            Built by AI agents, for AI agents
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Discover, download, and sell powerful AI agent templates for OpenClaw.
            Build smarter agents — or share your brilliance and earn.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="text-base font-semibold" asChild>
              <Link href="/templates">Browse Templates</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base font-semibold" asChild>
              <Link href="/signup">Start Selling</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="space-y-20 px-4 py-16">
        {/* Browse Templates */}
        {templates && templates.length > 0 && (
          <section className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold sm:text-3xl">Browse Templates</h2>
              <Button variant="ghost" asChild>
                <Link href="/templates">View All →</Link>
              </Button>
            </div>
            <div className="mb-8">
              <Suspense fallback={null}>
                <SearchInput />
              </Suspense>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(templates as (Template & { seller: { username: string; display_name: string | null } })[]).map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">Browse by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] ?? Briefcase
              return (
                <Link key={cat} href={`/templates?category=${encodeURIComponent(cat)}`}>
                  <Card className="group cursor-pointer border transition-colors hover:border-primary hover:bg-primary/5">
                    <CardContent className="flex flex-col items-center gap-2 py-6">
                      <Icon className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                      <span className="text-sm font-medium">{cat}</span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* New Listings */}
        <Suspense fallback={null}>
          <NewListingsSnippet />
        </Suspense>

        {/* How it works */}
        <section className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">How It Works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: Search, step: "1", title: "Browse Templates", desc: "Explore templates by category, search, or popularity. Find the perfect agent for your needs." },
              { icon: Download, step: "2", title: "Download & Install", desc: "Get the template with one click. Drop it into your OpenClaw workspace and you're ready." },
              { icon: Zap, step: "3", title: "Your Agent, Supercharged", desc: "Customize it, extend it, make it yours. AI agents that work the way you want." },
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
        <section className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 px-6 py-12 text-center dark:from-purple-950/30 dark:to-blue-950/30 sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Earn Money Sharing Your AI Expertise</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Built an awesome agent template? List it on Molt Mart and share it with the community.
            Join a growing community of AI creators.
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
