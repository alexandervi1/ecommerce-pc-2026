-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS pc_build_items CASCADE;
DROP TABLE IF EXISTS pc_builds CASCADE;
DROP TABLE IF EXISTS components CASCADE;
DROP TABLE IF EXISTS component_categories CASCADE;
DROP TABLE IF EXISTS compatibility_rules CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Create ENUM types
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENT');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "ComponentType" AS ENUM ('CPU', 'GPU', 'MOTHERBOARD', 'RAM', 'STORAGE', 'PSU', 'CASE', 'COOLING');

-- Users table
CREATE TABLE "users" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  role "Role" DEFAULT 'CLIENT',
  "emailVerified" TIMESTAMP,
  image VARCHAR(500),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON "users"(email);

-- Accounts table (for OAuth)
CREATE TABLE "accounts" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  "userId" VARCHAR(100) NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token TEXT,
  session_state VARCHAR(255),
  UNIQUE(provider, "providerAccountId")
);

-- Sessions table
CREATE TABLE "sessions" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
  "userId" VARCHAR(100) NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

-- Verification tokens table
CREATE TABLE "verification_tokens" (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  UNIQUE(identifier, token)
);

-- Categories table
CREATE TABLE "categories" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image VARCHAR(500),
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE "products" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  "compareAtPrice" DECIMAL(10, 2),
  sku VARCHAR(100) UNIQUE,
  stock INTEGER DEFAULT 0,
  image VARCHAR(500),
  images TEXT[] DEFAULT '{}',
  "isActive" BOOLEAN DEFAULT true,
  "isFeatured" BOOLEAN DEFAULT false,
  specifications JSONB DEFAULT '{}',
  "categoryId" VARCHAR(100) REFERENCES "categories"(id),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON "products"("categoryId");
CREATE INDEX idx_products_slug ON "products"(slug);

-- Component categories table
CREATE TABLE "component_categories" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  type "ComponentType" NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  "isRequired" BOOLEAN DEFAULT true,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Components table
CREATE TABLE "components" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image VARCHAR(500),
  specifications JSONB DEFAULT '{}',
  compatibility JSONB DEFAULT '[]',
  "socketType" VARCHAR(100),
  wattage INTEGER,
  "isActive" BOOLEAN DEFAULT true,
  "isFeatured" BOOLEAN DEFAULT false,
  "categoryId" VARCHAR(100) NOT NULL REFERENCES "component_categories"(id),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_components_category ON "components"("categoryId");
CREATE INDEX idx_components_slug ON "components"(slug);

-- Compatibility rules table
CREATE TABLE "compatibility_rules" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  "componentType1" "ComponentType" NOT NULL,
  "componentType2" "ComponentType" NOT NULL,
  rule VARCHAR(255) NOT NULL,
  description TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- PC Builds table
CREATE TABLE "pc_builds" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  name VARCHAR(255) NOT NULL,
  "totalPrice" DECIMAL(10, 2) DEFAULT 0,
  "userId" VARCHAR(100) NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pc_builds_user ON "pc_builds"("userId");

-- PC Build items table
CREATE TABLE "pc_build_items" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  "buildId" VARCHAR(100) NOT NULL REFERENCES "pc_builds"(id) ON DELETE CASCADE,
  "componentId" VARCHAR(100) NOT NULL REFERENCES "components"(id),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("buildId", "componentId")
);

-- Carts table
CREATE TABLE "carts" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  "userId" VARCHAR(100) UNIQUE REFERENCES "users"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Cart items table
CREATE TABLE "cart_items" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  "cartId" VARCHAR(100) NOT NULL REFERENCES "carts"(id) ON DELETE CASCADE,
  "productId" VARCHAR(100) REFERENCES "products"(id) ON DELETE SET NULL,
  "buildId" VARCHAR(100) REFERENCES "pc_builds"(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("cartId", "productId"),
  UNIQUE("cartId", "buildId")
);

-- Orders table
CREATE TABLE "orders" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  "orderNumber" VARCHAR(50) UNIQUE NOT NULL,
  status "OrderStatus" DEFAULT 'PENDING',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  "shippingAddress" JSONB,
  "billingAddress" JSONB,
  "paymentIntentId" VARCHAR(255) UNIQUE,
  "paymentStatus" VARCHAR(50),
  notes TEXT,
  "userId" VARCHAR(100) NOT NULL REFERENCES "users"(id),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON "orders"("userId");
CREATE INDEX idx_orders_status ON "orders"(status);

-- Order items table
CREATE TABLE "order_items" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  "orderId" VARCHAR(100) NOT NULL REFERENCES "orders"(id) ON DELETE CASCADE,
  "productId" VARCHAR(100) REFERENCES "products"(id) ON DELETE SET NULL,
  "buildName" VARCHAR(255),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON "order_items"("orderId");

-- Audit logs table
CREATE TABLE "audit_logs" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  "entityId" VARCHAR(100),
  "oldValue" JSONB,
  "newValue" JSONB,
  "userId" VARCHAR(100),
  "userEmail" VARCHAR(255),
  "ipAddress" VARCHAR(50),
  "userAgent" TEXT,
  error TEXT,
  status VARCHAR(50) DEFAULT 'SUCCESS',
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON "audit_logs"(entity, "entityId");
CREATE INDEX idx_audit_logs_user ON "audit_logs"("userId");
CREATE INDEX idx_audit_logs_created ON "audit_logs"("createdAt");
CREATE INDEX idx_audit_logs_action ON "audit_logs"(action);

-- Reviews table
CREATE TABLE "reviews" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  "productId" VARCHAR(100) NOT NULL REFERENCES "products"(id) ON DELETE CASCADE,
  "userId" VARCHAR(100) NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT,
  "isVerified" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON "reviews"("productId");
CREATE INDEX idx_reviews_user ON "reviews"("userId");

-- Settings table
CREATE TABLE "settings" (
  id VARCHAR(100) PRIMARY KEY DEFAULT REPLACE(gen_random_uuid()::text, '-', ''),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO "settings" (key, value, description) VALUES
  ('iva_rate', '15', 'Porcentaje de IVA aplicado a los productos'),
  ('currency', 'USD', 'Moneda utilizada para precios'),
  ('store_name', 'E-Commerce PC', 'Nombre de la tienda')
ON CONFLICT (key) DO NOTHING;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
DECLARE
  new_number VARCHAR;
BEGIN
  new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON "products" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_component_categories_updated_at BEFORE UPDATE ON "component_categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON "components" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compatibility_rules_updated_at BEFORE UPDATE ON "compatibility_rules" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pc_builds_updated_at BEFORE UPDATE ON "pc_builds" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON "carts" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON "cart_items" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON "orders" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON "settings" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create admin user (password: admin123)
-- Note: In production, change this password!
INSERT INTO "users" (id, email, password, name, role)
VALUES ('admin_01', 'admin@ecommerce.pc', '$2a$10$YourHashedPasswordHere', 'Admin', 'ADMIN')
ON CONFLICT (email) DO NOTHING;