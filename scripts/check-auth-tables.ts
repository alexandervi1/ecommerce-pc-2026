import pg from 'pg';

const { Pool } = pg;

async function checkTables() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    
    console.log('=== Verificando tablas de autenticación ===\n');
    
    // Check users table
    const usersCols = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('auth.users:');
    usersCols.rows.forEach((c: { column_name: string; data_type: string; character_maximum_length: number | null }) => {
      console.log(`  ${c.column_name}: ${c.data_type}${c.character_maximum_length ? `(${c.character_maximum_length})` : ''}`);
    });
    
    // Check sessions table
    const sessionsCols = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'sessions'
      ORDER BY ordinal_position
    `);
    console.log('\nauth.sessions:');
    sessionsCols.rows.forEach((c: { column_name: string; data_type: string; character_maximum_length: number | null }) => {
      console.log(`  ${c.column_name}: ${c.data_type}${c.character_maximum_length ? `(${c.character_maximum_length})` : ''}`);
    });
    
    // Check auditor_credentials
    const auditorCols = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'auditor_credentials'
      ORDER BY ordinal_position
    `);
    console.log('\nauth.auditor_credentials:');
    auditorCols.rows.forEach((c: { column_name: string; data_type: string; character_maximum_length: number | null }) => {
      console.log(`  ${c.column_name}: ${c.data_type}${c.character_maximum_length ? `(${c.character_maximum_length})` : ''}`);
    });
    
    // Show existing auditor
    const auditors = await client.query('SELECT id, email, name, is_active FROM auth.auditor_credentials');
    console.log('\nAuditores existentes:');
    auditors.rows.forEach((a: { id: string; email: string; name: string; is_active: boolean }) => {
      console.log(`  - ${a.email} (${a.name}) [${a.is_active ? 'activo' : 'inactivo'}]`);
    });
    
    client.release();
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

checkTables();