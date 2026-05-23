"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "@/lib/hooks";
import { useToastMessage } from "@/components/ui/toast";

export interface CartItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
  variant?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  isMiniCartOpen: boolean;
  setIsMiniCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>("techstore-cart", []);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const toast = useToastMessage();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = useCallback((newItem: Omit<CartItem, "id">) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (item) => item.productId === newItem.productId && item.variant === newItem.variant
      );

      if (existingItem) {
        if (existingItem.quantity + newItem.quantity > (newItem.stock || 99)) {
          toast.warning(`Lo sentimos, sólo tenemos ${newItem.stock} unidades disponibles.`, {
            title: "Límite de stock",
          });
          return prev;
        }
        return prev.map((item) =>
          item.productId === newItem.productId && item.variant === newItem.variant
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }

      toast.success(`${newItem.name} ha sido añadido a tu carrito.`, {
        title: "Agregado al arsenal",
      });

      return [...prev, { ...newItem, id: Math.random().toString(36).substr(2, 9) }];
    });
    
    // Automatically open mini-cart when item is added
    setIsMiniCartOpen(true);
  }, [setItems, toast]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, [setItems]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, Math.min(quantity, item.stock || 99));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  }, [setItems]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, [setItems]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        isMiniCartOpen,
        setIsMiniCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
