"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ArrowRight, Loader2, AlertCircle, RefreshCw, Mail } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function Verify2FAContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const demoCode = params.get("demo") ?? "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleDigit = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = code.join("");
    if (enteredCode.length !== 6) {
      setError("Ingrese los 6 dígitos del código");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredCode }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setError(verifyData.error ?? "Código inválido");
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        otpToken: verifyData.token,
        redirect: false,
      });

      if (result?.error) {
        setError("Error al establecer sesión. Intente nuevamente.");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        if (session?.user?.role === "AUDITOR") {
          window.location.href = "/auditor";
        } else if (session?.user?.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }
    } catch {
      setError("Error crítico de sistema. Reintente.");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/initiate-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "" }),
      });
      if (res.ok) {
        setCountdown(300);
        setCode(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
      } else {
        setError("No se pudo reenviar. Vuelva al inicio de sesión.");
      }
    } catch {
      setError("Error al reenviar.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-56 pb-24 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-md w-full">
        <Card className="border-white/5" padding="lg">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="bg-primary p-4 rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.4)]">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">
              Verificación <span className="text-primary">2FA</span>
            </h2>
            <p className="mt-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Código enviado a</p>
            <p className="mt-1 text-sm font-bold text-gray-300 flex items-center justify-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              {email}
            </p>
          </div>

          {/* Demo OTP display */}
          {demoCode && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">
                Modo Demo — Código OTP
              </p>
              <p className="text-2xl font-mono font-black text-amber-300 tracking-[0.3em]">
                {demoCode}
              </p>
              <p className="text-[9px] text-amber-500/70 mt-1">
                En producción este código se enviaría al correo/móvil registrado.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-tight flex items-center gap-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 text-center">
                Ingrese el código de 6 dígitos
              </label>
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-black text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/70 focus:ring-1 focus:ring-primary/30 transition-all"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Expira en{" "}
                <span className={countdown < 60 ? "text-red-400" : "text-primary"}>
                  {formatTime(countdown)}
                </span>
              </p>
            </div>

            <Button
              type="submit"
              fullWidth
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={countdown === 0}
              className="shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              Verificar Código
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResend}
              disabled={resending || countdown > 240}
              className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-40 flex items-center gap-2 mx-auto"
            >
              {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Reenviar código
            </button>
          </div>

          <div className="mt-4 text-center">
            <a
              href="/login"
              className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-gray-400 transition-colors"
            >
              ← Volver al inicio de sesión
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
