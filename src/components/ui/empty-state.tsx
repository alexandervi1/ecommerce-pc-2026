import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  variant?: "default" | "warning" | "error";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className = "",
  variant = "default",
}: EmptyStateProps) {
  const accentColor = variant === "error" ? "oklch(62% 0.22 15)" : "oklch(52% 0.25 285)";
  
  return (
    <div className={cn(
      "relative bg-[oklch(100%_0_0_/_0.05)] backdrop-blur-2xl border border-[oklch(100%_0_0_/_0.1)] rounded-[32px] p-12 text-center overflow-hidden",
      className
    )}>
      {/* Background Decorative Glow */}
      <div 
        className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[100px] opacity-10 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      
      {Icon && (
        <div 
          className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-transform hover:scale-110 duration-500 border border-white/10"
          style={{ backgroundColor: `oklch(from ${accentColor} l c h / 0.1)` }}
        >
          <Icon className="h-12 w-12" style={{ color: accentColor }} />
        </div>
      )}
      
      <h2 className="text-3xl font-black tracking-tighter uppercase font-display italic mb-4 text-[oklch(92%_0.01_250)]">
        {title}
      </h2>
      
      {description && (
        <p className="text-[oklch(70%_0.15_270)] mb-10 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all overflow-hidden"
          style={{ backgroundColor: accentColor }}
        >
          {/* Resin Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -inset-1 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <span className="relative z-10 uppercase tracking-wider">{actionLabel}</span>
          <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          
          <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] rounded-2xl pointer-events-none" />
        </Link>
      )}
    </div>
  );
}

export function EmptyCart() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Arsenal Vacío"
      description="Tu inventario táctico está listo para ser equipado. Explora nuestro catálogo de hardware de alto rendimiento."
      actionLabel="Explorar Productos"
      actionHref="/products"
    />
  );
}

export function EmptySession() {
  return (
    <EmptyState
      icon={ShieldAlert}
      title="Centro de Comando Desconectado"
      description="Para acceder a tu perfil y órdenes, debes autenticar tu identidad en la red de TechStore."
      actionLabel="Iniciar Sesión"
      actionHref="/login"
      variant="error"
    />
  );
}

export function EmptyTable({ title = "No hay datos disponibles", description = "No se encontraron registros en esta sección." }) {
  return (
    <EmptyState
      icon={ShieldAlert}
      title={title}
      description={description}
      variant="default"
    />
  );
}

export function EmptyList({ title = "Lista vacía", description = "No hay elementos para mostrar en este momento." }) {
  return (
    <EmptyState
      icon={ShoppingBag}
      title={title}
      description={description}
      variant="default"
    />
  );
}