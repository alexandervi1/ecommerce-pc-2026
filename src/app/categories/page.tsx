import Link from "next/link";
import { getCategories, getProducts } from "@/lib/repositories";
import { formatPrice } from "@/lib/utils";
import { Monitor, ChevronRight, Zap } from "lucide-react";
import { Card, CardHeader, CardContent, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();
  const products = await getProducts();

  const productsByCategory = categories.map((cat) => ({
    ...cat,
    products: products.filter((p) => (p as unknown as { categoryId: string }).categoryId === cat.id),
  }));

  return (
    <div className="min-h-screen pb-24 pt-56 bg-bg hero-gradient">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="glass p-12 lg:p-16 relative overflow-hidden border-white/5">
          {/* Tactical Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-32 -mt-32 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -ml-20 -mb-20" />
          
          <div className="relative z-10 space-y-4">
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase italic">
              Signature <span className="text-gradient">Lines</span>
            </h1>
            <p className="text-muted max-w-2xl text-lg font-medium leading-relaxed">
              Curaduría de hardware de élite clasificada por especialidad técnica. 
              ADN puro de alto rendimiento para cada disciplina.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="space-y-16">
          {productsByCategory.map((category) => (
            <section key={category.id} className="space-y-8">
              <div className="flex items-end justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border-primary/30 text-primary">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">{category.name}</h2>
                    {category.description && (
                      <p className="text-gray-500 text-sm">{category.description}</p>
                    )}
                  </div>
                </div>
                <Link 
                  href={`/categories/${category.slug}`} 
                  className="text-xs font-bold uppercase tracking-widest text-primary hover:text-accent transition-colors flex items-center gap-2"
                >
                  Ver sección <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {category.products.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.products.map((product: unknown) => {
                    const prod = product as { id: string; name: string; slug: string; price: number; compareAtPrice: number | null; image: string | null };
                    return (
                      <Link
                        key={prod.id}
                        href={`/products/${prod.slug}`}
                        className="group"
                      >
                        <Card className="border-white/5 overflow-hidden p-0 group-hover:border-primary/40" hover>
                          <div className="aspect-square glass relative overflow-hidden flex items-center justify-center border-none rounded-none">
                            {prod.image ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                              />
                            ) : (
                              <Monitor className="h-16 w-16 text-white/10 group-hover:text-primary/30 transition-colors" />
                            )}
                            {prod.compareAtPrice && (
                              <div className="absolute top-4 left-4">
                                <Badge variant="accent">Hot</Badge>
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-2">
                            <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">
                              {prod.name}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-black text-white">
                                {formatPrice(prod.price)}
                              </span>
                              {prod.compareAtPrice && (
                                <span className="text-xs text-gray-500 line-through">
                                  {formatPrice(prod.compareAtPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-white/5 border-dashed bg-transparent shadow-none">
                  <div className="text-gray-500 text-center py-12">
                    <Monitor className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No hay productos en esta categoría actualmente</p>
                  </div>
                </Card>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
