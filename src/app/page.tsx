import Link from "next/link";
import { getFeaturedProducts, getCategories, getProducts } from "@/lib/repositories";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Cpu, Monitor, Shield, Truck, Wrench, Zap, Star, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let [products, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);

  // Fallback: Si no hay productos destacados, mostrar productos normales
  if (products.length === 0) {
    products = await getProducts(8);
  }

  return (
    <div className="pt-56 space-y-52 pb-32 hero-gradient overflow-x-hidden">
      {/* Hero Section - Pro Max Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Hero Card */}
          <div className="lg:col-span-2 glass p-10 lg:p-20 min-h-[500px] flex flex-col justify-center relative group overflow-hidden">
            {/* Tactical Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[130px] rounded-full -mr-40 -mt-40 transition-all duration-1000 group-hover:bg-primary/30" />
            
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-3xl">
                <Star className="h-3.5 w-3.5 fill-primary" />
                Elite Spec 2026
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] text-white">
                Próxima <br />
                <span className="text-gradient">Evolución</span>
              </h1>
              
              <p className="text-lg text-muted max-w-lg leading-relaxed font-medium">
                Sistemas de alto rendimiento con ingeniería táctica. 
                Dominancia absoluta en el campo digital.
              </p>
              
              <div className="flex flex-wrap gap-6 pt-4">
                <Link href="/products" className="btn-primary group">
                  <span>Ver Productos</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link href="/build" className="btn-secondary">
                  Configurador Pro
                </Link>
              </div>
            </div>
          </div>

          {/* Tactical Side Cards */}
          <div className="flex flex-col gap-8">
            <div className="glass bg-accent/5 border-accent/20 p-8 rounded-[32px] flex-1 flex flex-col justify-center group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <Zap className="h-10 w-10 text-accent mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
              <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">Ultra Fast</h3>
              <p className="text-sm text-muted leading-relaxed font-medium">Logística táctica. Despliegue en 24h con tracking militar.</p>
              <div className="absolute bottom-6 right-6 p-3 glass rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                <ChevronRight className="h-5 w-5 text-accent" />
              </div>
            </div>
            
            <div className="glass bg-primary/5 border-primary/20 p-8 rounded-[32px] flex-1 flex flex-col justify-center group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <Shield className="h-10 w-10 text-primary mb-6 transition-all duration-500 group-hover:scale-110" />
              <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">Armor Tech</h3>
              <p className="text-sm text-muted leading-relaxed font-medium">Garantía blindada y soporte técnico de nivel arquitecto.</p>
              <div className="absolute bottom-6 right-6 p-3 glass rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                <ChevronRight className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PC Builder - Command Center */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="glass p-12 lg:p-24 rounded-[60px] relative overflow-hidden group border-white/5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-accent/5 opacity-50" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="w-24 h-24 glass rounded-[32px] flex items-center justify-center border-primary/30 shadow-[0_0_40px_rgba(124,58,237,0.3)]">
                <Wrench className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <h2 className="text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.85]">
                Arquitecto de <br/><span className="text-gradient">Sistemas</span>
              </h2>
              <p className="text-xl text-muted leading-relaxed font-medium max-w-md">
                Validación de compatibilidad en tiempo real. Algoritmos de optimización 
                para asegurar que cada componente rinda al 100%.
              </p>
              <Link href="/build" className="btn-primary inline-flex mt-4">
                <Zap className="h-5 w-5 fill-white" />
                <span>Iniciar Ensamble</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              {[
                { icon: <Cpu />, label: "Processors", color: "text-blue-400" },
                { icon: <Monitor />, label: "Graphics", color: "text-rose-500" },
                { icon: <Zap />, label: "Memory", color: "text-yellow-400" },
                { icon: <Shield />, label: "Thermal", color: "text-cyan-400" },
              ].map((item, idx) => (
                <div key={idx} className="glass p-12 rounded-[40px] border-white/5 hover:border-primary/40 transition-all duration-700 group/item text-center">
                  <div className={`${item.color} mb-6 flex justify-center transition-transform duration-700 group-hover/item:scale-125 group-hover/item:rotate-6`}>{item.icon}</div>
                  <span className="font-black text-white uppercase text-xs tracking-[0.3em]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories - Signature Selection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-5xl font-black text-white mb-4 uppercase italic">Nuestras <span className="text-accent">Categorías</span></h2>
            <p className="text-muted text-lg font-medium tracking-wide">Encuentra productos organizados por tipo y especialidad.</p>
          </div>
          <Link href="/categories" className="text-xs font-black uppercase tracking-[0.4em] text-accent hover:text-primary transition-all flex items-center gap-4">
            Explorar Todo <ChevronRight className="h-6 w-6" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="glass group p-10 text-center hover:border-accent/50 transition-all duration-500"
            >
              <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-500 shadow-2xl">
                <Monitor className="h-10 w-10 text-accent" />
              </div>
              <h3 className="font-black text-white text-base tracking-widest uppercase italic group-hover:text-accent transition-colors">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products - Elite Arsenal */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-5xl font-black text-white mb-4 uppercase italic">Productos <span className="text-accent">Destacados</span></h2>
            <p className="text-muted text-lg font-medium tracking-wide">Los productos más populares de nuestro catálogo.</p>
          </div>
          <Link href="/products" className="text-xs font-black uppercase tracking-[0.4em] text-accent hover:text-primary transition-all flex items-center gap-4">
            Inventario Completo <ChevronRight className="h-6 w-6" />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.length > 0 ? products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="product-card group p-8"
            >
              <div className="aspect-square glass rounded-2xl mb-8 relative overflow-hidden flex items-center justify-center bg-white/5">
                <Monitor className="h-24 w-24 text-white/10 group-hover:scale-125 transition-transform duration-1000 ease-out" />
                {product.compareAtPrice && (
                  <div className="absolute top-5 left-5 bg-accent text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                    HOT SPEC
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="font-black text-white text-base line-clamp-2 uppercase italic leading-tight group-hover:text-accent transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-5">
                  <span className="text-2xl font-black text-white tracking-tighter">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-gray-500 line-through font-medium">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                
                <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                  <div className="btn-primary !py-3 !text-[10px] w-full text-center">
                    Ver Detalles Tácticos
                  </div>
                </div>
              </div>
            </Link>
          )) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-premium aspect-[3/4] w-full" />
            ))
          )}
        </div>
      </section>

      {/* Trust Protocol */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { icon: <Truck />, title: "Stealth Shipping", desc: "Entrega blindada y prioritaria en toda la red nacional." },
            { icon: <Shield />, title: "Ironclad Security", desc: "Protocolos de pago encriptados de grado bancario." },
            { icon: <Wrench />, title: "Architect Support", desc: "Soporte directo con ingenieros de hardware certificados." },
          ].map((feature, idx) => (
            <div key={idx} className="glass p-12 flex flex-col items-center text-center space-y-8 hover:bg-white/[0.04] transition-all duration-700">
              <div className="p-6 bg-primary/10 rounded-3xl text-primary shadow-inner ring-1 ring-white/10">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-wider">{feature.title}</h3>
              <p className="text-muted text-base font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
