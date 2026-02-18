"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Megaphone, TrendingUp, ArrowLeft, BarChart3, MousePointer, AlertTriangle, RefreshCw, Eye, ArrowDown, Zap, CreditCard, CheckCircle2, Search, Home, Layout, FileText, List, Target } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { TemplateCard } from "@/components/template-card"
import type { Template } from "@/lib/types"

interface PromoInfo {
  promoted_at: string
  position: number
  impressions: number
  clicks: number
}

const placements = [
  { icon: <Home className="h-6 w-6" />, emoji: "🏠", title: "Homepage Featured Carousel", desc: "Prime real estate. Your enhancement scrolls across the homepage with a gold ⭐ border." },
  { icon: <Search className="h-6 w-6" />, emoji: "🔍", title: "Top of Search Results", desc: "Appear first when buyers search. Featured results pin above organic listings." },
  { icon: <Zap className="h-6 w-6" />, emoji: "⌘", title: "Search Popup", desc: "Shown to every user who opens the search bar (⌘K). Maximum visibility." },
  { icon: <Layout className="h-6 w-6" />, emoji: "📄", title: "Browse Page", desc: "Featured placement at the top of the browse page, above all other results." },
  { icon: <FileText className="h-6 w-6" />, emoji: "📋", title: "Featured Page", desc: "Permanent spot on the dedicated Featured Enhancements page." },
  { icon: <Target className="h-6 w-6" />, emoji: "🎯", title: "Template Detail Pages", desc: "Appear as recommended when buyers view similar enhancements.", badge: "NEW" },
]

const steps = [
  { num: "1", title: "Choose Your Enhancement", desc: "Pick any published enhancement from your catalog below." },
  { num: "2", title: "Pay $25 One-Time", desc: "A single payment. No recurring fees, no percentage cuts." },
  { num: "3", title: "Instantly Featured Everywhere", desc: "Your enhancement appears across all 6 premium placements immediately." },
]

const faqs = [
  { q: "How long does promotion last?", a: "Forever. Once promoted, your enhancement stays featured across all placements indefinitely. There are no recurring fees or expiration dates." },
  { q: "Can I re-promote?", a: "Yes! After 24 hours, you can re-promote for another $25 to jump back to the #1 position across all placements. This is great for boosting visibility after updates or during peak traffic." },
  { q: "What metrics can I track?", a: "You can track total impressions (how many times your featured enhancement was shown) and clicks (how many people clicked through). CTR is calculated automatically." },
  { q: "How is position determined?", a: "Position is based on when you last promoted. The most recently promoted enhancement appears first. Re-promoting moves you back to #1." },
  { q: "Can I promote multiple enhancements?", a: "Absolutely. Each published enhancement can be promoted independently. Each promotion is a separate $25 one-time payment." },
]

