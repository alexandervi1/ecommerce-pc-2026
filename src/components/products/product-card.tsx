"use client";

import Link from "next/link";
import { formatPrice, getStockLabel } from "@/lib/utils";
import { Monitor, Scale, ShoppingBag, Plus, Star } from "lucide-react";
import { useCompare } from "@/components/compare/compare-context";
import { useCart } from "@/components/providers/cart-context";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    description: string | null;
    stock: number;
    isFeatured: boolean;
    image: string | null;
    categoryId: string | null;
    category?: { name: string; slug: string } | null;
  };
}

export function ProductCardSkeleton() {
  return (
    <div className="bento-card border-white/5 flex flex-col h-full bg-white/2 backdrop-blur-xl">
      <Skeleton className="aspect-square rounded-2xl mb-4" />
      <div className="space-y-3 flex-grow flex flex-col p-2">
        <div className="flex justify-between items-start gap-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-4 mt-auto flex items-end justify-between border-t border-white/5">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const { addProduct, removeProduct, isInCompare, canAdd } = useCompare();
  const { addItem } = useCart();
  const inCompare = isInCompare(product.id);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      stock: product.stock,
    });
  };

  const stock = getStockLabel(product.stock);

  return (
    <div className="bento-card group border-white/5 hover:border-primary/40 flex flex-col h-full transition-all duration-500 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] relative overflow-hidden bg-white/2 backdrop-blur-xl">
      {/* Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <Link href={`/products/${product.slug}`} className="block overflow-hidden rounded-2xl relative p-3">
        <div className="aspect-square glass rounded-2xl relative overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-primary/30 transition-colors duration-500">
          {product.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <Monitor className="h-16 w-16 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          )}
          
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.isFeatured && (
              <div className="flex items-center gap-1 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.5)] uppercase tracking-tighter">
                <Star className="h-2.5 w-2.5 fill-current" />
                Elite
              </div>
            )}
            {product.compareAtPrice && (
              <div className="bg-accent text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.5)] uppercase tracking-tighter">
                Oferta
              </div>
            )}
          </div>

          {/* Quick Stats Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 backdrop-blur-[2px]">
            <div className="flex items-center justify-between text-white/80 text-[10px] font-bold uppercase tracking-widest">
              <span>{product.category?.name || "Componente"}</span>
              <span className={product.stock > 0 ? "text-green-400" : "text-red-400"}>
                {product.stock > 0 ? "Disponible" : "Sin Stock"}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-5 pb-5 space-y-3 flex-grow flex flex-col">
        <div className="flex justify-between items-start gap-4">
          <Link href={`/products/${product.slug}`} className="flex-grow">
            <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300 font-display">
              {product.name}
            </h3>
          </Link>
          <button
            onClick={handleCompareClick}
            disabled={!inCompare && !canAdd}
            title={inCompare ? "Quitar de comparación" : "Añadir a comparación"}
            className={`flex-shrink-0 p-2.5 rounded-xl border transition-all duration-300 ${
              inCompare
                ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                : "bg-white/5 text-gray-400 border-white/5 hover:border-primary/50 hover:text-primary hover:bg-primary/5"
            }`}
          >
            <Scale className="h-4.5 w-4.5" />
          </button>
        </div>

        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-medium opacity-80">
          {product.description}
        </p>

        <div className="pt-4 mt-auto flex items-center justify-between border-t border-white/5">
          <div className="flex flex-col">
            {product.compareAtPrice && (
              <span className="text-[10px] text-gray-500 line-through mb-0.5 font-bold">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <span className="text-2xl font-black text-white tracking-tight">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`group/btn relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest overflow-hidden transition-all duration-300 ${
              product.stock === 0
                ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
                : "bg-primary text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] active:scale-95"
            }`}
          >
            {/* Resina Shimmer Effect */}
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-45 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            
            {product.stock === 0 ? (
              "Agotado"
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Arsenal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}