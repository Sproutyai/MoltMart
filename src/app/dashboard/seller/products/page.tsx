"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus, Search, MoreHorizontal, Pencil, Eye, Copy, Archive, ArchiveRestore,
  Trash2, Loader2, Package, Star, LayoutGrid, List, AlertTriangle, Download,
} from "lucide-react"
import { toast } from "sonner"
import { getTemplateImage } from "@/lib/category-defaults"

interface Product {
  id: string
  title: string
  slug: string
  description: string
  category: string
  price_cents: number
  status: "draft" | "published" | "archived"
  download_count: number
  avg_rating: number
  review_count: number
  screenshots: string[]
  created_at: string
  updated_at: string
}

export default function MyProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sort, setSort] = useState("newest")
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "card">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("seller-products-view") as "list" | "card") || "list"
    }
    return "list"
  })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)
      params.set("sort", sort)
      const res = await fetch(`/api/seller/products?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
      }
    } catch {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, sort])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Debounce search
  const [searchInput, setSearchInput] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  async function handleArchiveToggle(product: Product) {
    const newStatus = product.status === "archived" ? "published" : "archived"
    try {
      const res = await fetch(`/api/templates/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(newStatus === "archived" ? "Product archived" : "Product restored")
        fetchProducts()
      } else {
        toast.error("Failed to update status")
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  async function handleDuplicate(product: Product) {
    toast.info("Duplicating product...")
    try {
      // Create via the upload endpoint would be complex; for now just navigate to upload with hint
      // Simple approach: POST to a duplicate endpoint or navigate
      router.push(`/dashboard/seller/upload?duplicate=${product.id}`)
    } catch {
      toast.error("Failed to duplicate")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/templates/${deleteTarget.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Product deleted")
        setDeleteTarget(null)
        fetchProducts()
      } else {
        const data = await res.json()
        toast.error(data.error || "Delete failed")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setDeleting(false)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100">Published</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100">Draft</Badge>
      case "archived":
        return <Badge variant="outline" className="text-muted-foreground">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatPrice = (cents: number) => cents === 0 ? "Free" : `$${(cents / 100).toFixed(2)}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Button asChild>
          <Link href="/dashboard/seller/upload">
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* View toggle */}
        <div className="flex border rounded-md overflow-hidden shrink-0">
          <button
            className={`p-2 ${viewMode === "list" ? "bg-muted" : "hover:bg-muted/50"}`}
            onClick={() => { setViewMode("list"); localStorage.setItem("seller-products-view", "list") }}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            className={`p-2 ${viewMode === "card" ? "bg-muted" : "hover:bg-muted/50"}`}
            onClick={() => { setViewMode("card"); localStorage.setItem("seller-products-view", "card") }}
            title="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most_sales">Most Sales</SelectItem>
            <SelectItem value="title_az">Title A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          {search || statusFilter !== "all" ? (
            <>
              <h3 className="text-lg font-semibold mb-1">No products match your filters</h3>
              <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters.</p>
              <Button variant="outline" onClick={() => { setSearchInput(""); setStatusFilter("all") }}>
                Clear Filters
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-1">Your store is ready for products</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Upload your first enhancement and start reaching the Molt Mart community.
              </p>
              <Button asChild>
                <Link href="/dashboard/seller/upload">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Product
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                💡 Products with screenshots and detailed descriptions get 3x more downloads.
              </p>
            </>
          )}
        </Card>
      ) : viewMode === "list" ? (
        <div className="space-y-2">
          {products.map((product) => (
            <Card key={product.id} className={`overflow-hidden ${product.status === "archived" ? "opacity-70" : ""}`}>
              {product.status === "archived" && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-1.5 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs text-yellow-700 dark:text-yellow-400">This product is archived and not visible to buyers</span>
                </div>
              )}
              <div className="flex items-center gap-4 p-4">
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <img src={getTemplateImage(product.screenshots, product.category)} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Title + Category */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link href={`/dashboard/seller/edit/${product.id}`} className="font-medium hover:underline truncate block">
                      {product.title}
                    </Link>
                    {statusBadge(product.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{product.category}</span>
                    <span className="font-medium text-foreground">{formatPrice(product.price_cents)}</span>
                    <span className="flex items-center gap-0.5"><Download className="h-3 w-3" />{product.download_count}</span>
                    {product.avg_rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {product.avg_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-1 shrink-0">
                  <Link href={`/dashboard/seller/edit/${product.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      <Pencil className="h-3.5 w-3.5 mr-1" />Edit
                    </Button>
                  </Link>
                  <Link href={`/templates/${product.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="text-xs h-8">
                      <Eye className="h-3.5 w-3.5 mr-1" />View
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleArchiveToggle(product)}>
                        {product.status === "archived" ? (
                          <><ArchiveRestore className="mr-2 h-4 w-4" /> Unarchive</>
                        ) : (
                          <><Archive className="mr-2 h-4 w-4" /> Archive</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(product)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className={`overflow-hidden flex flex-col ${product.status === "archived" ? "opacity-70" : ""}`}>
              {/* Image */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                <img src={getTemplateImage(product.screenshots, product.category)} alt={product.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2">
                  {statusBadge(product.status)}
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                {product.status === "archived" && (
                  <div className="flex items-center gap-1 mb-2 text-[10px] text-yellow-700 dark:text-yellow-400">
                    <AlertTriangle className="h-3 w-3" />
                    Archived — not visible to buyers
                  </div>
                )}
                <h3 className="font-semibold text-sm line-clamp-1 mb-1">{product.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>{formatPrice(product.price_cents)}</span>
                  <span className="flex items-center gap-0.5"><Download className="h-3 w-3" />{product.download_count}</span>
                  {product.avg_rating > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {product.avg_rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="mt-auto flex gap-1">
                  <Link href={`/dashboard/seller/edit/${product.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                      <Pencil className="h-3.5 w-3.5 mr-1" />Edit
                    </Button>
                  </Link>
                  <Link href={`/templates/${product.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="text-xs h-8">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{deleteTarget?.title}&rdquo; and its files. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
