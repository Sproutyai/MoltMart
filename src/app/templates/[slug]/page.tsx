import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/star-rating"
import { TemplatePreview } from "@/components/template-preview"
import { ReviewList } from "@/components/review-list"
import { DownloadButton } from "@/components/download-button"
import { ReviewFormWrapper } from "@/components/review-form-wrapper"
import { Download, Calendar } from "lucide-react"
import type { Template, Review } from "@/lib/types"

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: template } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url)")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!template) notFound()

  const t = template as Template & {
    seller: { username: string; display_name: string | null; avatar_url: string | null }
  }

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, buyer:profiles!buyer_id(username, avatar_url)")
    .eq("template_id", t.id)
    .order("created_at", { ascending: false })

  // Check auth & purchase status
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let hasPurchased = false
  if (user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("buyer_id", user.id)
      .eq("template_id", t.id)
      .maybeSingle()
    hasPurchased = !!purchase
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Left column */}
      <div className="space-y-6 lg:col-span-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{t.category}</Badge>
            {t.tags?.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="mt-3 text-3xl font-bold">{t.title}</h1>
          <p className="mt-1 text-muted-foreground">
            by {t.seller.display_name || t.seller.username}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <StarRating value={t.avg_rating} />
            <span className="text-sm text-muted-foreground">
              {t.avg_rating.toFixed(1)} ({t.review_count} reviews)
            </span>
          </div>
        </div>

        <Separator />

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p>{t.long_description || t.description}</p>
        </div>

        <Separator />

        <div>
          <h2 className="mb-4 text-xl font-semibold">Preview</h2>
          <TemplatePreview previewData={t.preview_data} />
        </div>

        <Separator />

        <div>
          <h2 className="mb-4 text-xl font-semibold">Reviews</h2>
          <ReviewList reviews={(reviews as (Review & { buyer: { username: string; avatar_url: string | null } })[]) ?? []} />
          {user && hasPurchased && (
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-semibold">Leave a Review</h3>
              <ReviewFormWrapper templateId={t.id} />
            </div>
          )}
        </div>
      </div>

      {/* Right column */}
      <div>
        <div className="sticky top-20 space-y-4 rounded-lg border p-6">
          <div className="text-center">
            <span className="text-3xl font-bold text-green-600">Free</span>
          </div>

          <DownloadButton
            templateId={t.id}
            isLoggedIn={!!user}
            hasPurchased={hasPurchased}
          />

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Downloads</span>
              <span className="flex items-center gap-1">
                <Download size={14} /> {t.download_count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Compatibility</span>
              <span>OpenClaw {t.compatibility}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(t.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-semibold">Install</h3>
            <code className="block rounded bg-muted p-2 text-xs">
              openclaw template install {t.slug}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
