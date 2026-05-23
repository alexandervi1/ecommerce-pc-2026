import pg from 'pg';

const { Pool } = pg;

async function createAuditorTable() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    console.log('Creando tabla auditor_credentials...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth.auditor_credentials (
        id VARCHAR(30) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_by VARCHAR(30)
      )
    `);
    
    console.log('✓ auth.auditor_credentials creada');
    
    // Verify
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'auth' AND table_name = 'auditor_credentials'
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ Verificado: tabla existe');
    } else {
      console.log('✗ Error: tabla no encontrada');
    }
    
    client.release();
    pool.end();
  } catch (error) {
    console.error('Error:', (error as Error).message);
    pool.end();
  }
}

createAuditorTable();