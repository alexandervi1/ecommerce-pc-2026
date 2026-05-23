"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "outline" | "primary" | "accent";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-gray-300 border border-white/5",
  primary: "bg-primary/20 text-primary border border-primary/30",
  accent: "bg-accent/20 text-accent border border-accent/30",
  success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  error: "bg-red-500/20 text-red-400 border border-red-500/30",
  info: "bg-sky-500/20 text-sky-400 border border-sky-500/30",
  outline: "bg-transparent border border-white/20 text-gray-300",
};

const dotClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-500",
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-sky-500",
  outline: "bg-gray-400",
};

export function Badge({ children, variant = "default", className = "", dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-lg",
        variantClasses[variant],
        className
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dotClasses[variant])} />}
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  label?: string;
  className?: string;
}

const statusConfig = {
  pending: { variant: "warning" as const, defaultLabel: "Pendiente" },
  paid: { variant: "success" as const, defaultLabel: "Pagado" },
  processing: { variant: "info" as const, defaultLabel: "Procesando" },
  shipped: { variant: "primary" as const, defaultLabel: "Enviado" },
  delivered: { variant: "success" as const, defaultLabel: "Entregado" },
  cancelled: { variant: "error" as const, defaultLabel: "Cancelado" },
};

export function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge variant={config.variant} dot className={className}>
      {label || config.defaultLabel}
    </Badge>
  );
}

interface StockBadgeProps {
  stock: number;
  className?: string;
}

export function StockBadge({ stock, className = "" }: StockBadgeProps) {
  if (stock === 0) {
    return <Badge variant="error" className={className}>Agotado</Badge>;
  }
  if (stock <= 5) {
    return <Badge variant="warning" className={className}>Solo {stock} disponibles</Badge>;
  }
  return <Badge variant="success" className={className}>{stock} stock</Badge>;
}

interface PriceBadgeProps {
  price: number;
  originalPrice?: number;
  className?: string;
}

export function PriceBadge({ price, originalPrice, className = "" }: PriceBadgeProps) {
  if (!originalPrice || originalPrice <= price) return null;
  
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  
  return (
    <Badge variant="accent" className={className}>
      -{discount}%
    </Badge>
  );
}

interface TagProps {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

export function Tag({ children, onRemove, className = "" }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase tracking-tight rounded-lg bg-white/5 border border-white/10 text-gray-300",
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-gray-500 hover:text-white transition-colors"
        >
          ×
        </button>
      )}
    </span>
  );
}
