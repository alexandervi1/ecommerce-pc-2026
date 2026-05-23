import type {
  Product,
  Category,
  Component,
  ComponentCategory,
  PCBuild,
  PCBuildItem,
  Cart,
  CartItem,
  Order,
  OrderItem,
  User,
} from "@prisma/client";

export type { Product, Category, Component, ComponentCategory, PCBuild, PCBuildItem, Cart, CartItem, Order, OrderItem, User };

export type ProductWithCategory = Product & {
  category: Category | null;
};

export type ComponentWithCategory = Component & {
  category: ComponentCategory;
};

export type PCBuildWithItems = PCBuild & {
  items: (PCBuildItem & {
    component: ComponentWithCategory;
  })[];
  user: Pick<User, "id" | "name" | "email">;
};

export type CartWithItems = Cart & {
  items: (CartItem & {
    product: Product | null;
    build: PCBuild | null;
  })[];
  user: Pick<User, "id" | "name" | "email"> | null;
};

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product | null;
  })[];
  user: Pick<User, "id" | "name" | "email">;
};

export type CartItemType = "product" | "build";

export interface CartSummary {
  items: {
    id: string;
    type: CartItemType;
    name: string;
    price: number;
    quantity: number;
    image?: string | null;
  }[];
  subtotal: number;
  itemCount: number;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface PCBuildSummary {
  id: string;
  name: string;
  totalPrice: number;
  components: {
    type: string;
    name: string;
    brand: string;
    price: number;
  }[];
}

export type ComponentType =
  | "CPU"
  | "GPU"
  | "MOTHERBOARD"
  | "RAM"
  | "STORAGE"
  | "PSU"
  | "CASE"
  | "COOLING";

export interface CompatibilityResult {
  isCompatible: boolean;
  errors: string[];
  warnings: string[];
}
