import pg from 'pg';

const { Pool } = pg;

async function completeAuditSetup() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    console.log('Completando tablas de auditoría...\n');

    // Drop old audit_logs from public if exists
    await client.query(`DROP TABLE IF EXISTS public.audit_logs CASCADE`);
    
    // Create error_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit.error_logs (
        id VARCHAR(30) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        error_type VARCHAR(100),
        error_message TEXT,
        stack_trace TEXT,
        user_id VARCHAR(30),
        ip_address VARCHAR(45),
        request_path VARCHAR(500),
        request_method VARCHAR(10),
        request_body JSONB,
        severity VARCHAR(20) DEFAULT 'MEDIUM',
        resolved BOOLEAN DEFAULT FALSE,
        resolved_by VARCHAR(30),
        resolved_at TIMESTAMP
      )
    `);
    console.log('  ✓ audit.error_logs creada');

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON audit.error_logs(timestamp DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON audit.error_logs(severity)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON audit.error_logs(resolved)`);

    // Create login_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit.login_history (
        id VARCHAR(30) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
        user_id VARCHAR(30),
        email VARCHAR(255),
        event_type VARCHAR(20) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        location_city VARCHAR(100),
        location_country VARCHAR(100),
        success BOOLEAN DEFAULT TRUE,
        failure_reason VARCHAR(255),
        timestamp TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('  ✓ audit.login_history creada');

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_login_history_timestamp ON audit.login_history(timestamp DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_login_history_user ON audit.login_history(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_login_history_email ON audit.login_history(email)`);

    // Verify all tables
    console.log('\n=== VERIFICACIÓN FINAL ===');
    
    const schemas = ['auth', 'products', 'components', 'orders', 'cart', 'builds', 'reviews', 'settings', 'audit'];
    
    for (const schema of schemas) {
      const tables = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = $1 ORDER BY table_name
      `, [schema]);
      
      console.log(`\n${schema}:`);
      tables.rows.forEach((row: { table_name: string }) => {
        console.log(`  - ${row.table_name}`);
      });
    }

    client.release();
    console.log('\n✓ Completado');
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

completeAuditSetup();