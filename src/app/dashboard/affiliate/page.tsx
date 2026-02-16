import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AffiliateStatsCards } from "@/components/affiliate/affiliate-stats"
import { ReferralLinkCard } from "@/components/affiliate/referral-link-card"
import { PayoutPlaceholder } from "@/components/affiliate/payout-placeholder"
import { EarningsTable } from "@/components/affiliate/earnings-table"
import { ReferralsTable } from "@/components/affiliate/referrals-table"
import { BecomeAffiliateCard } from "@/components/affiliate/become-affiliate-card"
import type { AffiliateStats } from "@/lib/types"

export default async function AffiliateDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!affiliate) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Affiliate Program</h1>
          <p className="text-muted-foreground">Earn by sharing Molt Mart with others.</p>
        </div>
        <BecomeAffiliateCard />
      </div>
    )
  }

  // Get earnings breakdown
  const { data: earningsData } = await supabase
    .from("affiliate_earnings")
    .select("commission_cents, status")
    .eq("affiliate_id", affiliate.id)

  let pending_cents = 0, approved_cents = 0, paid_cents = 0
  for (const e of earningsData || []) {
    if (e.status === "pending") pending_cents += e.commission_cents
    else if (e.status === "approved") approved_cents += e.commission_cents
    else if (e.status === "paid") paid_cents += e.commission_cents
  }

  const stats: AffiliateStats = {
    total_clicks: affiliate.total_clicks,
    total_signups: affiliate.total_signups,
    total_sales: affiliate.total_sales,
    total_earnings_cents: affiliate.total_earnings_cents,
    pending_cents,
    approved_cents,
    paid_cents,
  }

  // Get earnings list
  const { data: earnings } = await supabase
    .from("affiliate_earnings")
    .select("*")
    .eq("affiliate_id", affiliate.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get referrals list
  const { data: referrals } = await supabase
    .from("referrals")
    .select("*, referred_user:profiles!referred_user_id(username, display_name)")
    .eq("affiliate_id", affiliate.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Affiliate Program</h1>
        <p className="text-muted-foreground">Track your referrals and earnings.</p>
      </div>

      <AffiliateStatsCards stats={stats} />

      <div className="grid lg:grid-cols-2 gap-6">
        <ReferralLinkCard referralCode={affiliate.referral_code} />
        <PayoutPlaceholder stats={stats} />
      </div>

      <EarningsTable earnings={earnings || []} />
      <ReferralsTable referrals={referrals || []} />
    </div>
  )
}
