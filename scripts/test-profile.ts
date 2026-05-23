import pg from 'pg';

const { Pool } = pg;

async function testProfile() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    console.log('Testing profile query...');
    
    // Check users table structure
    const columns = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'users' ORDER BY ordinal_position
    `);
    
    console.log('\nColumnas de users:');
    columns.rows.forEach((row: { column_name: string; data_type: string }) => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    // Test user query
    const users = await client.query('SELECT id, email, name, role, phone FROM "users" LIMIT 2');
    console.log('\nUsuarios:');
    users.rows.forEach((row: Record<string, unknown>) => {
      console.log(`  ${row.email} - ${row.name} (${row.role})`);
    });
    
    client.release();
    console.log('\nTest completado!');
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

testProfile();