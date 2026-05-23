import { Pool } from 'pg';

async function markFeaturedProducts() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    console.log('Marcando productos como destacados...');
    const result = await pool.query('UPDATE auth.products SET "isFeatured" = true');
    console.log(`Éxito! ${result.rowCount} productos marcados como destacados.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

markFeaturedProducts();
