"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Cpu, Monitor, CircuitBoard, MemoryStick, HardDrive, Zap,
  Box, Fan, Check, Loader2, ArrowRight, X, Save, ShoppingCart,
  AlertTriangle, ChevronRight, Package, CheckCircle2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge, Button, Card, Skeleton } from "@/components/ui";
import { useCart } from "@/components/providers/cart-context";

/* ─── Types ──────────────────────────────────────────────────── */
interface ComponentCategory {
  id: string;
  name: string;
  slug: string;
  type: string;
  icon: string;
  isRequired: boolean;
}

interface Component {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  stock: number;
  image?: string | null;
  specifications: Record<string, unknown>;
  socketType?: string | null;
  wattage?: number | null;
}

/* ─── Icons per component type ────────────────────────────────── */
const TYPE_ICONS: Record<string, React.ReactNode> = {
  CPU:         <Cpu        className="h-6 w-6" />,
  GPU:         <Monitor    className="h-6 w-6" />,
  MOTHERBOARD: <CircuitBoard className="h-6 w-6" />,
  RAM:         <MemoryStick className="h-6 w-6" />,
  STORAGE:     <HardDrive  className="h-6 w-6" />,
  PSU:         <Zap        className="h-6 w-6" />,
  CASE:        <Box        className="h-6 w-6" />,
  COOLING:     <Fan        className="h-6 w-6" />,
};

const TYPE_COLORS: Record<string, string> = {
  CPU:         "text-violet-400 bg-violet-400/10 border-violet-400/20",
  GPU:         "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  MOTHERBOARD: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  RAM:         "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  STORAGE:     "text-blue-400 bg-blue-400/10 border-blue-400/20",
  PSU:         "text-orange-400 bg-orange-400/10 border-orange-400/20",
  CASE:        "text-gray-400 bg-gray-400/10 border-gray-400/20",
  COOLING:     "text-sky-400 bg-sky-400/10 border-sky-400/20",
};

/* ─── Compatibility check ─────────────────────────────────────── */
function getCompatibilityWarning(
  selected: Record<string, Component | null>
): string | null {
  const cpu = selected["CPU"];
  const mb  = selected["MOTHERBOARD"];
  if (cpu?.socketType && mb?.socketType && cpu.socketType !== mb.socketType) {
    return `Incompatibilidad de socket: CPU (${cpu.socketType}) ≠ Motherboard (${mb.socketType})`;
  }
  return null;
}

/* ─── Component thumbnail ─────────────────────────────────────── */
function CompThumb({ comp, type }: { comp: Component; type: string }) {
  const color = TYPE_COLORS[type] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20";
  if (comp.image) {
    return (
      <img
        src={comp.image}
        alt={comp.name}
        className="w-full h-full object-contain"
      />
    );
  }
  return (
    <div className={`w-full h-full flex items-center justify-center border rounded-2xl ${color}`}>
      {TYPE_ICONS[type] ?? <Package className="h-6 w-6" />}
    </div>
  );
}

