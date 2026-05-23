import pg from 'pg';

const { Pool } = pg;

async function checkDatabase() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    console.log('Conexión exitosa!\n');
    
    // Check existing tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    
    console.log('Tablas existentes:');
    tables.rows.forEach((row: { table_name: string }) => console.log(`  - ${row.table_name}`));
    
    // Check users
    const users = await client.query('SELECT id, email, name, role FROM "users"');
    console.log('\nUsuarios:', users.rows.length);
    
    // Check categories
    const categories = await client.query('SELECT id, name FROM "categories"');
    console.log('Categorías:', categories.rows.length);
    
    // Check products
    const products = await client.query('SELECT id, name FROM "products"');
    console.log('Productos:', products.rows.length);
    
    // Check components
    const components = await client.query('SELECT id, name, brand FROM "components"');
    console.log('Componentes:', components.rows.length);
    
    client.release();
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

checkDatabase();