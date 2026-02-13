import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/browse'

  if (code) {
    try {
      // Create a supabase client with cookie handling for server-side auth
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        }
      })

      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/auth?error=callback_error', requestUrl.origin))
      }

      // Determine redirect path based on user type
      let redirectPath = next
      if (data.user && data.user.user_metadata) {
        const userType = data.user.user_metadata.user_type
        if (userType === 'seller') {
          redirectPath = '/dashboard'
        } else {
          redirectPath = '/browse'
        }
      }

      // Redirect with success
      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/auth?error=callback_error', requestUrl.origin))
    }
  }

  // No code parameter, redirect to auth
  return NextResponse.redirect(new URL('/auth', requestUrl.origin))
}