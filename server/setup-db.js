require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🔧 Iniciando setup do banco de dados...\n');

  // Primeiro, conectar ao postgres para criar o banco se não existir
  const defaultPool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
    port: 5432
  });

  try {
    // Verificar se o banco existe
    const dbName = 'mirelli_crm';
    const { rows } = await defaultPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (rows.length === 0) {
      console.log(`📦 Criando banco de dados "${dbName}"...`);
      await defaultPool.query(`CREATE DATABASE ${dbName}`);
      console.log('✅ Banco de dados criado com sucesso!\n');
    } else {
      console.log(`✅ Banco de dados "${dbName}" já existe.\n`);
    }
  } catch (err) {
    console.error('❌ Erro ao verificar/criar banco de dados:', err.message);
  } finally {
    await defaultPool.end();
  }

  // Agora conectar ao banco específico
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Rodar migrations
    console.log('📋 Executando migrations...');
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`   → ${file}`);
      await pool.query(sql);
    }
    console.log('✅ Todas as migrations foram aplicadas!\n');

    // Criar usuário principal
    const email = process.env.SEED_USER_EMAIL || 'mirellisilva@gmail.com';
    const password = process.env.SEED_USER_PASS || '918273645';

    console.log('👤 Criando usuário principal...');
    console.log(`   Email: ${email}`);

    const { rows: existingUser } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.length === 0) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
        [email, hash]
      );
      console.log('✅ Usuário criado com sucesso!\n');
    } else {
      console.log('ℹ️  Usuário já existe no banco de dados.\n');
    }

    console.log('🎉 Setup do banco de dados concluído com sucesso!');
    console.log('\n📝 Credenciais de acesso:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log('\n⚠️  IMPORTANTE: Altere essas credenciais após o primeiro login em produção!\n');

  } catch (err) {
    console.error('❌ Erro durante o setup:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
