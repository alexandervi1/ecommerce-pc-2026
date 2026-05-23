import bcrypt from "bcryptjs";
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function updateCredentials() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const client = await pool.connect();
    console.log('--- ACTUALIZANDO CREDENCIALES DE ACCESO ---');

    const users = [
      {
        email: 'admin@techstore.com',
        password: 'Admin123!',
        name: 'Administrador Élite',
        role: 'ADMIN'
      },
      {
        email: 'cliente@techstore.com',
        password: 'Cliente123!',
        name: 'Cliente de Prueba',
        role: 'CLIENT'
      }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // First check if email exists
      const res = await client.query('SELECT id FROM auth.users WHERE email = $1', [user.email]);
      
      if (res.rows.length > 0) {
        // Update existing
        await client.query(
          `UPDATE auth.users SET password = $1, name = $2, role = $3, "updatedAt" = NOW() WHERE email = $4`,
          [hashedPassword, user.name, user.role, user.email]
        );
      } else {
        // Insert new with random ID
        await client.query(
          `INSERT INTO auth.users (id, email, password, name, role, "updatedAt")
           VALUES (REPLACE(gen_random_uuid()::text, '-', ''), $1, $2, $3, $4, NOW())`,
          [user.email, hashedPassword, user.name, user.role]
        );
      }
      
      console.log(`✅ Usuario [${user.role}] actualizado/creado: ${user.email} / ${user.password}`);
    }

    // Auditor setup
    const auditorEmail = 'auditor@techstore.com';
    const auditorPassword = 'Auditor123!';
    const auditorHash = await bcrypt.hash(auditorPassword, 12);
    
    try {
      const audRes = await client.query('SELECT id FROM auth.auditor_credentials WHERE email = $1', [auditorEmail]);
      if (audRes.rows.length > 0) {
        await client.query(
          `UPDATE auth.auditor_credentials SET password_hash = $1, name = 'Auditor de Sistemas' WHERE email = $2`,
          [auditorHash, auditorEmail]
        );
      } else {
        await client.query(
          `INSERT INTO auth.auditor_credentials (id, email, password_hash, name, is_active, created_at)
           VALUES (REPLACE(gen_random_uuid()::text, '-', ''), $1, $2, 'Auditor de Sistemas', true, NOW())`,
          [auditorEmail, auditorHash]
        );
      }
      console.log(`✅ Auditor actualizado/creado: ${auditorEmail} / ${auditorPassword}`);
    } catch (e) {
      console.log('⚠️ No se pudo actualizar el auditor:', (e as Error).message);
    }

    client.release();
    console.log('--- PROCESO COMPLETADO ---');
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    pool.end();
  }
}

updateCredentials();
