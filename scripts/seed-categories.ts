import pg from 'pg';

async function run() {
  const pool = new pg.Pool({
    connectionString: 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc'
  });

  try {
    const cats = [
      {id: 'cat-gaming', name: 'Gaming', slug: 'gaming', desc: 'Todo para el jugador profesional'},
      {id: 'cat-workstation', name: 'Workstation', slug: 'workstation', desc: 'Estaciones de trabajo de alto rendimiento'},
      {id: 'cat-home', name: 'Equipos de Hogar', slug: 'equipos-hogar', desc: 'Computadoras para uso diario y estudio'}
    ];

    for (const c of cats) {
      await pool.query(
        'INSERT INTO categories (id, name, slug, description) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [c.id, c.name, c.slug, c.desc]
      );
      console.log(`Inserted: ${c.name}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

run();
