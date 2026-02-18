"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { TemplateCard } from "@/components/template-card"
import { createClient } from "@/lib/supabase/client"
import type { Template } from "@/lib/types"

interface SearchPopupProps {
  mobile?: boolean
  className?: string
}

export function SearchPopup({ mobile, className }: SearchPopupProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<
    { id: string; title: string; slug: string }[]
  >([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [promotedTemplates, setPromotedTemplates] = useState<Template[]>([])
  const [loadingPromoted, setLoadingPromoted] = useState(false)
  const hasFetched = useRef(false)
  const impressionsSent = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>(null)

  // Global Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  // Fetch promoted on first open
  useEffect(() => {
    if (!open || hasFetched.current) return
    hasFetched.current = true
    setLoadingPromoted(true)

    const supabase = createClient()
    supabase
      .from("promotions")
      .select(
        "template_id, templates!inner(id, title, slug, category, price_cents, screenshots, avg_rating, review_count, status)"
      )
      .order("promoted_at", { ascending: false })
      .limit(36)
      .then(({ data }) => {
        if (data) {
          const templates = data
            .map((row: any) => row.templates as Template)
            .filter((t: Template) => t.status === "published")
          setPromotedTemplates(templates)
        }
        setLoadingPromoted(false)
      })
  }, [open])

  // Track impressions once per open
  useEffect(() => {
    if (!open || promotedTemplates.length === 0 || impressionsSent.current) return
    impressionsSent.current = true
    const ids = promotedTemplates.map((t) => t.id)
    fetch("/api/promote/track-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateIds: ids, type: "impression" }),
    }).catch(() => {})
  }, [open, promotedTemplates])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery("")
      setSuggestions([])
      setSelectedIndex(-1)
      impressionsSent.current = false
    }
  }, [open])

  // Autocomplete debounce
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setSelectedIndex(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("templates")
        .select("id, title, slug")
        .eq("status", "published")
        .ilike("title", `%${value.trim()}%`)
        .limit(5)
      setSuggestions(data ?? [])
    }, 300)
  }, [])

  const navigate = useCallback(
    (path: string) => {
      setOpen(false)
      router.push(path)
    },
    [router]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        navigate(`/templates/${suggestions[selectedIndex].slug}`)
      } else if (query.trim()) {
        navigate(`/templates?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  const handleCardClick = (templateId: string) => {
    // Fire click tracking
    fetch("/api/promote/track-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateIds: [templateId], type: "click" }),
    }).catch(() => {})
    setOpen(false)
  }

  // Trigger button
  const trigger = mobile ? (
    <button
      onClick={() => setOpen(true)}
      className={`flex items-center gap-2 h-10 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted transition-colors ${className ?? ""}`}
    >
      <Search className="size-4 shrink-0" />
      <span>Search enhancements...</span>
    </button>
  ) : (
    <button
      onClick={() => setOpen(true)}
      className={`hidden md:flex items-center gap-2 h-9 w-64 lg:w-80 rounded-full border border-input bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted transition-colors ${className ?? ""}`}
    >
      <Search className="size-3.5 shrink-0" />
      <span>Search enhancements...</span>
      <kbd className="ml-auto text-[10px] border rounded px-1.5 py-0.5 bg-background text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  )

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 rounded-none sm:rounded-xl bg-white dark:bg-zinc-900 shadow-2xl border border-border/50"
        >
          <DialogTitle className="sr-only">Search enhancements</DialogTitle>

          {/* Search input */}
          <div className="flex items-center border-b px-4">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search enhancements..."
              className="flex-1 h-12 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground text-foreground"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("")
                  setSuggestions([])
                  inputRef.current?.focus()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Autocomplete suggestions */}
          {suggestions.length > 0 && (
            <div className="border-b divide-y bg-muted/30">
              {suggestions.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/templates/${s.slug}`)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent cursor-pointer flex items-center gap-2 ${
                    i === selectedIndex ? "bg-accent" : ""
                  }`}
                >
                  <Search className="size-3 text-muted-foreground shrink-0" />
                  {s.title}
                </button>
              ))}
            </div>
          )}

          {/* Promoted grid */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="flex items-center justify-between py-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                ⭐ Promoted Enhancements
              </h3>
              <Link
                href="/dashboard/seller/promote"
                onClick={() => setOpen(false)}
                className="text-xs text-primary hover:underline"
              >
                Promote yours →
              </Link>
            </div>

            {loadingPromoted ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border bg-muted/50 animate-pulse h-[140px]"
                  />
                ))}
              </div>
            ) : promotedTemplates.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {promotedTemplates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    variant="compact"
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No promoted enhancements yet.{" "}
                <Link
                  href="/dashboard/seller/promote"
                  onClick={() => setOpen(false)}
                  className="text-primary hover:underline"
                >
                  Be the first!
                </Link>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
