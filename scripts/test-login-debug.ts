import bcrypt from "bcryptjs";
import pg from 'pg';

const { Pool } = pg;

async function testLogin() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    
    const email = 'auditor@ecommerce.pc';
    const password = 'Auditor2024!';
    
    console.log('=== TEST DE LOGIN ===\n');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}\n`);
    
    // Test auditor_credentials
    console.log('1. Buscando en auditor_credentials...');
    const auditorResult = await client.query(
      'SELECT id, email, password_hash, name, is_active FROM auth.auditor_credentials WHERE email = $1',
      [email]
    );
    
    if (auditorResult.rows.length === 0) {
      console.log('   ❌ No encontrado en auditor_credentials');
    } else {
      const auditor = auditorResult.rows[0];
      console.log('   ✓ Encontrado:');
      console.log(`     ID: ${auditor.id}`);
      console.log(`     Email: ${auditor.email}`);
      console.log(`     Name: ${auditor.name}`);
      console.log(`     Active: ${auditor.is_active}`);
      
      console.log('\n2. Verificando contraseña...');
      const isValid = await bcrypt.compare(password, auditor.password_hash);
      console.log(`   Contraseña válida: ${isValid ? '✓ SÍ' : '❌ NO'}`);
      
      if (isValid) {
        console.log('\n=== LOGIN EXITOSO ===');
        console.log('Usuario autenticado como AUDITOR');
      }
    }
    
    // Test users
    console.log('\n3. Verificando si existe en users...');
    const userResult = await client.query(
      'SELECT id, email, name, password, role FROM auth.users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length > 0) {
      console.log('   ⚠️ ADVERTENCIA: El email también existe en auth.users');
    } else {
      console.log('   ✓ Email no existe en auth.users (correcto)');
    }
    
    client.release();
  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message);
    console.error((error as Error).stack);
  } finally {
    pool.end();
  }
}

testLogin();