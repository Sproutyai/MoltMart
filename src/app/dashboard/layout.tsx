import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Download, Store, User, Upload, Receipt, ExternalLink, Pencil, DollarSign } from "lucide-react"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, is_seller")
    .eq("id", user.id)
    .single()

  return (
    <div className="container mx-auto flex gap-8 px-4 py-8">
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="flex flex-col gap-1">
          <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Buyer</p>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            My Downloads
          </Link>

          <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Seller</p>
          <Link
            href="/dashboard/seller"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Store className="h-4 w-4" />
            My Templates
          </Link>
          <Link
            href="/dashboard/seller/upload"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Upload className="h-4 w-4" />
            Upload Template
          </Link>
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Receipt className="h-4 w-4" />
            Transactions
          </Link>
          {profile?.username && (
            <Link
              href={`/sellers/${profile.username}`}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4" />
              Public Profile
            </Link>
          )}

          <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Affiliate</p>
          <Link
            href="/dashboard/affiliate"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <DollarSign className="h-4 w-4" />
            Affiliate Program
          </Link>

          <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Account</p>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Link>
        </nav>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
