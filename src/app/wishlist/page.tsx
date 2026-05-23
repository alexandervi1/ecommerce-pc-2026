"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, Cpu } from "lucide-react";
import { Card, Button, EmptyState, Skeleton } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string | null;
  slug: string;
  stock: number;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setRemoving(productId);
    try {
      await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
      setItems(items.filter(item => item.productId !== productId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-bg min-h-screen pb-32 pt-56 hero-gradient overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="glass p-6 flex gap-4">
                <Skeleton className="w-24 h-24 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen pb-32 pt-56 hero-gradient overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h1 className="text-5xl lg:text-6xl font-black text-white italic tracking-tight uppercase mb-2">
          Mi Wishlist
        </h1>
        <p className="text-muted font-medium leading-relaxed">
          {items.length} producto(s) guardado(s) en tu inventario de interés
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Inventario de Interés Vacío"
            description="Guarda los componentes y periféricos de alto rendimiento que te interesen para monitorear su disponibilidad y equiparlos más tarde."
            actionLabel="Explorar Productos"
            actionHref="/products"
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="flex gap-4 p-6 relative overflow-hidden items-center" hover>
                <Link 
                  href={`/products/${item.slug}`} 
                  className="w-24 h-24 bg-white/2 border border-white/5 rounded-2xl flex-shrink-0 flex items-center justify-center relative overflow-hidden group/img"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                  {item.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-2xl group-hover/img:scale-110 transition-transform duration-500" />
                  ) : (
                    <Cpu className="w-8 h-8 text-white/10 group-hover/img:text-primary/20 transition-all duration-500" />
                  )}
                </Link>
                
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-bold text-white hover:text-primary transition-colors truncate italic text-lg mb-1">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xl font-black text-white">
                    {formatPrice(item.price)}
                  </p>
                  <div>
                    {item.stock > 0 ? (
                      <span className="text-[10px] mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 uppercase tracking-wider">
                        {item.stock} disponibles
                      </span>
                    ) : (
                      <span className="text-[10px] mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 uppercase tracking-wider">
                        Agotado
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 justify-center items-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromWishlist(item.productId)}
                    disabled={removing === item.productId}
                    className="hover:bg-red-500/10 text-gray-400 hover:text-red-400 active:scale-95 p-2 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {item.stock > 0 && (
                    <Button 
                      size="sm" 
                      variant="primary" 
                      leftIcon={<ShoppingCart className="h-4.5 w-4.5" />}
                      className="px-4 py-2 font-black tracking-widest text-[9px] rounded-xl"
                    >
                      Agregar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}