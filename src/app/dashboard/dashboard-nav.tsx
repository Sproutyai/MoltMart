"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Library, Store, Upload, Receipt, Pencil, DollarSign, Megaphone,
  UserPlus, Heart, BarChart3, Package, ChevronLeft, ChevronRight,
  ShoppingBag, Settings, User, StoreIcon
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface NavLink {
  href: string
  label: string
  icon: LucideIcon
  className?: string
  external?: boolean
}

interface DashboardNavProps {
  isSeller: boolean
  username?: string | null
}

const COLLAPSE_KEY = "molt-mart-sidebar-collapsed"

export function DashboardNav({ isSeller, username }: DashboardNavProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(COLLAPSE_KEY)
    if (stored === "true") setCollapsed(true)
  }, [])

  function toggleCollapsed() {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_KEY, String(!prev))
      return !prev
    })
  }

  const storeLinks: NavLink[] = [
    { href: "/dashboard/seller", label: "Seller Dashboard", icon: Store },
    { href: "/dashboard/seller/products", label: "My Products", icon: Package },
    { href: "/dashboard/seller/upload", label: "Create Product", icon: Upload },
    { href: "/dashboard/profile", label: "Edit Store", icon: StoreIcon },
    { href: "/dashboard/transactions", label: "Sales", icon: Receipt },
    { href: "/dashboard/seller/promote", label: "Promote", icon: Megaphone },
    { href: "/dashboard/seller/analytics", label: "Analytics", icon: BarChart3 },
  ]

  const accountLinks: NavLink[] = [
    { href: "/dashboard/account/profile", label: "Edit Profile", icon: User },
    { href: "/dashboard", label: "Purchases", icon: ShoppingBag },
    { href: "/dashboard/bookmarks", label: "Bookmarks", icon: Heart },
    { href: "/dashboard/account/settings", label: "Account Settings", icon: Settings },
  ]

  const affiliateLinks: NavLink[] = [
    { href: "/dashboard/affiliate", label: "Affiliate Program", icon: DollarSign },
  ]

  const becomeSellerLink: NavLink | undefined = isSeller
    ? undefined
    : { href: "/dashboard/seller", label: "Become a Seller", icon: UserPlus }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    if (href === "/dashboard/seller") return pathname === "/dashboard/seller"
    return pathname.startsWith(href)
  }

  const desktopLinkClass = (href: string, extra?: string) =>
    `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive(href) ? "bg-muted font-semibold" : "hover:bg-muted"
    } ${extra || ""}`

  const desktopLinkClassCollapsed = (href: string, extra?: string) =>
    `flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors ${
      isActive(href) ? "bg-muted font-semibold" : "hover:bg-muted"
    } ${extra || ""}`

  const mobileLinkClass = (href: string, extra?: string) =>
    `flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
      isActive(href) ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
    } ${extra || ""}`

  const allMobileLinks = [
    ...accountLinks,
    ...(isSeller ? storeLinks : []),
    ...affiliateLinks,
  ]

  const sidebarWidth = collapsed ? "w-16" : "w-56"

  return (
    <>
      {/* Mobile: horizontal scrollable tab bar */}
      <div className="md:hidden overflow-x-auto -mx-4 px-4 pb-2 border-b">
        <nav className="flex gap-1 min-w-max">
          {allMobileLinks.map((l) => (
            <Link key={l.href} href={l.href} className={mobileLinkClass(l.href)}>
              <l.icon className="h-3.5 w-3.5" />{l.label}
            </Link>
          ))}
          {!isSeller && becomeSellerLink && (
            <Link href={becomeSellerLink.href} className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20">
              <becomeSellerLink.icon className="h-3.5 w-3.5" />{becomeSellerLink.label}
            </Link>
          )}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <aside className={`hidden shrink-0 md:block transition-all duration-200 ease-in-out ${sidebarWidth}`}>
        <nav className="flex flex-col gap-1">
          {/* Collapse toggle */}
          <button
            onClick={toggleCollapsed}
            className="flex items-center justify-center rounded-md p-2 mb-2 text-muted-foreground hover:bg-muted transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {mounted && collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Account section */}
          {!collapsed && <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Account</p>}
          {accountLinks.map((l) => (
            <Link key={l.href} href={l.href} className={collapsed ? desktopLinkClassCollapsed(l.href) : desktopLinkClass(l.href)} title={collapsed ? l.label : undefined}>
              <l.icon className="h-4 w-4 shrink-0" />{!collapsed && <span>{l.label}</span>}
            </Link>
          ))}

          {/* My Store section */}
          {isSeller ? (
            <>
              {!collapsed && <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">My Store</p>}
              {collapsed && <div className="mt-4" />}
              {storeLinks.map((l) => (
                <Link key={l.href} href={l.href} className={collapsed ? desktopLinkClassCollapsed(l.href) : desktopLinkClass(l.href)} title={collapsed ? l.label : undefined}>
                  <l.icon className="h-4 w-4 shrink-0" />{!collapsed && <span>{l.label}</span>}
                </Link>
              ))}
            </>
          ) : (
            <>
              {!collapsed && <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">My Store</p>}
              {collapsed && <div className="mt-4" />}
              {becomeSellerLink && (
                <Link href={becomeSellerLink.href} className={collapsed ? desktopLinkClassCollapsed(becomeSellerLink.href, "text-primary") : desktopLinkClass(becomeSellerLink.href, "text-primary")} title={collapsed ? becomeSellerLink.label : undefined}>
                  <becomeSellerLink.icon className="h-4 w-4 shrink-0" />{!collapsed && <span>{becomeSellerLink.label}</span>}
                </Link>
              )}
            </>
          )}

          {/* Affiliate section */}
          {!collapsed && <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Affiliate</p>}
          {collapsed && <div className="mt-4" />}
          {affiliateLinks.map((l) => (
            <Link key={l.href} href={l.href} className={collapsed ? desktopLinkClassCollapsed(l.href) : desktopLinkClass(l.href)} title={collapsed ? l.label : undefined}>
              <l.icon className="h-4 w-4 shrink-0" />{!collapsed && <span>{l.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
