require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function createUser() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const email = 'mirellisilva@gmail.com';
    const password = '918273645';

    console.log('Criando hash da senha...');
    const hash = await bcrypt.hash(password, 10);
    console.log('Hash gerado:', hash);

    console.log('Inserindo usuário no banco...');
    await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
      [email, hash]
    );

    console.log('✅ Usuário criado com sucesso!');
    console.log('Email:', email);
    console.log('Senha:', password);

  } catch (err) {
    console.error('❌ Erro:', err);
  } finally {
    await pool.end();
  }
}

createUser();
