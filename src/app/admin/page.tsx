"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Package, ShoppingCart, DollarSign, Users, 
  TrendingUp, TrendingDown, AlertTriangle,
  ArrowRight, ShoppingBag, Activity, Settings, LayoutDashboard, Loader2
} from "lucide-react";
import { Card, Badge, StatCard, Button } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { adminApi } from "@/lib/api";

interface AnalyticsData {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalCustomers: number;
    revenueChange: number;
  };
  ordersByStatus: { status: string; count: number }[];
  topProducts: { id: string; name: string; image: string; totalSold: number; totalRevenue: number }[];
  dailySales: { date: string; orders: number; revenue: number }[];
  lowStockProducts: { id: string; name: string; stock: number }[];
  period: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (status !== "authenticated" || session?.user?.role !== "ADMIN") return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.analytics.get(period) as AnalyticsData;
      setData(result);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("No se pudo conectar con el núcleo de datos. Verifique privilegios.");
    } finally {
      setLoading(false);
    }
  }, [period, session?.user?.role, status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchAnalytics();
      }
    }
  }, [status, session, router, fetchAnalytics]);

  if (status === "loading" || (loading && !error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F0F23]">
        <div className="relative">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="h-6 w-6 text-primary/50" />
          </div>
        </div>
        <p className="mt-6 text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Sincronizando Base de Control...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F0F23] p-4">
        <Card className="max-w-md w-full border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Error de Enlace</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            {error || "El sistema no pudo recuperar los datos de analítica. Es posible que el servidor de base de datos no esté respondiendo."}
          </p>
          <Button variant="outline" fullWidth onClick={() => fetchAnalytics()}>
            Reintentar Conexión
          </Button>
          <Link href="/" className="block mt-6 text-xs font-bold text-gray-600 uppercase tracking-widest hover:text-white transition-colors">
            Volver al Sector Civil
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-56 bg-[#0F0F23]">
      {/* Admin Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="glass rounded-3xl p-8 border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight uppercase">Base de <span className="text-primary">Control</span></h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Nivel de Acceso: Administrador • {session?.user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="bg-[#1A1A35] text-xs font-bold uppercase tracking-widest text-white px-4 py-2 outline-none cursor-pointer rounded-xl border-none"
            >
              <option value={7}>Ciclo: 7 Días</option>
              <option value={30}>Ciclo: 30 Días</option>
              <option value={90}>Ciclo: 90 Días</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Transacciones" 
            value={data.overview.totalOrders} 
            icon={<ShoppingBag className="h-5 w-5" />}
          />
          <StatCard 
            title="Ingresos Totales" 
            value={formatPrice(data.overview.totalRevenue)} 
            icon={<DollarSign className="h-5 w-5" />}
            trend={{ value: data.overview.revenueChange, isPositive: data.overview.revenueChange >= 0 }}
          />
          <StatCard 
            title="Ticket Élite" 
            value={formatPrice(data.overview.averageOrderValue)} 
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard 
            title="Clientes Activos" 
            value={data.overview.totalCustomers} 
            icon={<Users className="h-5 w-5" />}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Módulos de Sistema</h3>
                <Badge variant="success" dot>Operativo</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Productos", href: "/admin/products", icon: <Package />, color: "text-blue-400" },
                  { label: "Pedidos", href: "/admin/orders", icon: <ShoppingCart />, color: "text-emerald-400" },
                  { label: "Usuarios", href: "/admin/users", icon: <Users />, color: "text-purple-400" },
                  { label: "Configuración", href: "/admin/settings", icon: <Settings />, color: "text-gray-400" },
                  { label: "Auditoría", href: "/audit", icon: <Activity />, color: "text-amber-400" },
                ].map((mod) => (
                  <Link key={mod.label} href={mod.href}>
                    <div className="glass p-6 rounded-2xl border-white/5 hover:border-primary/50 transition-all text-center group">
                      <div className={`${mod.color} mb-3 flex justify-center group-hover:scale-110 transition-transform`}>{mod.icon}</div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">{mod.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="border-white/5">
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">Estado de Inventario</h3>
              <div className="space-y-4">
                {data.lowStockProducts.length > 0 ? (
                  data.lowStockProducts.map(prod => (
                    <div key={prod.id} className="flex items-center justify-between p-4 glass rounded-xl border-white/5">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-bold text-gray-300">{prod.name}</span>
                      </div>
                      <Badge variant="warning">{prod.stock} Unidades</Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                    Arsenal Completo - Sin Alertas
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Side Info */}
          <div className="space-y-8">
            <Card className="border-primary/20">
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">Productos Élite</h3>
              <div className="space-y-6">
                {data.topProducts.map((prod, idx) => (
                  <div key={prod.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-primary font-black text-xs">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{prod.name}</p>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{prod.totalSold} Vendidos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{formatPrice(prod.totalRevenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-primary/20 to-accent/20 border-white/10">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">Protocolos de Seguridad</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-6 font-medium">
                Cifrado de grado militar activo. Todas las terminales de acceso están siendo monitoreadas por el sistema de auditoría central.
              </p>
              <Link href="/audit">
                <Button variant="secondary" fullWidth size="sm" className="text-[9px] py-3">
                  Consultar Registro de Eventos
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