/* ─── Main inner component ────────────────────────────────────── */
function BuildPageInner() {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCart();

  const [currentStep, setCurrentStep]     = useState(0);
  const [selected, setSelected]           = useState<Record<string, Component | null>>({});
  const [categories, setCategories]       = useState<ComponentCategory[]>([]);
  const [components, setComponents]       = useState<Record<string, Component[]>>({});
  const [loadingCat, setLoadingCat]       = useState<Record<string, boolean>>({});
  const [buildName, setBuildName]         = useState("Mi PC Personalizada");
  const [ivaRate, setIvaRate]             = useState(15);
  const [saving, setSaving]               = useState(false);
  const [saveSuccess, setSaveSuccess]     = useState(false);
  const [saveError, setSaveError]         = useState("");

  /* Load IVA rate & categories once */
  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => { if (d.iva_rate) setIvaRate(parseFloat(d.iva_rate) || 15); })
      .catch(() => {});

    fetch("/api/categories?type=component")
      .then(r => r.json())
      .then((cats: ComponentCategory[]) => {
        setCategories(cats);
        cats.forEach(cat => loadCategoryComponents(cat));
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCategoryComponents = useCallback((cat: ComponentCategory) => {
    setLoadingCat(prev => ({ ...prev, [cat.type]: true }));
    fetch(`/api/components?categoryId=${cat.id}`)
      .then(r => r.json())
      .then((data: Component[]) => {
        setComponents(prev => ({ ...prev, [cat.type]: data }));
      })
      .catch(console.error)
      .finally(() => setLoadingCat(prev => ({ ...prev, [cat.type]: false })));
  }, []);

  /* Derived values */
  const subtotal = useMemo(
    () => Object.values(selected).reduce((s, c) => s + (c?.price ?? 0), 0),
    [selected]
  );
  const ivaAmount  = subtotal * (ivaRate / 100);
  const totalPrice = subtotal + ivaAmount;

  const totalWattage = useMemo(
    () => Object.values(selected).reduce((s, c) => s + (c?.wattage ?? 0), 0),
    [selected]
  );

  const selectedCount  = Object.values(selected).filter(Boolean).length;
  const requiredCount  = categories.filter(c => c.isRequired).length;
  const allRequiredMet = selectedCount >= requiredCount && requiredCount > 0;
  const compatWarning  = getCompatibilityWarning(selected);
  const currentCat     = categories[currentStep];
  const currentType    = currentCat?.type;

  /* Actions */
  const selectComponent = (type: string, comp: Component) => {
    setSelected(prev => ({ ...prev, [type]: comp }));
    // auto-advance if not on last step
    if (currentStep < categories.length - 1) setCurrentStep(s => s + 1);
  };

  const removeComponent = (type: string) => {
    setSelected(prev => ({ ...prev, [type]: null }));
  };

  const handleSaveBuild = async () => {
    if (!session?.user) {
      router.push("/login?callbackUrl=/build");
      return;
    }
    const ids = Object.values(selected).filter(Boolean).map(c => c!.id);
    if (ids.length === 0) return;

    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: buildName, componentIds: ids }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const d = await res.json();
        setSaveError(d.error ?? "Error al guardar");
      }
    } catch {
      setSaveError("Error de red al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCart = () => {
    Object.values(selected).forEach(comp => {
      if (!comp) return;
      addItem({
        productId: comp.id,
        name: comp.name,
        price: comp.price,
        image: comp.image ?? null,
        quantity: 1,
        stock: comp.stock ?? 99,
        variant: "Componente Build",
      });
    });
  };

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen pb-32 pt-56 bg-bg hero-gradient overflow-x-hidden">

      {/* ── Hero ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <div className="glass p-10 lg:p-16 relative overflow-hidden border-white/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -ml-20 -mb-20 pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase italic">
              Arquitecto de <span className="text-gradient">Sistemas</span>
            </h1>
            <p className="text-muted max-w-2xl text-lg font-medium leading-relaxed">
              Configura tu estación de batalla con validación técnica en tiempo real.
              Ingeniería de precisión para tu próximo despliegue.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8 items-start">

          {/* ── Sidebar: category progress ── */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-32 border-white/5" padding="none">
              <div className="px-4 pt-4 pb-2">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                  Nodos de Configuración
                </p>
                {/* Progress bar */}
                <div className="h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${requiredCount ? (selectedCount / requiredCount) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 font-medium mb-3">
                  {selectedCount}/{requiredCount} requeridos
                </p>
              </div>

              <div className="space-y-0.5 px-2 pb-3">
                {categories.map((cat, idx) => {
                  const isDone   = !!selected[cat.type];
                  const isActive = currentStep === idx;
                  const color    = TYPE_COLORS[cat.type] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20";
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCurrentStep(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? "bg-primary/20 text-white border border-primary/30"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg border ${isActive ? "bg-primary/20 border-primary/30 text-white" : color}`}>
                        <div className="h-4 w-4 flex items-center justify-center">
                          {TYPE_ICONS[cat.type] ?? <Box className="h-4 w-4" />}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-tight flex-1 text-left">
                        {cat.name}
                      </span>
                      {isDone
                        ? <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-emerald-400"}`} />
                        : cat.isRequired
                          ? <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">REQ</span>
                          : null
                      }
                    </button>
                  );
                })}
              </div>
            </Card>
          </aside>

          {/* ── Center: component selector ── */}
          <div className="lg:col-span-2 space-y-6">
            {categories.length === 0 ? (
              /* skeleton while loading categories */
              <div className="space-y-4">
                {[1,2,3].map(n => <Skeleton key={n} className="h-28 w-full rounded-2xl" />)}
              </div>
            ) : currentCat ? (
              <div className="space-y-5">
                {/* Step header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">
                      {currentCat.name}
                    </h2>
                    <p className="text-xs text-muted font-medium mt-0.5">
                      {currentCat.isRequired ? "Componente requerido" : "Componente opcional"}
                      {selected[currentType] && (
                        <span className="ml-2 text-emerald-400 font-bold">• Seleccionado</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {selected[currentType] && (
                      <button
                        onClick={() => removeComponent(currentType)}
                        className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors border border-red-400/20 px-3 py-1.5 rounded-lg hover:bg-red-400/10"
                      >
                        Quitar selección
                      </button>
                    )}
                    <Badge variant="outline" className="border-white/10 text-gray-400 text-[9px]">
                      {components[currentType]?.length ?? 0} disponibles
                    </Badge>
                  </div>
                </div>

                {/* Component cards */}
                {loadingCat[currentType] ? (
                  <div className="space-y-4">
                    {[1,2,3].map(n => <Skeleton key={n} className="h-28 w-full rounded-2xl" />)}
                  </div>
                ) : !components[currentType]?.length ? (
                  <div className="glass rounded-3xl p-12 text-center border-white/5">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${TYPE_COLORS[currentType] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                      {TYPE_ICONS[currentType] ?? <Package className="h-8 w-8" />}
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                      Sin stock disponible en esta categoría
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {components[currentType].map(comp => {
                      const isSelected = selected[currentType]?.id === comp.id;
                      return (
                        <div
                          key={comp.id}
                          onClick={() => selectComponent(currentType, comp)}
                          className={`
                            relative glass rounded-2xl p-5 cursor-pointer group transition-all duration-300
                            hover:border-primary/40 hover:bg-white/5
                            ${isSelected
                              ? "ring-2 ring-primary border-primary/40 bg-primary/5 shadow-[0_0_30px_rgba(124,58,237,0.15)]"
                              : "border-white/5"
                            }
                          `}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.5)]">
                              <Check className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}

                          <div className="flex items-center gap-5">
                            {/* Thumbnail */}
                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-white/2 border border-white/5 p-2 group-hover:scale-105 transition-transform duration-300">
                              <CompThumb comp={comp} type={currentType} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-bold text-sm leading-tight transition-colors ${
                                isSelected ? "text-primary" : "text-white group-hover:text-primary"
                              }`}>
                                {comp.name}
                              </h3>
                              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">
                                {comp.brand} · {comp.model}
                              </p>

                              {/* Spec badges */}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {comp.wattage && (
                                  <span className="inline-flex items-center gap-1 text-[9px] text-yellow-400 font-black uppercase tracking-widest bg-yellow-400/5 border border-yellow-400/15 px-2 py-0.5 rounded-md">
                                    <Zap className="h-2.5 w-2.5" /> {comp.wattage}W
                                  </span>
                                )}
                                {comp.socketType && (
                                  <span className="inline-flex items-center gap-1 text-[9px] text-blue-400 font-black uppercase tracking-widest bg-blue-400/5 border border-blue-400/15 px-2 py-0.5 rounded-md">
                                    <Cpu className="h-2.5 w-2.5" /> {comp.socketType}
                                  </span>
                                )}
                                {comp.stock <= 5 && comp.stock > 0 && (
                                  <span className="text-[9px] text-orange-400 font-black uppercase tracking-widest bg-orange-400/5 border border-orange-400/15 px-2 py-0.5 rounded-md">
                                    Últimas {comp.stock} unidades
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-xl font-black text-white">{formatPrice(comp.price)}</p>
                              <Button
                                variant={isSelected ? "primary" : "secondary"}
                                size="sm"
                                className="mt-2 pointer-events-none text-[9px]"
                              >
                                {isSelected ? "✓ Elegido" : "Elegir"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Step navigation */}
                <div className="flex gap-3 pt-2">
                  {currentStep > 0 && (
                    <Button variant="secondary" size="sm" onClick={() => setCurrentStep(s => s - 1)}>
                      ← Anterior
                    </Button>
                  )}
                  {currentStep < categories.length - 1 && (
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(s => s + 1)} className="ml-auto">
                      Siguiente <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* ── Right sidebar: build summary ── */}
          <aside className="lg:col-span-1">
            <div className="sticky top-32 space-y-4">

              {/* Wattage meter */}
              <Card className="border-white/5 overflow-hidden" padding="none">
                <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/10 p-5 border-b border-white/10">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Carga Estimada
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">{totalWattage}</span>
                    <span className="text-[10px] font-bold text-gray-400 mb-1 uppercase">Watts</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        totalWattage > 800 ? "bg-red-500" : totalWattage > 500 ? "bg-yellow-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min((totalWattage / 1000) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Selected components list */}
                <div className="p-4 space-y-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Componentes Seleccionados
                  </p>
                  {categories.length === 0 ? (
                    <Skeleton className="h-8 w-full" />
                  ) : categories.map(cat => {
                    const comp = selected[cat.type];
                    return (
                      <div key={cat.id} className={`flex items-center gap-2 py-1.5 ${comp ? "" : "opacity-30"}`}>
                        <div className={`w-6 h-6 flex-shrink-0 rounded-lg flex items-center justify-center border text-[10px] ${
                          comp ? (TYPE_COLORS[cat.type] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20") : "border-white/5"
                        }`}>
                          {TYPE_ICONS[cat.type] ?? <Package className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          {comp ? (
                            <p className="text-[10px] font-bold text-white truncate">{comp.name}</p>
                          ) : (
                            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">{cat.name}</p>
                          )}
                        </div>
                        {comp ? (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] font-black text-white">{formatPrice(comp.price)}</span>
                            <button
                              onClick={() => removeComponent(cat.type)}
                              className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">
                            {cat.isRequired ? "—" : "OPC"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="px-4 pb-2 border-t border-white/5 pt-3 space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-300">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                    <span className="text-gray-500">IVA ({ivaRate}%)</span>
                    <span className="text-gray-300">{formatPrice(ivaAmount)}</span>
                  </div>
                  <div className="h-[1px] bg-white/5" />
                  <div className="flex justify-between items-end pb-1">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total</span>
                    <span className="text-2xl font-black text-white">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </Card>

              {/* Compatibility warning */}
              {compatWarning && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-red-400 leading-relaxed">{compatWarning}</p>
                </div>
              )}

              {/* Save error */}
              {saveError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-[10px] text-red-400 font-bold">
                  {saveError}
                </div>
              )}

              {/* Save success */}
              {saveSuccess && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    ¡Build guardada exitosamente!
                  </p>
                </div>
              )}

              {/* Build name input */}
              {selectedCount > 0 && (
                <input
                  type="text"
                  value={buildName}
                  onChange={e => setBuildName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors font-bold placeholder-gray-600"
                  placeholder="Nombre de tu build..."
                />
              )}

              {/* CTA buttons */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  disabled={selectedCount === 0 || saving}
                  isLoading={saving}
                  onClick={handleSaveBuild}
                  className="shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  {session?.user ? "Guardar Build" : "Iniciar Sesión para Guardar"}
                </Button>

                <Button
                  variant="accent"
                  fullWidth
                  size="md"
                  disabled={selectedCount === 0}
                  onClick={handleAddToCart}
                  leftIcon={<ShoppingCart className="h-4 w-4" />}
                >
                  Agregar al Carrito
                </Button>
              </div>

              <p className="text-[9px] text-gray-600 text-center uppercase font-black tracking-widest">
                {!allRequiredMet
                  ? `Faltan ${requiredCount - selectedCount} componentes requeridos`
                  : compatWarning
                    ? "Revisar compatibilidad antes de confirmar"
                    : "✓ Sistema listo para despliegue"
                }
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ─── Default export with Suspense ─────────────────────────────── */
export default function BuildPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg hero-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
            Inicializando Arquitecto de Sistemas...
          </p>
        </div>
      </div>
    }>
      <BuildPageInner />
    </Suspense>
  );
}
