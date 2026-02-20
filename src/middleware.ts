import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getRateLimiter, isUpstashConfigured } from '@/lib/rate-limit'

// --- Route → Rate Limit Tier Mapping ---
// Order matters: first match wins
const ROUTE_TIER_MAP: Array<[string, "strict" | "medium" | "default" | "export"]> = [
  ['/api/account/export', 'export'],
  ['/api/account/delete', 'strict'],
  ['/api/auth', 'strict'],
  ['/api/profile', 'strict'],
  ['/api/affiliate/join', 'strict'],
  ['/api/checkout', 'medium'],
  ['/api/templates/upload', 'medium'],
  ['/api/templates/replace-file', 'medium'],
  ['/api/', 'default'],
]

function getTierForRoute(pathname: string) {
  // Never rate limit webhook routes (Stripe etc.)
  if (pathname.endsWith('/webhook')) return null

  for (const [prefix, tier] of ROUTE_TIER_MAP) {
    if (pathname.startsWith(prefix)) return tier
  }
  return null
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // --- Rate Limiting (Upstash Redis) ---
  if (pathname.startsWith('/api/') && isUpstashConfigured()) {
    const tier = getTierForRoute(pathname)
    if (tier) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
      try {
        const limiter = getRateLimiter(tier)
        const { success, limit, remaining, reset } = await limiter.limit(ip)

        if (!success) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
              status: 429,
              headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': '0',
                'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
              },
            }
          )
        }
      } catch {
        // If Upstash is down, fail open — don't block requests
        console.error('Rate limiting error, failing open')
      }
    }
  }

  // --- Supabase Auth Refresh ---
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        },
      },
    }
  )

  // --- Affiliate Referral Tracking ---
  const refCode = request.nextUrl.searchParams.get('ref')
  if (refCode && !request.cookies.get('molt_ref')) {
    response.cookies.set('molt_ref', refCode, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    })
  }

  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
