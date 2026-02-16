"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Twitter, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface SocialState {
  github_username: string | null
  github_verified: boolean
  github_repos_count: number | null
  github_followers_count: number | null
  twitter_username: string | null
  twitter_verified: boolean
  twitter_followers_count: number | null
  twitter_tweet_count: number | null
  social_stats_updated_at: string | null
}

export function ConnectedAccounts() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<SocialState | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  const loadState = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from("profiles")
      .select("github_username, github_verified, github_repos_count, github_followers_count, twitter_username, twitter_verified, twitter_followers_count, twitter_tweet_count, social_stats_updated_at")
      .eq("id", user.id)
      .single()
    if (data) setState(data as SocialState)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadState()
  }, [loadState])

  useEffect(() => {
    const connected = searchParams.get("connected")
    if (connected === "github" || connected === "twitter") {
      handlePostConnect(connected)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  async function handlePostConnect(provider: "github" | "twitter") {
    try {
      const res = await fetch("/api/profile/link-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`${provider === "github" ? "GitHub" : "X"} connected! Your verified badge is now live.`)
        await loadState()
      } else {
        toast.error(data.error || `Failed to link ${provider}`)
      }
    } catch {
      toast.error("Something went wrong")
    }
    window.history.replaceState({}, "", "/dashboard/profile")
  }

  async function handleConnect(provider: "github" | "twitter") {
    setConnecting(provider)
    const supabase = createClient()
    const { error } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard/profile?connected=${provider}`,
      },
    })
    if (error) {
      toast.error(error.message)
      setConnecting(null)
    }
  }

  async function handleDisconnect(provider: "github" | "twitter") {
    if (!confirm(`Disconnect your ${provider === "github" ? "GitHub" : "X"} account?`)) return
    try {
      const res = await fetch("/api/profile/unlink-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      })
      if (res.ok) {
        toast.success("Account disconnected")
        await loadState()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to disconnect")
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  async function handleRefresh() {
    const res = await fetch("/api/profile/refresh-social", { method: "POST" })
    if (res.ok) {
      toast.success("Stats refreshed")
      await loadState()
    }
  }

  if (loading) return null

  function formatCount(n: number | null): string {
    if (n == null) return "—"
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }

  return (
    <Card className="max-w-2xl mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Connected Accounts</CardTitle>
          {(state?.github_verified || state?.twitter_verified) && (
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw size={14} className="mr-1" /> Refresh Stats
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GitHub */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Github size={24} />
            <div>
              {state?.github_verified ? (
                <>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle size={16} className="text-green-500" />
                    Connected as @{state.github_username}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCount(state.github_repos_count)} repos · {formatCount(state.github_followers_count)} followers
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">GitHub</p>
                  <p className="text-xs text-muted-foreground">Connect your GitHub to build trust with buyers</p>
                </>
              )}
            </div>
          </div>
          {state?.github_verified ? (
            <Button variant="outline" size="sm" onClick={() => handleDisconnect("github")}>Disconnect</Button>
          ) : (
            <Button size="sm" onClick={() => handleConnect("github")} disabled={connecting === "github"}>
              {connecting === "github" && <Loader2 size={14} className="mr-1 animate-spin" />}
              Connect GitHub
            </Button>
          )}
        </div>

        {/* Twitter */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Twitter size={24} />
            <div>
              {state?.twitter_verified ? (
                <>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle size={16} className="text-green-500" />
                    Connected as @{state.twitter_username}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCount(state.twitter_followers_count)} followers · {formatCount(state.twitter_tweet_count)} tweets
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">X / Twitter</p>
                  <p className="text-xs text-muted-foreground">Connect your X account to build trust with buyers</p>
                </>
              )}
            </div>
          </div>
          {state?.twitter_verified ? (
            <Button variant="outline" size="sm" onClick={() => handleDisconnect("twitter")}>Disconnect</Button>
          ) : (
            <Button size="sm" onClick={() => handleConnect("twitter")} disabled={connecting === "twitter"}>
              {connecting === "twitter" && <Loader2 size={14} className="mr-1 animate-spin" />}
              Connect X
            </Button>
          )}
        </div>

        {state?.social_stats_updated_at && (
          <p className="text-xs text-muted-foreground text-right">
            Stats last updated {new Date(state.social_stats_updated_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
