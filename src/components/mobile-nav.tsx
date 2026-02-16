"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
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
  const close = () => setOpen(false)

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
          <Link href="/" onClick={close} className="text-lg font-medium">Home</Link>
          <Link href="/templates" onClick={close} className="text-lg font-medium">Browse Templates</Link>
          <Link href="/templates/new" onClick={close} className="text-lg font-medium">New Listings</Link>
          <Link href="/dashboard/seller" onClick={close} className="text-lg font-medium">Sell</Link>
          <Link href="/affiliate" onClick={close} className="text-lg font-medium">Affiliates</Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" onClick={close} className="text-lg font-medium">Dashboard</Link>
              {isSeller && (
                <Link href="/dashboard/seller/upload" onClick={close} className="text-lg font-medium">Upload Template</Link>
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
