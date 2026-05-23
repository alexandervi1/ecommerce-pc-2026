"use client";

import { useCompare } from "@/components/compare/compare-context";
import Link from "next/link";
import { X, Scale } from "lucide-react";
import { Button } from "@/components/ui";

export function CompareBar() {
  const { products, removeProduct, clearAll } = useCompare();

  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Scale className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">
              Comparar ({products.length}/4)
            </span>
          </div>

          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg flex-shrink-0"
              >
                <span className="text-sm text-gray-700 max-w-[150px] truncate">
                  {product.name}
                </span>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="p-0.5 hover:bg-gray-200 rounded transition"
                  aria-label="Remover"
                >
                  <X className="h-3 w-3 text-gray-500" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Limpiar
            </Button>
            <Link href="/compare">
              <Button size="sm">Comparar</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}