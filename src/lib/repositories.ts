import { query, queryOne, execute, table } from "./db";
import { v4 as uuidv4 } from "uuid";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stock: number;
  image: string | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  specifications: Record<string, unknown>;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category | null;
  categoryName?: string | null;
  categorySlug?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Component {
  id: string;
  name: string;
  brand: string;
  model: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  specifications: Record<string, unknown>;
  socketType: string | null;
  wattage: number | null;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentCategory {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  icon: string | null;
  isRequired: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Record<string, unknown>;
  paymentIntentId: string | null;
  paymentStatus: string | null;
  notes: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string | null;
  buildName: string | null;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  userId: string | null;
  userEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  error: string | null;
  status: string;
  createdAt: Date;
}

// Categories
export async function getCategories(): Promise<Category[]> {
  return query<Category>(`SELECT * FROM ${table("categories")} WHERE "isActive" = true ORDER BY name`);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return queryOne<Category>(`SELECT * FROM ${table("categories")} WHERE slug = $1`, [slug]);
}

// Products
export async function getProducts(limit?: number): Promise<Product[]> {
  const sql = limit 
    ? `SELECT p.*, c.name as "categoryName", c.slug as "categorySlug" 
       FROM ${table("products")} p 
       LEFT JOIN ${table("categories")} c ON p."categoryId" = c.id 
       WHERE p."isActive" = true 
       ORDER BY p."createdAt" DESC LIMIT $1`
    : `SELECT p.*, c.name as "categoryName", c.slug as "categorySlug" 
       FROM ${table("products")} p 
       LEFT JOIN ${table("categories")} c ON p."categoryId" = c.id 
       WHERE p."isActive" = true 
       ORDER BY p."createdAt" DESC`;
  
  const params = limit ? [limit] : [];
  return query<Product>(sql, params);
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  return query<Product>(
    `SELECT p.*, c.name as "categoryName", c.slug as "categorySlug" 
     FROM ${table("products")} p 
     LEFT JOIN ${table("categories")} c ON p."categoryId" = c.id 
     WHERE p."isActive" = true AND p."isFeatured" = true 
     ORDER BY p."createdAt" DESC LIMIT $1`,
    [limit]
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return queryOne<Product>(
    `SELECT p.*, c.name as "categoryName", c.slug as "categorySlug" 
     FROM ${table("products")} p 
     LEFT JOIN ${table("categories")} c ON p."categoryId" = c.id 
     WHERE p.slug = $1 AND p."isActive" = true`,
    [slug]
  );
}

export async function getProductsCount(): Promise<number> {
  const result = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM ${table("products")} WHERE "isActive" = true`);
  return parseInt(result?.count || "0");
}

// Components
export async function getComponentCategories(): Promise<ComponentCategory[]> {
  return query<ComponentCategory>(`SELECT * FROM ${table("component_categories")} ORDER BY "sortOrder"`);
}

export async function getComponentsByCategory(categoryId: string): Promise<Component[]> {
  return query<Component>(
    `SELECT c.*, cc.name as "categoryName", cc.slug as "categorySlug" 
     FROM ${table("components")} c 
     JOIN ${table("component_categories")} cc ON c."categoryId" = cc.id 
     WHERE c."categoryId" = $1 AND c."isActive" = true 
     ORDER BY c.price`,
    [categoryId]
  );
}

export async function getComponentsByIds(ids: string[]): Promise<Component[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
  return query<Component>(
    `SELECT * FROM ${table("components")} WHERE id IN (${placeholders})`,
    ids
  );
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
  return query<Product>(
    `SELECT * FROM ${table("products")} WHERE id IN (${placeholders})`,
    ids
  );
}

// Users
export async function getUserByEmail(email: string): Promise<(User & { password: string }) | null> {
  return queryOne<User & { password: string }>(
    `SELECT id, email, name, password, role, "createdAt" FROM ${table("users")} WHERE email = $1`,
    [email]
  );
}

export async function getUserById(id: string): Promise<User | null> {
  return queryOne<User>(
    `SELECT id, email, name, role, "createdAt" FROM ${table("users")} WHERE id = $1`,
    [id]
  );
}

export async function createUser(data: { name: string; email: string; password: string }): Promise<string> {
  const id = uuidv4();
  const result = await queryOne<{ id: string }>(
    `INSERT INTO ${table("users")} (id, name, email, password, role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'CLIENT', NOW(), NOW())
     RETURNING id`,
    [id, data.name, data.email, data.password]
  );
  return result!.id;
}

// Orders
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  return query<Order>(
    `SELECT * FROM ${table("orders")} WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
    [userId]
  );
}

export async function getOrderById(id: string): Promise<Order | null> {
  return queryOne<Order>(`SELECT * FROM ${table("orders")} WHERE id = $1`, [id]);
}

export async function getAllOrders(): Promise<Order[]> {
  return query<Order>(`SELECT * FROM ${table("orders")} ORDER BY "createdAt" DESC`);
}

export async function getRecentOrders(limit = 5): Promise<Order[]> {
  return query<Order>(
    `SELECT * FROM ${table("orders")} ORDER BY "createdAt" DESC LIMIT $1`,
    [limit]
  );
}

export async function createOrder(data: {
  orderNumber: string;
  userId: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Record<string, unknown>;
  notes?: string;
}): Promise<string> {
  const result = await queryOne<{ id: string }>(
    `INSERT INTO ${table("orders")} ("orderNumber", "userId", subtotal, tax, shipping, total, "shippingAddress", notes, status, "createdAt", "updatedAt") 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', NOW(), NOW()) 
     RETURNING id`,
    [data.orderNumber, data.userId, data.subtotal, data.tax, data.shipping, data.total, JSON.stringify(data.shippingAddress), data.notes || null]
  );
  return result!.id;
}

export async function createOrderItem(data: {
  orderId: string;
  productId?: string;
  buildName?: string;
  price: number;
  quantity: number;
}): Promise<void> {
  await execute(
    `INSERT INTO ${table("order_items")} ("orderId", "productId", "buildName", price, quantity, "createdAt") 
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [data.orderId, data.productId || null, data.buildName || null, data.price, data.quantity]
  );
}

// Stats
export async function getStats(): Promise<{
  products: number;
  orders: number;
  users: number;
  totalRevenue: number;
  pendingOrders: number;
}> {
  const [products, orders, users, revenue, pending] = await Promise.all([
    queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM ${table("products")}`),
    queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM ${table("orders")}`),
    queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM ${table("users")} WHERE role = 'CLIENT'`),
    queryOne<{ sum: string }>(`SELECT COALESCE(SUM(total), 0) as sum FROM ${table("orders")} WHERE status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')`),
    queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM ${table("orders")} WHERE status = 'PENDING'`),
  ]);

  return {
    products: parseInt(products?.count || "0"),
    orders: parseInt(orders?.count || "0"),
    users: parseInt(users?.count || "0"),
    totalRevenue: parseFloat(revenue?.sum || "0"),
    pendingOrders: parseInt(pending?.count || "0"),
  };
}

// Audit Logs
export async function createAuditLog(data: {
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  userId?: string;
  userEmail?: string;
  error?: string;
  status?: string;
}): Promise<void> {
  await execute(
    `INSERT INTO ${table("audit_logs")} (id, action, entity, "entityId", "oldValue", "newValue", "userId", "userEmail", "ipAddress", "userAgent", error, status, "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'unknown', 'unknown', $9, $10, NOW())`,
    [
      uuidv4(),
      data.action,
      data.entity,
      data.entityId || null,
      data.oldValue ? JSON.stringify(data.oldValue) : null,
      data.newValue ? JSON.stringify(data.newValue) : null,
      data.userId || null,
      data.userEmail || null,
      data.error || null,
      data.status || "SUCCESS",
    ]
  );
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  return query<AuditLog>(
    `SELECT * FROM ${table("audit_logs")} ORDER BY "createdAt" DESC LIMIT $1`,
    [limit]
  );
}

