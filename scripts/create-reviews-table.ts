import pg from 'pg';

const { Pool } = pg;

async function createReviewsTable() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    console.log('Creando tabla reviews...');
    
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
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_product ON "reviews"("productId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_user ON "reviews"("userId")`);
    
    // Add trigger for updatedAt
    await client.query(`
      CREATE TRIGGER update_reviews_updated_at 
      BEFORE UPDATE ON "reviews" 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    
    console.log('✓ Tabla reviews creada');
    
    client.release();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

createReviewsTable();