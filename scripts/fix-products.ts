import pg from 'pg';

const { Pool } = pg;

async function fixProducts() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    console.log('Arreglando productos y categorías...\n');
    
    // Create new categories for products
    const newCategories = [
      { name: 'Laptops', slug: 'laptops', description: 'Laptops y notebooks gaming y profesionales' },
      { name: 'Monitores', slug: 'monitores', description: 'Monitores gaming y profesionales' },
      { name: 'Periféricos', slug: 'perifericos', description: 'Teclados, mouse, headsets y más' },
      { name: 'Accesorios', slug: 'accesorios', description: 'Accesorios y complementos para tu setup' },
      { name: 'Sillas Gaming', slug: 'sillas-gaming', description: 'Sillas ergonómicas para gaming' },
    ];
    
    console.log('Creando categorías para productos...');
    for (const cat of newCategories) {
      try {
        await client.query(
          'INSERT INTO categories (id, name, slug, description, "isActive", "createdAt", "updatedAt") VALUES (REPLACE(gen_random_uuid()::text, \'-\', \'\'), $1, $2, $3, true, NOW(), NOW())',
          [cat.name, cat.slug, cat.description]
        );
        console.log(`  ✓ ${cat.name}`);
      } catch (e) {
        const err = e as Error;
        if (err.message.includes('unique constraint')) {
          console.log(`  ○ ${cat.name} ya existe`);
        } else {
          console.log(`  ✗ Error: ${err.message}`);
        }
      }
    }
    
    // Get category IDs
    const catResult = await client.query('SELECT id, slug FROM categories');
    const catMap: Record<string, string> = {};
    catResult.rows.forEach((r: { id: string; slug: string }) => {
      catMap[r.slug] = r.id;
    });
    
    // Assign products to categories
    console.log('\nAsignando productos a categorías...');
    
    const productAssignments: { product: string; category: string }[] = [
      { product: 'Laptop Gaming ASUS ROG', category: 'laptops' },
      { product: 'Monitor Samsung 27" 144Hz', category: 'monitores' },
      { product: 'Teclado Mecánico RGB', category: 'perifericos' },
      { product: 'Mouse Logitech G Pro X', category: 'perifericos' },
      { product: 'Headset HyperX Cloud II', category: 'perifericos' },
      { product: 'Webcam Logitech C920', category: 'perifericos' },
      { product: 'Silla Gaming Ergonómica', category: 'sillas-gaming' },
      { product: 'Mousepad XL RGB', category: 'accesorios' },
      { product: 'Cable HDMI 2.1 2m', category: 'accesorios' },
      { product: 'Hub USB-C 7 en 1', category: 'accesorios' },
      { product: 'Lámpara LED Monitor Bar', category: 'accesorios' },
      { product: 'Soporte Monitor Dual', category: 'accesorios' },
      { product: 'Republic of Gamers Backpack', category: 'accesorios' },
      { product: 'Cargador Dominó USB', category: 'accesorios' },
      { product: 'Mouse Bungee', category: 'accesorios' },
    ];
    
    for (const assignment of productAssignments) {
      const categoryId = catMap[assignment.category];
      if (categoryId) {
        const result = await client.query(
          'UPDATE products SET "categoryId" = $1 WHERE name = $2',
          [categoryId, assignment.product]
        );
        console.log(`  ✓ ${assignment.product} → ${assignment.category}`);
      }
    }
    
    // Verify
    console.log('\n=== VERIFICACIÓN ===');
    const products = await client.query(`
      SELECT p.name, c.name as category
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
      ORDER BY c.name, p.name
    `);
    
    let currentCategory = '';
    products.rows.forEach((p: { name: string; category: string | null }) => {
      if (p.category !== currentCategory) {
        currentCategory = p.category || 'Sin categoría';
        console.log(`\n${currentCategory}:`);
      }
      console.log(`  - ${p.name}`);
    });
    
    client.release();
    console.log('\n✓ Listo!');
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

fixProducts();