"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

interface MobileNavProps {
  isLoggedIn: boolean
  isSeller: boolean
}

export function MobileNav({ isLoggedIn, isSeller }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()
  const close = () => setOpen(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/templates?q=${encodeURIComponent(query.trim())}`)
      setQuery("")
      close()
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="pt-12">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <nav className="flex flex-col gap-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search enhancements..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </form>

          <Link href="/" onClick={close} className="text-lg font-medium">Home</Link>
          <Link href="/templates" onClick={close} className="text-lg font-medium">Browse Enhancements</Link>
          <Link href="/templates/new" onClick={close} className="text-lg font-medium">New Listings</Link>
          <Link href="/templates/featured" onClick={close} className="text-lg font-medium">⭐ Featured</Link>
          {isSeller ? (
            <Link href="/dashboard/seller" onClick={close} className="text-lg font-medium">Sell</Link>
          ) : isLoggedIn ? (
            <Link href="/dashboard/seller" onClick={close} className="text-lg font-medium">Become a Seller</Link>
          ) : null}
          <Link href="/affiliate" onClick={close} className="text-lg font-medium">Affiliates</Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" onClick={close} className="text-lg font-medium">Dashboard</Link>
              {isSeller && (
                <Link href="/dashboard/seller/upload" onClick={close} className="text-lg font-medium">Upload Enhancement</Link>
              )}
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-lg font-medium text-destructive">Sign Out</button>
              </form>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Button variant="outline" asChild onClick={close}>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild onClick={close}>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
