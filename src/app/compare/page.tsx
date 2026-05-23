"use client";

import { useCompare } from "@/components/compare/compare-context";
import { formatPrice } from "@/lib/utils";
import { Monitor, X, ArrowLeft, Scale } from "lucide-react";
import Link from "next/link";
import { Button, Card, EmptyState, Skeleton } from "@/components/ui";
import { useEffect, useState } from "react";

interface CompareProductFull {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  description: string | null;
  specifications: Record<string, unknown>;
  category: { name: string } | null;
}

export default function ComparePage() {
  const { products, removeProduct, clearAll } = useCompare();
  const [fullProducts, setFullProducts] = useState<CompareProductFull[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (products.length === 0) {
        setFullProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ids = products.map(p => p.id);
        const res = await fetch(`/api/compare?ids=${ids.join(",")}`);
        if (res.ok) {
          const data = await res.json();
          setFullProducts(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [products]);

  if (products.length === 0 && !loading) {
    return (
      <div className="bg-bg min-h-screen pb-32 pt-56 hero-gradient overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a productos
            </Link>
          </div>

          <EmptyState
            icon={Scale}
            title="Comparación Vacía"
            description="Tu panel comparativo está listo. Agrega hasta 4 componentes de alto rendimiento para analizar sus especificaciones lado a lado."
            actionLabel="Ver productos"
            actionHref="/products"
          />
        </div>
      </div>
    );
  }

  const allSpecKeys = Array.from(
    new Set(
      fullProducts.flatMap(p => Object.keys(p.specifications || {}))
    )
  );

  return (
    <div className="bg-bg min-h-screen pb-32 pt-56 hero-gradient overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a productos
            </Link>
            <h1 className="text-5xl lg:text-6xl font-black text-white italic tracking-tight uppercase mb-2">
              Comparar Productos
            </h1>
            <p className="text-muted mt-1 font-medium leading-relaxed">
              Compara y analiza especificaciones técnicas de hasta 4 productos lado a lado
            </p>
          </div>
          {products.length > 0 && (
            <Button variant="secondary" onClick={clearAll} className="self-start md:self-auto font-black tracking-widest text-xs py-3 px-6 rounded-xl">
              Limpiar todo
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass p-6 space-y-4">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {fullProducts.map((product) => (
              <Card key={product.id} className="relative flex flex-col justify-between" hover>
                <div>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition-all z-10 active:scale-90 group/btn"
                    aria-label="Remover producto"
                  >
                    <X className="h-4 w-4 text-gray-400 group-hover/btn:text-red-400 transition-colors" />
                  </button>

                  <div className="aspect-square bg-white/2 border border-white/5 flex items-center justify-center mb-6 rounded-2xl group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Monitor className="h-24 w-24 text-white/10 group-hover:scale-110 group-hover:text-primary/20 transition-all duration-500" />
                  </div>

                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-black text-lg text-white hover:text-primary transition-colors line-clamp-2 mb-2 italic">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                    {product.category?.name || "Sin categoría"}
                  </p>

                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-muted line-through font-medium">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-400 line-clamp-3 mb-6 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                  <Link href={`/products/${product.slug}`} className="w-full block">
                    <Button className="w-full py-3">Ver detalles</Button>
                  </Link>
                </div>
              </Card>
            ))}

            {products.length < 4 && (
              <Card className="flex flex-col items-center justify-center border-dashed border-2 border-white/10 hover:border-primary/40 bg-white/2 backdrop-blur-3xl hover:bg-white/5 transition-all duration-300 rounded-3xl min-h-[350px]">
                <Link href="/products" className="text-center p-8 w-full h-full flex flex-col items-center justify-center group">
                  <div className="bg-white/5 border border-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:border-primary/30 group-hover:bg-primary/10 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                    <Scale className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <p className="text-white/80 font-bold tracking-tight uppercase group-hover:text-white transition-colors">Agregar otro producto</p>
                  <p className="text-xs text-muted mt-2 font-medium tracking-wide">
                    ({products.length}/4 productos)
                  </p>
                </Link>
              </Card>
            )}
          </div>
        )}

        {!loading && fullProducts.length > 0 && allSpecKeys.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight italic">
              Especificaciones Técnicas
            </h2>
            
            <div className="overflow-x-auto rounded-3xl border border-white/5 bg-white/2 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider text-white border-r border-white/5">
                      Característica
                    </th>
                    {fullProducts.map((product) => (
                      <th key={product.id} className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider text-white border-r border-white/5 last:border-r-0">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allSpecKeys.map((key) => (
                    <tr key={key} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                      <td className="py-4 px-6 text-sm font-bold text-primary border-r border-white/5 uppercase tracking-wide bg-white/1">
                        {key}
                      </td>
                      {fullProducts.map((product) => (
                        <td key={product.id} className="py-4 px-6 text-sm text-gray-300 font-medium border-r border-white/5 last:border-r-0">
                          {String(product.specifications[key] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && fullProducts.length > 0 && allSpecKeys.length === 0 && (
          <div className="mt-16">
            <Card className="border border-white/10 bg-white/2 py-12">
              <p className="text-muted text-center py-8 font-medium">
                No hay especificaciones disponibles para comparar
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}