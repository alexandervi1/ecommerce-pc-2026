import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:nuevo2029@localhost:5432/ecommerce_pc',
});

const categories = [
  { id: 'cat-cpu', name: 'Procesadores', slug: 'procesadores', description: 'CPUs AMD e Intel' },
  { id: 'cat-gpu', name: 'Tarjetas Gráficas', slug: 'tarjetas-graficas', description: 'GPUs NVIDIA y AMD' },
  { id: 'cat-mb', name: 'Placas Base', slug: 'placas-base', description: 'Motherboards para AMD e Intel' },
  { id: 'cat-ram', name: 'Memoria RAM', slug: 'memoria-ram', description: 'DDR4 y DDR5' },
  { id: 'cat-storage', name: 'Almacenamiento', slug: 'almacenamiento', description: 'SSD NVMe y SATA' },
  { id: 'cat-psu', name: 'Fuentes de Poder', slug: 'fuentes-poder', description: 'PSUs certificadas' },
  { id: 'cat-case', name: 'Gabinetes', slug: 'gabinetes', description: 'Cases para PC' },
  { id: 'cat-cooling', name: 'Refrigeración', slug: 'refrigeracion', description: 'Coolers y sistemas AIO' },
];

const components = [
  // CPUs AMD Ryzen 3000 Series (Zen 2)
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 9 3900X', brand: 'AMD', model: 'Ryzen 9 3900X', price: 399.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=Ryzen+9+3900X', specs: { cores: 12, threads: 24, baseClock: '3.8GHz', boostClock: '4.6GHz', socket: 'AM4', tdp: '165W', cache: '70MB' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 7 3800X', brand: 'AMD', model: 'Ryzen 7 3800X', price: 249.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=Ryzen+7+3800X', specs: { cores: 8, threads: 16, baseClock: '3.9GHz', boostClock: '4.5GHz', socket: 'AM4', tdp: '105W', cache: '36MB' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 5 3600X', brand: 'AMD', model: 'Ryzen 5 3600X', price: 149.99, stock: 30, image: 'https://via.placeholder.com/400x300?text=Ryzen+5+3600X', specs: { cores: 6, threads: 12, baseClock: '3.8GHz', boostClock: '4.4GHz', socket: 'AM4', tdp: '95W', cache: '35MB' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 5 3600', brand: 'AMD', model: 'Ryzen 5 3600', price: 119.99, stock: 40, image: 'https://via.placeholder.com/400x300?text=Ryzen+5+3600', specs: { cores: 6, threads: 12, baseClock: '3.6GHz', boostClock: '4.2GHz', socket: 'AM4', tdp: '65W', cache: '35MB' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 3 3300X', brand: 'AMD', model: 'Ryzen 3 3300X', price: 79.99, stock: 25, image: 'https://via.placeholder.com/400x300?text=Ryzen+3+3300X', specs: { cores: 4, threads: 8, baseClock: '3.8GHz', boostClock: '4.3GHz', socket: 'AM4', tdp: '65W', cache: '18MB' }, isFeatured: false },

  // AMD Ryzen 4000 Series (Zen 2 APUs)
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 7 4700G', brand: 'AMD', model: 'Ryzen 7 4700G', price: 199.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=Ryzen+7+4700G', specs: { cores: 8, threads: 16, baseClock: '3.6GHz', boostClock: '4.4GHz', socket: 'AM4', tdp: '65W', cache: '12MB', integratedGraphics: 'Radeon Graphics' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 5 4600G', brand: 'AMD', model: 'Ryzen 5 4600G', price: 129.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=Ryzen+5+4600G', specs: { cores: 6, threads: 12, baseClock: '3.7GHz', boostClock: '4.2GHz', socket: 'AM4', tdp: '65W', cache: '11MB', integratedGraphics: 'Radeon Graphics' }, isFeatured: false },

  // AMD Ryzen 5000 Series (Zen 3)
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 9 5950X', brand: 'AMD', model: 'Ryzen 9 5950X', price: 549.99, stock: 10, image: 'https://via.placeholder.com/400x300?text=Ryzen+9+5950X', specs: { cores: 16, threads: 32, baseClock: '3.4GHz', boostClock: '4.9GHz', socket: 'AM4', tdp: '105W', cache: '72MB' }, isFeatured: true },
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 9 5900X', brand: 'AMD', model: 'Ryzen 9 5900X', price: 399.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=Ryzen+9+5900X', specs: { cores: 12, threads: 24, baseClock: '3.7GHz', boostClock: '4.8GHz', socket: 'AM4', tdp: '105W', cache: '70MB' }, isFeatured: true },
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 7 5800X', brand: 'AMD', model: 'Ryzen 7 5800X', price: 299.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=Ryzen+7+5800X', specs: { cores: 8, threads: 16, baseClock: '3.8GHz', boostClock: '4.7GHz', socket: 'AM4', tdp: '105W', cache: '36MB' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 5 5600X', brand: 'AMD', model: 'Ryzen 5 5600X', price: 189.99, stock: 30, image: 'https://via.placeholder.com/400x300?text=Ryzen+5+5600X', specs: { cores: 6, threads: 12, baseClock: '3.7GHz', boostClock: '4.6GHz', socket: 'AM4', tdp: '65W', cache: '35MB' }, isFeatured: true },
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 5 5600', brand: 'AMD', model: 'Ryzen 5 5600', price: 139.99, stock: 35, image: 'https://via.placeholder.com/400x300?text=Ryzen+5+5600', specs: { cores: 6, threads: 12, baseClock: '3.5GHz', boostClock: '4.4GHz', socket: 'AM4', tdp: '65W', cache: '35MB' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 5 5500', brand: 'AMD', model: 'Ryzen 5 5500', price: 99.99, stock: 40, image: 'https://via.placeholder.com/400x300?text=Ryzen+5+5500', specs: { cores: 6, threads: 12, baseClock: '3.6GHz', boostClock: '4.2GHz', socket: 'AM4', tdp: '65W', cache: '19MB' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 7 5800X3D', brand: 'AMD', model: 'Ryzen 7 5800X3D', price: 299.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=Ryzen+7+5800X3D', specs: { cores: 8, threads: 16, baseClock: '3.4GHz', boostClock: '4.5GHz', socket: 'AM4', tdp: '105W', cache: '96MB', vCache: '3D V-Cache' }, isFeatured: true },
  { categoryId: 'cat-cpu', name: 'AMD Ryzen 5 5600GT', brand: 'AMD', model: 'Ryzen 5 5600GT', price: 149.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=Ryzen+5+5600GT', specs: { cores: 6, threads: 12, baseClock: '3.9GHz', boostClock: '4.6GHz', socket: 'AM4', tdp: '65W', cache: '19MB', integratedGraphics: 'Radeon Graphics' }, isFeatured: false },

  // Intel 10th Gen (Comet Lake)
  { categoryId: 'cat-cpu', name: 'Intel Core i9-10900K', brand: 'Intel', model: 'Core i9-10900K', price: 449.99, stock: 10, image: 'https://via.placeholder.com/400x300?text=Core+i9-10900K', specs: { cores: 10, threads: 20, baseClock: '3.7GHz', boostClock: '5.3GHz', socket: 'LGA1200', tdp: '125W', cache: '20MB' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'Intel Core i7-10700K', brand: 'Intel', model: 'Core i7-10700K', price: 299.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=Core+i7-10700K', specs: { cores: 8, threads: 16, baseClock: '3.8GHz', boostClock: '5.1GHz', socket: 'LGA1200', tdp: '125W', cache: '16MB' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'Intel Core i5-10600K', brand: 'Intel', model: 'Core i5-10600K', price: 199.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=Core+i5-10600K', specs: { cores: 6, threads: 12, baseClock: '4.1GHz', boostClock: '4.8GHz', socket: 'LGA1200', tdp: '125W', cache: '12MB' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'Intel Core i5-10400F', brand: 'Intel', model: 'Core i5-10400F', price: 129.99, stock: 30, image: 'https://via.placeholder.com/400x300?text=Core+i5-10400F', specs: { cores: 6, threads: 12, baseClock: '2.9GHz', boostClock: '4.3GHz', socket: 'LGA1200', tdp: '65W', cache: '12MB' }, isFeatured: false },

  // Intel 11th Gen (Rocket Lake)
  { categoryId: 'cat-cpu', name: 'Intel Core i9-11900K', brand: 'Intel', model: 'Core i9-11900K', price: 399.99, stock: 10, image: 'https://via.placeholder.com/400x300?text=Core+i9-11900K', specs: { cores: 8, threads: 16, baseClock: '3.5GHz', boostClock: '5.3GHz', socket: 'LGA1200', tdp: '125W', cache: '16MB' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'Intel Core i7-11700K', brand: 'Intel', model: 'Core i7-11700K', price: 299.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=Core+i7-11700K', specs: { cores: 8, threads: 16, baseClock: '3.6GHz', boostClock: '5.0GHz', socket: 'LGA1200', tdp: '125W', cache: '16MB' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'Intel Core i5-11600K', brand: 'Intel', model: 'Core i5-11600K', price: 199.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=Core+i5-11600K', specs: { cores: 6, threads: 12, baseClock: '3.9GHz', boostClock: '4.9GHz', socket: 'LGA1200', tdp: '125W', cache: '12MB' }, isFeatured: false },

  // Intel 12th Gen (Alder Lake)
  { categoryId: 'cat-cpu', name: 'Intel Core i9-12900K', brand: 'Intel', model: 'Core i9-12900K', price: 569.99, stock: 10, image: 'https://via.placeholder.com/400x300?text=Core+i9-12900K', specs: { cores: 16, threads: 24, baseClock: '3.2GHz', boostClock: '5.2GHz', socket: 'LGA1700', tdp: '125W', cache: '30MB' }, isFeatured: true },
  { categoryId: 'cat-cpu', name: 'Intel Core i7-12700K', brand: 'Intel', model: 'Core i7-12700K', price: 399.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=Core+i7-12700K', specs: { cores: 12, threads: 20, baseClock: '3.6GHz', boostClock: '5.0GHz', socket: 'LGA1700', tdp: '125W', cache: '25MB' }, isFeatured: true },
  { categoryId: 'cat-cpu', name: 'Intel Core i5-12600K', brand: 'Intel', model: 'Core i5-12600K', price: 249.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=Core+i5-12600K', specs: { cores: 10, threads: 16, baseClock: '3.7GHz', boostClock: '4.9GHz', socket: 'LGA1700', tdp: '125W', cache: '20MB' }, isFeatured: false },
  { categoryId: 'cat-cpu', name: 'Intel Core i5-12400F', brand: 'Intel', model: 'Core i5-12400F', price: 149.99, stock: 30, image: 'https://via.placeholder.com/400x300?text=Core+i5-12400F', specs: { cores: 6, threads: 12, baseClock: '2.5GHz', boostClock: '4.4GHz', socket: 'LGA1700', tdp: '65W', cache: '18MB' }, isFeatured: false },

  // GPUs NVIDIA GTX 1600 Series
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce GTX 1660 Super', brand: 'NVIDIA', model: 'GTX 1660 Super', price: 199.99, stock: 25, image: 'https://via.placeholder.com/400x300?text=GTX+1660+Super', specs: { vram: '6GB GDDR6', memoryBus: '192-bit', cores: 1408, tdp: '125W', length: '225mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce GTX 1660 Ti', brand: 'NVIDIA', model: 'GTX 1660 Ti', price: 229.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=GTX+1660+Ti', specs: { vram: '6GB GDDR6', memoryBus: '192-bit', cores: 1536, tdp: '120W', length: '225mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce GTX 1650 Super', brand: 'NVIDIA', model: 'GTX 1650 Super', price: 129.99, stock: 30, image: 'https://via.placeholder.com/400x300?text=GTX+1650+Super', specs: { vram: '4GB GDDR6', memoryBus: '128-bit', cores: 1280, tdp: '100W', length: '200mm' }, isFeatured: false },

  // NVIDIA RTX 2000 Series (Turing)
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce RTX 2080 Ti', brand: 'NVIDIA', model: 'RTX 2080 Ti', price: 799.99, stock: 8, image: 'https://via.placeholder.com/400x300?text=RTX+2080+Ti', specs: { vram: '11GB GDDR6', memoryBus: '352-bit', cores: 4352, tdp: '250W', length: '270mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce RTX 2080 Super', brand: 'NVIDIA', model: 'RTX 2080 Super', price: 599.99, stock: 10, image: 'https://via.placeholder.com/400x300?text=RTX+2080+Super', specs: { vram: '8GB GDDR6', memoryBus: '256-bit', cores: 3072, tdp: '250W', length: '270mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce RTX 2070 Super', brand: 'NVIDIA', model: 'RTX 2070 Super', price: 449.99, stock: 12, image: 'https://via.placeholder.com/400x300?text=RTX+2070+Super', specs: { vram: '8GB GDDR6', memoryBus: '256-bit', cores: 2560, tdp: '215W', length: '267mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce RTX 2060 Super', brand: 'NVIDIA', model: 'RTX 2060 Super', price: 299.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=RTX+2060+Super', specs: { vram: '8GB GDDR6', memoryBus: '256-bit', cores: 2176, tdp: '175W', length: '228mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce RTX 2060', brand: 'NVIDIA', model: 'RTX 2060', price: 249.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=RTX+2060', specs: { vram: '6GB GDDR6', memoryBus: '192-bit', cores: 1920, tdp: '160W', length: '228mm' }, isFeatured: false },

  // NVIDIA RTX 3000 Series (Ampere)
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce RTX 3090', brand: 'NVIDIA', model: 'RTX 3090', price: 1499.99, stock: 5, image: 'https://via.placeholder.com/400x300?text=RTX+3090', specs: { vram: '24GB GDDR6X', memoryBus: '384-bit', cores: 10496, tdp: '350W', length: '336mm' }, isFeatured: true },
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce RTX 3080 Ti', brand: 'NVIDIA', model: 'RTX 3080 Ti', price: 1199.99, stock: 8, image: 'https://via.placeholder.com/400x300?text=RTX+3080+Ti', specs: { vram: '12GB GDDR6X', memoryBus: '384-bit', cores: 10240, tdp: '350W', length: '285mm' }, isFeatured: true },
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce RTX 3080', brand: 'NVIDIA', model: 'RTX 3080', price: 899.99, stock: 10, image: 'https://via.placeholder.com/400x300?text=RTX+3080', specs: { vram: '10GB GDDR6X', memoryBus: '320-bit', cores: 8704, tdp: '320W', length: '285mm' }, isFeatured: true },
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce RTX 3070 Ti', brand: 'NVIDIA', model: 'RTX 3070 Ti', price: 699.99, stock: 12, image: 'https://via.placeholder.com/400x300?text=RTX+3070+Ti', specs: { vram: '8GB GDDR6X', memoryBus: '256-bit', cores: 6144, tdp: '290W', length: '267mm' }, isFeatured: true },
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce RTX 3070', brand: 'NVIDIA', model: 'RTX 3070', price: 499.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=RTX+3070', specs: { vram: '8GB GDDR6', memoryBus: '256-bit', cores: 5888, tdp: '220W', length: '242mm' }, isFeatured: true },
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce RTX 3060 Ti', brand: 'NVIDIA', model: 'RTX 3060 Ti', price: 399.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=RTX+3060+Ti', specs: { vram: '8GB GDDR6', memoryBus: '256-bit', cores: 4864, tdp: '200W', length: '242mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce RTX 3060', brand: 'NVIDIA', model: 'RTX 3060', price: 329.99, stock: 25, image: 'https://via.placeholder.com/400x300?text=RTX+3060', specs: { vram: '12GB GDDR6', memoryBus: '192-bit', cores: 3584, tdp: '170W', length: '242mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'NVIDIA GeForce RTX 3050', brand: 'NVIDIA', model: 'RTX 3050', price: 249.99, stock: 30, image: 'https://via.placeholder.com/400x300?text=RTX+3050', specs: { vram: '8GB GDDR6', memoryBus: '128-bit', cores: 2560, tdp: '130W', length: '200mm' }, isFeatured: false },

  // AMD RX 5000 Series (RDNA)
  { categoryId: 'cat-gpu', name: 'AMD Radeon RX 5700 XT', brand: 'AMD', model: 'RX 5700 XT', price: 399.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=RX+5700+XT', specs: { vram: '8GB GDDR6', memoryBus: '256-bit', cores: 2560, tdp: '225W', length: '270mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'AMD Radeon RX 5700', brand: 'AMD', model: 'RX 5700', price: 349.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=RX+5700', specs: { vram: '8GB GDDR6', memoryBus: '256-bit', cores: 2304, tdp: '180W', length: '270mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'AMD Radeon RX 5600 XT', brand: 'AMD', model: 'RX 5600 XT', price: 279.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=RX+5600+XT', specs: { vram: '6GB GDDR6', memoryBus: '192-bit', cores: 2304, tdp: '150W', length: '240mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'AMD Radeon RX 5500 XT', brand: 'AMD', model: 'RX 5500 XT', price: 179.99, stock: 25, image: 'https://via.placeholder.com/400x300?text=RX+5500+XT', specs: { vram: '8GB GDDR6', memoryBus: '128-bit', cores: 1408, tdp: '130W', length: '200mm' }, isFeatured: false },

  // AMD RX 6000 Series (RDNA 2)
  { categoryId: 'cat-gpu', name: 'AMD Radeon RX 6900 XT', brand: 'AMD', model: 'RX 6900 XT', price: 999.99, stock: 8, image: 'https://via.placeholder.com/400x300?text=RX+6900+XT', specs: { vram: '16GB GDDR6', memoryBus: '256-bit', cores: 5120, tdp: '300W', length: '267mm' }, isFeatured: true },
  { categoryId: 'cat-gpu', name: 'AMD Radeon RX 6800 XT', brand: 'AMD', model: 'RX 6800 XT', price: 799.99, stock: 10, image: 'https://via.placeholder.com/400x300?text=RX+6800+XT', specs: { vram: '16GB GDDR6', memoryBus: '256-bit', cores: 4608, tdp: '300W', length: '267mm' }, isFeatured: true },
  { categoryId: 'cat-gpu', name: 'AMD Radeon RX 6800', brand: 'AMD', model: 'RX 6800', price: 649.99, stock: 12, image: 'https://via.placeholder.com/400x300?text=RX+6800', specs: { vram: '16GB GDDR6', memoryBus: '256-bit', cores: 3840, tdp: '250W', length: '267mm' }, isFeatured: true },
  { categoryId: 'cat-gpu', name: 'AMD Radeon RX 6750 XT', brand: 'AMD', model: 'RX 6750 XT', price: 449.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=RX+6750+XT', specs: { vram: '12GB GDDR6', memoryBus: '192-bit', cores: 2560, tdp: '250W', length: '240mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'AMD Radeon RX 6700 XT', brand: 'AMD', model: 'RX 6700 XT', price: 379.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=RX+6700+XT', specs: { vram: '12GB GDDR6', memoryBus: '192-bit', cores: 2560, tdp: '230W', length: '240mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'AMD Radeon RX 6650 XT', brand: 'AMD', model: 'RX 6650 XT', price: 299.99, stock: 25, image: 'https://via.placeholder.com/400x300?text=RX+6650+XT', specs: { vram: '8GB GDDR6', memoryBus: '128-bit', cores: 2048, tdp: '180W', length: '240mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'AMD Radeon RX 6600 XT', brand: 'AMD', model: 'RX 6600 XT', price: 269.99, stock: 25, image: 'https://via.placeholder.com/400x300?text=RX+6600+XT', specs: { vram: '8GB GDDR6', memoryBus: '128-bit', cores: 2048, tdp: '160W', length: '235mm' }, isFeatured: false },
  { categoryId: 'cat-gpu', name: 'AMD Radeon RX 6600', brand: 'AMD', model: 'RX 6600', price: 229.99, stock: 30, image: 'https://via.placeholder.com/400x300?text=RX+6600', specs: { vram: '8GB GDDR6', memoryBus: '128-bit', cores: 1792, tdp: '132W', length: '235mm' }, isFeatured: false },

  // Motherboards AMD AM4
  { categoryId: 'cat-mb', name: 'ASUS ROG Crosshair VIII Hero', brand: 'ASUS', model: 'ROG Crosshair VIII Hero', price: 399.99, stock: 8, image: 'https://via.placeholder.com/400x300?text=Crosshair+VIII+Hero', specs: { socket: 'AM4', chipset: 'X570', memoryType: 'DDR4', maxMemory: '128GB', formFactor: 'ATX', wifi: 'WiFi 6' }, isFeatured: true },
  { categoryId: 'cat-mb', name: 'MSI MEG X570 ACE', brand: 'MSI', model: 'MEG X570 ACE', price: 349.99, stock: 10, image: 'https://via.placeholder.com/400x300?text=MEG+X570+ACE', specs: { socket: 'AM4', chipset: 'X570', memoryType: 'DDR4', maxMemory: '128GB', formFactor: 'ATX', wifi: 'WiFi 6' }, isFeatured: true },
  { categoryId: 'cat-mb', name: 'Gigabyte X570 AORUS Master', brand: 'Gigabyte', model: 'X570 AORUS Master', price: 299.99, stock: 12, image: 'https://via.placeholder.com/400x300?text=X570+AORUS+Master', specs: { socket: 'AM4', chipset: 'X570', memoryType: 'DDR4', maxMemory: '128GB', formFactor: 'ATX', wifi: 'WiFi 6' }, isFeatured: false },
  { categoryId: 'cat-mb', name: 'ASUS TUF Gaming X570-Plus', brand: 'ASUS', model: 'TUF Gaming X570-Plus', price: 179.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=TUF+X570+Plus', specs: { socket: 'AM4', chipset: 'X570', memoryType: 'DDR4', maxMemory: '128GB', formFactor: 'ATX', wifi: 'WiFi 5' }, isFeatured: false },
  { categoryId: 'cat-mb', name: 'MSI B550 TOMAHAWK', brand: 'MSI', model: 'B550 TOMAHAWK', price: 159.99, stock: 25, image: 'https://via.placeholder.com/400x300?text=B550+TOMAHAWK', specs: { socket: 'AM4', chipset: 'B550', memoryType: 'DDR4', maxMemory: '128GB', formFactor: 'ATX', wifi: 'WiFi 6' }, isFeatured: false },
  { categoryId: 'cat-mb', name: 'ASUS ROG Strix B550-F Gaming', brand: 'ASUS', model: 'ROG Strix B550-F', price: 179.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=ROG+Strix+B550-F', specs: { socket: 'AM4', chipset: 'B550', memoryType: 'DDR4', maxMemory: '128GB', formFactor: 'ATX', wifi: 'WiFi 6' }, isFeatured: false },
  { categoryId: 'cat-mb', name: 'Gigabyte B550M DS3H', brand: 'Gigabyte', model: 'B550M DS3H', price: 79.99, stock: 40, image: 'https://via.placeholder.com/400x300?text=B550M+DS3H', specs: { socket: 'AM4', chipset: 'B550', memoryType: 'DDR4', maxMemory: '64GB', formFactor: 'mATX', wifi: 'No' }, isFeatured: false },
  { categoryId: 'cat-mb', name: 'MSI A320M-A PRO', brand: 'MSI', model: 'A320M-A PRO', price: 49.99, stock: 50, image: 'https://via.placeholder.com/400x300?text=A320M-A+PRO', specs: { socket: 'AM4', chipset: 'A320', memoryType: 'DDR4', maxMemory: '32GB', formFactor: 'mATX', wifi: 'No' }, isFeatured: false },

  // Motherboards Intel LGA1200
  { categoryId: 'cat-mb', name: 'ASUS ROG Maximus XII Hero', brand: 'ASUS', model: 'ROG Maximus XII Hero', price: 399.99, stock: 8, image: 'https://via.placeholder.com/400x300?text=Maximus+XII+Hero', specs: { socket: 'LGA1200', chipset: 'Z490', memoryType: 'DDR4', maxMemory: '128GB', formFactor: 'ATX', wifi: 'WiFi 6' }, isFeatured: true },
  { categoryId: 'cat-mb', name: 'MSI MEG Z490 ACE', brand: 'MSI', model: 'MEG Z490 ACE', price: 349.99, stock: 10, image: 'https://via.placeholder.com/400x300?text=MEG+Z490+ACE', specs: { socket: 'LGA1200', chipset: 'Z490', memoryType: 'DDR4', maxMemory: '128GB', formFactor: 'E-ATX', wifi: 'WiFi 6' }, isFeatured: true },
  { categoryId: 'cat-mb', name: 'Gigabyte Z490 AORUS Master', brand: 'Gigabyte', model: 'Z490 AORUS Master', price: 299.99, stock: 12, image: 'https://via.placeholder.com/400x300?text=Z490+AORUS+Master', specs: { socket: 'LGA1200', chipset: 'Z490', memoryType: 'DDR4', maxMemory: '128GB', formFactor: 'ATX', wifi: 'WiFi 6' }, isFeatured: false },
  { categoryId: 'cat-mb', name: 'ASUS TUF Gaming Z490-Plus', brand: 'ASUS', model: 'TUF Gaming Z490-Plus', price: 179.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=TUF+Z490+Plus', specs: { socket: 'LGA1200', chipset: 'Z490', memoryType: 'DDR4', maxMemory: '128GB', formFactor: 'ATX', wifi: 'No' }, isFeatured: false },
  { categoryId: 'cat-mb', name: 'MSI MPG B460I GAMING EDGE', brand: 'MSI', model: 'MPG B460I', price: 129.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=MPG+B460I', specs: { socket: 'LGA1200', chipset: 'B460', memoryType: 'DDR4', maxMemory: '64GB', formFactor: 'ITX', wifi: 'WiFi 6' }, isFeatured: false },

  // Motherboards Intel LGA1700 (DDR4)
  { categoryId: 'cat-mb', name: 'ASUS ROG Strix Z690-E Gaming WiFi', brand: 'ASUS', model: 'ROG Strix Z690-E', price: 449.99, stock: 10, image: 'https://via.placeholder.com/400x300?text=ROG+Strix+Z690-E', specs: { socket: 'LGA1700', chipset: 'Z690', memoryType: 'DDR4', maxMemory: '128GB', formFactor: 'ATX', wifi: 'WiFi 6E' }, isFeatured: true },
  { categoryId: 'cat-mb', name: 'MSI MAG Z690 Tomahawk WiFi', brand: 'MSI', model: 'MAG Z690 Tomahawk', price: 229.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=MAG+Z690+Tomahawk', specs: { socket: 'LGA1700', chipset: 'Z690', memoryType: 'DDR4', maxMemory: '128GB', formFactor: 'ATX', wifi: 'WiFi 6' }, isFeatured: false },
  { categoryId: 'cat-mb', name: 'Gigabyte Z690 AORUS Ultra', brand: 'Gigabyte', model: 'Z690 AORUS Ultra', price: 299.99, stock: 12, image: 'https://via.placeholder.com/400x300?text=Z690+AORUS+Ultra', specs: { socket: 'LGA1700', chipset: 'Z690', memoryType: 'DDR4', maxMemory: '128GB', formFactor: 'ATX', wifi: 'WiFi 6E' }, isFeatured: false },
  { categoryId: 'cat-mb', name: 'ASUS Prime B660M-A D4', brand: 'ASUS', model: 'Prime B660M-A', price: 109.99, stock: 30, image: 'https://via.placeholder.com/400x300?text=Prime+B660M-A', specs: { socket: 'LGA1700', chipset: 'B660', memoryType: 'DDR4', maxMemory: '64GB', formFactor: 'mATX', wifi: 'No' }, isFeatured: false },

  // RAM DDR4
  { categoryId: 'cat-ram', name: 'G.Skill Trident Z Neo 32GB (2x16GB) DDR4 3600', brand: 'G.Skill', model: 'Trident Z Neo 32GB', price: 109.99, stock: 40, image: 'https://via.placeholder.com/400x300?text=Trident+Z+Neo+DDR4', specs: { capacity: '32GB (2x16GB)', speed: 'DDR4-3600', latency: 'CL16', voltage: '1.35V', rgb: true }, isFeatured: false },
  { categoryId: 'cat-ram', name: 'Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4 3200', brand: 'Corsair', model: 'Vengeance RGB Pro 32GB', price: 89.99, stock: 50, image: 'https://via.placeholder.com/400x300?text=Vengeance+RGB+Pro+DDR4', specs: { capacity: '32GB (2x16GB)', speed: 'DDR4-3200', latency: 'CL16', voltage: '1.35V', rgb: true }, isFeatured: false },
  { categoryId: 'cat-ram', name: 'Kingston Fury Beast 16GB (2x8GB) DDR4 3200', brand: 'Kingston', model: 'Fury Beast 16GB', price: 49.99, stock: 60, image: 'https://via.placeholder.com/400x300?text=Fury+Beast+DDR4', specs: { capacity: '16GB (2x8GB)', speed: 'DDR4-3200', latency: 'CL16', voltage: '1.35V', rgb: false }, isFeatured: false },
  { categoryId: 'cat-ram', name: 'Crucial Ballistix 16GB (2x8GB) DDR4 3600', brand: 'Crucial', model: 'Ballistix 16GB', price: 59.99, stock: 50, image: 'https://via.placeholder.com/400x300?text=Ballistix+DDR4', specs: { capacity: '16GB (2x8GB)', speed: 'DDR4-3600', latency: 'CL16', voltage: '1.35V', rgb: false }, isFeatured: false },
  { categoryId: 'cat-ram', name: 'TeamGroup T-Force Vulcan Z 32GB (2x16GB) DDR4 3200', brand: 'TeamGroup', model: 'Vulcan Z 32GB', price: 79.99, stock: 40, image: 'https://via.placeholder.com/400x300?text=Vulcan+Z+DDR4', specs: { capacity: '32GB (2x16GB)', speed: 'DDR4-3200', latency: 'CL16', voltage: '1.35V', rgb: false }, isFeatured: false },

  // Storage
  { categoryId: 'cat-storage', name: 'Samsung 980 PRO 1TB NVMe PCIe 4.0', brand: 'Samsung', model: '980 PRO 1TB', price: 129.99, stock: 50, image: 'https://via.placeholder.com/400x300?text=Samsung+980+PRO+1TB', specs: { capacity: '1TB', interface: 'PCIe 4.0', readSpeed: '7000MB/s', writeSpeed: '5000MB/s', formFactor: 'M.2' }, isFeatured: true },
  { categoryId: 'cat-storage', name: 'Samsung 970 EVO Plus 1TB NVMe', brand: 'Samsung', model: '970 EVO Plus 1TB', price: 99.99, stock: 45, image: 'https://via.placeholder.com/400x300?text=Samsung+970+EVO+Plus', specs: { capacity: '1TB', interface: 'PCIe 3.0', readSpeed: '3500MB/s', writeSpeed: '3300MB/s', formFactor: 'M.2' }, isFeatured: false },
  { categoryId: 'cat-storage', name: 'WD Black SN750 1TB NVMe', brand: 'Western Digital', model: 'Black SN750 1TB', price: 89.99, stock: 40, image: 'https://via.placeholder.com/400x300?text=WD+Black+SN750', specs: { capacity: '1TB', interface: 'PCIe 3.0', readSpeed: '3470MB/s', writeSpeed: '3000MB/s', formFactor: 'M.2' }, isFeatured: false },
  { categoryId: 'cat-storage', name: 'Sabrent Rocket 4TB NVMe PCIe 4.0', brand: 'Sabrent', model: 'Rocket 4TB', price: 499.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=Sabrent+Rocket+4TB', specs: { capacity: '4TB', interface: 'PCIe 4.0', readSpeed: '7100MB/s', writeSpeed: '6600MB/s', formFactor: 'M.2' }, isFeatured: true },
  { categoryId: 'cat-storage', name: 'Crucial MX500 2TB SATA', brand: 'Crucial', model: 'MX500 2TB', price: 149.99, stock: 35, image: 'https://via.placeholder.com/400x300?text=Crucial+MX500+2TB', specs: { capacity: '2TB', interface: 'SATA III', readSpeed: '560MB/s', writeSpeed: '510MB/s', formFactor: '2.5"' }, isFeatured: false },
  { categoryId: 'cat-storage', name: 'Samsung 870 QVO 2TB SATA', brand: 'Samsung', model: '870 QVO 2TB', price: 159.99, stock: 30, image: 'https://via.placeholder.com/400x300?text=Samsung+870+QVO', specs: { capacity: '2TB', interface: 'SATA III', readSpeed: '560MB/s', writeSpeed: '530MB/s', formFactor: '2.5"' }, isFeatured: false },
  { categoryId: 'cat-storage', name: 'Seagate Barracuda 4TB HDD', brand: 'Seagate', model: 'Barracuda 4TB', price: 79.99, stock: 50, image: 'https://via.placeholder.com/400x300?text=Seagate+Barracuda+4TB', specs: { capacity: '4TB', interface: 'SATA III', readSpeed: '190MB/s', rpm: '5400', formFactor: '3.5"' }, isFeatured: false },

  // PSUs
  { categoryId: 'cat-psu', name: 'Corsair RM850x (850W) 80+ Gold', brand: 'Corsair', model: 'RM850x', price: 139.99, stock: 40, image: 'https://via.placeholder.com/400x300?text=Corsair+RM850x', specs: { power: '850W', efficiency: '80+ Gold', modular: 'Full', fanSize: '135mm' }, isFeatured: true },
  { categoryId: 'cat-psu', name: 'Corsair RM750x (750W) 80+ Gold', brand: 'Corsair', model: 'RM750x', price: 109.99, stock: 45, image: 'https://via.placeholder.com/400x300?text=Corsair+RM750x', specs: { power: '750W', efficiency: '80+ Gold', modular: 'Full', fanSize: '135mm' }, isFeatured: false },
  { categoryId: 'cat-psu', name: 'EVGA SuperNOVA 750 G6', brand: 'EVGA', model: 'SuperNOVA 750 G6', price: 99.99, stock: 35, image: 'https://via.placeholder.com/400x300?text=EVGA+750+G6', specs: { power: '750W', efficiency: '80+ Gold', modular: 'Full', fanSize: '135mm' }, isFeatured: false },
  { categoryId: 'cat-psu', name: 'Seasonic Focus GX-650', brand: 'Seasonic', model: 'Focus GX-650', price: 89.99, stock: 40, image: 'https://via.placeholder.com/400x300?text=Seasonic+Focus+GX-650', specs: { power: '650W', efficiency: '80+ Gold', modular: 'Full', fanSize: '120mm' }, isFeatured: false },
  { categoryId: 'cat-psu', name: 'Thermaltake Smart 500W 80+ White', brand: 'Thermaltake', model: 'Smart 500W', price: 39.99, stock: 60, image: 'https://via.placeholder.com/400x300?text=Thermaltake+Smart+500W', specs: { power: '500W', efficiency: '80+ White', modular: 'Non-modular', fanSize: '120mm' }, isFeatured: false },

  // Cases
  { categoryId: 'cat-case', name: 'NZXT H510 Flow', brand: 'NZXT', model: 'H510 Flow', price: 89.99, stock: 30, image: 'https://via.placeholder.com/400x300?text=NZXT+H510+Flow', specs: { type: 'Mid Tower', formFactor: 'ATX', motherboardSupport: 'ATX/mATX/ITX', maxGPULength: '380mm', fans: '4x 120mm' }, isFeatured: false },
  { categoryId: 'cat-case', name: 'Corsair Carbide 275R', brand: 'Corsair', model: 'Carbide 275R', price: 79.99, stock: 35, image: 'https://via.placeholder.com/400x300?text=Corsair+Carbide+275R', specs: { type: 'Mid Tower', formFactor: 'ATX', motherboardSupport: 'ATX/mATX/ITX', maxGPULength: '370mm', fans: '3x 120mm' }, isFeatured: false },
  { categoryId: 'cat-case', name: 'Cooler Master MasterBox Q300L', brand: 'Cooler Master', model: 'MasterBox Q300L', price: 59.99, stock: 50, image: 'https://via.placeholder.com/400x300?text=MasterBox+Q300L', specs: { type: 'Mid Tower', formFactor: 'mATX', motherboardSupport: 'mATX/mITX', maxGPULength: '360mm', fans: '4x 120mm' }, isFeatured: false },
  { categoryId: 'cat-case', name: 'Fractal Design Pop Mini', brand: 'Fractal Design', model: 'Pop Mini', price: 99.99, stock: 25, image: 'https://via.placeholder.com/400x300?text=Fractal+Pop+Mini', specs: { type: 'Mini Tower', formFactor: 'mATX', motherboardSupport: 'mATX/mITX', maxGPULength: '360mm', fans: '4x 120mm' }, isFeatured: false },
  { categoryId: 'cat-case', name: 'Thermaltake V200 RGB', brand: 'Thermaltake', model: 'V200 RGB', price: 69.99, stock: 40, image: 'https://via.placeholder.com/400x300?text=Thermaltake+V200+RGB', specs: { type: 'Mid Tower', formFactor: 'ATX', motherboardSupport: 'ATX/mATX/ITX', maxGPULength: '380mm', fans: '3x 120mm', rgb: true }, isFeatured: false },

  // Cooling
  { categoryId: 'cat-cooling', name: 'Noctua NH-U14S', brand: 'Noctua', model: 'NH-U14S', price: 89.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=Noctua+NH-U14S', specs: { type: 'Air Cooler', sockets: 'AM4/LGA1200/LGA1700', fans: '1x 140mm', tdp: '150W', height: '165mm' }, isFeatured: false },
  { categoryId: 'cat-cooling', name: 'Noctua NH-L9i', brand: 'Noctua', model: 'NH-L9i', price: 49.99, stock: 25, image: 'https://via.placeholder.com/400x300?text=Noctua+NH-L9i', specs: { type: 'Air Cooler', sockets: 'AM4/LGA1200/LGA1700', fans: '1x 92mm', tdp: '65W', height: '37mm' }, isFeatured: false },
  { categoryId: 'cat-cooling', name: 'be quiet! Silent Loop 2 280', brand: 'be quiet!', model: 'Silent Loop 2 280', price: 129.99, stock: 15, image: 'https://via.placeholder.com/400x300?text=Silent+Loop+2+280', specs: { type: 'AIO Liquid', sockets: 'AM4/LGA1200/LGA1700', radiator: '280mm', fans: '2x 140mm' }, isFeatured: false },
  { categoryId: 'cat-cooling', name: 'Corsair iCUE H100i Elite XT 240', brand: 'Corsair', model: 'H100i Elite XT 240', price: 179.99, stock: 20, image: 'https://via.placeholder.com/400x300?text=Corsair+H100i+Elite', specs: { type: 'AIO Liquid', sockets: 'AM4/LGA1200/LGA1700', radiator: '240mm', fans: '2x 120mm', rgb: true }, isFeatured: true },
  { categoryId: 'cat-cooling', name: 'NZXT Kraken M22 120', brand: 'NZXT', model: 'Kraken M22 120', price: 109.99, stock: 25, image: 'https://via.placeholder.com/400x300?text=NZXT+Kraken+M22', specs: { type: 'AIO Liquid', sockets: 'AM4/LGA1200/LGA1700', radiator: '120mm', fans: '1x 120mm' }, isFeatured: false },
  { categoryId: 'cat-cooling', name: 'Cooler Master Hyper 212 RGB', brand: 'Cooler Master', model: 'Hyper 212 RGB', price: 49.99, stock: 40, image: 'https://via.placeholder.com/400x300?text=Hyper+212+RGB', specs: { type: 'Air Cooler', sockets: 'AM4/LGA1200/LGA1700', fans: '1x 120mm', tdp: '150W', height: '158mm', rgb: true }, isFeatured: false },
];

function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seed() {
  try {
    console.log('Seeding database with extended product catalog...');

    await pool.query('DELETE FROM components');
    await pool.query('DELETE FROM component_categories');
    console.log('Cleared existing data');

    const catTypeMap: Record<string, string> = {
      'cat-cpu': 'CPU',
      'cat-gpu': 'GPU',
      'cat-mb': 'MOTHERBOARD',
      'cat-ram': 'RAM',
      'cat-storage': 'STORAGE',
      'cat-psu': 'PSU',
      'cat-case': 'CASE',
      'cat-cooling': 'COOLING',
    };

    for (const cat of categories) {
      await pool.query(
        `INSERT INTO component_categories (id, name, slug, type, description, "isRequired", "sortOrder", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, true, $6, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [cat.id, cat.name, cat.slug, catTypeMap[cat.id] || cat.slug.toUpperCase(), cat.description, categories.indexOf(cat) + 1]
      );
    }
    console.log('Inserted component_categories');

    for (const comp of components) {
      await pool.query(
        `INSERT INTO components (id, name, brand, model, slug, price, stock, image, specifications, "socketType", "wattage", "isActive", "isFeatured", "categoryId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12, $13, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price`,
        [
          `comp-${generateSlug(comp.name)}`,
          comp.name,
          comp.brand,
          comp.model,
          generateSlug(comp.name),
          comp.price,
          comp.stock,
          comp.image,
          JSON.stringify(comp.specs),
          comp.specs.socket || comp.specs.sockets || null,
          comp.specs.tdp ? parseInt(comp.specs.tdp) : null,
          comp.isFeatured,
          comp.categoryId
        ]
      );
    }
    console.log(`Inserted ${components.length} components`);

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seed();