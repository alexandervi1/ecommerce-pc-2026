import pg from 'pg';

const { Pool } = pg;

async function setupDatabase() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    
    // Create the update_updated_at_column function
    console.log('Creando función update_updated_at_column...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('✓ Función creada');
    
    // Create the sequence for order numbers
    console.log('Creando secuencia order_number_seq...');
    await client.query(`CREATE SEQUENCE IF NOT EXISTS order_number_seq`);
    console.log('✓ Secuencia creada');
    
    // Add triggers to existing tables
    console.log('Agregando triggers...');
    const triggers = [
      { table: 'users', name: 'update_users_updated_at' },
      { table: 'categories', name: 'update_categories_updated_at' },
      { table: 'products', name: 'update_products_updated_at' },
      { table: 'component_categories', name: 'update_component_categories_updated_at' },
      { table: 'components', name: 'update_components_updated_at' },
      { table: 'pc_builds', name: 'update_pc_builds_updated_at' },
      { table: 'carts', name: 'update_carts_updated_at' },
      { table: 'cart_items', name: 'update_cart_items_updated_at' },
      { table: 'orders', name: 'update_orders_updated_at' },
      { table: 'settings', name: 'update_settings_updated_at' }
    ];
    
    for (const { table, name } of triggers) {
      try {
        await client.query(`DROP TRIGGER IF EXISTS ${name} ON "${table}"`);
        await client.query(`
          CREATE TRIGGER ${name} 
          BEFORE UPDATE ON "${table}" 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);
        console.log(`  ✓ ${table}`);
      } catch (e) {
        const err = e as Error;
        if (!err.message.includes('does not exist')) {
          console.log(`  ⚠️ ${table}: ${err.message}`);
        }
      }
    }
    
    // Create reviews table
    console.log('\nCreando tabla reviews...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "reviews" (
        id VARCHAR(30) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
        "productId" VARCHAR(30) NOT NULL REFERENCES "products"(id) ON DELETE CASCADE,
        "userId" VARCHAR(30) NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(200),
        content TEXT,
        "isVerified" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ Tabla reviews creada');
    
    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_product ON "reviews"("productId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_user ON "reviews"("userId")`);
    console.log('✓ Índices creados');
    
    // Add trigger to reviews
    await client.query(`
      CREATE TRIGGER update_reviews_updated_at 
      BEFORE UPDATE ON "reviews" 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✓ Trigger agregado a reviews');
    
    client.release();
    console.log('\n✓ Base de datos configurada correctamente!');
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

setupDatabase();