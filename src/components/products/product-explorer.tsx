"use client";

import { useState, useMemo, useEffect } from "react";
import { Filter, Grid, List, Monitor, Search, X, ChevronDown, SlidersHorizontal, ArrowUpDown, Check } from "lucide-react";
import { ProductCard } from "./product-card";
import { Card, Input, EmptyState, Skeleton } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
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
}

interface ProductExplorerProps {
  initialProducts: Product[];
  categories: Category[];
}

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

export function ProductExplorer({ initialProducts, categories }: ProductExplorerProps) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPriceLimit, setMaxPriceLimit] = useState<number>(5000);
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [showInStock, setShowInStock] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Sync price range if products change
  useEffect(() => {
    const highest = Math.max(...initialProducts.map(p => p.price), 0);
    const limit = Math.ceil(highest / 100) * 100;
    setMaxPriceLimit(limit || 5000);
    setPriceRange(limit || 5000);
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    let result = initialProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                           product.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || 
                             (product.categoryId && selectedCategories.includes(product.categoryId));
      const matchesPrice = product.price <= priceRange;
      const matchesStock = !showInStock || product.stock > 0;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });

    // Apply Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [initialProducts, search, selectedCategories, priceRange, showInStock, sortBy]);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setPriceRange(maxPriceLimit);
    setShowInStock(false);
    setSortBy("featured");
  };

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: "Recomendados", value: "featured" },
    { label: "Precio: Menor a Mayor", value: "price-asc" },
    { label: "Precio: Mayor a Menor", value: "price-desc" },
    { label: "Nombre: A-Z", value: "name-asc" },
  ];

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
      {/* Sidebar Filters */}
      <aside className="lg:col-span-1 space-y-6">
        <div className="glass rounded-3xl p-6 border-white/5 space-y-8 sticky top-28 backdrop-blur-3xl bg-white/2">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-black text-white uppercase tracking-[0.2em] text-[10px]">Filtros</h2>
            </div>
            {(search || selectedCategories.length > 0 || showInStock || priceRange < maxPriceLimit) && (
              <button 
                onClick={clearFilters}
                className="text-[10px] font-black text-accent hover:text-accent/80 uppercase tracking-widest transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Search */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Búsqueda Táctica</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar componente..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-10 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-3 w-3 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Sectores</label>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 group ${
                    selectedCategories.includes(category.id)
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-white/2 text-gray-500 border border-white/5 hover:border-white/20 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    selectedCategories.includes(category.id) 
                      ? "bg-primary border-primary scale-110 shadow-[0_0_10px_rgba(124,58,237,0.4)]" 
                      : "border-white/20 group-hover:border-white/40"
                  }`}>
                    {selectedCategories.includes(category.id) && <Check className="h-2.5 w-2.5 text-white stroke-[4]" />}
                  </div>
                  <span className="flex-grow text-left uppercase tracking-wider">{category.name}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                    selectedCategories.includes(category.id) ? "bg-primary/20" : "bg-white/5"
                  }`}>
                    {initialProducts.filter(p => p.categoryId === category.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Presupuesto</label>
              <span className="text-sm font-black text-primary tracking-tight">{formatPrice(priceRange)}</span>
            </div>
            <div className="relative px-2">
              <input
                type="range"
                min="0"
                max={maxPriceLimit}
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
              />
              <div className="flex justify-between mt-3 text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">
                <span>$0</span>
                <span>{formatPrice(maxPriceLimit)}</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Logística</label>
            <button
              onClick={() => setShowInStock(!showInStock)}
              className={`flex items-center justify-between w-full px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                showInStock 
                  ? "bg-accent/10 text-accent border border-accent/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]" 
                  : "bg-white/2 text-gray-500 border border-white/5 hover:border-white/20 hover:text-white"
              }`}
            >
              <span>Sólo Disponibles</span>
              <div className={`w-8 h-4 rounded-full relative transition-all duration-500 ${showInStock ? "bg-accent" : "bg-white/10"}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-500 ${showInStock ? "left-4.5" : "left-0.5"}`} />
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Toolbar */}
        <div className="glass rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between border-white/5 backdrop-blur-xl bg-white/2 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-0.5">Arsenal Desplegado</p>
              <p className="text-sm text-white font-medium">
                <span className="font-black text-primary">{filteredProducts.length}</span> unidades localizadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <div className="relative flex-grow sm:flex-grow-0">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all w-full"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
                  <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsSortOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-56 glass rounded-2xl border border-white/10 p-2 z-30 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          sortBy === option.value 
                            ? "bg-primary text-white" 
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {option.label}
                        {sortBy === option.value && <Check className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "text-primary bg-primary/20 shadow-[0_0_10px_rgba(124,58,237,0.2)]" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "text-primary bg-primary/20 shadow-[0_0_10px_rgba(124,58,237,0.2)]" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center space-y-8 border-white/5 backdrop-blur-2xl relative overflow-hidden bg-white/2">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
              <Monitor className="h-12 w-12 text-gray-600" />
            </div>
            <div className="space-y-3 relative z-10">
              <h3 className="text-2xl font-black text-white uppercase tracking-wider">Arsenal Localizado Vacío</h3>
              <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed font-medium">
                No hemos detectado componentes con las coordenadas proporcionadas. Reajusta tus parámetros de búsqueda.
              </p>
            </div>
            <button 
              onClick={clearFilters}
              className="relative group px-8 py-3 bg-white/5 hover:bg-primary/20 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/10 hover:border-primary/50 transition-all duration-500"
            >
              Restablecer Escaneo
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-in fade-in zoom-in-95 duration-700 ease-out"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
