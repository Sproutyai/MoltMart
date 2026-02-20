import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/star-rating"
import { TemplatePreview } from "@/components/template-preview"
import { ReviewList } from "@/components/review-list"
import { DownloadButton } from "@/components/download-button"
import { ReviewFormWrapper } from "@/components/review-form-wrapper"
import { SellerLink } from "@/components/seller-link"
import { TemplateCard } from "@/components/template-card"
import { ScreenshotCarousel } from "@/components/screenshot-carousel"
import { MarkdownContent } from "@/components/markdown-content"
import { VideoEmbed } from "@/components/video-embed"
import { getCategoryDefaultImage } from "@/lib/category-defaults"
import { SimilarTemplates } from "@/components/similar-templates"
import { PromotedInCategory } from "@/components/promoted-in-category"
import { BookmarkButton } from "@/components/bookmark-button"
import { Download, Calendar, Shield, BookOpen, Cpu, History, Clock } from "lucide-react"
import { SellerTrustSection } from "@/components/seller-trust-section"
import { Breadcrumb } from "@/components/breadcrumb"
import { ReportButton } from "@/components/report-button"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import type { Template, Review } from "@/lib/types"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: template } = await supabase
    .from("templates")
    .select("title, description, price_cents, screenshots")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!template) return { title: "Template Not Found | Molt Mart" }

  const priceLabel = template.price_cents === 0 ? "Free" : `$${(template.price_cents / 100).toFixed(2)}`
  const desc = `${priceLabel} — ${template.description}`.slice(0, 160)
  const imageUrl = template.screenshots?.[0] || undefined

  return {
    title: `${template.title} | Molt Mart`,
    description: desc,
    openGraph: {
      title: `${template.title} | Molt Mart`,
      description: desc,
      images: imageUrl ? [imageUrl] : [],
      type: "website",
      siteName: "Molt Mart",
    },
    twitter: {
      card: "summary_large_image",
      title: `${template.title} | Molt Mart`,
      description: desc,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: template } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, github_username, github_avatar_url, github_repos_count, github_followers_count, github_created_at, twitter_verified, twitter_username, twitter_followers_count, twitter_tweet_count)")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!template) notFound()

  const t = template as Template & {
    seller: { username: string; display_name: string | null; avatar_url: string | null; is_verified?: boolean; github_verified?: boolean; github_username?: string; github_avatar_url?: string; github_repos_count?: number; github_followers_count?: number; github_created_at?: string; twitter_verified?: boolean; twitter_username?: string; twitter_followers_count?: number; twitter_tweet_count?: number }
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, buyer:profiles!buyer_id(username, avatar_url)")
    .eq("template_id", t.id)
    .order("created_at", { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  const { data: moreBySeller } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, twitter_verified)")
    .eq("seller_id", t.seller_id)
    .eq("status", "published")
    .neq("id", t.id)
    .order("download_count", { ascending: false })
    .limit(3)

  let hasPurchased = false
  let isBookmarked = false
  if (user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("buyer_id", user.id)
      .eq("template_id", t.id)
      .maybeSingle()
    hasPurchased = !!purchase

    const { data: bookmark } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("template_id", t.id)
      .maybeSingle()
    isBookmarked = !!bookmark
  }

  const difficultyConfig: Record<string, { emoji: string; color: string }> = {
    beginner: { emoji: "🟢", color: "text-green-600" },
    intermediate: { emoji: "🟡", color: "text-yellow-600" },
    advanced: { emoji: "🔴", color: "text-red-600" },
  }
  const diff = difficultyConfig[t.difficulty] || difficultyConfig.beginner

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Breadcrumb items={[
          { label: "Home", href: "/" },
          { label: "Templates", href: "/templates" },
          { label: t.category, href: `/templates?category=${encodeURIComponent(t.category)}` },
          { label: t.title },
        ]} />

        {t.screenshots && t.screenshots.length > 0 ? (
          <ScreenshotCarousel screenshots={t.screenshots} title={t.title} />
        ) : (
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted relative">
            <img src={getCategoryDefaultImage(t.category)} alt={t.category} className="w-full h-full object-cover" />
          </div>
        )}

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{t.category}</Badge>
            {t.tags?.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <BookmarkButton templateId={t.id} initialBookmarked={isBookmarked} size={24} />
          </div>
          <div className="mt-1 flex items-center gap-3">
            <SellerLink
              username={t.seller.username}
              displayName={t.seller.display_name}
              avatarUrl={t.seller.avatar_url}
              showAvatar
            />
            <ReportButton templateId={t.id} isLoggedIn={!!user} />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <StarRating value={t.avg_rating} />
            <span className="text-sm text-muted-foreground">
              {t.avg_rating.toFixed(1)} ({t.review_count} reviews)
            </span>
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="mb-3 text-xl font-semibold">Description</h2>
          <MarkdownContent content={t.long_description || t.description} />
        </div>

        {t.requirements && (
          <>
            <Separator />
            <div>
              <h2 className="mb-3 text-xl font-semibold flex items-center gap-2">
                <BookOpen size={20} /> Requirements
              </h2>
              <MarkdownContent content={t.requirements} />
            </div>
          </>
        )}

        {t.setup_instructions && (
          <>
            <Separator />
            <div>
              <h2 className="mb-3 text-xl font-semibold">Setup Instructions</h2>
              <MarkdownContent content={t.setup_instructions} />
            </div>
          </>
        )}

        {t.demo_video_url && (
          <>
            <Separator />
            <div>
              <h2 className="mb-3 text-xl font-semibold">Demo</h2>
              <VideoEmbed url={t.demo_video_url} />
            </div>
          </>
        )}

        <Separator />

        <div>
          <h2 className="mb-4 text-xl font-semibold">Preview</h2>
          <TemplatePreview previewData={t.preview_data} />
        </div>

        <Separator />

        {/* Version History */}
        <div>
          <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
            <History size={20} /> Version History
          </h2>
          <div className="rounded-lg border">
            <div className="flex items-start gap-3 p-4">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-500 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">v{t.version || "1.0.0"}</span>
                  <Badge variant="secondary">Latest</Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Clock size={12} />
                  <span>
                    {new Date(t.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                {t.created_at !== t.updated_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Originally published {new Date(t.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="mb-4 text-xl font-semibold">Reviews</h2>
          <ReviewList reviews={(reviews as (Review & { buyer: { username: string; avatar_url: string | null } })[]) ?? []} currentSellerId={user?.id === t.seller_id ? user.id : undefined} />
          {user && hasPurchased && (
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-semibold">Leave a Review</h3>
              <ReviewFormWrapper templateId={t.id} />
            </div>
          )}
        </div>

        {moreBySeller && moreBySeller.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="mb-4 text-xl font-semibold">More by {t.seller.display_name || t.seller.username}</h2>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {(moreBySeller as (Template & { seller: { username: string; display_name: string | null } })[]).map((mt) => (
                  <TemplateCard key={mt.id} template={mt} />
                ))}
              </div>
            </div>
          </>
        )}
        <Separator />
        <SimilarTemplates category={t.category} currentTemplateId={t.id} />
      </div>

      <div>
        <div className="sticky top-20 space-y-4 rounded-lg border p-6">
          <div className="text-center">
            {t.price_cents === 0 ? (
              <span className="text-3xl font-bold text-green-600">Free</span>
            ) : (
              <span className="text-3xl font-bold">${(t.price_cents / 100).toFixed(2)}</span>
            )}
          </div>

          <DownloadButton
            templateId={t.id}
            templateSlug={t.slug}
            templateName={t.title}
            isLoggedIn={!!user}
            hasPurchased={hasPurchased}
            priceCents={t.price_cents}
          />

          <Separator />

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Difficulty</span>
              <span className={`flex items-center gap-1 font-medium capitalize ${diff.color}`}>
                {diff.emoji} {t.difficulty}
              </span>
            </div>
            {t.ai_models && t.ai_models.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><Cpu size={14} /> Models</span>
                <span className="text-right">{t.ai_models.join(", ")}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Version</span>
              <span>{t.version || "1.0.0"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><Shield size={14} /> License</span>
              <span>{t.license || "MIT"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Downloads</span>
              <span className="flex items-center gap-1">
                <Download size={14} /> {t.download_count}
              </span>
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

          {/* Verified / File Updated Indicators */}
          {reviews && reviews.length > 0 && (() => {
            const latestReviewDate = new Date(Math.max(...reviews.map((r: any) => new Date(r.created_at).getTime())))
            const fileUpdated = (t as any).file_updated_at ? new Date((t as any).file_updated_at) : null
            const fileChangedSinceReviews = fileUpdated && fileUpdated > latestReviewDate

            return fileChangedSinceReviews ? (
              <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm">
                <AlertTriangle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-yellow-600">File updated since reviews</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    The template file was updated after the most recent review. Existing reviews may not reflect the current version.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm">
                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                <span className="font-medium text-green-600">Verified — unchanged since reviews</span>
              </div>
            )
          })()}

          <div>
            <h3 className="mb-2 text-sm font-semibold">Install</h3>
            <code className="block rounded bg-muted p-2 text-xs">
              openclaw template install {t.slug}
            </code>
          </div>

          <PromotedInCategory category={t.category} currentTemplateId={t.id} />

          {(t.seller.github_verified || t.seller.twitter_verified) && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 text-sm font-semibold">About the Seller</h3>
                <SellerTrustSection
                  github_verified={t.seller.github_verified}
                  github_username={t.seller.github_username}
                  github_avatar_url={t.seller.github_avatar_url}
                  github_repos_count={t.seller.github_repos_count}
                  github_followers_count={t.seller.github_followers_count}
                  github_created_at={t.seller.github_created_at}
                  twitter_verified={t.seller.twitter_verified}
                  twitter_username={t.seller.twitter_username}
                  twitter_followers_count={t.seller.twitter_followers_count}
                  twitter_tweet_count={t.seller.twitter_tweet_count}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
