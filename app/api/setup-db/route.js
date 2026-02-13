import { NextResponse } from 'next/server'
import { createServiceClient } from '../../../lib/supabase'
import fs from 'fs'
import path from 'path'

export async function POST(request) {
  try {
    const { adminKey } = await request.json()
    
    // Simple security check (in production, use proper authentication)
    if (adminKey !== 'setup-molt-mart-db-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()
    
    // Read the enhanced schema file
    const schemaPath = path.join(process.cwd(), 'database', 'enhanced_schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    const results = []
    let successCount = 0
    let errorCount = 0

    // Execute each statement
    for (const [index, statement] of statements.entries()) {
      try {
        console.log(`Executing statement ${index + 1}:`, statement.substring(0, 100) + '...')
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        })
        
        if (error) {
          console.error(`Statement ${index + 1} error:`, error)
          results.push({
            statement: index + 1,
            status: 'error',
            error: error.message,
            sql: statement.substring(0, 200) + '...'
          })
          errorCount++
        } else {
          results.push({
            statement: index + 1,
            status: 'success',
            sql: statement.substring(0, 100) + '...'
          })
          successCount++
        }
      } catch (err) {
        console.error(`Statement ${index + 1} exception:`, err)
        results.push({
          statement: index + 1,
          status: 'exception',
          error: err.message,
          sql: statement.substring(0, 200) + '...'
        })
        errorCount++
      }
    }

    // Test basic table creation if the RPC doesn't work
    if (errorCount > 0) {
      console.log('Trying alternative approach - direct table creation...')
      
      try {
        // Try creating a simple profiles table first
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
        
        if (error && error.code === 'PGRST116') {
          // Table doesn't exist, that's expected
          results.push({
            statement: 'test',
            status: 'info',
            message: 'Tables need to be created via Supabase dashboard SQL editor'
          })
        } else if (error) {
          results.push({
            statement: 'test',
            status: 'error',
            error: error.message
          })
        } else {
          results.push({
            statement: 'test',
            status: 'success',
            message: 'Database connection working, some tables may exist'
          })
        }
      } catch (testErr) {
        results.push({
          statement: 'test',
          status: 'exception',
          error: testErr.message
        })
      }
    }

    return NextResponse.json({
      success: successCount > 0,
      totalStatements: statements.length,
      successCount,
      errorCount,
      message: errorCount > 0 
        ? 'Database setup completed with some errors. Manual setup via dashboard may be required.'
        : 'Database setup completed successfully!',
      results: results.slice(0, 10), // Limit results to prevent huge response
      schemaLocation: 'database/enhanced_schema.sql',
      nextSteps: errorCount > 0 ? [
        '1. Go to Supabase dashboard SQL editor',
        '2. Copy and paste the enhanced_schema.sql file',
        '3. Execute the SQL to create tables',
        '4. Test the /api/test endpoint to verify setup'
      ] : [
        'Database setup complete! Ready for testing.'
      ]
    })

  } catch (error) {
    console.error('Database setup error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      schemaLocation: 'database/enhanced_schema.sql',
      alternativeApproach: 'Use Supabase dashboard SQL editor to run the schema manually'
    }, { status: 500 })
  }
}