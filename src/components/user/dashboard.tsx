"use client";

import React, { useState } from "react";
import { useFetch } from "@/lib/hooks";
import { formatPrice, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "next-auth/react";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  User as UserIcon, 
  MapPin, 
  Clock, 
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  LogOut,
  ShoppingBag
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

// --- Types ---

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  createdAt: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  items: OrderItem[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

// --- Components ---

const OrderStatusTimeline = ({ status }: { status: Order["status"] }) => {
  const steps = [
    { key: "PENDING", label: "Recibido", icon: Clock },
    { key: "PROCESSING", label: "Procesando", icon: Package },
    { key: "SHIPPED", label: "Enviado", icon: Truck },
    { key: "DELIVERED", label: "Entregado", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === status);
  const isCancelled = status === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 text-[var(--accent)] font-medium bg-[var(--accent)]/10 px-4 py-2 rounded-full border border-[var(--accent)]/20">
        <AlertCircle size={18} />
        <span>Pedido Cancelado</span>
      </div>
    );
  }

  return (
    <div className="relative flex justify-between w-full max-w-2xl mx-auto py-8">
      {/* Connector Line */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2" />
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-[var(--success)] -translate-y-1/2 transition-all duration-1000" 
        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <div key={step.key} className="relative flex flex-col items-center gap-3 z-10">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
              ${isCompleted 
                ? "bg-[var(--success)] border-[var(--success)] text-[var(--bg)]" 
                : "bg-[var(--bg)] border-white/20 text-white/40"}
              ${isCurrent ? "ring-4 ring-[var(--success)]/30 scale-110" : ""}
            `}>
              <Icon size={20} strokeWidth={isCurrent ? 2.5 : 2} />
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${isCompleted ? "text-white" : "text-white/40"}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const DashboardCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`glass rounded-[32px] border-white/5 overflow-hidden group hover:border-white/10 transition-all ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
    <div className="space-y-2">
      <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{title}</h2>
      {description && <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{description}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "addresses">("orders");
  const { data: orders, loading: loadingOrders } = useFetch<Order[]>("/api/orders");
  const { data: profile, loading: loadingProfile } = useFetch<UserProfile>("/api/profile");
  const { data: addresses, loading: loadingAddresses } = useFetch<Address[]>("/api/profile/addresses");

  return (
    <div className="min-h-screen bg-bg hero-gradient pb-32 pt-56">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center border border-accent/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
              <UserIcon className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Centro de <span className="text-accent">Mando</span></h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Bienvenido de vuelta, {profile?.name || "Operador"}</p>
            </div>
          </div>

          <div className="flex gap-3 p-2 glass border-white/5 rounded-[24px] w-fit">
            {[
              { id: "orders", label: "MIS PEDIDOS", icon: Package },
              { id: "profile", label: "MI PERFIL", icon: UserIcon },
              { id: "addresses", label: "DIRECCIONES", icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${activeTab === tab.id 
                      ? "bg-accent text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]" 
                      : "text-gray-500 hover:text-white hover:bg-white/5"}
                  `}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={16} />
              CERRAR SESIÓN
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-12">
          
          {/* ORDERS SECTION */}
          {activeTab === "orders" && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionHeader 
                title="Historial de Arsenal" 
                description="Rastrea y gestiona tus adquisiciones tecnológicas."
              />
              
              {loadingOrders ? (
                <div className="grid gap-6">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-[24px]" />)}
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="grid gap-8">
                  {orders.map((order) => (
                    <DashboardCard key={order.id} className="group transition-all hover:border-white/20">
                      <div className="p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                          {/* Order Meta */}
                          <div className="flex-shrink-0 lg:w-64 space-y-4">
                            <div>
                              <span className="text-xs font-black text-white/30 uppercase tracking-widest block mb-1">ID PEDIDO</span>
                              <code className="text-[var(--primary)] font-mono font-bold text-sm">#{order.id.slice(-8).toUpperCase()}</code>
                            </div>
                            <div>
                              <span className="text-xs font-black text-white/30 uppercase tracking-widest block mb-1">FECHA</span>
                              <span className="text-white font-bold">{formatDate(order.createdAt)}</span>
                            </div>
                            <div>
                              <span className="text-xs font-black text-white/30 uppercase tracking-widest block mb-1">TOTAL</span>
                              <span className="text-2xl font-black text-white tracking-tighter">{formatPrice(order.total)}</span>
                            </div>
                          </div>

                          {/* Tracking & Items */}
                          <div className="flex-grow space-y-8">
                            <OrderStatusTimeline status={order.status} />
                            
                            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                              {order.items.map((item) => (
                                <div key={item.id} className="relative group/item">
                                  <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                    {item.image ? (
                                      /* eslint-disable-next-line @next/next/no-img-element */
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-white/20">
                                        <Package size={24} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="absolute -top-2 -right-2 bg-[var(--primary)] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[var(--bg)]">
                                    {item.quantity}
                                  </div>
                                </div>
                              ))}
                              <button className="ml-auto flex items-center gap-2 text-xs font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest self-center">
                                Detalles Completos <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={ShoppingBag}
                  title="Arsenal Vacío"
                  description="Aún no has realizado ningún pedido. Tu arsenal de hardware te está esperando en el catálogo."
                  actionLabel="Explorar Catálogo"
                  actionHref="/products"
                  className="border-dashed border-2 border-white/5 bg-transparent"
                />
              )}
            </section>
          )}

          {/* PROFILE SECTION */}
          {activeTab === "profile" && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
              <SectionHeader 
                title="Centro de Control" 
                description="Gestiona tu identidad y credenciales de acceso."
              />
              
              {loadingProfile ? (
                <Skeleton className="h-96 w-full rounded-[24px]" />
              ) : (
                <DashboardCard className="p-8">
                  <form className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-white/40 uppercase tracking-widest px-1">NOMBRE COMPLETO</label>
                        <input 
                          type="text" 
                          defaultValue={profile?.name}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-white/40 uppercase tracking-widest px-1">CORREO ELECTRÓNICO</label>
                        <input 
                          type="email" 
                          defaultValue={profile?.email}
                          disabled
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/40 font-bold cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-white/40 uppercase tracking-widest px-1">TELÉFONO</label>
                        <input 
                          type="tel" 
                          defaultValue={profile?.phone}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-white/5 flex justify-end">
                      <button className="bg-[var(--primary)] text-white font-black px-8 py-4 rounded-xl hover:shadow-[0_0_30px_oklch(52%_0.25_285_/_0.4)] transition-all">
                        GUARDAR CAMBIOS
                      </button>
                    </div>
                  </form>
                </DashboardCard>
              )}
            </section>
          )}

          {/* ADDRESSES SECTION */}
          {activeTab === "addresses" && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionHeader 
                title="Puntos de Entrega" 
                description="Tus coordenadas de envío configuradas."
                action={
                  <button className="flex items-center gap-2 bg-white text-black font-black px-6 py-3 rounded-full hover:scale-105 transition-transform">
                    <Plus size={18} /> AGREGAR DIRECCIÓN
                  </button>
                }
              />

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingAddresses ? (
                  [1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-[24px]" />)
                ) : addresses && addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <DashboardCard key={addr.id} className="p-6 relative group">
                      {addr.isDefault && (
                        <div className="absolute top-4 right-4 bg-[var(--success)]/20 text-[var(--success)] text-[10px] font-black px-3 py-1 rounded-full border border-[var(--success)]/20 uppercase tracking-wider">
                          PREDETERMINADA
                        </div>
                      )}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-lg text-white/40">
                            <MapPin size={20} />
                          </div>
                          <h4 className="text-lg font-black text-white tracking-tight uppercase">{addr.label}</h4>
                        </div>
                        <div className="text-[var(--muted)] font-medium leading-relaxed">
                          <p>{addr.street}</p>
                          <p>{addr.city}, {addr.state} {addr.zip}</p>
                          <p>{addr.country}</p>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex gap-4">
                          <button className="text-xs font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1.5">
                            <Edit2 size={12} /> EDITAR
                          </button>
                          <button className="text-xs font-black text-white/40 hover:text-[var(--accent)] transition-colors uppercase tracking-widest flex items-center gap-1.5">
                            <Trash2 size={12} /> ELIMINAR
                          </button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))
                ) : (
                  <EmptyState
                    icon={MapPin}
                    title="Coordenadas No Encontradas"
                    description="No tienes direcciones guardadas en tu sistema de navegación. Agrega una para agilizar tus futuros despliegues."
                    className="col-span-full border-dashed border-2 border-white/5 bg-transparent"
                  />
                )}
              </div>
            </section>
          )}
        </div>

      </div>
    </div>
  );
}