export default function PromotePage() {
  const router = useRouter()
  const templateListRef = useRef<HTMLDivElement>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [promotions, setPromotions] = useState<Map<string, PromoInfo>>(new Map())
  const [loading, setLoading] = useState(true)
  const [promoting, setPromoting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState<Set<string>>(new Set())
  const [sellerProfile, setSellerProfile] = useState<{ username: string; display_name: string | null; avatar_url?: string | null; is_verified?: boolean; github_verified?: boolean; twitter_verified?: boolean } | null>(null)
  const [aggregateStats, setAggregateStats] = useState<{ totalImpressions: number; avgCtr: number } | null>(null)

  async function load() {
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const [{ data: t }, { data: profile }] = await Promise.all([
        supabase
          .from("templates")
          .select("*")
          .eq("seller_id", user.id)
          .eq("status", "published")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("username, display_name, avatar_url, is_verified, github_verified, twitter_verified")
          .eq("id", user.id)
          .single(),
      ])
      setTemplates(t || [])
      if (profile) setSellerProfile(profile)

      const { data: promos } = await supabase
        .from("promotions")
        .select("template_id, promoted_at, impressions, clicks")
        .eq("seller_id", user.id)

      if (promos) {
        let posMap = new Map<string, number>()
        try {
          const templateIds = promos.map(p => p.template_id)
          const res = await fetch("/api/promote/positions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ templateIds }),
          })
          if (res.ok) {
            const positions: Record<string, number> = await res.json()
            posMap = new Map(Object.entries(positions))
          }
        } catch {
          // Position will default to 0 if API fails — non-critical
        }

        const promoMap = new Map<string, PromoInfo>()
        let totalImpressions = 0
        let totalClicks = 0
        promos.forEach(p => {
          totalImpressions += p.impressions || 0
          totalClicks += p.clicks || 0
          promoMap.set(p.template_id, {
            promoted_at: p.promoted_at,
            position: posMap.get(p.template_id) ?? 0,
            impressions: p.impressions,
            clicks: p.clicks,
          })
        })
        setPromotions(promoMap)
        if (totalImpressions > 100) {
          setAggregateStats({
            totalImpressions,
            avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
          })
        }
      }

      setLoading(false)
    } catch {
      setError("Failed to load promotions. Please try again.")
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  async function handlePromote(templateId: string) {
    setPromoting(templateId)
    try {
      const res = await fetch("/api/promote/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to start promotion")
        return
      }
      window.location.href = data.url
    } catch {
      toast.error("Something went wrong")
    } finally {
      setPromoting(null)
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-lg font-medium">{error}</p>
        <Button onClick={() => { setLoading(true); load() }}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>
      </div>
    )
  }

  function togglePreview(id: string) {
    setPreviewOpen(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function withSeller(t: Template) {
    return sellerProfile ? { ...t, seller: sellerProfile } as any : t
  }

  const promoted = templates.filter(t => promotions.has(t.id))
  const unpromoted = templates.filter(t => !promotions.has(t.id))

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/seller">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <h1 className="text-2xl font-bold">Promote Enhancements</h1>
      </div>

      {/* ===== HERO SECTION ===== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/20 border border-amber-200/60 dark:border-amber-800/40 p-8 md:p-12 mb-10">
        <div className="absolute top-4 right-4 text-6xl opacity-20 select-none">⭐</div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Get Your Enhancement Seen
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Promoted enhancements appear in premium placements across Molt Mart — homepage, search, browse, and more.
          </p>
          <Button
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => templateListRef.current?.scrollIntoView({ behavior: "smooth" })}
          >
            <Megaphone className="h-5 w-5 mr-2" />
            Promote Now
            <ArrowDown className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* ===== WHERE YOU APPEAR ===== */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-2">Where You Appear</h2>
        <p className="text-muted-foreground mb-6">6 premium placements, all included with a single $25 promotion.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {placements.map((p) => (
            <Card key={p.title} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="pt-6 pb-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{p.title}</h3>
                      {p.badge && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px] px-1.5 py-0">
                          {p.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ===== HOW IT WORKS ===== */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-xl font-bold mb-4">
                {s.num}
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== PRICING COMPARISON ===== */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-2">How We Compare</h2>
        <p className="text-muted-foreground mb-6">One price. No ongoing fees. No percentage cuts.</p>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Model</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-amber-50/50 dark:bg-amber-950/20 font-medium">
                  <TableCell className="font-bold">⭐ Molt Mart</TableCell>
                  <TableCell className="font-bold text-amber-600 dark:text-amber-400">$25 one-time</TableCell>
                  <TableCell>Featured forever, re-promote to #1 anytime</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Etsy Ads</TableCell>
                  <TableCell>$0.20–1.50/click</TableCell>
                  <TableCell className="text-muted-foreground">Ongoing, can cost $50–500+/month</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>eBay Promoted</TableCell>
                  <TableCell>2–20% of sale</TableCell>
                  <TableCell className="text-muted-foreground">Ongoing percentage</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Amazon Sponsored</TableCell>
                  <TableCell>$0.10–6.00/click</TableCell>
                  <TableCell className="text-muted-foreground">Ongoing, highly competitive</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ===== AGGREGATE STATS (conditional) ===== */}
      {aggregateStats && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Your Promotion Performance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <BarChart3 className="h-8 w-8 text-amber-500 mb-2" />
                <div className="text-3xl font-bold">{aggregateStats.totalImpressions.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Impressions Served</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <MousePointer className="h-8 w-8 text-amber-500 mb-2" />
                <div className="text-3xl font-bold">{aggregateStats.avgCtr.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">Average Click-Through Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ===== FAQ ===== */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* ===== EXISTING TEMPLATE LIST ===== */}
      <div ref={templateListRef}>
        {promoted.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Your Promoted Enhancements</h2>
            <div className="space-y-3">
              {promoted.map(t => {
                const promo = promotions.get(t.id)!
                const ctr = promo.impressions > 0 ? ((promo.clicks / promo.impressions) * 100).toFixed(1) : "0.0"
                const hoursSince = (Date.now() - new Date(promo.promoted_at).getTime()) / (1000 * 60 * 60)
                const canRepromote = hoursSince >= 24
                const hoursLeft = Math.ceil(24 - hoursSince)

                return (
                  <Card key={t.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{t.title}</span>
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-xs">
                              Featured #{promo.position}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Promoted {formatDistanceToNow(new Date(promo.promoted_at), { addSuffix: true })}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><BarChart3 size={12} /> {promo.impressions.toLocaleString()} impressions</span>
                            <span className="flex items-center gap-1"><MousePointer size={12} /> {promo.clicks.toLocaleString()} clicks</span>
                            <span>{ctr}% CTR</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePromote(t.id)}
                          disabled={promoting === t.id || !canRepromote}
                          title={canRepromote ? "Re-promote to #1" : `Available in ${hoursLeft}h`}
                        >
                          {promoting === t.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          )}
                          {canRepromote ? "Re-promote — $25" : `Available in ${hoursLeft}h`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {unpromoted.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Promote an Enhancement</h2>
            <div className="space-y-2">
              {unpromoted.map(t => (
                <Card key={t.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{t.title}</div>
                        <div className="text-xs text-muted-foreground">{t.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePreview(t.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {previewOpen.has(t.id) ? "Hide" : "Preview"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePromote(t.id)}
                          disabled={promoting === t.id}
                        >
                          {promoting === t.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Megaphone className="h-4 w-4 mr-1" />
                          )}
                          Promote — $25
                        </Button>
                      </div>
                    </div>
                    {previewOpen.has(t.id) && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex flex-wrap gap-6 justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Regular</span>
                            <div className="w-[224px] flex-shrink-0">
                              <TemplateCard template={withSeller(t)} isPreview />
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-xs font-medium text-amber-600">⭐ Featured</span>
                            <div className="w-[224px] flex-shrink-0">
                              <TemplateCard template={withSeller(t)} isPreview isFeatured borderColor="amber" />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-3">
                          Your enhancement will appear in the Featured carousel on the homepage with the gold border.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {templates.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">You don&apos;t have any published enhancements to promote yet.</p>
              <Link href="/dashboard/seller/upload">
                <Button>Upload an Enhancement</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
