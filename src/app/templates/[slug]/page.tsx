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
import { Download, Calendar, Shield, BookOpen, Cpu } from "lucide-react"
import { SellerTrustSection } from "@/components/seller-trust-section"
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
  if (user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("buyer_id", user.id)
      .eq("template_id", t.id)
      .maybeSingle()
    hasPurchased = !!purchase
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
        {t.screenshots && t.screenshots.length > 0 && (
          <ScreenshotCarousel screenshots={t.screenshots} title={t.title} />
        )}

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{t.category}</Badge>
            {t.tags?.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          <h1 className="mt-3 text-3xl font-bold">{t.title}</h1>
          <div className="mt-1">
            <SellerLink
              username={t.seller.username}
              displayName={t.seller.display_name}
              avatarUrl={t.seller.avatar_url}
              showAvatar
            />
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

        {moreBySeller && moreBySeller.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="mb-4 text-xl font-semibold">More by {t.seller.display_name || t.seller.username}</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {(moreBySeller as (Template & { seller: { username: string; display_name: string | null } })[]).map((mt) => (
                  <TemplateCard key={mt.id} template={mt} />
                ))}
              </div>
            </div>
          </>
        )}
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
            isLoggedIn={!!user}
            hasPurchased={hasPurchased}
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

          <div>
            <h3 className="mb-2 text-sm font-semibold">Install</h3>
            <code className="block rounded bg-muted p-2 text-xs">
              openclaw template install {t.slug}
            </code>
          </div>

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
