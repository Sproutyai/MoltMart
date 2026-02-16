import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Seller intent is checked client-side after redirect (see layout/dashboard)
  return NextResponse.redirect(`${origin}/dashboard?check_seller=1`)
}
