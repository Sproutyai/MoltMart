import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <span className="text-xl">🦋</span> Molt Mart
            </Link>
            <p className="text-sm text-muted-foreground">
              The marketplace for AI agent templates. Built for OpenClaw.
            </p>
          </div>

          {/* Marketplace */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Marketplace</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/templates" className="hover:text-foreground">Browse Templates</Link>
              <Link href="/templates?category=Productivity" className="hover:text-foreground">Productivity</Link>
              <Link href="/templates?category=Coding" className="hover:text-foreground">Coding</Link>
              <Link href="/templates?category=Writing" className="hover:text-foreground">Writing</Link>
            </nav>
          </div>

          {/* Sellers */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">For Sellers</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/dashboard/seller" className="hover:text-foreground">Sell Templates</Link>
              <Link href="/dashboard/seller/upload" className="hover:text-foreground">Upload</Link>
              <Link href="/signup" className="hover:text-foreground">Get Started</Link>
            </nav>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Account</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground">Log In</Link>
              <Link href="/signup" className="hover:text-foreground">Sign Up</Link>
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Molt Mart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
