import pg from 'pg';

const { Pool } = pg;

async function checkComponents() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    
    console.log('=== CATEGORÍAS DE COMPONENTES (Para armar PC) ===\n');
    
    const categories = await client.query(`
      SELECT id, name, type, slug FROM component_categories 
      ORDER BY "sortOrder"
    `);
    
    let totalComponents = 0;
    
    for (const cat of categories.rows) {
      const result = await client.query(
        'SELECT COUNT(*) as count FROM components WHERE "categoryId" = $1 AND "isActive" = true',
        [cat.id]
      );
      const count = parseInt(result.rows[0].count);
      totalComponents += count;
      console.log(`${cat.name} (${cat.type}): ${count} componentes`);
    }
    
    console.log('\n─'.repeat(40));
    console.log(`Total: ${totalComponents} componentes activos`);
    console.log('\n=== PRODUCTOS (Tienda general) ===\n');
    
    const products = await client.query(`
      SELECT c.name as category, COUNT(*) as count 
      FROM products p
      JOIN categories c ON p."categoryId" = c.id
      WHERE p."isActive" = true
      GROUP BY c.name
      ORDER BY c.name
    `);
    
    let totalProducts = 0;
    for (const p of products.rows) {
      const count = parseInt(p.count);
      totalProducts += count;
      console.log(`${p.category}: ${count} productos`);
    }
    
    console.log('\n─'.repeat(40));
    console.log(`Total: ${totalProducts} productos activos`);
    
    client.release();
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

checkComponents();