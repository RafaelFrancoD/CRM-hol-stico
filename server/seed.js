require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  try {
    // create tables if missing
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    const testEmail = process.env.SEED_USER_EMAIL || 'test@example.com';
    const testPass = process.env.SEED_USER_PASS || 'senha123';
    const hash = await bcrypt.hash(testPass, 10);

    await pool.query(`INSERT INTO users (email, password_hash)
      VALUES ($1, $2) ON CONFLICT (email) DO NOTHING`, [testEmail, hash]);

    // Create example CRM records
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id UUID PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    const { rows } = await pool.query('SELECT id FROM patients LIMIT 1');
    if (!rows.length) {
      const id = require('crypto').randomUUID();
      await pool.query('INSERT INTO patients (id, data) VALUES ($1, $2)', [id, { name: 'João Silva', phone: '(11) 99999-9999' }]);
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

seed();
