import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Library, Store, Upload, Receipt, ExternalLink, Pencil, DollarSign, Megaphone, UserPlus, Heart } from "lucide-react"
import { SellerIntentHandler } from "@/components/seller-intent-handler"
import { DashboardNav } from "./dashboard-nav"

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
    { href: "/dashboard", label: "Purchases", icon: Library },
    { href: "/dashboard/bookmarks", label: "Bookmarks", icon: Heart },
  ]

  const sellerLinks = [
    { href: "/dashboard/seller", label: "Seller Dashboard", icon: Store },
    { href: "/dashboard/seller/upload", label: "Create Product", icon: Upload },
    { href: "/dashboard/seller/promote", label: "Promote", icon: Megaphone },
    { href: "/dashboard/transactions", label: "Sales", icon: Receipt },
    ...(profile?.username ? [{ href: `/sellers/${profile.username}`, label: "View Public Profile", icon: ExternalLink }] : []),
  ]

  const affiliateLinks = [
    { href: "/dashboard/affiliate", label: "Affiliate Program", icon: DollarSign },
  ]

  const accountLinks = [
    { href: "/dashboard/profile", label: isSeller ? "Edit Store" : "Edit Profile", icon: Pencil },
  ]

  const becomeSellerLink = { href: "/dashboard/seller", label: "Become a Seller", icon: UserPlus }

  return (
    <div className="container mx-auto flex flex-col md:flex-row gap-4 md:gap-8 px-4 py-4 md:py-8">
      <DashboardNav
        buyerLinks={buyerLinks}
        sellerLinks={sellerLinks}
        affiliateLinks={affiliateLinks}
        accountLinks={accountLinks}
        isSeller={isSeller}
        becomeSellerLink={isSeller ? undefined : becomeSellerLink}
      />
      <main className="flex-1 min-w-0">{children}</main>
      <SellerIntentHandler />
    </div>
  )
}
