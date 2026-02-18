import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutButton } from "@/components/sign-out-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { NavbarSearch } from "@/components/navbar-search"
import { NavLinks } from "@/components/nav-links"

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { username: string; display_name: string | null; avatar_url: string | null; is_seller: boolean } | null = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url, is_seller")
      .eq("id", user.id)
      .single()
    profile = data
  }

  let isAffiliate = false
  if (user) {
    const { data: affData } = await supabase
      .from("affiliates")
      .select("id")
      .eq("user_id", user.id)
      .single()
    isAffiliate = !!affData
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Image src="/logo/Moltmartlogo.png" alt="Molt Mart" width={28} height={28} />
            <span>Molt Mart</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <NavLinks isSeller={!!profile?.is_seller} isLoggedIn={!!user} isAffiliate={isAffiliate} />
          </nav>
        </div>

        {/* Search */}
        <NavbarSearch />

        {/* Right: Auth */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden items-center gap-2 md:flex">
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.username} />
                      <AvatarFallback>{profile.username?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">{profile.display_name || profile.username}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  {profile.is_seller ? (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/seller/upload">Create Product</Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/seller">Become a Seller</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/affiliate">Affiliate Program</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <SignOutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
          <MobileNav isLoggedIn={!!user} isSeller={!!profile?.is_seller} isAffiliate={isAffiliate} />
        </div>
      </div>
    </header>
  )
}
