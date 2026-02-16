import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!affiliate) return NextResponse.json({ error: 'Not an affiliate' }, { status: 404 })

  const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
  const perPage = parseInt(request.nextUrl.searchParams.get('per_page') || '10')
  const from = (page - 1) * perPage

  const { data: referrals } = await supabase
    .from('referrals')
    .select('*, referred_user:profiles!referred_user_id(username, display_name)')
    .eq('affiliate_id', affiliate.id)
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1)

  return NextResponse.json({ referrals: referrals || [] })
}
