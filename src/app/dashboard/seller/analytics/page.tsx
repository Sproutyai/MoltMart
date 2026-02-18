"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, BarChart3, Download, DollarSign, Eye, Star, TrendingUp, Package, ArrowLeft, AlertTriangle, RefreshCw, MessageSquare } from "lucide-react"

interface ProductStat {
  id: string
  title: string
  slug: string
  category: string
  status: string
  downloads: number
  avgRating: number
  reviewCount: number
  priceCents: number
  revenueCents: number
  createdAt: string
  updatedAt: string
}

interface AnalyticsData {
  overview: {
    totalDownloads: number
    totalRevenueCents: number
    totalReviews: number
    totalProducts: number
    publishedProducts: number
    totalViews: number | null
    viewsThisMonth: number | null
    conversionRate: number | null
  }
  products: ProductStat[]
  period: string
}

export default function SellerAnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("all")

  async function fetchAnalytics(p: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/seller/analytics?period=${p}`)
      if (!res.ok) {
        if (res.status === 401) { router.push("/login"); return }
        throw new Error("Failed to load analytics")
      }
      const json = await res.json()
      setData(json)
    } catch {
      setError("Failed to load analytics. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAnalytics(period) }, [period])

  function handlePeriodChange(value: string) {
    setPeriod(value)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-lg font-medium">{error}</p>
        <Button onClick={() => fetchAnalytics(period)}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/seller">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" /> Analytics
          </h1>
        </div>
        <Tabs value={period} onValueChange={handlePeriodChange}>
          <TabsList>
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
            <TabsTrigger value="90d">90 days</TabsTrigger>
            <TabsTrigger value="all">All time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : data ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Eye className="h-4 w-4" />
                  <span className="text-xs font-medium">Total Views</span>
                </div>
                {data.overview.totalViews !== null ? (
                  <div className="text-2xl font-bold">{data.overview.totalViews.toLocaleString()}</div>
                ) : (
                  <div className="text-2xl font-bold text-muted-foreground">—</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {data.overview.totalViews === null ? "Coming soon" : ""}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Download className="h-4 w-4" />
                  <span className="text-xs font-medium">Downloads</span>
                </div>
                <div className="text-2xl font-bold">{data.overview.totalDownloads.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.overview.publishedProducts} published product{data.overview.publishedProducts !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium">Conversion Rate</span>
                </div>
                {data.overview.conversionRate !== null ? (
                  <div className="text-2xl font-bold">{data.overview.conversionRate.toFixed(1)}%</div>
                ) : (
                  <div className="text-2xl font-bold text-muted-foreground">—</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {data.overview.conversionRate === null ? "Needs view tracking" : "Views → Downloads"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs font-medium">Revenue</span>
                </div>
                <div className="text-2xl font-bold">
                  ${(data.overview.totalRevenueCents / 100).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {period === "all" ? "All time" : `Last ${period}`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Per-Product Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Product Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No products yet. <Link href="/dashboard/seller/upload" className="text-primary hover:underline">Upload your first enhancement</Link></p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Downloads</TableHead>
                        <TableHead className="text-right">Rating</TableHead>
                        <TableHead className="text-right">Reviews</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.products.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <Link href={`/templates/${p.slug}`} className="font-medium hover:underline">
                              {p.title}
                            </Link>
                            <div className="text-xs text-muted-foreground">{p.category}</div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{p.downloads.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <span className="flex items-center justify-end gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {p.avgRating.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="flex items-center justify-end gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {p.reviewCount}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {p.priceCents === 0 ? (
                              <span className="text-green-600">Free</span>
                            ) : (
                              `$${(p.priceCents / 100).toFixed(2)}`
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${(p.revenueCents / 100).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={p.status === "published" ? "default" : p.status === "draft" ? "secondary" : "outline"}>
                              {p.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info note about view tracking */}
          <Card className="mt-4">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">View tracking coming soon</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We&apos;re building detailed view tracking and conversion analytics. For now, you can track downloads, ratings, and revenue across your products.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
