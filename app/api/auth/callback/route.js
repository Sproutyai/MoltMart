import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/auth?error=callback_error', requestUrl.origin))
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/auth?error=callback_error', requestUrl.origin))
    }
  }

  // Redirect to browse page after successful authentication
  return NextResponse.redirect(new URL('/browse', requestUrl.origin))
}