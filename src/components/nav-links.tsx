"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavLinksProps {
  isSeller: boolean
  isLoggedIn: boolean
  isAffiliate: boolean
}

const links = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  { href: "/templates", label: "Enhancements", match: (p: string) => p === "/templates" },
  { href: "/templates/new", label: "New", match: (p: string) => p === "/templates/new" },
  { href: "/templates/featured", label: "Featured", match: (p: string) => p === "/templates/featured" },
]

export function NavLinks({ isSeller, isLoggedIn, isAffiliate }: NavLinksProps) {
  const pathname = usePathname()

  return (
    <>
      {links
        .filter((l) => !(l.href === "/" && pathname === "/"))
        .map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-foreground",
            l.match(pathname) ? "text-foreground font-semibold" : "text-muted-foreground"
          )}
        >
          {l.label}
        </Link>
      ))}
      {isSeller ? (
        <Link
          href="/dashboard/seller"
          className={cn(
            "text-sm font-medium transition-colors hover:text-foreground",
            pathname.startsWith("/dashboard/seller") ? "text-foreground font-semibold" : "text-muted-foreground"
          )}
        >
          Sell
        </Link>
      ) : isLoggedIn ? (
        <Link
          href="/dashboard/seller"
          className={cn(
            "text-sm font-medium transition-colors hover:text-foreground",
            pathname.startsWith("/dashboard/seller") ? "text-foreground font-semibold" : "text-muted-foreground"
          )}
        >
          Become a Seller
        </Link>
      ) : (
        <Link
          href="/sell"
          className={cn(
            "text-sm font-medium transition-colors hover:text-foreground",
            pathname === "/sell" ? "text-foreground font-semibold" : "text-muted-foreground"
          )}
        >
          Sell
        </Link>
      )}
      <Link
        href="/affiliate"
        className={cn(
          "text-sm transition-colors hover:text-foreground",
          pathname === "/affiliate"
            ? "text-foreground font-semibold"
            : isAffiliate
              ? "font-medium text-muted-foreground"
              : "font-bold text-amber-500 dark:text-amber-400"
        )}
      >
        {isAffiliate ? "Affiliates" : "Become an Affiliate"}
      </Link>
    </>
  )
}
