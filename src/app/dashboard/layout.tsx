import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Download, Store, Upload, Receipt, ExternalLink, Pencil, DollarSign, Megaphone, UserPlus } from "lucide-react"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, is_seller")
    .eq("id", user.id)
    .single()

  const isSeller = !!profile?.is_seller

  const buyerLinks = [
    { href: "/dashboard", label: "My Downloads", icon: Download },
  ]

  const sellerLinks = [
    { href: "/dashboard/seller", label: "Seller Dashboard", icon: Store },
    { href: "/dashboard/seller/upload", label: "Upload Enhancement", icon: Upload },
    { href: "/dashboard/seller/promote", label: "Promote", icon: Megaphone },
    { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
    ...(profile?.username ? [{ href: `/sellers/${profile.username}`, label: "Public Profile", icon: ExternalLink }] : []),
  ]

  const affiliateLinks = [
    { href: "/dashboard/affiliate", label: "Affiliate Program", icon: DollarSign },
  ]

  const accountLinks = [
    { href: "/dashboard/profile", label: "Edit Profile", icon: Pencil },
  ]

  return (
    <div className="container mx-auto flex flex-col md:flex-row gap-4 md:gap-8 px-4 py-4 md:py-8">
      {/* Mobile: horizontal scrollable tab bar */}
      <div className="md:hidden overflow-x-auto -mx-4 px-4 pb-2 border-b">
        <nav className="flex gap-1 min-w-max">
          {buyerLinks.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80">
              <l.icon className="h-3.5 w-3.5" />{l.label}
            </Link>
          ))}
          {isSeller ? (
            sellerLinks.map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80">
                <l.icon className="h-3.5 w-3.5" />{l.label}
              </Link>
            ))
          ) : (
            <Link href="/dashboard/seller" className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20">
              <UserPlus className="h-3.5 w-3.5" />Become a Seller
            </Link>
          )}
          {affiliateLinks.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80">
              <l.icon className="h-3.5 w-3.5" />{l.label}
            </Link>
          ))}
          {accountLinks.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80">
              <l.icon className="h-3.5 w-3.5" />{l.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="flex flex-col gap-1">
          <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Buyer</p>
          {buyerLinks.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
              <l.icon className="h-4 w-4" />{l.label}
            </Link>
          ))}

          {isSeller ? (
            <>
              <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Seller</p>
              {sellerLinks.map((l) => (
                <Link key={l.href} href={l.href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                  <l.icon className="h-4 w-4" />{l.label}
                </Link>
              ))}
            </>
          ) : (
            <>
              <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Seller</p>
              <Link href="/dashboard/seller" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-muted">
                <UserPlus className="h-4 w-4" />Become a Seller
              </Link>
            </>
          )}

          <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Affiliate</p>
          {affiliateLinks.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
              <l.icon className="h-4 w-4" />{l.label}
            </Link>
          ))}

          <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Account</p>
          {accountLinks.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
              <l.icon className="h-4 w-4" />{l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
