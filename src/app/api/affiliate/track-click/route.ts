import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const rateLimit = new Map<string, { count: number; reset: number }>()

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  const entry = rateLimit.get(ip)
  if (entry && entry.reset > now && entry.count >= 10) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
  }
  if (!entry || entry.reset <= now) {
    rateLimit.set(ip, { count: 1, reset: now + 60000 })
  } else {
    entry.count++
  }

  const { code } = await request.json()
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const supabase = await createClient()
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, total_clicks')
    .eq('referral_code', code)
    .eq('status', 'active')
    .single()

  if (!affiliate) return NextResponse.json({ error: 'Invalid code' }, { status: 404 })

  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(ip))
  const ipHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

  await supabase.from('referral_clicks').insert({
    affiliate_id: affiliate.id,
    ip_hash: ipHash,
    user_agent: request.headers.get('user-agent') || null,
  })

  await supabase.from('affiliates').update({ total_clicks: affiliate.total_clicks + 1 }).eq('id', affiliate.id)

  return NextResponse.json({ ok: true })
}
