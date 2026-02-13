import { NextResponse } from 'next/server';

// Simple API endpoint that doesn't depend on any external libraries
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Simple API endpoint working!",
    timestamp: new Date().toISOString(),
    routes_available: [
      "GET /api/simple-test",
      "GET /api/categories-static", 
      "GET /api/products-mock",
      "GET /api/health"
    ],
    issue: "New /api/v1/* routes failing due to Supabase library conflicts",
    fix_needed: "Database table name mismatch in lib/supabase.js"
  });
}