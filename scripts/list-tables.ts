import pg from 'pg';

async function run() {
  const pool = new pg.Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc'
  });

  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in public schema:', res.rows.map(r => r.table_name));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

run();
