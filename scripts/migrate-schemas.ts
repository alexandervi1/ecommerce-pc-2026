import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public';

async function migrateSchemas() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const client = await pool.connect();
    console.log('Conectado a la base de datos...\n');

    // 1. Create schemas
    console.log('=== CREANDO ESQUEMAS ===');
    const schemas = [
      'auth',
      'products', 
      'components',
      'orders',
      'cart',
      'builds',
      'reviews',
      'settings',
      'audit'
    ];

    for (const schema of schemas) {
      try {
        await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
        console.log(`  ✓ Esquema "${schema}" creado`);
      } catch (e) {
        console.log(`  ○ Esquema "${schema}" ya existe`);
      }
    }

    // 2. Migrate tables to schemas
    console.log('\n=== MIGRANDO TABLAS ===');
    
    const tableMigrations: { table: string; from: string; to: string }[] = [
      // Auth schema
      { table: 'users', from: 'public', to: 'auth' },
      { table: 'accounts', from: 'public', to: 'auth' },
      { table: 'sessions', from: 'public', to: 'auth' },
      { table: 'verification_tokens', from: 'public', to: 'auth' },
      
      // Products schema
      { table: 'products', from: 'public', to: 'products' },
      { table: 'categories', from: 'public', to: 'products' },
      
      // Components schema
      { table: 'component_categories', from: 'public', to: 'components' },
      { table: 'components', from: 'public', to: 'components' },
      { table: 'compatibility_rules', from: 'public', to: 'components' },
      
      // Orders schema
      { table: 'orders', from: 'public', to: 'orders' },
      { table: 'order_items', from: 'public', to: 'orders' },
      
      // Cart schema
      { table: 'carts', from: 'public', to: 'cart' },
      { table: 'cart_items', from: 'public', to: 'cart' },
      
      // Builds schema
      { table: 'pc_builds', from: 'public', to: 'builds' },
      { table: 'pc_build_items', from: 'public', to: 'builds' },
      
      // Reviews schema
      { table: 'reviews', from: 'public', to: 'reviews' },
      
      // Settings schema
      { table: 'settings', from: 'public', to: 'settings' },
      
      // Audit schema - will create new tables
      { table: 'audit_logs', from: 'public', to: 'audit' },
    ];

    for (const migration of tableMigrations) {
      const { table, from, to } = migration;
      
      try {
        // Check if table exists in source schema
        const existsInSource = await client.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = $1 AND table_name = $2
          )
        `, [from, table]);
        
        if (!existsInSource.rows[0].exists) {
          // Check if already in target schema
          const existsInTarget = await client.query(`
            SELECT EXISTS (
              SELECT 1 FROM information_schema.tables 
              WHERE table_schema = $1 AND table_name = $2
            )
          `, [to, table]);
          
          if (existsInTarget.rows[0].exists) {
            console.log(`  ✓ "${table}" ya está en esquema "${to}"`);
          } else {
            console.log(`  ✗ "${table}" no existe`);
          }
          continue;
        }
        
        // Check if already exists in target
        const existsInTarget = await client.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = $1 AND table_name = $2
          )
        `, [to, table]);
        
        if (existsInTarget.rows[0].exists) {
          // Drop from source if exists in target
          await client.query(`DROP TABLE IF EXISTS "${from}"."${table}" CASCADE`);
          console.log(`  ✓ "${table}" ya migrada a "${to}"`);
          continue;
        }
        
        // Move table to new schema
        await client.query(`ALTER TABLE "${from}"."${table}" SET SCHEMA "${to}"`);
        console.log(`  ✓ "${table}" migrada de "${from}" a "${to}"`);
        
      } catch (e) {
        const err = e as Error;
        console.log(`  ✗ Error migrando "${table}": ${err.message}`);
      }
    }

    // 3. Create audit tables
    console.log('\n=== CREANDO TABLAS DE AUDITORÍA ===');
    
    // Audit logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit.audit_logs (
        id VARCHAR(30) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        user_id VARCHAR(30),
        user_email VARCHAR(255),
        user_role VARCHAR(50),
        session_id VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        action_type VARCHAR(50) NOT NULL,
        entity_type VARCHAR(100),
        entity_id VARCHAR(30),
        old_value JSONB,
        new_value JSONB,
        request_method VARCHAR(10),
        request_path VARCHAR(500),
        request_params JSONB,
        response_status INTEGER,
        duration_ms INTEGER,
        status VARCHAR(20) DEFAULT 'SUCCESS',
        error_message TEXT
      )
    `);
    console.log('  ✓ audit_logs creada');

    // Create indexes for audit_logs
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit.audit_logs(timestamp DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit.audit_logs(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.audit_logs(action_type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit.audit_logs(entity_type, entity_id)`);

    // Error logs table
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
    console.log('  ✓ error_logs creada');

    // Create indexes for error_logs
    await client.query(`CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON audit.error_logs(timestamp DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON audit.error_logs(severity)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON audit.error_logs(resolved)`);

    // Login history table
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
    console.log('  ✓ login_history creada');

    // Create indexes for login_history
    await client.query(`CREATE INDEX IF NOT EXISTS idx_login_history_timestamp ON audit.login_history(timestamp DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_login_history_user ON audit.login_history(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_login_history_email ON audit.login_history(email)`);

    // 4. Create auditor_credentials table in auth schema
    console.log('\n=== CREANDO TABLA DE AUDITORES ===');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth.auditor_credentials (
        id VARCHAR(30) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_by VARCHAR(30)
      )
    `);
    console.log('  ✓ auditor_credentials creada');

    // 5. Update Role enum to include AUDITOR
    console.log('\n=== ACTUALIZANDO ENUM ROLE ===');
    
    try {
      await client.query(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'AUDITOR'`);
      console.log('  ✓ AUDITOR agregado al enum Role');
    } catch (e) {
      const err = e as Error;
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log('  ○ AUDITOR ya existe en el enum');
      } else {
        console.log(`  ⚠ Error: ${err.message}`);
      }
    }

    // 6. Update search_path for future connections
    console.log('\n=== CONFIGURANDO SEARCH_PATH ===');
    await client.query(`
      ALTER DATABASE ecommerce_pc SET search_path TO auth, products, components, orders, cart, builds, reviews, settings, audit, public
    `);
    console.log('  ✓ search_path configurado');

    // 7. Verify migration
    console.log('\n=== VERIFICACIÓN ===');
    
    for (const schema of schemas) {
      const tables = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = $1 ORDER BY table_name
      `, [schema]);
      
      console.log(`\nEsquema "${schema}":`);
      if (tables.rows.length === 0) {
        console.log('  (vacío)');
      } else {
        tables.rows.forEach((row: { table_name: string }) => {
          console.log(`  - ${row.table_name}`);
        });
      }
    }

    client.release();
    console.log('\n✓ MIGRACIÓN COMPLETADA');
    
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

migrateSchemas();