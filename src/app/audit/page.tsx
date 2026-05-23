import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { query, queryOne, table } from "@/lib/db";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Shield, Activity, AlertTriangle, User, Calendar, ExternalLink, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

interface AuditLog {
  id: string;
  createdAt: Date;
  userId: string | null;
  userEmail: string | null;
  ipAddress: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  oldValue: any;
  newValue: any;
  status: string;
  error: string | null;
}

interface ErrorLog {
  id: string;
  timestamp: Date;
  error_type: string;
  error_message: string;
  request_path: string | null;
  request_method: string | null;
  severity: string;
  resolved: boolean;
}

interface LoginHistory {
  id: string;
  email: string;
  event_type: string;
  ip_address: string;
  location_city: string | null;
  location_country: string | null;
  success: boolean;
  failure_reason: string | null;
  timestamp: Date;
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const session = await auth();

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "AUDITOR")) {
    redirect("/");
  }

  const params = await searchParams;
  const tab = params.tab || "logs";
  const page = parseInt(params.page || "1");
  const limit = 50;
  const offset = (page - 1) * limit;

  const [auditLogs, errorLogs, loginHistory, stats] = await Promise.all([
    query<AuditLog>(
      `SELECT * FROM ${table("audit_logs")} ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    query<ErrorLog>(
      `SELECT * FROM ${table("error_logs")} ORDER BY timestamp DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    query<LoginHistory>(
      `SELECT * FROM ${table("login_history")} ORDER BY timestamp DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    queryOne<{
      total_logs: string;
      total_errors: string;
      unresolved_errors: string;
      total_logins: string;
      failed_logins: string;
    }>(`
      SELECT 
        (SELECT COUNT(*) FROM ${table("audit_logs")}) as total_logs,
        (SELECT COUNT(*) FROM ${table("error_logs")}) as total_errors,
        (SELECT COUNT(*) FROM ${table("error_logs")} WHERE resolved = false) as unresolved_errors,
        (SELECT COUNT(*) FROM ${table("login_history")}) as total_logins,
        (SELECT COUNT(*) FROM ${table("login_history")} WHERE success = false) as failed_logins
    `),
  ]);

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      LOGIN: "bg-green-100 text-green-700",
      LOGOUT: "bg-gray-100 text-gray-700",
      FAILED_LOGIN: "bg-red-100 text-red-700",
      CREATE: "bg-green-100 text-green-700",
      UPDATE: "bg-blue-100 text-blue-700",
      DELETE: "bg-red-100 text-red-700",
      READ: "bg-gray-100 text-gray-700",
    };
    return colors[action] || "bg-gray-100 text-gray-700";
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-gray-100 text-gray-700",
      MEDIUM: "bg-yellow-100 text-yellow-700",
      HIGH: "bg-orange-100 text-orange-700",
      CRITICAL: "bg-red-100 text-red-700",
    };
    return colors[severity] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen pb-24 pt-56 bg-bg hero-gradient">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="glass p-10 rounded-[32px] border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link href={session.user.role === "ADMIN" ? "/admin" : "/"} className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] hover:text-white transition-colors">← Volver a Base</Link>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Auditoría <span className="text-blue-500">Forense</span></h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">MONITOREO DE ACTIVIDAD EN TIEMPO REAL</p>
            </div>
          </div>
          <div className="px-6 py-3 glass rounded-2xl border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">SISTEMA NOMINAL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HUD Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          {[
            { label: "TOTAL LOGS", val: stats?.total_logs, icon: Activity, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "ERRORES CRÍTICOS", val: stats?.unresolved_errors, icon: AlertTriangle, color: "text-accent", bg: "bg-accent/10" },
            { label: "INICIOS SESIÓN", val: stats?.total_logins, icon: Shield, color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { label: "INTENTOS FALLIDOS", val: stats?.failed_logins, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10" },
            { label: "NODOS IP ÚNICOS", val: auditLogs.filter((l: any) => l.ipAddress && l.ipAddress !== "unknown").length, icon: Activity, color: "text-purple-400", bg: "bg-purple-400/10" },
          ].map((stat, i) => (
            <div key={i} className="glass p-6 rounded-3xl border-white/5 hover:border-white/10 transition-all">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 border border-white/5`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black text-white tracking-tighter mb-1">{stat.val || "0"}</p>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-[40px] overflow-hidden border-white/5">
          <div className="border-b border-white/5 bg-white/[0.02]">
            <nav className="flex px-4">
              {[
                { id: "logs", label: "LOGS DE AUDITORÍA" },
                { id: "errors", label: "REGISTRO DE ERRORES" },
                { id: "logins", label: "HISTORIAL DE ACCESO" },
              ].map((t) => (
                <Link
                  key={t.id}
                  href={`?tab=${t.id}`}
                  className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                    tab === t.id
                      ? "border-blue-500 text-blue-500 bg-blue-500/5"
                      : "border-transparent text-gray-500 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>

            {tab === "logs" && (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.01]">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Timestamp</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Operador</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">IP Origen</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Acción</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Entidad</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-600 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6 font-mono text-[10px] text-blue-400/70 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("es-ES")}
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-white uppercase tracking-tight">{log.userEmail || "SISTEMA"}</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase">ID: {log.userId?.substring(0, 8) || "N/A"}</p>
                      </td>
                      <td className="px-8 py-6 font-mono text-[10px] text-gray-500">
                        {log.ipAddress}
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="outline" className={`text-[8px] py-0.5 px-3 uppercase border-white/10 ${getActionBadge(log.action)}`}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{log.entity}</p>
                        {log.entityId && <p className="text-[8px] text-gray-600">ID: {log.entityId}</p>}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${log.status === "SUCCESS" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-accent shadow-[0_0_10px_rgba(244,63,94,0.5)]"}`} />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{log.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          {tab === "errors" && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.01]">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Timestamp</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Severidad</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Tipo de Error</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Mensaje / Traza</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Nodo (Ruta)</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-600 uppercase tracking-widest">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {errorLogs.map((error) => (
                    <tr key={error.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6 font-mono text-[10px] text-blue-400/70 whitespace-nowrap">
                        {new Date(error.timestamp).toLocaleString("es-ES")}
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="outline" className={`text-[8px] py-0.5 px-3 uppercase border-white/10 ${getSeverityBadge(error.severity)}`}>
                          {error.severity}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-white uppercase tracking-tight">{error.error_type}</p>
                      </td>
                      <td className="px-8 py-6 max-w-md">
                        <p className="text-[10px] text-gray-400 font-bold leading-relaxed truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                          {error.error_message}
                        </p>
                      </td>
                      <td className="px-8 py-6 font-mono text-[10px] text-gray-500 italic">
                        {error.request_method} {error.request_path}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${error.resolved ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-accent shadow-[0_0_10px_rgba(244,63,94,0.5)]"}`} />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">
                            {error.resolved ? "RESUELTO" : "PENDIENTE"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "logins" && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.01]">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Timestamp</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Email de Acceso</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Tipo de Evento</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Dirección IP</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest">Geolocalización</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-600 uppercase tracking-widest">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loginHistory.map((login) => (
                    <tr key={login.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6 font-mono text-[10px] text-blue-400/70 whitespace-nowrap">
                        {new Date(login.timestamp).toLocaleString("es-ES")}
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-white uppercase tracking-tight">{login.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="outline" className={cn(
                          "text-[8px] py-0.5 px-3 uppercase border-white/10",
                          login.event_type === "LOGIN" ? "bg-emerald-500/10 text-emerald-500" :
                          login.event_type === "LOGOUT" ? "bg-gray-500/10 text-gray-500" :
                          "bg-accent/10 text-accent"
                        )}>
                          {login.event_type}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 font-mono text-[10px] text-gray-500">
                        {login.ip_address}
                      </td>
                      <td className="px-8 py-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {login.location_city && login.location_country
                          ? `${login.location_city}, ${login.location_country}`
                          : "UBICACIÓN DESCONOCIDA"}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${login.success ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-accent shadow-[0_0_10px_rgba(244,63,94,0.5)]"}`} />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">
                              {login.success ? "EXITOSO" : "FALLIDO"}
                            </span>
                          </div>
                          {!login.success && login.failure_reason && (
                            <p className="text-[8px] text-accent font-bold uppercase">{login.failure_reason}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}