import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY.' },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { templateId } = await req.json()
    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
    }

    // Validate ownership + published
    const { data: template } = await supabase
      .from('templates')
      .select('id, title, seller_id, status')
      .eq('id', templateId)
      .single()

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    if (template.seller_id !== user.id) {
      return NextResponse.json({ error: 'Not your template' }, { status: 403 })
    }
    if (template.status !== 'published') {
      return NextResponse.json({ error: 'Template must be published' }, { status: 400 })
    }

    // 24hr cooldown check
    const { data: existing } = await supabase
      .from('promotions')
      .select('promoted_at')
      .eq('template_id', templateId)
      .single()

    if (existing) {
      const hoursSince = (Date.now() - new Date(existing.promoted_at).getTime()) / (1000 * 60 * 60)
      if (hoursSince < 24) {
        const hoursLeft = Math.ceil(24 - hoursSince)
        return NextResponse.json(
          { error: `Re-promote available in ${hoursLeft}h` },
          { status: 429 }
        )
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: 2500,
          product_data: { name: `Promote: ${template.title}` },
        },
        quantity: 1,
      }],
      metadata: { template_id: templateId, seller_id: user.id },
      success_url: `${baseUrl}/dashboard/seller?promoted=${templateId}`,
      cancel_url: `${baseUrl}/dashboard/seller`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Promote checkout error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
