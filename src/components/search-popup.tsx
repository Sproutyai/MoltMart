"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, X, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { TemplateCard } from "@/components/template-card"
import { StarRating } from "@/components/star-rating"
import { CategoryPlaceholder } from "@/components/category-placeholder"
import { createClient } from "@/lib/supabase/client"
import type { Template } from "@/lib/types"

interface SearchResult {
  id: string
  title: string
  slug: string
  category: string
  price_cents: number
  screenshots: string[] | null
  avg_rating: number | null
  review_count: number | null
  description: string | null
}

interface SearchPopupProps {
  mobile?: boolean
  className?: string
}

export function SearchPopup({ mobile, className }: SearchPopupProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
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
      setIsSearching(false)
      setHasSearched(false)
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
      setIsSearching(false)
      setHasSearched(false)
      return
    }
    setIsSearching(true)
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("templates")
        .select("id, title, slug, category, price_cents, screenshots, avg_rating, review_count, description")
        .eq("status", "published")
        .or(`title.ilike.%${value.trim()}%,description.ilike.%${value.trim()}%`)
        .limit(6)
      setSuggestions((data as SearchResult[]) ?? [])
      setIsSearching(false)
      setHasSearched(true)
    }, 300)
  }, [])

  const navigate = useCallback(
    (path: string) => {
      setOpen(false)
      router.push(path)
    },
    [router]
  )

  // "See all results" counts as an extra item for keyboard nav
  const hasSeeAll = suggestions.length > 0 && query.trim().length >= 2
  const totalItems = suggestions.length + (hasSeeAll ? 1 : 0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, totalItems - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < suggestions.length && suggestions[selectedIndex]) {
        navigate(`/templates/${suggestions[selectedIndex].slug}`)
      } else if (selectedIndex === suggestions.length && hasSeeAll) {
        navigate(`/templates?q=${encodeURIComponent(query.trim())}`)
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

  const isActiveSearch = query.trim().length >= 2

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
                  setIsSearching(false)
                  setHasSearched(false)
                  inputRef.current?.focus()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Search results area (when actively searching) */}
          {isActiveSearch && (
            <div className="border-b">
              {/* Loading skeleton */}
              {isSearching && (
                <div className="space-y-1 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 animate-pulse">
                      <div className="w-12 h-12 rounded-md bg-muted shrink-0" />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="h-4 w-2/3 rounded bg-muted" />
                        <div className="h-3 w-1/3 rounded bg-muted" />
                      </div>
                      <div className="h-5 w-12 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              )}

              {/* Results */}
              {!isSearching && hasSearched && suggestions.length > 0 && (
                <div className="divide-y">
                  {suggestions.map((s, i) => {
                    const thumb = s.screenshots?.[0]
                    return (
                      <button
                        key={s.id}
                        onClick={() => navigate(`/templates/${s.slug}`)}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-accent cursor-pointer transition-colors ${
                          i === selectedIndex ? "bg-accent" : ""
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0 relative">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={s.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <CategoryPlaceholder category={s.category} />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium line-clamp-1">{s.title}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {s.avg_rating != null && s.review_count != null && s.review_count > 0 && (
                              <div className="flex items-center gap-1">
                                <StarRating value={s.avg_rating} size={12} />
                                <span className="text-xs text-muted-foreground">({s.review_count})</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Category + Price */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                            {s.category}
                          </Badge>
                          {s.price_cents === 0 ? (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Free
                            </Badge>
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                              ${(s.price_cents / 100).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}

                  {/* See all results */}
                  <button
                    onClick={() => navigate(`/templates?q=${encodeURIComponent(query.trim())}`)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm text-primary hover:bg-accent cursor-pointer transition-colors ${
                      selectedIndex === suggestions.length ? "bg-accent" : ""
                    }`}
                  >
                    <span>See all results for &apos;{query.trim()}&apos;</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              )}

              {/* No results */}
              {!isSearching && hasSearched && suggestions.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No enhancements found for &apos;{query.trim()}&apos;
                  </p>
                  <button
                    onClick={() => navigate("/templates")}
                    className="text-sm text-primary hover:underline mt-1"
                  >
                    Browse all enhancements
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Promoted grid (only when NOT searching) */}
          {!isActiveSearch && (
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
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
