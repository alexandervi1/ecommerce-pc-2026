export function formatPrice(price: number | string): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : Number(price);
  return "$" + numPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-EC", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("es-EC", { 
    year: "numeric", 
    month: "short", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING: "Pendiente",
    PAID: "Pagado",
    PROCESSING: "Procesando",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  };
  return labels[status] || status;
}

export function getOrderStatusColor(status: OrderStatus): { bg: string; text: string } {
  const colors: Record<OrderStatus, { bg: string; text: string }> = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-700" },
    PAID: { bg: "bg-blue-100", text: "text-blue-700" },
    PROCESSING: { bg: "bg-purple-100", text: "text-purple-700" },
    SHIPPED: { bg: "bg-orange-100", text: "text-orange-700" },
    DELIVERED: { bg: "bg-green-100", text: "text-green-700" },
    CANCELLED: { bg: "bg-red-100", text: "text-red-700" },
  };
  return colors[status] || { bg: "bg-gray-100", text: "text-gray-700" };
}

export type AuditStatus = "SUCCESS" | "ERROR" | "WARNING";

export function getAuditStatusColor(status: AuditStatus): { bg: string; text: string } {
  const colors: Record<AuditStatus, { bg: string; text: string }> = {
    SUCCESS: { bg: "bg-green-100", text: "text-green-700" },
    ERROR: { bg: "bg-red-100", text: "text-red-700" },
    WARNING: { bg: "bg-yellow-100", text: "text-yellow-700" },
  };
  return colors[status] || { bg: "bg-gray-100", text: "text-gray-700" };
}

export function getStockLabel(stock: number): { label: string; color: string } {
  if (stock === 0) return { label: "Agotado", color: "text-red-600" };
  if (stock <= 5) return { label: `Solo ${stock} disponibles`, color: "text-orange-600" };
  return { label: `${stock} disponibles`, color: "text-green-600" };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function calculateTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getComponentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    CPU: "Procesador",
    GPU: "Tarjeta Gráfica",
    MOTHERBOARD: "Placa Base",
    RAM: "Memoria RAM",
    STORAGE: "Almacenamiento",
    PSU: "Fuente de Poder",
    CASE: "Gabinete",
    COOLING: "Refrigeración",
  };
  return labels[type] || type;
}

export function getComponentTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    CPU: "cpu",
    GPU: "monitor",
    MOTHERBOARD: "circuit-board",
    RAM: "memory-stick",
    STORAGE: "hard-drive",
    PSU: "zap",
    CASE: "box",
    COOLING: "fan",
  };
  return icons[type] || "package";
}
