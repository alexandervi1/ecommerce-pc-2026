import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

async function listUsers() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos.');

    const res = await client.query('SELECT id, email, name, role FROM auth.users');
    console.log('\nUSUARIOS REGISTRADOS:');
    console.table(res.rows);

  } catch (err) {
    console.error('Error al consultar usuarios:', err);
  } finally {
    await client.end();
  }
}

listUsers();
