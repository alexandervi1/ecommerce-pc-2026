"use client";

import { useState } from "react";
import { useCompare } from "@/components/compare/compare-context";
import { useCart } from "@/components/providers/cart-context";
import { Button } from "@/components/ui";
import { Scale, Check, ShoppingCart, Zap, Box, Info } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    category?: { name: string } | null;
    stock: number;
  };
}

export function ProductActions({ product }: ProductActionsProps) {
  const { addProduct, removeProduct, isInCompare, canAdd } = useCompare();
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string>("standard");
  const [isAdding, setIsAdding] = useState(false);
  
  const inCompare = isInCompare(product.id);

  const variants = [
    { id: "standard", name: "Standard Edition", premium: 0, description: "Rendimiento base de fábrica" },
    { id: "pro", name: "Pro Overclocked", premium: product.price * 0.15, description: "15% más de potencia con enfriamiento mejorado" },
  ];

  const currentVariant = variants.find(v => v.id === selectedVariant) || variants[0];
  const finalPrice = product.price + currentVariant.premium;

  const handleCompareClick = () => {
    if (inCompare) {
      removeProduct(product.id);
    } else if (canAdd) {
      addProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category?.name || null,
      });
    }
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      addItem({
        productId: product.id,
        name: `${product.name} (${currentVariant.name})`,
        price: finalPrice,
        image: product.image,
        quantity: 1,
        stock: product.stock,
        variant: currentVariant.name,
      });
      setIsAdding(false);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Variant Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Box className="h-3 w-3" />
          Configuración Seleccionada
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariant(v.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                selectedVariant === v.id
                  ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(124,58,237,0.1)]"
                  : "bg-white/5 border-white/5 hover:border-white/20"
              }`}
            >
              {selectedVariant === v.id && (
                <div className="absolute top-0 right-0 p-1.5 bg-primary rounded-bl-xl">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <div className="flex flex-col gap-1 relative z-10">
                <span className={`text-sm font-bold transition-colors ${selectedVariant === v.id ? "text-primary" : "text-white"}`}>
                  {v.name}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">{v.description}</span>
                {v.premium > 0 && (
                  <span className="text-[10px] font-black text-accent mt-1">
                    +{formatPrice(v.premium)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="lg"
          className="flex-grow !py-4 shadow-[0_0_30px_rgba(124,58,237,0.3)] group"
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAdding}
        >
          {isAdding ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              {product.stock > 0 ? `Añadir al arsenal - ${formatPrice(finalPrice)}` : "Sin Stock"}
            </>
          )}
        </Button>
        
        <button
          onClick={handleCompareClick}
          disabled={!inCompare && !canAdd}
          className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-center ${
            inCompare
              ? "bg-primary/20 text-primary border-primary"
              : "bg-white/5 text-gray-400 border-white/10 hover:border-primary/50 hover:text-primary"
          }`}
          title={inCompare ? "Quitar de comparación" : "Añadir a comparación"}
        >
          <Scale className={`h-6 w-6 ${inCompare ? "fill-primary" : ""}`} />
        </button>
      </div>

      <div className="p-4 glass rounded-2xl border-white/5 bg-primary/5 flex gap-3">
        <Info className="h-5 w-5 text-primary shrink-0" />
        <p className="text-[10px] text-gray-400 leading-tight">
          El precio final incluye impuestos y ensamblaje básico. Esta configuración Pro requiere una fuente de poder de al menos 750W.
        </p>
      </div>
    </div>
  );
}