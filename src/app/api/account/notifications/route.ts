import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

// NOTE: Requires Supabase migration:
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_prefs jsonb DEFAULT '{}'::jsonb;

const DEFAULT_PREFS = {
  emailPurchase: true,
  emailSale: true,
  emailReview: true,
  emailMarketing: false,
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data } = await supabase
    .from("profiles")
    .select("notification_prefs")
    .eq("id", user.id)
    .single()

  return NextResponse.json(data?.notification_prefs && Object.keys(data.notification_prefs).length > 0
    ? data.notification_prefs
    : DEFAULT_PREFS)
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const prefs = await request.json()

  const { error } = await supabase
    .from("profiles")
    .update({ notification_prefs: prefs })
    .eq("id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(prefs)
}
