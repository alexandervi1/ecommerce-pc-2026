import bcrypt from "bcryptjs";
import pg from "pg";
import readline from "readline";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:nuevo2029@localhost:5432/ecommerce_pc?schema=public';

async function createAuditor() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  try {
    console.log("\n=== CREAR USUARIO AUDITOR ===\n");
    console.log("Este script creará un usuario auditor con acceso al panel de auditoría.\n");

    const email = await question("Email del auditor: ");
    if (!email || !email.includes("@")) {
      console.log("❌ Email inválido");
      rl.close();
      pool.end();
      return;
    }
    const existingAuditor = await pool.query(
      'SELECT id FROM auth.auditor_credentials WHERE email = $1',
      [email]
    );
    if (existingAuditor.rows.length > 0) {
      console.log("❌ Ya existe un auditor con ese email");
      rl.close();
      pool.end();
      return;
    }
    const existingUser = await pool.query(
      'SELECT id FROM auth.users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      console.log("❌ Ya existe un usuario regular con ese email");
      rl.close();
      pool.end();
      return;
    }
    const name = await question("Nombre del auditor: ");
    if (!name) {
      console.log("❌ Nombre requerido");
      rl.close();
      pool.end();
      return;
    }
    console.log("\nLa contraseña debe tener:");
    console.log("  - Mínimo 8 caracteres");
    console.log("  - Al menos una mayúscula");
    console.log("  - Al menos una minúscula");
    console.log("  - Al menos un número");
    console.log("  - Al menos un carácter especial (!@#$%^&*)\n");
    const password = await question("Contraseña: ");
    if (password.length < 8) {
      console.log("❌ La contraseña debe tener al menos 8 caracteres");
      rl.close();
      pool.end();
      return;
    }
    if (!/[A-Z]/.test(password)) {
      console.log("❌ La contraseña debe tener al menos una mayúscula");
      rl.close();
      pool.end();
      return;
    }
    if (!/[a-z]/.test(password)) {
      console.log("❌ La contraseña debe tener al menos una minúscula");
      rl.close();
      pool.end();
      return;
    }
    if (!/[0-9]/.test(password)) {
      console.log("❌ La contraseña debe tener al menos un número");
      rl.close();
      pool.end();
      return;
    }
    if (!/[!@#$%^&*]/.test(password)) {
      console.log("❌ La contraseña debe tener al menos un carácter especial (!@#$%^&*)");
      rl.close();
      pool.end();
      return;
    }
    const confirmPassword = await question("Confirmar contraseña: ");
    if (password !== confirmPassword) {
      console.log("❌ Las contraseñas no coinciden");
      rl.close();
      pool.end();
      return;
    }
    console.log("\n--- Resumen ---");
    console.log(`Email: ${email}`);
    console.log(`Nombre: ${name}`);
    console.log(`Rol: AUDITOR`);
    console.log("---------------\n");
    const confirm = await question("¿Crear este auditor? (s/n): ");
    if (confirm.toLowerCase() !== "s") {
      console.log("Operación cancelada");
      rl.close();
      pool.end();
      return;
    }
    console.log("\nCreando auditor...");
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO auth.auditor_credentials (email, password_hash, name, is_active, created_at)
       VALUES ($1, $2, $3, true, NOW())
       RETURNING id`,
      [email, passwordHash, name]
    );
    const auditorId = result.rows[0].id;
    console.log("✅ Auditor creado exitosamente");
    console.log(`\nID: ${auditorId}`);
    console.log(`Email: ${email}`);
    console.log(`\nEl auditor puede iniciar sesión en:`);
    console.log(`  - /login (con provider 'auditor')`);
    console.log(`  - Acceder al panel: /admin/audit`);
    rl.close();
  } catch (error) {
    console.error("\n❌ Error:", (error as Error).message);
  } finally {
    pool.end();
  }
}

createAuditor();