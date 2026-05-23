"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cpu, User, Mail, Lock, ShieldCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/schemas";
import { Button, Card, Badge } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Falla en la creación de ADN");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Error crítico en los servidores centrales.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-56 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-md w-full">
        <Card className="border-white/5 relative" padding="lg">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="bg-primary p-4 rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.4)]">
                <Cpu className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">Generar <span className="text-primary">Perfil</span></h2>
            <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
              ¿Ya posees credenciales?{" "}
              <Link href="/login" className="text-primary hover:text-white transition-colors">
                Iniciar Secuencia
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-tight flex items-center gap-3">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div className="relative group">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Alias de Sistema</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    {...register("name")}
                    className={`w-full bg-white/5 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-all font-medium`}
                    placeholder="Tu Nombre"
                  />
                </div>
                {errors.name && <p className="mt-1 text-[9px] text-red-400 font-bold uppercase tracking-widest ml-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="relative group">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Enlace de Comunicación (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    {...register("email")}
                    type="email"
                    className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-all font-medium`}
                    placeholder="terminal@techstore.io"
                  />
                </div>
                {errors.email && <p className="mt-1 text-[9px] text-red-400 font-bold uppercase tracking-widest ml-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="relative group">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Clave de Cifrado</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    {...register("password")}
                    type="password"
                    className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-all font-medium`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-[9px] text-red-400 font-bold uppercase tracking-widest ml-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Validación de Clave</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    className={`w-full bg-white/5 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-all font-medium`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-[9px] text-red-400 font-bold uppercase tracking-widest ml-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="mt-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              Registrar Perfil
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
