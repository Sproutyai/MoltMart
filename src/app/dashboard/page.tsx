import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { DownloadButton } from "@/components/download-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Star, ShoppingBag, AlertTriangle } from "lucide-react"

export default async function DashboardPage() {
  let purchases: unknown[] | null = null
  let reviewMap = new Map<string, number>()

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: p } = await supabase
      .from("purchases")
      .select("*, template:templates(*)")
      .eq("buyer_id", user!.id)
      .order("created_at", { ascending: false })
    purchases = p

    const { data: reviews } = await supabase
      .from("reviews")
      .select("template_id, rating")
      .eq("buyer_id", user!.id)

    reviewMap = new Map(reviews?.map((r) => [r.template_id, r.rating]) || [])
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-lg font-medium">Failed to load your downloads</p>
        <p className="text-sm text-muted-foreground">Please refresh the page to try again.</p>
        <Link href="/dashboard">
          <Button>Refresh</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Downloads</h1>
        <Link href="/templates">
          <Button variant="outline"><ShoppingBag className="mr-2 h-4 w-4" />Browse Enhancements</Button>
        </Link>
      </div>

      {!purchases || purchases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Package className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">You haven&apos;t downloaded any enhancements yet</p>
            <p className="text-sm text-muted-foreground">Browse the marketplace to find agent enhancements!</p>
            <Link href="/templates">
              <Button><ShoppingBag className="mr-2 h-4 w-4" />Browse Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {purchases.map((purchase: any) => {
            const userRating = reviewMap.get(purchase.template_id)
            return (
              <Card key={purchase.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">
                      <Link href={`/templates/${purchase.template?.slug}`} className="hover:underline">
                        {purchase.template?.title}
                      </Link>
                    </CardTitle>
                    <Badge variant="secondary">{purchase.template?.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {purchase.template?.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    Downloaded {new Date(purchase.created_at).toLocaleDateString()}
                  </div>

                  {userRating !== undefined ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>Your rating: {userRating}/5</span>
                    </div>
                  ) : (
                    <Link href={`/templates/${purchase.template?.slug}#reviews`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Star className="mr-2 h-3 w-3" />Leave a Review
                      </Button>
                    </Link>
                  )}

                  <DownloadButton
                    templateId={purchase.template_id}
                    isLoggedIn={true}
                    hasPurchased={true}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
