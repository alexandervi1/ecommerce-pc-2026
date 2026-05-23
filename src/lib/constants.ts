export const APP_NAME = "PC Store Ecuador";

export const APP_DESCRIPTION = "Tu tienda de componentes PC y computadoras en Ecuador";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const FREE_SHIPPING_THRESHOLD = 150;

export const LOW_STOCK_THRESHOLD = 5;

export const MAX_CART_ITEMS = 99;

export const DEFAULT_PAGE_SIZE = 12;

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const ORDER_STATUSES = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
} as const;

export const PAYMENT_METHODS = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  CARD: "Tarjeta",
} as const;

export const SHIPPING_ZONES = {
  QUITO: { name: "Quito", freeThreshold: 150 },
  GUAYAQUIL: { name: "Guayaquil", freeThreshold: 200 },
  OTHER: { name: "Otros", freeThreshold: 300 },
} as const;

export const DEFAULT_SHIPPING_COST = 15;

export const TAX_RATE = 0.12;

export const CATEGORIES = {
  COMPUTERS: "cat-computers",
  COMPONENTS: "cat-components",
  PERIPHERALS: "cat-peripherals",
  ACCESSORIES: "cat-accessories",
} as const;

export const COMPONENT_TYPES = {
  CPU: "CPU",
  GPU: "GPU",
  MOTHERBOARD: "MOTHERBOARD",
  RAM: "RAM",
  STORAGE: "STORAGE",
  PSU: "PSU",
  CASE: "CASE",
  COOLING: "COOLING",
} as const;

export const SOCKET_TYPES = {
  AM4: "AM4",
  AM5: "AM5",
  LGA1200: "LGA1200",
  LGA1700: "LGA1700",
} as const;

export const MEMORY_TYPES = {
  DDR4: "DDR4",
  DDR5: "DDR5",
} as const;

export const FORM_FACTORS = {
  ATX: "ATX",
  MATX: "mATX",
  ITX: "ITX",
  EATX: "E-ATX",
} as const;

export const SEO_DEFAULTS = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  ogImage: "/og-image.png",
  twitterCard: "summary_large_image",
} as const;

export const TIMEZONE = "America/Guayaquil";

export const DATE_LOCALE = "es-EC";

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  PAGE_SIZE_OPTIONS: [12, 24, 48],
} as const;