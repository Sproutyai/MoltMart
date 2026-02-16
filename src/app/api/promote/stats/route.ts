import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all promotions ordered by recency (for position calc)
    const { data: allPromos } = await supabase
      .from('promotions')
      .select('template_id, promoted_at')
      .order('promoted_at', { ascending: false })

    // Get seller's promotions with template info
    const { data: sellerPromos } = await supabase
      .from('promotions')
      .select('template_id, promoted_at, impressions, clicks')
      .eq('seller_id', user.id)

    if (!sellerPromos) {
      return NextResponse.json({ promotions: [] })
    }

    const posMap = new Map<string, number>()
    allPromos?.forEach((p, i) => posMap.set(p.template_id, i + 1))

    const promotions = sellerPromos.map(p => ({
      template_id: p.template_id,
      promoted_at: p.promoted_at,
      position: posMap.get(p.template_id) ?? 0,
      impressions: p.impressions,
      clicks: p.clicks,
    }))

    return NextResponse.json({ promotions })
  } catch (error) {
    console.error('Promote stats error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
