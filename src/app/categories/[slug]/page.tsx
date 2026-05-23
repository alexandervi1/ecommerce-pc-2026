import Link from "next/link";
import { getCategoryBySlug, getProducts, getCategories } from "@/lib/repositories";
import { ArrowLeft } from "lucide-react";
import { ProductExplorer } from "@/components/products/product-explorer";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, allProducts, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getProducts(),
    getCategories()
  ]);
  
  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass p-12 rounded-3xl text-center border-white/5">
          <h1 className="text-2xl font-bold text-white mb-4">Categoría no encontrada</h1>
          <Link href="/categories" className="btn-outline inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a categorías
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="glass rounded-3xl p-8 lg:p-12 relative overflow-hidden border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -mr-20 -mt-20" />
          <div className="relative z-10 space-y-4">
            <Link href="/categories" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Categorías
            </Link>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">{category.name}</h1>
            {category.description && (
              <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductExplorer initialProducts={allProducts} categories={categories} />
      </div>
    </div>
  );
}