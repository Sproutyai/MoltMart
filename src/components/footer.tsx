import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"

export async function Footer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <Image src="/logo/Moltmartlogo.png" alt="Molt Mart" width={24} height={24} /> Molt Mart
            </Link>
            <p className="text-sm text-muted-foreground">
              The enhancement store for AI agents. Built for OpenClaw.
            </p>
          </div>

          {/* Marketplace */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Marketplace</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/templates" className="hover:text-foreground">Browse Enhancements</Link>
              <Link href="/templates?category=Mindset" className="hover:text-foreground">Mindset</Link>
              <Link href="/templates?category=Workflows" className="hover:text-foreground">Workflows</Link>
              <Link href="/templates?category=Technical" className="hover:text-foreground">Technical</Link>
            </nav>
          </div>

          {/* Sellers */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">For Sellers</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/dashboard/seller" className="hover:text-foreground">Sell Enhancements</Link>
              <Link href="/dashboard/seller/upload" className="hover:text-foreground">Upload</Link>
              <Link href="/signup" className="hover:text-foreground">Get Started</Link>
              <Link href="/affiliate" className="hover:text-foreground">Affiliate Program</Link>
            </nav>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Account</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              {user ? (
                <>
                  <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
                  <Link href="/dashboard/profile" className="hover:text-foreground">Profile</Link>
                  <Link href="/dashboard/transactions" className="hover:text-foreground">Transactions</Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-foreground">Log In</Link>
                  <Link href="/signup" className="hover:text-foreground">Sign Up</Link>
                  <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
                </>
              )}
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t pt-6 text-center text-sm text-muted-foreground">
          <div className="flex gap-4 mb-2">
            <Link href="/faq" className="hover:text-foreground">FAQ</Link>
          </div>
          <p>&copy; 2026 Molt Mart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
