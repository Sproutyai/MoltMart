import { createClient } from '@/lib/supabase/server'
import { generateReferralCode } from '@/lib/affiliate'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if already affiliate
  const { data: existing } = await supabase
    .from('affiliates')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) return NextResponse.json({ error: 'Already an affiliate' }, { status: 409 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const code = generateReferralCode(profile?.username || 'user')

  const { data: affiliate, error } = await supabase
    .from('affiliates')
    .insert({ user_id: user.id, referral_code: code })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ affiliate })
}
