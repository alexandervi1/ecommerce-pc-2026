import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const res = await pool.query(
    `SELECT action, "userEmail", status, error, "createdAt"
     FROM "audit"."audit_logs"
     ORDER BY "createdAt" DESC
     LIMIT 10`
  );

  console.log("\n=== Últimos registros en audit_logs ===");
  res.rows.forEach((r: Record<string, string>) =>
    console.log(
      String(r.action).padEnd(22),
      String(r.status).padEnd(8),
      String(r.userEmail ?? "-").padEnd(35),
      r.error ?? ""
    )
  );
  await pool.end();
}

main();
