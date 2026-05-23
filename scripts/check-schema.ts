import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkSchema() {
  try {
    const productsSchema = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'products'
    `);
    console.log('Products columns:', productsSchema.rows);

    const componentsSchema = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'components'
    `);
    console.log('Components columns:', componentsSchema.rows);

    const sampleComponents = await pool.query('SELECT * FROM components LIMIT 2');
    console.log('Sample components:', sampleComponents.rows);

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkSchema();