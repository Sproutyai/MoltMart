import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.warn("createAdminClient: missing SUPABASE_SERVICE_ROLE_KEY or URL — returning null")
    return null
  }

  return createClient(url, key)
}
