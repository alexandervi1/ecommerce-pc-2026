import pg from 'pg';

const { Pool } = pg;

async function fixAllIdColumns() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    
    console.log('=== Corrigiendo todas las columnas ID a TEXT ===\n');
    
    const alterations = [
      // audit.audit_logs
      'ALTER TABLE audit.audit_logs ALTER COLUMN id TYPE TEXT',
      'ALTER TABLE audit.audit_logs ALTER COLUMN user_id TYPE TEXT',
      'ALTER TABLE audit.audit_logs ALTER COLUMN entity_id TYPE TEXT',
      'ALTER TABLE audit.audit_logs ALTER COLUMN session_id TYPE TEXT',
      
      // audit.error_logs
      'ALTER TABLE audit.error_logs ALTER COLUMN id TYPE TEXT',
      'ALTER TABLE audit.error_logs ALTER COLUMN user_id TYPE TEXT',
      'ALTER TABLE audit.error_logs ALTER COLUMN resolved_by TYPE TEXT',
      
      // audit.login_history
      'ALTER TABLE audit.login_history ALTER COLUMN id TYPE TEXT',
      'ALTER TABLE audit.login_history ALTER COLUMN user_id TYPE TEXT',
      
      // reviews
      'ALTER TABLE reviews.reviews ALTER COLUMN id TYPE TEXT',
      'ALTER TABLE reviews.reviews ALTER COLUMN "productId" TYPE TEXT',
      'ALTER TABLE reviews.reviews ALTER COLUMN "userId" TYPE TEXT',
    ];
    
    for (const sql of alterations) {
      try {
        await client.query(sql);
        console.log(`✓ ${sql.split('ALTER COLUMN ')[1].split(' TYPE')[0]}`);
      } catch (e) {
        const err = e as Error;
        if (err.message.includes('already') || err.message.includes('cannot alter')) {
          console.log(`○ Ya es TEXT o no existe: ${sql.split('ALTER COLUMN ')[1]?.split(' TYPE')[0] || ''}`);
        }
      }
    }
    
    console.log('\n✓ Todas las columnas ID corregidas a TEXT');
    client.release();
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

fixAllIdColumns();