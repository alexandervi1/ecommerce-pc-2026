"use client";

import { useCart } from "@/components/providers/cart-context";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { EmptyState, Card, Button, Badge } from "@/components/ui";
import { ShoppingCart, Trash2, Plus, Minus, Monitor, ArrowRight, ShieldCheck, Truck, ChevronLeft } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();

  return (
    <div className="bg-bg hero-gradient min-h-screen pb-32 pt-56">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-10">
          <div className="space-y-4">
            <Link href="/products" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all group mb-6">
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Volver al Arsenal
            </Link>
            <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
              Tu <span className="text-accent">Arsenal</span>
            </h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-lg">
              CONFIGURACIÓN TÁCTICA LISTA PARA DESPLIEGUE OPERATIVO.
            </p>
          </div>
          
          <div className="glass px-8 py-6 rounded-[32px] border-white/5 flex items-center gap-10 shadow-2xl">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Items</p>
              <p className="text-2xl font-black text-white italic">{itemCount}</p>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Subtotal</p>
              <p className="text-2xl font-black text-accent italic">{formatPrice(subtotal)}</p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="glass rounded-[48px] p-24 text-center border-white/5 animate-in zoom-in-95 duration-700">
             <div className="w-32 h-32 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                <ShoppingCart className="h-12 w-12 text-gray-700" />
             </div>
             <h2 className="text-4xl font-black text-white uppercase italic tracking-tight mb-6">Arsenal Vacío</h2>
             <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-sm mx-auto mb-12 leading-relaxed">Explora nuestros productos y arma tu setup definitivo con hardware de alto nivel.</p>
             <Link href="/products">
                <Button variant="accent" size="lg" className="!px-16 !py-8 rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                   EXPLORAR CATÁLOGO
                </Button>
             </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="group animate-in fade-in slide-in-from-left-6 duration-700">
                  <div className="glass p-6 sm:p-8 rounded-[40px] border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="w-32 h-32 glass rounded-3xl flex items-center justify-center flex-shrink-0 border-white/10 relative z-10 overflow-hidden p-4">
                      {item.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <Monitor className="h-12 w-12 text-white/5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-center sm:text-left relative z-10">
                      <div className="flex flex-col gap-3">
                        <h3 className="font-black text-white text-xl uppercase tracking-tighter italic group-hover:text-accent transition-colors leading-tight">{item.name}</h3>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-3 items-center">
                          <span className="text-[9px] font-black text-accent uppercase tracking-widest px-3 py-1 rounded-lg bg-accent/10 border border-accent/20">
                            {item.variant || "SISTEMA OPERATIVO"}
                          </span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Stock: {item.stock}</span>
                        </div>
                        <p className="text-3xl font-black text-white mt-4 italic tracking-tighter">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center sm:items-end gap-8 relative z-10">
                      <div className="flex items-center glass border-white/10 rounded-2xl p-1 bg-white/5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-20"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-14 text-center font-black text-white text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-20"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-12 h-12 flex items-center justify-center glass rounded-2xl text-gray-500 hover:text-red-400 hover:border-red-400/30 transition-all shadow-lg"
                          title="Eliminar del arsenal"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-8">
              <div className="glass p-10 rounded-[48px] border-white/5 sticky top-56 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 blur-[80px] rounded-full -mr-20 -mt-20" />
                
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-10 relative z-10 border-b border-white/5 pb-6">Resumen de Misión</h2>
                
                <div className="space-y-6 mb-12 relative z-10">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span>Arsenal Seleccionado</span>
                    <span className="text-white">{itemCount} Unidades</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span>Gravamen (15% IVA)</span>
                    <span className="text-white">{formatPrice(subtotal * 0.15)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span>Logística de Envío</span>
                    <span className="text-emerald-500 flex items-center gap-2">
                       <Truck className="h-4 w-4" />
                       SIN COSTO
                    </span>
                  </div>
                  
                  <div className="h-[1px] bg-white/5 my-8" />
                  
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                       <span className="text-accent font-black uppercase text-[10px] tracking-[0.3em]">Total Despliegue</span>
                    </div>
                    <span className="text-5xl font-black text-white tracking-tighter italic">{formatPrice(subtotal * 1.15)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block relative z-10">
                  <button className="w-full bg-accent text-white py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(244,63,94,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 border border-white/10 group">
                    TRAMITAR DESPLIEGUE
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </button>
                </Link>
                
                <div className="mt-10 grid grid-cols-1 gap-4 relative z-10">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <ShieldCheck className="h-5 w-5 text-accent" />
                    <span className="text-[9px] uppercase tracking-widest font-black text-gray-400">Garantía Operativa (2 Años)</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Truck className="h-5 w-5 text-accent" />
                    <span className="text-[9px] uppercase tracking-widest font-black text-gray-400">Despacho Prioritario 24h</span>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-[32px] border-white/5 text-center bg-white/[0.02]">
                 <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest leading-relaxed">
                   SISTEMA DE PAGOS CIFRADO BAJO PROTOCOLO DE SEGURIDAD KELECTRONICAEC
                 </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
