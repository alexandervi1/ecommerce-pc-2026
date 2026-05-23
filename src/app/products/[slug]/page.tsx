import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/repositories";
import { formatPrice, getStockLabel } from "@/lib/utils";
import { Monitor, Shield, Truck, Wrench, ChevronRight, ArrowLeft, Star, Zap } from "lucide-react";
import ReviewsSection from "@/components/reviews-section";
import { ProductActions } from "@/components/products/product-actions";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const stock = getStockLabel(product.stock);

  return (
    <div className="bg-bg min-h-screen pt-24 pb-32 hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs - Tactical Style */}
        <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-12">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products" className="hover:text-white transition-colors">Productos</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-16 items-start mb-32">
          {/* Image Gallery - Pro Spec */}
          <div className="space-y-6">
            <div className="aspect-square glass rounded-[40px] flex items-center justify-center relative overflow-hidden group border-white/5">
              {/* Internal Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-30" />
              
              {product.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-1000"
                />
              ) : (
                <Monitor className="h-56 w-56 text-white/5 relative z-10 group-hover:scale-110 transition-transform duration-700" />
              )}
              
              <div className="absolute top-8 left-8 z-20 flex flex-col gap-4">
                {product.isFeatured && (
                  <div className="glass px-4 py-1.5 rounded-full border-primary/30 flex items-center gap-2 backdrop-blur-3xl shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Recommended Spec</span>
                  </div>
                )}
                <div className="glass px-4 py-1.5 rounded-full border-accent/30 flex items-center gap-2 backdrop-blur-3xl shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                  <Zap className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">High-End Gear</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square glass rounded-3xl border-white/5 hover:border-primary/40 cursor-pointer transition-all duration-500 flex items-center justify-center hover:scale-105">
                  <Monitor className="h-8 w-8 text-white/5 group-hover:text-white/20 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info - High Density */}
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20">
                {product.categoryName || "Hardware Component"}
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
                {product.name}
              </h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 text-primary">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <span className="text-xs text-muted font-bold uppercase tracking-widest">Protocolo de Reseñas: 4.9 (124)</span>
              </div>
            </div>

            <div className="space-y-4">
              {product.compareAtPrice && (
                <span className="text-xl text-gray-600 line-through font-medium">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              <p className="text-7xl font-black text-white tracking-tighter leading-none">
                {formatPrice(product.price)}
              </p>
            </div>

            <p className="text-xl text-muted leading-relaxed border-l-4 border-primary/40 pl-8 py-4 font-medium italic">
              &quot;{product.description}&quot;
            </p>

            <div className="space-y-8 pt-6">
              <div className="flex items-center gap-4 p-6 glass rounded-3xl border-white/5">
                <div className={`w-4 h-4 rounded-full shadow-[0_0_15px_currentColor] animate-pulse ${product.stock > 0 ? "text-success bg-success" : "text-accent bg-accent"}`} />
                <span className={`font-black text-xs uppercase tracking-[0.3em] ${product.stock > 0 ? "text-success" : "text-accent"}`}>
                  {stock.label}
                </span>
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-auto">Serial ID: {product.sku || "TECH-PR-001"}</span>
              </div>

              {/* Reactive actions */}
              <ProductActions product={product} />
            </div>

            {/* Feature Cards - Tactical */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/5">
              {[
                { icon: <Truck />, label: "Stealth Shipping" },
                { icon: <Shield />, label: "Ironclad Warranty" },
                { icon: <Wrench />, label: "Architect Support" },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-4 p-6 glass rounded-[32px] border-white/5 group hover:border-primary/40 transition-all duration-500">
                  <div className="text-muted group-hover:text-primary transition-all duration-500 transform group-hover:scale-110">{item.icon}</div>
                  <span className="text-[9px] font-black text-muted group-hover:text-white uppercase tracking-[0.3em] text-center transition-colors">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications / Reviews - Bento Control */}
        <div className="space-y-16">
          <div className="flex border-b border-white/5 gap-12">
            <button className="pb-6 text-xs font-black uppercase tracking-[0.4em] text-primary border-b-4 border-primary">
              Feedback Logs
            </button>
            <button className="pb-6 text-xs font-black uppercase tracking-[0.4em] text-muted hover:text-white transition-all">
              Technical Specs
            </button>
          </div>
          
          <div className="glass rounded-[40px] p-12 lg:p-20 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full" />
            <ReviewsSection productId={product.id} />
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Explorar más hardware
          </Link>
        </div>
      </div>
    </div>
  );
}
