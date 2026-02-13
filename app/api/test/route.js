import { NextResponse } from 'next/server'
import { db } from '../../../lib/supabase'

export async function GET() {
  try {
    // Test database connection by trying to fetch products
    const products = await db.getProducts()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      productCount: products.length,
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