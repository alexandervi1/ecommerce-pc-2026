import pg from 'pg';

const { Pool } = pg;

async function checkDatabase() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public'
  });

  try {
    const client = await pool.connect();
    console.log('=== REVISIÓN DE BASE DE DATOS ===\n');

    // 1. Check all tables exist
    console.log('1. TABLAS:');
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    const expectedTables = [
      'accounts', 'audit_logs', 'cart_items', 'carts', 'categories',
      'compatibility_rules', 'component_categories', 'components',
      'order_items', 'orders', 'pc_build_items', 'pc_builds',
      'products', 'reviews', 'sessions', 'settings', 'users', 'verification_tokens'
    ];
    
    const existingTables = tables.rows.map((r: { table_name: string }) => r.table_name);
    const missingTables = expectedTables.filter(t => !existingTables.includes(t));
    const extraTables = existingTables.filter(t => !expectedTables.includes(t) && !t.startsWith('pg_'));
    
    existingTables.forEach((t: string) => {
      const icon = expectedTables.includes(t) ? '✓' : '?';
      console.log(`  ${icon} ${t}`);
    });
    
    if (missingTables.length > 0) console.log(`\n  ❌ Faltan: ${missingTables.join(', ')}`);
    if (extraTables.length > 0) console.log(`  ⚠️  Extra: ${extraTables.join(', ')}`);

    // 2. Check columns for key tables
    console.log('\n2. COLUMNAS IMPORTANTES:');
    
    const checkTableColumns = async (tableName: string, expectedCols: string[]) => {
      const cols = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = $1 ORDER BY ordinal_position
      `, [tableName]);
      const existingCols = cols.rows.map((r: { column_name: string }) => r.column_name);
      const missing = expectedCols.filter(c => !existingCols.includes(c));
      const extra = existingCols.filter(c => !expectedCols.includes(c));
      
      console.log(`\n  Tabla "${tableName}":`);
      if (missing.length > 0) console.log(`    ❌ Faltan: ${missing.join(', ')}`);
      if (extra.length > 0) console.log(`    ⚠️  Extra: ${extra.join(', ')}`);
      if (missing.length === 0 && extra.length === 0) console.log('    ✓ OK');
    };

    await checkTableColumns('users', ['id', 'email', 'password', 'name', 'phone', 'role', 'emailVerified', 'image', 'createdAt', 'updatedAt']);
    await checkTableColumns('products', ['id', 'name', 'slug', 'description', 'price', 'compareAtPrice', 'sku', 'stock', 'image', 'images', 'isActive', 'isFeatured', 'specifications', 'categoryId', 'createdAt', 'updatedAt']);
    await checkTableColumns('components', ['id', 'name', 'brand', 'model', 'slug', 'description', 'price', 'stock', 'image', 'specifications', 'compatibility', 'socketType', 'wattage', 'isActive', 'isFeatured', 'categoryId', 'createdAt', 'updatedAt']);
    await checkTableColumns('orders', ['id', 'orderNumber', 'status', 'subtotal', 'tax', 'shipping', 'total', 'shippingAddress', 'billingAddress', 'paymentIntentId', 'paymentStatus', 'notes', 'userId', 'createdAt', 'updatedAt']);

    // 3. Check foreign keys
    console.log('\n3. RELACIONES (FOREIGN KEYS):');
    const fks = await client.query(`
      SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `);
    
    const expectedFKs: Record<string, string[]> = {
      'accounts': ['users'],
      'sessions': ['users'],
      'products': ['categories'],
      'components': ['component_categories'],
      'pc_builds': ['users'],
      'pc_build_items': ['pc_builds', 'components'],
      'carts': ['users'],
      'cart_items': ['carts', 'products', 'pc_builds'],
      'orders': ['users'],
      'order_items': ['orders', 'products'],
      'reviews': ['products', 'users']
    };
    
    for (const [table, refTables] of Object.entries(expectedFKs)) {
      const tableFKs = fks.rows.filter((r: { table_name: string }) => r.table_name === table);
      const foundRefs = tableFKs.map((r: { foreign_table_name: string }) => r.foreign_table_name);
      const missing = refTables.filter(r => !foundRefs.includes(r));
      if (missing.length > 0) {
        console.log(`  ❌ ${table} → faltan FK a: ${missing.join(', ')}`);
      } else {
        console.log(`  ✓ ${table}`);
      }
    }

    // 4. Check indexes
    console.log('\n4. ÍNDICES:');
    const indexes = await client.query(`
      SELECT indexname, tablename FROM pg_indexes 
      WHERE schemaname = 'public' ORDER BY tablename, indexname
    `);
    
    const indexCount: Record<string, number> = {};
    indexes.rows.forEach((r: { tablename: string }) => {
      indexCount[r.tablename] = (indexCount[r.tablename] || 0) + 1;
    });
    
    const tablesNeedingIndexes = ['users', 'products', 'components', 'orders', 'reviews'];
    tablesNeedingIndexes.forEach(t => {
      const count = indexCount[t] || 0;
      console.log(`  ${count > 1 ? '✓' : '⚠️ '} ${t}: ${count} índices`);
    });

    // 5. Check data count
    console.log('\n5. DATOS:');
    const dataCounts = [
      { table: 'users', name: 'Usuarios' },
      { table: 'categories', name: 'Categorías' },
      { table: 'products', name: 'Productos' },
      { table: 'component_categories', name: 'Categorías de componentes' },
      { table: 'components', name: 'Componentes' },
      { table: 'orders', name: 'Órdenes' },
      { table: 'reviews', name: 'Reseñas' },
      { table: 'settings', name: 'Configuraciones' }
    ];
    
    for (const { table, name } of dataCounts) {
      const result = await client.query(`SELECT COUNT(*) FROM "${table}"`);
      const count = parseInt(result.rows[0].count);
      const icon = count > 0 ? '✓' : '⚠️ ';
      console.log(`  ${icon} ${name}: ${count}`);
    }

    // 6. Check admin user
    console.log('\n6. USUARIO ADMIN:');
    const admin = await client.query('SELECT * FROM "users" WHERE role = $1 LIMIT 1', ['ADMIN']);
    if (admin.rows.length > 0) {
      console.log(`  ✓ Admin existe: ${admin.rows[0].email}`);
    } else {
      console.log('  ❌ No hay usuario admin');
      console.log('     Crear uno con: INSERT INTO "users" (id, email, password, name, role)...');
    }

    // 7. Check settings
    console.log('\n7. CONFIGURACIÓN:');
    const settings = await client.query('SELECT key, value FROM "settings"');
    if (settings.rows.length > 0) {
      settings.rows.forEach((s: { key: string; value: string }) => {
        console.log(`  ✓ ${s.key} = ${s.value}`);
      });
    } else {
      console.log('  ❌ No hay configuraciones');
    }

    // 8. Check ENUM types
    console.log('\n8. TIPOS ENUM:');
    const enums = await client.query(`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname IN ('Role', 'OrderStatus', 'ComponentType')
      ORDER BY t.typname, e.enumsortorder
    `);
    
    const enumValues: Record<string, string[]> = {};
    enums.rows.forEach((r: { enum_name: string; enum_value: string }) => {
      if (!enumValues[r.enum_name]) enumValues[r.enum_name] = [];
      enumValues[r.enum_name].push(r.enum_value);
    });
    
    console.log(`  Role: ${enumValues['Role']?.join(', ') || '❌ No existe'}`);
    console.log(`  OrderStatus: ${enumValues['OrderStatus']?.join(', ') || '❌ No existe'}`);
    console.log(`  ComponentType: ${enumValues['ComponentType']?.join(', ') || '❌ No existe'}`);

    // 9. Check triggers
    console.log('\n9. TRIGGERS (updatedAt):');
    const triggers = await client.query(`
      SELECT trigger_name, event_object_table 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
    `);
    
    const triggerTables = triggers.rows.map((r: { event_object_table: string }) => r.event_object_table);
    const tablesWithUpdatedAt = ['users', 'categories', 'products', 'components', 'orders', 'carts'];
    
    tablesWithUpdatedAt.forEach(t => {
      const hasTrigger = triggerTables.includes(t);
      console.log(`  ${hasTrigger ? '✓' : '⚠️ '} ${t}`);
    });

    console.log('\n=== REVISIÓN COMPLETADA ===');
    client.release();
  } catch (error) {
    console.error('Error:', (error as Error).message);
  } finally {
    pool.end();
  }
}

checkDatabase();