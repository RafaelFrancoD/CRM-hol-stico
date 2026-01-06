require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Missing DATABASE_URL in environment');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log('Running', file);
      await pool.query(sql);
    }
    console.log('Migrations applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();

