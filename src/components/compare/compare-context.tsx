"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CompareProduct {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category: string | null;
}

interface CompareContextType {
  products: CompareProduct[];
  addProduct: (product: CompareProduct) => void;
  removeProduct: (id: string) => void;
  clearAll: () => void;
  isInCompare: (id: string) => boolean;
  canAdd: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

function getInitialProducts(): CompareProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const item = window.localStorage.getItem("compare-products");
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<CompareProduct[]>(() => getInitialProducts());

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("compare-products", JSON.stringify(products));
    }
  }, [products]);

  const MAX_COMPARE = 4;

  const addProduct = (product: CompareProduct) => {
    if (products.length >= MAX_COMPARE) return;
    if (products.find(p => p.id === product.id)) return;
    setProducts([...products, product]);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const clearAll = () => setProducts([]);

  const isInCompare = (id: string) => products.some(p => p.id === id);

  return (
    <CompareContext.Provider value={{
      products,
      addProduct,
      removeProduct,
      clearAll,
      isInCompare,
      canAdd: products.length < MAX_COMPARE,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}