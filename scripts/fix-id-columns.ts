import pg from 'pg';

const { Pool } = pg;

async function fixIdColumns() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    
    console.log('=== Verificando columnas VARCHAR(30) ===\n');
    
    // Find all VARCHAR(30) columns that might be too short for IDs
    const varcharCols = await client.query(`
      SELECT table_schema, table_name, column_name, character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema IN ('auth', 'products', 'components', 'orders', 'cart', 'builds', 'reviews', 'settings', 'audit')
      AND data_type = 'character varying'
      AND character_maximum_length <= 30
      ORDER BY table_schema, table_name
    `);
    
    console.log('Columnas VARCHAR(30) o menos:');
    varcharCols.rows.forEach((c: { table_schema: string; table_name: string; column_name: string; character_maximum_length: number }) => {
      console.log(`  ${c.table_schema}.${c.table_name}.${c.column_name}: VARCHAR(${c.character_maximum_length})`);
    });
    
    // Fix auditor_credentials id to TEXT
    console.log('\n=== Corrigiendo auditor_credentials.id a TEXT ===');
    await client.query(`ALTER TABLE auth.auditor_credentials ALTER COLUMN id TYPE TEXT`);
    console.log('✓ auditor_credentials.id cambiado a TEXT');
    
    // Also fix created_by if it exists
    await client.query(`ALTER TABLE auth.auditor_credentials ALTER COLUMN created_by TYPE TEXT`);
    console.log('✓ auditor_credentials.created_by cambiado a TEXT');
    
    client.release();
    console.log('\n✓ Corregido');
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

fixIdColumns();