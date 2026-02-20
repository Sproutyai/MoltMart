"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isSeller, setIsSeller] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [website, setWebsite] = useState("") // honeypot
  const [lastAttempt, setLastAttempt] = useState(0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email || !password || !username || !displayName) {
      setError("Please fill in all fields")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError("Username can only contain letters, numbers, hyphens, and underscores")
      return
    }

    // Honeypot: bots fill hidden fields
    if (website) {
      toast.success("Account created! Check your email to confirm.")
      return
    }

    // Client-side throttle: 10s cooldown
    const now = Date.now()
    if (now - lastAttempt < 10_000) {
      setError("Please wait a moment before trying again")
      return
    }
    setLastAttempt(now)

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { username, display_name: displayName },
        },
      })
      if (authError) {
        setError(authError.message)
        return
      }

      // Store seller intent for after email confirmation (profile may not exist yet)
      if (isSeller) {
        localStorage.setItem("molt_seller_intent", "true")
      }

      // Attribute referral (cookie is httpOnly, handled server-side)
      await fetch("/api/affiliate/attribute", { method: "POST" }).catch(() => {})

      toast.success("Account created! Check your email to confirm.")
      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join Molt Mart — the marketplace for AI agent enhancements</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="cooldev42" required />
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Cool Developer" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} />
            </div>
            {/* Honeypot field — hidden from real users, bots fill it */}
            <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="seller" checked={isSeller} onCheckedChange={(c) => setIsSeller(c === true)} className="mt-1" />
              <div>
                <Label htmlFor="seller" className="cursor-pointer">Register as a Seller</Label>
                {isSeller && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sellers can create and sell AI agent templates on Molt Mart.
                  </p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">Log In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
