import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkTables() {
  try {
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', tables.rows.map(r => r.table_name));

    const productsCount = await pool.query('SELECT COUNT(*) FROM products');
    console.log('Products count:', productsCount.rows[0].count);

    const componentsCount = await pool.query('SELECT COUNT(*) FROM components');
    console.log('Components count:', componentsCount.rows[0].count);

    const categoriesCount = await pool.query('SELECT COUNT(*) FROM categories');
    console.log('Categories count:', categoriesCount.rows[0].count);

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkTables();