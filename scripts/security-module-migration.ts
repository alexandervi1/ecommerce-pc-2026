import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function runSecurityMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    console.log('Iniciando migración del módulo de seguridad...');

    await client.query('BEGIN');

    // 1. Add session_version to users (for concurrency control)
    await client.query(`
      ALTER TABLE "auth"."users"
      ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1
    `);
    console.log('✓ Columna session_version agregada a auth.users');

    // 2. Create otp_codes table (stores generated OTPs for 2FA)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "auth"."otp_codes" (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     TEXT        NOT NULL REFERENCES "auth"."users"(id) ON DELETE CASCADE,
        email       TEXT        NOT NULL,
        code        VARCHAR(6)  NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL,
        used        BOOLEAN     NOT NULL DEFAULT FALSE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✓ Tabla auth.otp_codes creada');

    // 3. Create otp_tokens table (one-time tokens exchanged after OTP verification)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "auth"."otp_tokens" (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     TEXT        NOT NULL REFERENCES "auth"."users"(id) ON DELETE CASCADE,
        token       TEXT        NOT NULL UNIQUE,
        expires_at  TIMESTAMPTZ NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✓ Tabla auth.otp_tokens creada');

    // 4. Index for fast OTP lookups by email
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_otp_codes_email
      ON "auth"."otp_codes" (email, expires_at)
      WHERE used = FALSE
    `);

    await client.query('COMMIT');
    console.log('\n✅ Migración completada exitosamente.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error en migración, rollback ejecutado:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSecurityMigration();
