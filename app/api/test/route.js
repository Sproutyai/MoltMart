import { NextResponse } from 'next/server'
import { createServiceClient } from '../../../lib/supabase'

export async function GET() {
  try {
    // Test database connection using service client
    const supabase = createServiceClient()
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title')
      .limit(1)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      productCount: products?.length || 0,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database test error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}