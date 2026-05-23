import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { query, queryOne, table } from "@/lib/db";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";
import { Shield, Activity, AlertTriangle, LogIn, XCircle, Clock, TrendingUp } from "lucide-react";

export default async function AuditorDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "AUDITOR") {
    redirect("/login");
  }

  const [recentLogs, recentErrors, recentLogins, stats] = await Promise.all([
    query<{
      id: string;
      createdAt: Date;
      userEmail: string | null;
      action: string;
      ipAddress: string;
      status: string;
    }>(
      `SELECT id, "createdAt", "userEmail", action, "ipAddress", status 
       FROM ${table("audit_logs")} 
       ORDER BY "createdAt" DESC LIMIT 5`
    ),
    query<{
      id: string;
      timestamp: Date;
      error_type: string;
      error_message: string;
      severity: string;
      resolved: boolean;
    }>(
      `SELECT id, timestamp, error_type, error_message, severity, resolved 
       FROM ${table("error_logs")} 
       ORDER BY timestamp DESC LIMIT 5`
    ),
    query<{
      id: string;
      timestamp: Date;
      email: string;
      event_type: string;
      ip_address: string;
      success: boolean;
    }>(
      `SELECT id, timestamp, email, event_type, ip_address, success 
       FROM ${table("login_history")} 
       ORDER BY timestamp DESC LIMIT 5`
    ),
    queryOne<{
      total_logs: string;
      total_errors: string;
      unresolved_errors: string;
      total_logins: string;
      failed_logins: string;
      logins_today: string;
      errors_today: string;
    }>(`
      SELECT 
        (SELECT COUNT(*) FROM ${table("audit_logs")}) as total_logs,
        (SELECT COUNT(*) FROM ${table("error_logs")}) as total_errors,
        (SELECT COUNT(*) FROM ${table("error_logs")} WHERE resolved = false) as unresolved_errors,
        (SELECT COUNT(*) FROM ${table("login_history")}) as total_logins,
        (SELECT COUNT(*) FROM ${table("login_history")} WHERE success = false) as failed_logins,
        (SELECT COUNT(*) FROM ${table("login_history")} WHERE timestamp >= NOW() - INTERVAL '24 hours') as logins_today,
        (SELECT COUNT(*) FROM ${table("error_logs")} WHERE timestamp >= NOW() - INTERVAL '24 hours') as errors_today
    `),
  ]);

  return (
    <div className="min-h-screen pb-24 pt-56 bg-bg hero-gradient">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="glass p-10 rounded-[40px] border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-amber-500/20 rounded-[28px] flex items-center justify-center border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
              <Shield className="h-10 w-10 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">Consola de Auditoría</h1>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Supervisión e Integridad de Red</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Identidad</p>
              <p className="text-xs font-black text-white uppercase tracking-tight">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Logs Totales",
              value: stats?.total_logs ?? "0",
              icon: Activity,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
            {
              label: "Logins Hoy",
              value: stats?.logins_today ?? "0",
              icon: LogIn,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20",
            },
            {
              label: "Fallos de Login",
              value: stats?.failed_logins ?? "0",
              icon: XCircle,
              color: "text-accent",
              bg: "bg-accent/10",
              border: "border-accent/20",
            },
            {
              label: "Errores Pendientes",
              value: stats?.unresolved_errors ?? "0",
              icon: AlertTriangle,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
            },
          ].map((stat) => (
            <div key={stat.label} className={`glass p-6 rounded-[24px] border ${stat.border} flex items-center gap-4`}>
              <div className={`p-3 ${stat.bg} rounded-xl shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color} leading-none mt-1`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-[32px] border-white/5 h-fit">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Errores Recientes</h2>
              <Link href="/audit?tab=errors" className="text-[10px] font-black text-blue-500 hover:text-white transition-colors uppercase tracking-widest">
                Ver todo →
              </Link>
            </div>
            <div className="space-y-4">
              {recentErrors.length === 0 ? (
                <div className="py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">Silencio Operativo</div>
              ) : (
                recentErrors.map((error: any) => (
                  <div key={error.id} className="p-4 glass rounded-2xl border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className={`text-[8px] py-0.5 px-3 uppercase border-white/10 ${
                        error.severity === "CRITICAL" ? "bg-accent/10 text-accent" :
                        error.severity === "HIGH" ? "bg-amber-500/10 text-amber-500" :
                        "bg-blue-500/10 text-blue-500"
                      }`}>
                        {error.severity}
                      </Badge>
                      <span className={`text-[8px] font-black uppercase ${error.resolved ? "text-emerald-500" : "text-amber-500"}`}>
                        {error.resolved ? "RESUELTO" : "PENDIENTE"}
                      </span>
                    </div>
                    <p className="text-xs font-black text-white uppercase tracking-tight mb-1 truncate">{error.error_type}</p>
                    <p className="text-[10px] text-gray-500 font-bold truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                      {error.error_message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 glass p-8 rounded-[32px] border-white/5 h-fit">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Historial de Login</h2>
              <Link href="/audit?tab=logins" className="text-[10px] font-black text-blue-500 hover:text-white transition-colors uppercase tracking-widest">
                Ver todo →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.01]">
                    <th className="px-4 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Fecha</th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Email</th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Tipo</th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">IP</th>
                    <th className="px-4 py-4 text-right text-[10px] font-black text-gray-600 uppercase tracking-widest">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentLogins.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">
                        Sin Registros de Acceso
                      </td>
                    </tr>
                  ) : (
                    recentLogins.map((login: any) => (
                      <tr key={login.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 py-5 text-[10px] font-mono text-blue-400/70 whitespace-nowrap">
                          {new Date(login.timestamp).toLocaleString("es-ES")}
                        </td>
                        <td className="px-4 py-5 text-xs font-black text-white uppercase tracking-tight">{login.email}</td>
                        <td className="px-4 py-5">
                          <Badge variant="outline" className={`text-[8px] py-0.5 px-3 uppercase border-white/10 ${
                            login.event_type === "LOGIN" ? "bg-emerald-500/10 text-emerald-500" :
                            login.event_type === "LOGOUT" ? "bg-gray-500/10 text-gray-500" :
                            "bg-accent/10 text-accent"
                          }`}>
                            {login.event_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-5 font-mono text-[10px] text-gray-500">
                          {login.ip_address}
                        </td>
                        <td className="px-4 py-5 text-right">
                          <div className={`inline-block w-1.5 h-1.5 rounded-full ${login.success ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-accent shadow-[0_0_10px_rgba(244,63,94,0.5)]"}`} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-8 glass p-8 rounded-[32px] border-white/5">
          <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 text-center">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/audit?tab=logs"
              className="flex items-center gap-4 p-6 glass rounded-2xl border-white/5 hover:border-blue-500/50 transition-all group"
            >
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-[10px] font-black text-white uppercase tracking-widest">Ver Logs</div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-tight">Historial Completo</div>
              </div>
            </Link>
            <Link
              href="/audit?tab=errors"
              className="flex items-center gap-4 p-6 glass rounded-2xl border-white/5 hover:border-accent/50 transition-all group"
            >
              <div className="p-3 bg-accent/10 rounded-xl group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-[10px] font-black text-white uppercase tracking-widest">Errores</div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-tight">Registro Forense</div>
              </div>
            </Link>
            <Link
              href="/audit?tab=logins"
              className="flex items-center gap-4 p-6 glass rounded-2xl border-white/5 hover:border-emerald-500/50 transition-all group"
            >
              <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="text-[10px] font-black text-white uppercase tracking-widest">Logins</div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-tight">Nodos de Acceso</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}