"use client";

import { useCart } from "@/components/providers/cart-context";
import { formatPrice } from "@/lib/utils";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Monitor, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui";

export function MiniCart() {
  const { items, removeItem, updateQuantity, subtotal, itemCount, isMiniCartOpen, setIsMiniCartOpen } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsMiniCartOpen(false);
      }
    };

    if (isMiniCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isMiniCartOpen, setIsMiniCartOpen]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] transition-opacity duration-500 ${
          isMiniCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-background/95 border-l border-white/10 z-[101] shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
          isMiniCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">Tu Carrito</h2>
              <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                {itemCount} {itemCount === 1 ? "Componente" : "Componentes"} seleccionados
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsMiniCartOpen(false)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 animate-pulse">
                <ShoppingBag className="h-10 w-10 text-gray-600" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-bold">Tu arsenal está vacío</p>
                <p className="text-sm text-gray-500 max-w-[200px]">Empieza a añadir componentes de alto rendimiento.</p>
              </div>
              <Button 
                variant="primary" 
                onClick={() => setIsMiniCartOpen(false)}
                className="!px-8"
              >
                Explorar Tienda
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="group animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex gap-4 p-4 glass rounded-2xl border-white/5 hover:border-white/10 transition-all relative">
                  <div className="w-20 h-20 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/5">
                    {item.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Monitor className="h-8 w-8 text-white/10" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 pr-6">
                      {item.name}
                    </h3>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{item.variant || "Standard"}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-black text-white">{formatPrice(item.price)}</span>
                      
                      <div className="flex items-center bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-white/5 border-t border-white/10 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Envío Estimado</span>
                <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest">Calculado en checkout</span>
              </div>
              <div className="h-[1px] bg-white/10 my-4" />
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-white uppercase tracking-widest">Total Estimado</span>
                <span className="text-2xl font-black text-white tracking-tighter">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/cart" onClick={() => setIsMiniCartOpen(false)} className="w-full">
                <Button variant="primary" fullWidth size="lg" className="shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                  Finalizar Compra
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <button 
                onClick={() => setIsMiniCartOpen(false)}
                className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors py-2"
              >
                Seguir equipándome
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-4 py-2 opacity-30 grayscale">
              <div className="h-4 w-8 bg-white/20 rounded" />
              <div className="h-4 w-8 bg-white/20 rounded" />
              <div className="h-4 w-8 bg-white/20 rounded" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
