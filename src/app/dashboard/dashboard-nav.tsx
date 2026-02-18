"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Library, Store, Upload, Receipt, ExternalLink, Pencil, DollarSign, Megaphone, UserPlus, Heart, BarChart3 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface NavLink {
  href: string
  label: string
  icon: LucideIcon
  className?: string
}

interface DashboardNavProps {
  isSeller: boolean
  username?: string | null
}

export function DashboardNav({ isSeller, username }: DashboardNavProps) {
  const pathname = usePathname()

  const buyerLinks: NavLink[] = [
    { href: "/dashboard", label: "Purchases", icon: Library },
    { href: "/dashboard/bookmarks", label: "Bookmarks", icon: Heart },
  ]

  const sellerLinks: NavLink[] = [
    { href: "/dashboard/seller", label: "Seller Dashboard", icon: Store },
    { href: "/dashboard/seller/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/seller/upload", label: "Create Product", icon: Upload },
    { href: "/dashboard/seller/promote", label: "Promote", icon: Megaphone },
    { href: "/dashboard/transactions", label: "Sales", icon: Receipt },
    ...(username ? [{ href: `/sellers/${username}`, label: "View Public Profile", icon: ExternalLink }] : []),
  ]

  const affiliateLinks: NavLink[] = [
    { href: "/dashboard/affiliate", label: "Affiliate Program", icon: DollarSign },
  ]

  const accountLinks: NavLink[] = [
    { href: "/dashboard/profile", label: isSeller ? "Edit Store" : "Edit Profile", icon: Pencil },
  ]

  const becomeSellerLink: NavLink | undefined = isSeller ? undefined : { href: "/dashboard/seller", label: "Become a Seller", icon: UserPlus }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const desktopLinkClass = (href: string, extra?: string) =>
    `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive(href) ? "bg-muted font-semibold" : "hover:bg-muted"
    } ${extra || ""}`

  const mobileLinkClass = (href: string, extra?: string) =>
    `flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
      isActive(href) ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
    } ${extra || ""}`

  return (
    <>
      {/* Mobile: horizontal scrollable tab bar */}
      <div className="md:hidden overflow-x-auto -mx-4 px-4 pb-2 border-b">
        <nav className="flex gap-1 min-w-max">
          {buyerLinks.map((l) => (
            <Link key={l.href} href={l.href} className={mobileLinkClass(l.href)}>
              <l.icon className="h-3.5 w-3.5" />{l.label}
            </Link>
          ))}
          {isSeller ? (
            sellerLinks.map((l) => (
              <Link key={l.href} href={l.href} className={mobileLinkClass(l.href)}>
                <l.icon className="h-3.5 w-3.5" />{l.label}
              </Link>
            ))
          ) : becomeSellerLink ? (
            <Link href={becomeSellerLink.href} className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20">
              <becomeSellerLink.icon className="h-3.5 w-3.5" />{becomeSellerLink.label}
            </Link>
          ) : null}
          {affiliateLinks.map((l) => (
            <Link key={l.href} href={l.href} className={mobileLinkClass(l.href)}>
              <l.icon className="h-3.5 w-3.5" />{l.label}
            </Link>
          ))}
          {accountLinks.map((l) => (
            <Link key={l.href} href={l.href} className={mobileLinkClass(l.href)}>
              <l.icon className="h-3.5 w-3.5" />{l.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="flex flex-col gap-1">
          <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Library</p>
          {buyerLinks.map((l) => (
            <Link key={l.href} href={l.href} className={desktopLinkClass(l.href)}>
              <l.icon className="h-4 w-4" />{l.label}
            </Link>
          ))}

          {isSeller ? (
            <>
              <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">My Store</p>
              {sellerLinks.map((l) => (
                <Link key={l.href} href={l.href} className={desktopLinkClass(l.href)}>
                  <l.icon className="h-4 w-4" />{l.label}
                </Link>
              ))}
            </>
          ) : (
            <>
              <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">My Store</p>
              {becomeSellerLink && (
                <Link href={becomeSellerLink.href} className={desktopLinkClass(becomeSellerLink.href, "text-primary")}>
                  <becomeSellerLink.icon className="h-4 w-4" />{becomeSellerLink.label}
                </Link>
              )}
            </>
          )}

          <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Affiliate</p>
          {affiliateLinks.map((l) => (
            <Link key={l.href} href={l.href} className={desktopLinkClass(l.href)}>
              <l.icon className="h-4 w-4" />{l.label}
            </Link>
          ))}

          <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Account</p>
          {accountLinks.map((l) => (
            <Link key={l.href} href={l.href} className={desktopLinkClass(l.href)}>
              <l.icon className="h-4 w-4" />{l.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
