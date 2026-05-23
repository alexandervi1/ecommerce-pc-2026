import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;

async function initDatabase() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    console.log('Conectando a la base de datos...');
    
    const client = await pool.connect();
    console.log('Conexión exitosa!');
    
    const sql = fs.readFileSync('./scripts/init-database.sql', 'utf8');
    
    console.log('Ejecutando esquema...');
    await client.query(sql);
    
    console.log('Base de datos inicializada correctamente!');
    
    // Hash password for admin user
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update admin password
    await client.query(
      'UPDATE "users" SET password = $1 WHERE email = $2',
      [hashedPassword, 'admin@ecommerce.pc']
    );
    
    console.log('Usuario admin creado:');
    console.log('Email: admin@ecommerce.pc');
    console.log('Password: admin123');
    
    client.release();
  } catch (error) {
    const pgError = error as { code?: string; message: string };
    console.error('Error:', pgError.message);
    
    // Try creating database first
    if (pgError.code === '3D000') {
      console.log('La base de datos no existe. Creándola...');
      const adminPool = new Pool({
        connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/postgres'
      });
      
      try {
        await adminPool.query('CREATE DATABASE ecommerce_pc');
        console.log('Base de datos creada!');
        adminPool.end();
        
        // Retry initialization
        initDatabase();
        return;
      } catch (createError) {
        const err = createError as { message: string };
        console.error('Error creando base de datos:', err.message);
        adminPool.end();
      }
    }
  } finally {
    pool.end();
  }
}

initDatabase();