import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { templateId, type } = await req.json()

    if (!templateId || !['impression', 'click'].includes(type)) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
    }

    const field = type === 'impression' ? 'impressions' : 'clicks'
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Admin client unavailable' }, { status: 503 })
    }

    await supabase.rpc('increment_promotion_stat', {
      p_template_id: templateId,
      p_field: field,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Track error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
