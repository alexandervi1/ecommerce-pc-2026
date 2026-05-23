"use client";

import { useCompare } from "@/components/compare/compare-context";
import { Scale, Check } from "lucide-react";
import { Button } from "@/components/ui";
import { useToastMessage } from "@/components/ui/toast";

interface CompareButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    category: string | null;
  };
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

export function CompareButton({ product, variant = "outline", size = "md" }: CompareButtonProps) {
  const { addProduct, removeProduct, isInCompare, canAdd } = useCompare();
  const toast = useToastMessage();
  const inCompare = isInCompare(product.id);

  const handleClick = () => {
    if (inCompare) {
      removeProduct(product.id);
      toast.success("Producto removido de la comparación");
    } else {
      if (!canAdd) {
        toast.warning("Máximo 4 productos para comparar");
        return;
      }
      addProduct(product);
      toast.success("Producto agregado a la comparación");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={inCompare ? "bg-blue-50 text-blue-600 border-blue-200" : ""}
    >
      {inCompare ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          En comparación
        </>
      ) : (
        <>
          <Scale className="h-4 w-4 mr-2" />
          Comparar
        </>
      )}
    </Button>
  );
}