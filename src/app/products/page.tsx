import { getProducts, getCategories } from "@/lib/repositories";
import { ProductExplorer } from "@/components/products/product-explorer";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="min-h-screen pb-24 pt-56 bg-background">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="glass p-12 lg:p-16 relative overflow-hidden border-white/5">
          {/* Tactical Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-32 -mt-32 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -ml-20 -mb-20" />
          
          <div className="relative z-10 space-y-4">
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter">
              Catálogo de <span className="text-gradient">Productos</span>
            </h1>
            <p className="text-muted max-w-2xl text-lg font-medium leading-relaxed">
              Explora nuestra selección élite de componentes y equipos de alto rendimiento para entusiastas y profesionales.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductExplorer initialProducts={products} categories={categories} />
      </div>
    </div>
  );
}
