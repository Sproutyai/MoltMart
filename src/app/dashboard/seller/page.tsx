"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SellerTemplateRow } from "@/components/seller-template-row"
import { Loader2, Plus, Store } from "lucide-react"
import { toast } from "sonner"
import type { Profile, Template } from "@/lib/types"

export default function SellerDashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [becoming, setBecoming] = useState(false)

  useEffect(() => {
    async function load() {
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
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function becomeSeller() {
    setBecoming(true)
    try {
      const res = await fetch("/api/profile/become-seller", { method: "POST" })
      if (!res.ok) { toast.error("Failed"); return }
      toast.success("You're now a seller!")
      setProfile((p) => p ? { ...p, is_seller: true } : p)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setBecoming(false)
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>

  if (!profile?.is_seller) {
    return (
      <div className="flex justify-center py-12">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Store className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <CardTitle>Become a Seller</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Start selling your OpenClaw agent templates to the community.</p>
            <Button onClick={becomeSeller} disabled={becoming}>
              {becoming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Become a Seller
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalDownloads = templates.reduce((s, t) => s + t.download_count, 0)
  const avgRating = templates.length ? (templates.reduce((s, t) => s + t.avg_rating, 0) / templates.length).toFixed(1) : "—"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <Link href="/dashboard/seller/upload">
          <Button><Plus className="mr-2 h-4 w-4" />Upload New Template</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card><CardContent className="pt-6 text-center"><div className="text-2xl font-bold">{templates.length}</div><div className="text-xs text-muted-foreground">Templates</div></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="text-2xl font-bold">{totalDownloads}</div><div className="text-xs text-muted-foreground">Downloads</div></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="text-2xl font-bold">{avgRating}</div><div className="text-xs text-muted-foreground">Avg Rating</div></CardContent></Card>
      </div>

      {templates.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No templates yet. Upload your first one!</p>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => <SellerTemplateRow key={t.id} template={t} />)}
        </div>
      )}
    </div>
  )
}
