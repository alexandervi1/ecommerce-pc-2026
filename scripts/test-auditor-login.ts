import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

async function testAuditorLogin() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    
    const email = 'auditor@ecommerce.pc';
    const password = 'Auditor2024!';
    
    console.log('=== Probando login de auditor ===\n');
    
    // Get auditor
    const result = await client.query(
      'SELECT id, email, password_hash, name, is_active FROM auth.auditor_credentials WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Auditor NO encontrado');
      return;
    }
    
    const auditor = result.rows[0];
    console.log('✓ Auditor encontrado:');
    console.log(`  ID: ${auditor.id}`);
    console.log(`  Email: ${auditor.email}`);
    console.log(`  Name: ${auditor.name}`);
    console.log(`  Active: ${auditor.is_active}`);
    
    // Test password
    const isValid = await bcrypt.compare(password, auditor.password_hash);
    console.log(`\n✓ Contraseña válida: ${isValid ? 'SÍ' : 'NO'}`);
    
    // Check users table for duplicate
    const userCheck = await client.query(
      'SELECT id, email FROM auth.users WHERE email = $1',
      [email]
    );
    
    if (userCheck.rows.length > 0) {
      console.log('\n⚠️ ADVERTENCIA: Existe un usuario regular con el mismo email:');
      console.log(`  User ID: ${userCheck.rows[0].id}`);
    } else {
      console.log('\n✓ No hay conflicto con usuario regular');
    }
    
    client.release();
  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

testAuditorLogin();