import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sampleProducts = [
  { name: "Laptop Gaming ASUS ROG", description: "Laptop gaming de alto rendimiento con RTX 4070", price: 1499.99, compareAtPrice: 1699.99, stock: 15, sku: "LAPTOP-ASUS-001" },
  { name: "Monitor Samsung 27\" 144Hz", description: "Monitor gaming de 27 pulgadas con tasa de refresco de 144Hz", price: 299.99, compareAtPrice: 349.99, stock: 42, sku: "MON-SAM-27" },
  { name: "Teclado Mecánico RGB", description: "Teclado mecánico con switches Cherry MX Blue y retroiluminación RGB", price: 89.99, stock: 78, sku: "KB-MECH-001" },
  { name: "Mouse Logitech G Pro X", description: "Mouse gaming inalámbrico con sensor HERO 25K", price: 129.99, compareAtPrice: 149.99, stock: 35, sku: "MOUSE-LOG-GP" },
  { name: "Headset HyperX Cloud II", description: "Audífonos gaming con sonido envolvente 7.1", price: 79.99, stock: 56, sku: "HS-HX-C2" },
  { name: "Webcam Logitech C920", description: "Webcam Full HD 1080p con micrófono estéreo", price: 69.99, stock: 28, sku: "WC-LOG-C920" },
  { name: "Silla Gaming Ergonómica", description: "Silla gaming con soporte lumbar ajustable", price: 299.99, compareAtPrice: 399.99, stock: 12, sku: "CHAIR-GAME-01" },
  { name: "Mousepad XL RGB", description: "Mousepad extra grande con iluminación RGB LED", price: 39.99, stock: 89, sku: "PAD-XL-RGB" },
  { name: "Cable HDMI 2.1 2m", description: "Cable HDMI de alta velocidad 8K/60Hz, 4K/120Hz", price: 19.99, stock: 150, sku: "CABLE-HDMI21-2M" },
  { name: "Hub USB-C 7 en 1", description: "Hub USB-C con HDMI 4K, USB 3.0, SD card reader", price: 49.99, stock: 67, sku: "HUB-USBC-7IN1" },
  { name: "Lámpara LED Monitor Bar", description: "Lámpara de monitor con control táctil y temperatura ajustable", price: 59.99, stock: 45, sku: "LAMP-MON-BAR" },
  { name: "Soporte Monitor Dual", description: "Soporte para dos monitores ajustable en altura y ángulo", price: 89.99, stock: 23, sku: "STAND-DUAL-MON" },
  { name: "Republic of Gamers Backpack", description: "Mochila gaming impermeable para laptop 17\"", price: 79.99, stock: 31, sku: "BAG-ROG-17" },
  { name: "Mouse Bungee", description: "Soporte para cable de mouse con diseño minimalista", price: 24.99, stock: 95, sku: "BUNGEE-001" },
  { name: "Cargador Dominó USB", description: "Cargador con 6 puertos USB de carga rápida hasta 2.4A", price: 34.99, stock: 82, sku: "CHARGER-USB-6P" },
];

async function insertProducts() {
  try {
    for (const product of sampleProducts) {
      const slug = product.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim();

      const id = `prod-${slug}-${Date.now()}`;

      await pool.query(
        `INSERT INTO products (id, name, slug, description, price, "compareAtPrice", sku, stock, "isActive", "isFeatured", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, false, NOW(), NOW())`,
        [id, product.name, slug, product.description, product.price, product.compareAtPrice || null, product.sku, product.stock]
      );
      console.log(`Inserted: ${product.name}`);
    }

    console.log(`\nInserted ${sampleProducts.length} products successfully!`);
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

insertProducts();