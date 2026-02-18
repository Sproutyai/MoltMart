import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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

  return (
    <div className="container mx-auto flex flex-col md:flex-row gap-4 md:gap-8 px-4 py-4 md:py-8">
      <DashboardNav
        isSeller={isSeller}
        username={profile?.username}
      />
      <main className="flex-1 min-w-0">{children}</main>
      <SellerIntentHandler />
    </div>
  )
}
