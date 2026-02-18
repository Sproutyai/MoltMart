"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { SearchPopup } from "@/components/search-popup"

interface MobileNavProps {
  isLoggedIn: boolean
  isSeller: boolean
  isAffiliate: boolean
}

export function MobileNav({ isLoggedIn, isSeller, isAffiliate }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const close = () => setOpen(false)
  const linkClass = (match: boolean) => cn("text-lg font-medium", match && "text-foreground font-semibold")

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
          {/* Mobile Search — opens search popup */}
          <SearchPopup mobile />

          {pathname !== "/" && (
            <Link href="/" onClick={close} className={linkClass(pathname === "/")}>Home</Link>
          )}
          <Link href="/templates" onClick={close} className={linkClass(pathname === "/templates")}>Browse Enhancements</Link>
          <Link href="/templates/new" onClick={close} className={linkClass(pathname === "/templates/new")}>New Listings</Link>
          <Link href="/templates/featured" onClick={close} className={linkClass(pathname === "/templates/featured")}>Featured</Link>
          {isSeller ? (
            <Link href="/dashboard/seller" onClick={close} className={linkClass(pathname.startsWith("/dashboard/seller"))}>Sell</Link>
          ) : isLoggedIn ? (
            <Link href="/dashboard/seller" onClick={close} className={linkClass(pathname.startsWith("/dashboard/seller"))}>Become a Seller</Link>
          ) : (
            <Link href="/sell" onClick={close} className={linkClass(pathname === "/sell")}>Sell</Link>
          )}
          <Link
            href="/affiliate"
            onClick={close}
            className={cn(
              pathname === "/affiliate"
                ? linkClass(true)
                : isAffiliate
                  ? "text-lg font-medium"
                  : "text-lg font-bold text-amber-500 dark:text-amber-400"
            )}
          >
            {isAffiliate ? "Affiliates" : "Become an Affiliate"}
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" onClick={close} className="text-lg font-medium">Dashboard</Link>
              {isSeller && (
                <Link href="/dashboard/seller/upload" onClick={close} className="text-lg font-medium">Create Product</Link>
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
