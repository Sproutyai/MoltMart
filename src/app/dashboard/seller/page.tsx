"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Store, Pencil, Archive, DollarSign, Download, Star, Package, Megaphone, TrendingUp, AlertTriangle, RefreshCw, BarChart3, Upload, Zap, Crown } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type { Profile, Template } from "@/lib/types"

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
}

export default function SellerDashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [becoming, setBecoming] = useState(false)
  const [archiving, setArchiving] = useState<string | null>(null)
  const [promotions, setPromotions] = useState<Map<string, { promoted_at: string; position: number; impressions: number; clicks: number }>>(new Map())
  const [promoting, setPromoting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Template | null>(null)
  const [promoteTarget, setPromoteTarget] = useState<Template | null>(null)

  async function load() {
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(p)

      if (p?.is_seller) {
        const { data: t } = await supabase
          .from("templates")
          .select("*")
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false })
        setTemplates(t || [])

        // Fetch only this seller's promotions
        const { data: promos } = await supabase
          .from("promotions")
          .select("template_id, promoted_at, impressions, clicks")
          .eq("seller_id", user.id)

        if (promos) {
          const promoMap = new Map<string, { promoted_at: string; position: number; impressions: number; clicks: number }>()
          promos.forEach(p => {
            promoMap.set(p.template_id, {
              promoted_at: p.promoted_at,
              position: 0,
              impressions: p.impressions,
              clicks: p.clicks,
            })
          })
          setPromotions(promoMap)
        }
      }
      setLoading(false)

      // Handle success redirect
      const params = new URLSearchParams(window.location.search)
      if (params.get("promoted")) {
        toast.success("Enhancement promoted! It's now #1 in Featured.")
        window.history.replaceState({}, "", "/dashboard/seller")
      }
    } catch {
      setError("Failed to load seller dashboard. Please try again.")
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [router])

  async function becomeSeller() {
    setBecoming(true)
    try {
      const res = await fetch("/api/profile/become-seller", { method: "POST" })
      if (!res.ok) { toast.error("Failed"); return }
      toast.success("You're now a seller! Set up your store profile to get started.")
      router.push("/dashboard/profile")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setBecoming(false)
    }
  }

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

  async function toggleArchive(t: Template) {
    setArchiving(t.id)
    const newStatus = t.status === "archived" ? "published" : "archived"
    try {
      const res = await fetch(`/api/templates/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) { toast.error("Failed to update"); return }
      setTemplates((prev) => prev.map((x) => x.id === t.id ? { ...x, status: newStatus } : x))
      toast.success(newStatus === "archived" ? "Enhancement archived" : "Enhancement restored")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setArchiving(null)
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

  if (!profile?.is_seller) {
    return (
      <div className="flex justify-center py-12">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Store className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <CardTitle>Become a Seller</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">Start selling your OpenClaw agent enhancements to the community.</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">📦 List your agent enhancements & templates</li>
              <li className="flex items-center gap-2">💰 Set your own prices (free or paid)</li>
              <li className="flex items-center gap-2">📊 Track downloads, ratings & reviews</li>
              <li className="flex items-center gap-2">🎉 0% platform fees during beta</li>
            </ul>
            <div className="text-center">
              <Button onClick={becomeSeller} disabled={becoming}>
                {becoming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Become a Seller
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalDownloads = templates.reduce((s, t) => s + t.download_count, 0)
  const avgRating = templates.length ? (templates.reduce((s, t) => s + t.avg_rating, 0) / templates.length).toFixed(1) : "—"
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/seller/promote" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto text-sm"><Megaphone className="mr-2 h-4 w-4" />Promote</Button>
          </Link>
          <Link href="/dashboard/seller/upload" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto text-sm"><Plus className="mr-2 h-4 w-4" />Upload</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{templates.length}</div>
            <div className="text-xs text-muted-foreground">Enhancements</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Download className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{totalDownloads}</div>
            <div className="text-xs text-muted-foreground">Downloads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{avgRating}</div>
            <div className="text-xs text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold text-muted-foreground">—</div>
            <div className="text-xs text-muted-foreground">Earnings (coming soon)</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Link href="/dashboard/seller/upload">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center gap-2 py-5 text-center">
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Upload Product</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/seller/analytics">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center gap-2 py-5 text-center">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">View Analytics</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/seller/promote">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center gap-2 py-5 text-center">
              <Megaphone className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Promote</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Best Performing Product */}
      {templates.length > 0 && (() => {
        const best = [...templates].sort((a, b) => b.download_count - a.download_count)[0]
        const recentlyUpdated = [...templates].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]
        return (
          <Card className="mb-8">
            <CardContent className="py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Top Performer</p>
                    <Link href={`/templates/${best.slug}`} className="text-sm font-semibold hover:underline">{best.title}</Link>
                    <p className="text-xs text-muted-foreground">{best.download_count} downloads · ★ {best.avg_rating.toFixed(1)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Recently Updated</p>
                    <Link href={`/templates/${recentlyUpdated.slug}`} className="text-sm font-semibold hover:underline">{recentlyUpdated.title}</Link>
                    <p className="text-xs text-muted-foreground">Updated {new Date(recentlyUpdated.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Package className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">You haven&apos;t uploaded any enhancements yet</p>
            <Link href="/dashboard/seller/upload">
              <Button><Plus className="mr-2 h-4 w-4" />Upload Your First Enhancement</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.category}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusColors[t.status] || "secondary"}>{t.status}</Badge>
                  {promotions.has(t.id) && (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-xs">
                      ⭐ Promoted
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">{t.download_count} DLs</span>
                  <span className="text-sm text-muted-foreground">★ {t.avg_rating.toFixed(1)}</span>
                  <span className="text-sm font-medium">
                    {t.price_cents > 0 ? `$${(t.price_cents / 100).toFixed(2)}` : "Free"}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Link href={`/dashboard/seller/edit/${t.id}`}>
                    <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => t.status === "archived" ? toggleArchive(t) : setArchiveTarget(t)}
                    disabled={archiving === t.id}
                    title={t.status === "archived" ? "Restore" : "Archive"}
                  >
                    {archiving === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
                  </Button>
                  {t.status === "published" && (
                    <Button variant="ghost" size="sm" onClick={() => setPromoteTarget(t)} disabled={promoting === t.id} title={promotions.has(t.id) ? "Re-promote to #1" : "Promote for $25"}>
                      {promoting === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : promotions.has(t.id) ? <TrendingUp className="h-4 w-4 text-amber-500" /> : <Megaphone className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!archiveTarget} onOpenChange={(open) => !open && setArchiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Enhancement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive &ldquo;{archiveTarget?.title}&rdquo;? It will be unpublished and hidden from buyers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (archiveTarget) { toggleArchive(archiveTarget); setArchiveTarget(null) } }}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!promoteTarget} onOpenChange={(open) => !open && setPromoteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote Enhancement</AlertDialogTitle>
            <AlertDialogDescription>
              Promote &ldquo;{promoteTarget?.title}&rdquo; to #1 in Featured for <strong>$25</strong>. You&apos;ll be redirected to Stripe to complete payment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (promoteTarget) { handlePromote(promoteTarget.id); setPromoteTarget(null) } }}>
              Promote for $25
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
