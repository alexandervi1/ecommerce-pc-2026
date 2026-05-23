import bcrypt from "bcryptjs";
import pg from 'pg';
import { randomUUID } from 'crypto';

const { Pool } = pg;

function generateId(): string {
  return randomUUID().replace(/-/g, '').substring(0, 25);
}

async function createFirstAuditor() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    
    // Check if any auditor exists
    const existing = await client.query('SELECT id FROM auth.auditor_credentials LIMIT 1');
    
    if (existing.rows.length > 0) {
      console.log('Ya existe un auditor en el sistema.');
      client.release();
      pool.end();
      return;
    }

    console.log('\n=== CREANDO PRIMER AUDITOR ===\n');
    
    const email = 'auditor@ecommerce.pc';
    const name = 'Auditor Principal';
    const password = 'Auditor2024!';
    
    const passwordHash = await bcrypt.hash(password, 12);
    const id = generateId();
    
    await client.query(
      `INSERT INTO auth.auditor_credentials (id, email, password_hash, name, is_active, created_at)
       VALUES ($1, $2, $3, $4, true, NOW())`,
      [id, email, passwordHash, name]
    );
    
    console.log('✅ Auditor creado exitosamente!\n');
    console.log('CREDENCIALES:');
    console.log('─'.repeat(40));
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('─'.repeat(40));
    console.log('\nIMPORTANTE: Guarda estas credenciales de forma segura.');
    console.log('Accede al panel de auditoría en: /admin/audit\n');
    
    client.release();
  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

createFirstAuditor();