import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { DownloadButton } from "@/components/download-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: purchases } = await supabase
    .from("purchases")
    .select("*, template:templates(*)")
    .eq("buyer_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Downloads</h1>

      {!purchases || purchases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Package className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No downloads yet. Browse templates to get started!</p>
            <Link href="/templates" className="text-primary underline">Browse Templates</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {purchases.map((purchase: any) => (
            <Card key={purchase.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{purchase.template?.title}</CardTitle>
                  <Badge variant="secondary">{purchase.template?.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {purchase.template?.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-xs text-muted-foreground">
                  Downloaded {new Date(purchase.created_at).toLocaleDateString()}
                </div>
                <DownloadButton
                  templateId={purchase.template_id}
                  isLoggedIn={true}
                  hasPurchased={true}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
