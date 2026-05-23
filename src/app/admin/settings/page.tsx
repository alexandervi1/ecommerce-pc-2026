"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Settings, Save, Loader2, DollarSign, Activity, LayoutDashboard } from "lucide-react";
import { Card, Button, Input } from "@/components/ui";
import { useToast, ToastProvider } from "@/components/ui/toast";

interface Settings {
  iva_rate: string;
  currency: string;
  store_name: string;
}

function AdminSettingsContent() {
  const [settings, setSettings] = useState<Settings>({
    iva_rate: "15",
    currency: "USD",
    store_name: "E-Commerce PC",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          iva_rate: data.iva_rate || "15",
          currency: data.currency || "USD",
          store_name: data.store_name || "E-Commerce PC",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.addToast({ type: "error", message: "Error al cargar configuración" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        toast.addToast({ type: "success", message: "Configuración guardada correctamente" });
      } else {
        toast.addToast({ type: "error", message: "Error al guardar configuración" });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.addToast({ type: "error", message: "Error al guardar configuración" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-56 bg-bg hero-gradient">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="glass p-10 rounded-[32px] border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link href="/admin" className="text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:text-white transition-colors">← Volver a Base</Link>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Ajustes <span className="text-primary">Núcleo</span></h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">PARAMETRIZACIÓN GLOBAL DEL SISTEMA</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {/* Impuestos Section */}
          <div className="glass p-8 rounded-[32px] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign className="w-32 h-32 text-blue-500" />
            </div>
            
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Protocolos Fiscales</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Configuración de gravámenes y tasas</p>
              </div>
            </div>

            <div className="space-y-6 max-w-lg">
              <Input
                label="IVA OPERATIVO (%)"
                type="number"
                value={settings.iva_rate}
                onChange={(e) => setSettings({ ...settings, iva_rate: e.target.value })}
                className="bg-white/5 border-white/10 text-white font-black text-sm"
              />

              <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                <p className="text-[10px] text-blue-400/70 font-bold uppercase tracking-widest leading-relaxed">
                  <span className="text-blue-400 mr-2">ℹ INFO:</span> Con un IVA del {settings.iva_rate || "0"}%, el sistema calculará automáticamente el margen de beneficio sobre el subtotal de cada arsenal.
                </p>
              </div>
            </div>
          </div>

          {/* General Section */}
          <div className="glass p-8 rounded-[32px] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <LayoutDashboard className="w-32 h-32 text-emerald-500" />
            </div>

            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Settings className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Identidad del Sistema</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Configuración de marca y localización</p>
              </div>
            </div>

            <div className="space-y-8 max-w-lg">
              <Input
                label="NOMBRE DE LA ESTACIÓN"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="bg-white/5 border-white/10 text-white font-black text-sm uppercase"
              />

              <Input
                label="DIVISA DE TRANSACCIÓN"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="bg-white/5 border-white/10 text-white font-black text-sm uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button 
              onClick={handleSave} 
              variant="primary"
              isLoading={saving}
              className="px-10 py-6 rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.3)] text-xs font-black uppercase tracking-[0.2em]"
            >
              <Save className="h-4 w-4 mr-3" />
              SINCRONIZAR CONFIGURACIÓN
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <ToastProvider>
      <AdminSettingsContent />
    </ToastProvider>
  );
}