import pg from 'pg';

const { Pool } = pg;

async function addPhoneColumn() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    console.log('Agregando columna phone...');
    
    await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS phone VARCHAR(50)');
    
    console.log('Columna phone agregada!');
    
    // Verify
    const columns = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone'
    `);
    
    if (columns.rows.length > 0) {
      console.log('Verificado: columna phone existe');
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

addPhoneColumn();