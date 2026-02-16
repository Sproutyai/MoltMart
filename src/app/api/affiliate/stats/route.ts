import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!affiliate) return NextResponse.json({ error: 'Not an affiliate' }, { status: 404 })

  const { data: earnings } = await supabase
    .from('affiliate_earnings')
    .select('commission_cents, status')
    .eq('affiliate_id', affiliate.id)

  let pending_cents = 0, approved_cents = 0, paid_cents = 0
  for (const e of earnings || []) {
    if (e.status === 'pending') pending_cents += e.commission_cents
    else if (e.status === 'approved') approved_cents += e.commission_cents
    else if (e.status === 'paid') paid_cents += e.commission_cents
  }

  return NextResponse.json({
    total_clicks: affiliate.total_clicks,
    total_signups: affiliate.total_signups,
    total_sales: affiliate.total_sales,
    total_earnings_cents: affiliate.total_earnings_cents,
    pending_cents,
    approved_cents,
    paid_cents,
  })
}
