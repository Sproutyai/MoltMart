import { createClient } from '@supabase/supabase-js'
import { db } from '../../../lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET() {
  try {
    // Create supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test database connectivity
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)
    
    if (testError) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Database connection failed',
        error: testError.message,
        hint: 'Make sure the users table exists in Supabase'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    return new Response(JSON.stringify({
      success: true,
      message: 'Authentication system working',
      database: 'Connected',
      users_table: 'Available',
      current_user: user ? `${user.email} (${user.id})` : 'None',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'System error',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}