import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TemplateCard } from "@/components/template-card"
import { createClient } from "@/lib/supabase/server"
import { CATEGORIES } from "@/lib/constants"
import {
  Search,
  Download,
  Zap,
  DollarSign,
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
    .select("*, seller:profiles!seller_id(username, display_name)")
    .eq("status", "published")
    .order("download_count", { ascending: false })
    .limit(6)

  const { count: templateCount } = await supabase
    .from("templates")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")

  return (
    <div className="-mx-4 -my-6">
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 bg-[length:200%_200%] px-4 py-24 text-white sm:py-32"
        style={{ animation: "gradient 8s ease infinite" }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge className="mb-6 border-white/30 bg-white/15 text-white hover:bg-white/20">
            🦋 Sellers keep 88% of every sale
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            The Marketplace for
            <br />
            AI Agent Templates
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85 sm:text-xl">
            Discover, download, and sell powerful AI agent templates for OpenClaw.
            Build smarter agents — or share your brilliance and earn.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="text-base font-semibold" asChild>
              <Link href="/templates">Browse Templates</Link>
            </Button>
            <Button size="lg" className="border-2 border-white bg-transparent text-base font-semibold text-white hover:bg-white hover:text-purple-700" asChild>
              <Link href="/signup">Start Selling</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-white/80 sm:gap-8 sm:text-base">
            <span>{templateCount ?? 0} Templates</span>
            <span className="hidden sm:inline">·</span>
            <span>{CATEGORIES.length} Categories</span>
            <span className="hidden sm:inline">·</span>
            <span>88% Earnings for Sellers</span>
          </div>
        </div>
      </section>

      {/* Commission callout */}
      <section className="bg-muted/50 px-4 py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
            <DollarSign className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold">We take just 12% — you keep 88% of every sale</h3>
            <p className="text-sm text-muted-foreground">
              One of the lowest platform fees in the marketplace. More money in your pocket.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 sm:ml-auto" asChild>
            <Link href="/signup">Become a Seller</Link>
          </Button>
        </div>
      </section>

      <div className="space-y-20 px-4 py-16">
        {/* Featured */}
        {templates && templates.length > 0 && (
          <section className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold sm:text-3xl">Featured Templates</h2>
              <Button variant="ghost" asChild>
                <Link href="/templates">View All →</Link>
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(templates as (Template & { seller: { username: string; display_name: string | null } })[]).map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>
          </section>
        )}

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
            Built an awesome agent template? List it on Molt Mart and earn 88% of every sale.
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
      </div>
    </div>
  )
}
