import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

async function updateEnum() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos.');

    // Añadir AUDITOR al ENUM Role
    await client.query('ALTER TYPE "Role" ADD VALUE IF NOT EXISTS \'AUDITOR\'');
    
    console.log('✅ Enum Role actualizado con AUDITOR correctamente.');

  } catch (err) {
    console.error('Error al actualizar el enum:', err);
  } finally {
    await client.end();
  }
}

updateEnum();
