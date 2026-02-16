"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { TemplateCard } from "@/components/template-card"
import { Loader2 } from "lucide-react"
import type { Template } from "@/lib/types"

interface Props {
  initialTemplates: (Template & { seller: { username: string; display_name: string | null } })[]
  pageSize: number
}

export function FeaturedGrid({ initialTemplates, pageSize }: Props) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialTemplates.length >= pageSize)
  const loaderRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const supabase = createClient()
    const offset = templates.length

    const { data: promotions } = await supabase
      .from("promotions")
      .select("template_id")
      .order("promoted_at", { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (!promotions || promotions.length === 0) {
      setHasMore(false)
      setLoading(false)
      return
    }

    const ids = promotions.map(p => p.template_id)
    const { data: newTemplates } = await supabase
      .from("templates")
      .select("*, seller:profiles!seller_id(username, display_name, avatar_url)")
      .in("id", ids)
      .eq("status", "published")

    if (newTemplates) {
      const idOrder = new Map(ids.map((id, i) => [id, i]))
      const sorted = [...newTemplates].sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99))
      setTemplates(prev => [...prev, ...sorted as typeof prev])
      setHasMore(newTemplates.length >= pageSize)
    }
    setLoading(false)
  }, [loading, hasMore, templates.length, pageSize])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore()
    }, { threshold: 0.1 })
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(t => <TemplateCard key={t.id} template={t} isFeatured />)}
      </div>
      <div ref={loaderRef} className="flex justify-center py-8">
        {loading && <Loader2 className="h-6 w-6 animate-spin" />}
      </div>
    </>
  )
}
