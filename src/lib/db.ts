import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Based on the 'list-all-tables.ts' output, almost all tables are in the 'auth' schema.
// A few logs are in the 'audit' schema.
export const SCHEMAS = {
  auth: "auth",
  products: "products",
  components: "components",
  orders: "orders",
  cart: "cart",
  builds: "builds",
  reviews: "reviews",
  settings: "settings",
  audit: "audit",
} as const;

export const TABLE_SCHEMAS: Record<string, string> = {
  users: SCHEMAS.auth,
  accounts: SCHEMAS.auth,
  sessions: SCHEMAS.auth,
  verification_tokens: SCHEMAS.auth,
  auditor_credentials: SCHEMAS.auth,
  otp_codes: SCHEMAS.auth,
  otp_tokens: SCHEMAS.auth,
  products: SCHEMAS.products,
  categories: SCHEMAS.products,
  component_categories: SCHEMAS.components,
  components: SCHEMAS.components,
  compatibility_rules: SCHEMAS.components,
  orders: SCHEMAS.orders,
  order_items: SCHEMAS.orders,
  carts: SCHEMAS.cart,
  cart_items: SCHEMAS.cart,
  pc_builds: SCHEMAS.builds,
  pc_build_items: SCHEMAS.builds,
  reviews: SCHEMAS.reviews,
  settings: SCHEMAS.settings,
  audit_logs: SCHEMAS.audit,
  error_logs: "audit", // Specifically in 'audit' schema
  login_history: "audit", // Specifically in 'audit' schema
};

export function table(tableName: string): string {
  const schema = TABLE_SCHEMAS[tableName] || "public";
  return `"${schema}"."${tableName}"`;
}

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query<Record<string, unknown>>(text, params as (string | number | boolean | null | undefined)[]);
  return result.rows as T[];
}

export async function queryOne<T = unknown>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

export async function execute(text: string, params?: unknown[]): Promise<number> {
  const result = await pool.query(text, params as (string | number | boolean | null | undefined)[]);
  return result.rowCount || 0;
}

export { pool };
