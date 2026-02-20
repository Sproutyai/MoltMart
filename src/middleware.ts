import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// --- Rate Limiting (in-memory, single-instance only) ---
// NOTE: For production, use Redis/Upstash instead of in-memory Map
const RATE_LIMIT = 30 // requests per window
const RATE_WINDOW_MS = 60_000 // 1 minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMITED_ROUTES = [
  '/api/auth',
  '/api/profile',
  '/api/templates/upload',
  '/api/affiliate/join',
  '/api/account/delete',
  '/api/checkout',
]

// Cleanup stale entries every 60s
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of rateLimitMap) {
    if (val.resetAt < now) rateLimitMap.delete(key)
  }
}, 60_000)

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  entry.count++
  return entry.count <= RATE_LIMIT
}

export async function middleware(request: NextRequest) {
  // Rate limiting for sensitive API routes
  const pathname = request.nextUrl.pathname
  if (RATE_LIMITED_ROUTES.some((route) => pathname.startsWith(route))) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
  }

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
  // Affiliate referral tracking
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
