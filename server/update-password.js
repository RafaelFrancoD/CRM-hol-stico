require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const email = 'mirellisilva@gmail.com';
    const password = '918273645';

    console.log('Criando hash da senha...');
    const hash = await bcrypt.hash(password, 12);
    console.log('Hash gerado:', hash);

    console.log('Atualizando senha do usuário...');
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
      [hash, email]
    );

    if (result.rows.length > 0) {
      console.log('✅ Senha atualizada com sucesso!');
      console.log('Email:', email);
      console.log('Senha:', password);
    } else {
      console.log('❌ Usuário não encontrado no banco de dados.');
    }

  } catch (err) {
    console.error('❌ Erro:', err);
  } finally {
    await pool.end();
  }
}

updatePassword();
