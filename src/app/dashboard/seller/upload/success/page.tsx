import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, ExternalLink, Share2, Camera, FileText, Users, Download, Star } from "lucide-react"
import type { Template } from "@/lib/types"

export default async function UploadSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const { slug } = await searchParams
  if (!slug) redirect("/dashboard/seller")

  const supabase = await createClient()

  const { data: template } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name)")
    .eq("slug", slug)
    .single()

  if (!template) redirect("/dashboard/seller")

  const t = template as Template & {
    seller: { username: string; display_name: string | null }
  }

  const listingUrl = `https://molt-mart.vercel.app/templates/${t.slug}`
  const tweetText = encodeURIComponent(`I just published "${t.title}" on Molt Mart! 🦎\n\n${listingUrl}`)

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Success header */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Your enhancement is live! 🎉</h1>
        <p className="text-muted-foreground">
          {t.title} is now available on Molt Mart for everyone to discover.
        </p>
      </div>

      {/* Listing preview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{t.category}</Badge>
                {t.price_cents === 0 ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">Free</Badge>
                ) : (
                  <Badge variant="outline">${(t.price_cents / 100).toFixed(2)}</Badge>
                )}
              </div>
              <h2 className="text-xl font-semibold">{t.title}</h2>
              <p className="text-sm text-muted-foreground">{t.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><Download className="h-3 w-3" /> 0 downloads</span>
                <span className="flex items-center gap-1"><Star className="h-3 w-3" /> No reviews yet</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1">
          <Link href={`/templates/${t.slug}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Live Listing
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <a href={`https://twitter.com/intent/tweet?text=${tweetText}`} target="_blank" rel="noopener noreferrer">
            <Share2 className="mr-2 h-4 w-4" />
            Share on X
          </a>
        </Button>
      </div>

      <Separator />

      {/* Tips */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Tips to get more downloads</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4 space-y-2">
            <Camera className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-sm">Add screenshots</h3>
            <p className="text-xs text-muted-foreground">
              Templates with screenshots get 3x more downloads. Show your enhancement in action.
            </p>
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-sm">Write a detailed description</h3>
            <p className="text-xs text-muted-foreground">
              Explain what makes your enhancement unique. Use markdown for formatting.
            </p>
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-sm">Share with your community</h3>
            <p className="text-xs text-muted-foreground">
              Post on X, Discord, or Reddit. Early downloads boost your visibility.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/seller">← Back to Seller Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
