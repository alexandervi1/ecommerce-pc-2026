import pg from 'pg';

const { Pool } = pg;

async function checkProducts() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    console.log('=== VERIFICANDO PRODUCTOS ===\n');
    
    // Check products
    const products = await client.query(`
      SELECT p.id, p.name, p."categoryId", p."isActive", c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
      ORDER BY p."createdAt" DESC
    `);
    
    console.log(`Total productos: ${products.rows.length}\n`);
    
    // Count by category
    const byCategory: Record<string, { count: number; active: number }> = {};
    
    products.rows.forEach((p: { id: string; name: string; categoryId: string | null; isActive: boolean; category_name: string | null }) => {
      const catName = p.category_name || 'Sin categoría';
      if (!byCategory[catName]) {
        byCategory[catName] = { count: 0, active: 0 };
      }
      byCategory[catName].count++;
      if (p.isActive) {
        byCategory[catName].active++;
      }
    });
    
    console.log('Productos por categoría:');
    console.log('─'.repeat(50));
    Object.entries(byCategory).forEach(([cat, data]) => {
      console.log(`${cat}: ${data.count} total, ${data.active} activos`);
    });
    
    // Products without category
    const noCategory = products.rows.filter((p: { categoryId: null }) => p.categoryId === null);
    console.log('\n─'.repeat(50));
    console.log(`\nProductos SIN categoría: ${noCategory.length}`);
    if (noCategory.length > 0) {
      noCategory.forEach((p: { id: string; name: string }) => {
        console.log(`  - ${p.name}`);
      });
    }
    
    // Products inactive
    const inactive = products.rows.filter((p: { isActive: boolean }) => !p.isActive);
    console.log(`\nProductos INACTIVOS: ${inactive.length}`);
    if (inactive.length > 0) {
      inactive.forEach((p: { id: string; name: string }) => {
        console.log(`  - ${p.name}`);
      });
    }
    
    // Verify categories
    const categories = await client.query('SELECT id, name FROM categories ORDER BY name');
    console.log('\n=== CATEGORÍAS ===');
    categories.rows.forEach((c: { id: string; name: string }) => {
      const count = products.rows.filter((p: { categoryId: string | null }) => p.categoryId === c.id).length;
      console.log(`  ${c.name}: ${count} productos`);
    });
    
    client.release();
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

checkProducts();