"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cpu, Shield, User, Key, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((session) => {
        if (session?.user) {
          if (session.user.role === "AUDITOR") {
            window.location.href = "/auditor";
          } else if (session.user.role === "ADMIN") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/account";
          }
        } else {
          setCheckingSession(false);
        }
      })
      .catch(() => setCheckingSession(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/initiate-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Credenciales inválidas");
        setIsLoading(false);
        return;
      }

      // Redirect to 2FA page, passing the demo OTP code in the URL
      const params = new URLSearchParams({ email: data.email });
      if (data.otpCode) params.set("demo", data.otpCode);
      router.push(`/verify-2fa?${params.toString()}`);
    } catch {
      setError("Error crítico de sistema. Reintente.");
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F23]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Validando Protocolos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-56 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-md w-full">
        <Card className="border-white/5 relative" padding="lg">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="bg-primary p-4 rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.4)]">
                <Cpu className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">
              Acceso de <span className="text-primary">Usuario</span>
            </h2>
            <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
              ¿Sin registro activo?{" "}
              <Link href="/register" className="text-primary hover:text-white transition-colors">
                Crear ADN
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-tight flex items-center gap-3">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">
                  Terminal ID (Email)
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                    placeholder="terminal@techstore.io"
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">
                  Access Key (Clave)
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              Autenticar Sistema
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Dev Credentials */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Shield className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocolos de Prueba Activos</span>
            </div>
            <div className="space-y-3">
              {[
                { role: "ADMIN", email: "admin@kelectronicaec.com", pass: "password123", color: "text-accent" },
                { role: "CLIENTE", email: "cliente@kelectronicaec.com", pass: "password123", color: "text-emerald-400" },
                { role: "AUDITOR", email: "auditor@kelectronicaec.com", pass: "password123", color: "text-amber-400" },
              ].map((cred) => (
                <div key={cred.role} className="glass p-3 rounded-xl border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${cred.color}`}>{cred.role}</span>
                    <Badge variant="outline" className="text-[8px] py-0">Verified</Badge>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <code className="text-xs text-gray-300 font-mono">{cred.email}</code>
                    <code className="text-[10px] text-gray-500 font-mono">{cred.pass}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
