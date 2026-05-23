import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Settings table created');

    await pool.query(`
      INSERT INTO settings (key, value, description) VALUES
        ('iva_rate', '15', 'Porcentaje de IVA aplicado a los productos'),
        ('currency', 'USD', 'Moneda utilizada para precios'),
        ('store_name', 'E-Commerce PC', 'Nombre de la tienda')
      ON CONFLICT (key) DO NOTHING
    `);
    console.log('Default settings inserted');

    console.log('Migration completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

migrate();