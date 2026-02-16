import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cookieStore = await cookies()
  const refCode = cookieStore.get('molt_ref')?.value
  if (!refCode) return NextResponse.json({ ok: false, reason: 'no_cookie' })

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, user_id, total_signups')
    .eq('referral_code', refCode)
    .eq('status', 'active')
    .single()

  if (!affiliate) return NextResponse.json({ ok: false, reason: 'invalid_code' })

  // Anti self-referral
  if (affiliate.user_id === user.id) return NextResponse.json({ ok: false, reason: 'self_referral' })

  // Check if already referred
  const { data: existing } = await supabase
    .from('referrals')
    .select('id')
    .eq('referred_user_id', user.id)
    .single()

  if (existing) return NextResponse.json({ ok: false, reason: 'already_referred' })

  await supabase.from('referrals').insert({
    affiliate_id: affiliate.id,
    referred_user_id: user.id,
  })

  await supabase.from('affiliates').update({
    total_signups: affiliate.total_signups + 1,
  }).eq('id', affiliate.id)

  // Clear the cookie
  const response = NextResponse.json({ ok: true })
  response.cookies.set('molt_ref', '', { maxAge: 0, path: '/' })
  return response
}
