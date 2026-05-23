import pg from 'pg';
import fs from 'fs';

async function run() {
  const pool = new pg.Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc'
  });

  try {
    console.log('Dropping types...');
    await pool.query('DROP TYPE IF EXISTS "Role" CASCADE; DROP TYPE IF EXISTS "OrderStatus" CASCADE; DROP TYPE IF EXISTS "ComponentType" CASCADE;');
    
    console.log('Reading init-database.sql...');
    let sql = fs.readFileSync('./scripts/init-database.sql', 'utf8');
    
    // Fix the "settings" table issue if necessary - but usually it's better to run the whole file
    console.log('Executing SQL...');
    await pool.query(sql);
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error during database initialization:', error);
  } finally {
    await pool.end();
  }
}

run();
