import { NextResponse } from 'next/server';

// Simple database status check without dependencies
export async function GET() {
  try {
    // Test connection to Supabase
    const supabaseUrl = 'https://pixasvjwrjvuorqqrpti.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeGFzdmp3cmp2dW9ycXFycHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTg1MDMsImV4cCI6MjA4NjUzNDUwM30.HZbn4SuI5LT4B3FC2o3Ev2qsJDvurNbDFdnAk2h1c8Q';

    const tables = ['users', 'products', 'orders'];
    const results = {};

    for (const table of tables) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=count&limit=1`, {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Prefer': 'count=exact'
          }
        });

        if (response.ok) {
          const countHeader = response.headers.get('content-range');
          const count = countHeader ? parseInt(countHeader.split('/')[1]) : 0;
          results[table] = {
            status: '✅ exists',
            records: count,
            healthy: true
          };
        } else {
          const errorData = await response.json();
          results[table] = {
            status: '❌ missing',
            error: errorData.message || 'Table not found',
            healthy: false
          };
        }
      } catch (error) {
        results[table] = {
          status: '❌ error',
          error: error.message,
          healthy: false
        };
      }
    }

    const allHealthy = Object.values(results).every(r => r.healthy);
    const totalRecords = Object.values(results)
      .filter(r => r.healthy)
      .reduce((sum, r) => sum + (r.records || 0), 0);

    return NextResponse.json({
      success: true,
      database_health: allHealthy ? 'healthy' : 'needs_setup',
      timestamp: new Date().toISOString(),
      tables: results,
      summary: {
        tables_created: Object.values(results).filter(r => r.healthy).length,
        tables_missing: Object.values(results).filter(r => !r.healthy).length,
        total_records: totalRecords,
        setup_required: !allHealthy
      },
      next_steps: allHealthy ? [
        'Database is healthy and operational!',
        'All tables exist with proper structure',
        'Ready for production use'
      ] : [
        'Database needs manual setup',
        'Go to Supabase Dashboard > SQL Editor',
        'Execute the SQL commands from MANUAL_DATABASE_SETUP.md',
        'Check this endpoint again after setup'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      database_health: 'connection_error',
      error: error.message,
      timestamp: new Date().toISOString(),
      next_steps: [
        'Check Supabase project status',
        'Verify environment variables',
        'Check network connectivity'
      ]
    }, { status: 500 });
  }
}