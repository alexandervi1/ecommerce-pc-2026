import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

async function setupUsers() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos.');

    const passwordHash = await bcrypt.hash('password123', 10);

    // Limpiar usuarios de prueba anteriores
    await client.query('DELETE FROM auth.users WHERE email IN ($1, $2, $3)', [
      'admin@kelectronicaec.com',
      'auditor@kelectronicaec.com',
      'cliente@kelectronicaec.com'
    ]);

    // Insertar Admin
    await client.query(
      `INSERT INTO auth.users (id, email, password, name, role, "emailVerified", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())`,
      ['user-admin-01', 'admin@kelectronicaec.com', passwordHash, 'Admin Kelectronica', 'ADMIN']
    );

    // Insertar Auditor
    await client.query(
      `INSERT INTO auth.users (id, email, password, name, role, "emailVerified", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())`,
      ['user-auditor-01', 'auditor@kelectronicaec.com', passwordHash, 'Auditor Kelectronica', 'AUDITOR']
    );

    // Insertar Cliente
    await client.query(
      `INSERT INTO auth.users (id, email, password, name, role, "emailVerified", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())`,
      ['user-client-01', 'cliente@kelectronicaec.com', passwordHash, 'Cliente VIP', 'CLIENT']
    );

    console.log('\n✅ USUARIOS CREADOS EXITOSAMENTE:');
    console.log('---------------------------------');
    console.log('Admin: admin@kelectronicaec.com / password123');
    console.log('Auditor: auditor@kelectronicaec.com / password123');
    console.log('Cliente: cliente@kelectronicaec.com / password123');

  } catch (err) {
    console.error('Error al configurar usuarios:', err);
  } finally {
    await client.end();
  }
}

setupUsers();
