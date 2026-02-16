const { readFileSync } = require('fs');
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.pixasvjwrjvuorqqrpti:pavwa4-xuCgis-mehqyp@aws-0-us-west-2.pooler.supabase.com:6543/postgres',
  });
  await client.connect();
  const sql = readFileSync('./supabase/migrations/promotions.sql', 'utf8');
  await client.query(sql);
  console.log('Migration completed successfully');
  await client.end();
}

main().catch(e => { console.error('Migration failed:', e); process.exit(1); });
