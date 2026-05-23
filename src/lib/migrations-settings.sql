-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('iva_rate', '15', 'Porcentaje de IVA aplicado a los productos'),
  ('currency', 'USD', 'Moneda utilizada para precios'),
  ('store_name', 'E-Commerce PC', 'Nombre de la tienda')
ON CONFLICT (key) DO NOTHING;