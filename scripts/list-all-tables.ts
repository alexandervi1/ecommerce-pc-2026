import pg from 'pg';

async function run() {
  const pool = new pg.Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc'
  });

  try {
    const res = await pool.query("SELECT schema_name FROM information_schema.schemata");
    console.log('Schemas:', res.rows.map(r => r.schema_name));
    
    for (const schema of res.rows.map(r => r.schema_name)) {
      if (['information_schema', 'pg_catalog'].includes(schema)) continue;
      const tables = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = $1`, [schema]);
      if (tables.rows.length > 0) {
        console.log(`Tables in ${schema}:`, tables.rows.map(r => r.table_name));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

run();