// PC Builds
export async function createPCBuild(data: {
  name: string;
  userId: string;
  totalPrice: number;
  componentIds: string[];
}): Promise<string> {
  const result = await queryOne<{ id: string }>(
    `INSERT INTO ${table("pc_builds")} (name, "userId", "totalPrice", "createdAt", "updatedAt") 
     VALUES ($1, $2, $3, NOW(), NOW()) 
     RETURNING id`,
    [data.name, data.userId, data.totalPrice]
  );
  
  const buildId = result!.id;
  
  for (const componentId of data.componentIds) {
    await execute(
      `INSERT INTO ${table("pc_build_items")} ("buildId", "componentId", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())`,
      [buildId, componentId]
    );
  }
  
  return buildId;
}

export async function getPCBuildsByUserId(userId: string): Promise<unknown[]> {
  const builds = await query<{ id: string; name: string; totalPrice: number; createdAt: Date }>(
    `SELECT * FROM ${table("pc_builds")} WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
    [userId]
  );
  return builds;
}

export async function getPCBuildById(buildId: string): Promise<unknown | null> {
  const build = await queryOne<{ id: string; name: string; "userId": string; totalPrice: number; createdAt: Date }>(
    `SELECT * FROM ${table("pc_builds")} WHERE id = $1`,
    [buildId]
  );
  
  if (!build) return null;
  
  const items = await query<{ componentId: string }>(
    `SELECT "componentId" FROM ${table("pc_build_items")} WHERE "buildId" = $1`,
    [buildId]
  );
  
  const componentIds = items.map(i => i.componentId);
  const components = componentIds.length > 0 ? await getComponentsByIds(componentIds) : [];
  
  const categories = await query<ComponentCategory>(`SELECT * FROM ${table("component_categories")}`);
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  
  const componentsWithType = (components as Component[]).map(comp => ({
    ...comp,
    type: categoryMap.get(comp.categoryId)?.type || null,
  }));
  
  return {
    ...build,
    components: componentsWithType,
  };
}

export async function deletePCBuild(buildId: string, userId: string): Promise<boolean> {
  const result = await execute(
    `DELETE FROM ${table("pc_builds")} WHERE id = $1 AND "userId" = $2`,
    [buildId, userId]
  );
  return result !== null;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  content: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  userName?: string;
}

export async function createReview(data: {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  content?: string;
}): Promise<string> {
  const result = await queryOne<{ id: string }>(
    `INSERT INTO ${table("reviews")} ("productId", "userId", rating, title, content, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING id`,
    [data.productId, data.userId, data.rating, data.title || null, data.content || null]
  );
  return result!.id;
}

export async function getReviewsByProductId(productId: string): Promise<Review[]> {
  return query<Review>(
    `SELECT r.*, u.name as "userName"
     FROM ${table("reviews")} r
     JOIN ${table("users")} u ON r."userId" = u.id
     WHERE r."productId" = $1
     ORDER BY r."createdAt" DESC`,
    [productId]
  );
}

export async function getAverageRating(productId: string): Promise<{ average: number; count: number }> {
  const result = await queryOne<{ average: string; count: string }>(
    `SELECT COALESCE(AVG(rating), 0) as average, COUNT(*) as count
     FROM ${table("reviews")}
     WHERE "productId" = $1`,
    [productId]
  );
  return {
    average: parseFloat(result?.average || "0"),
    count: parseInt(result?.count || "0"),
  };
}

export async function deleteReview(reviewId: string, userId: string): Promise<boolean> {
  const result = await execute(
    `DELETE FROM ${table("reviews")} WHERE id = $1 AND "userId" = $2`,
    [reviewId, userId]
  );
  return result !== null;
}

export async function hasUserReviewedProduct(productId: string, userId: string): Promise<boolean> {
  const result = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM ${table("reviews")} WHERE "productId" = $1 AND "userId" = $2) as exists`,
    [productId, userId]
  );
  return result?.exists || false;
}