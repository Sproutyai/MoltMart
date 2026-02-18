"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Megaphone, TrendingUp, ArrowLeft, BarChart3, MousePointer, AlertTriangle, RefreshCw, Eye } from "lucide-react"
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

export default function PromotePage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [promotions, setPromotions] = useState<Map<string, PromoInfo>>(new Map())
  const [loading, setLoading] = useState(true)
  const [promoting, setPromoting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState<Set<string>>(new Set())
  const [sellerProfile, setSellerProfile] = useState<{ username: string; display_name: string | null; avatar_url?: string | null; is_verified?: boolean; github_verified?: boolean; twitter_verified?: boolean } | null>(null)

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
        // Compute position server-side via API to avoid leaking all sellers' promotion data
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
        promos.forEach(p => {
          promoMap.set(p.template_id, {
            promoted_at: p.promoted_at,
            position: posMap.get(p.template_id) ?? 0,
            impressions: p.impressions,
            clicks: p.clicks,
          })
        })
        setPromotions(promoMap)
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

      <Card className="mb-8">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <Megaphone className="h-8 w-8 text-amber-500 shrink-0 mt-1" />
            <div>
              <h2 className="font-semibold text-lg">Get more visibility for $25</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Featured templates appear on the homepage, at the top of search results, and get a ⭐ badge.
                You stay featured forever — re-promote anytime to jump back to #1.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
  )
}
