import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const PASSWORD_RULES = {
  min: 8,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(PASSWORD_RULES.min, `La contraseña debe tener al menos ${PASSWORD_RULES.min} caracteres`)
    .regex(PASSWORD_RULES.uppercase, "Debe contener al menos una mayúscula (A-Z)")
    .regex(PASSWORD_RULES.lowercase, "Debe contener al menos una minúscula (a-z)")
    .regex(PASSWORD_RULES.number, "Debe contener al menos un número (0-9)")
    .regex(PASSWORD_RULES.special, "Debe contener al menos un carácter especial (!@#$%^&*...)"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  slug: z.string().min(3, "El slug debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  compareAtPrice: z.number().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0, "El stock debe ser mayor o igual a 0"),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const componentSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  brand: z.string().min(2, "La marca debe tener al menos 2 caracteres"),
  model: z.string().min(2, "El modelo debe tener al menos 2 caracteres"),
  slug: z.string().min(3, "El slug debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  stock: z.number().int().min(0, "El stock debe ser mayor o igual a 0"),
  categoryId: z.string().min(1, "Debe seleccionar una categoría"),
  socketType: z.string().optional(),
  wattage: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  specifications: z.record(z.string(), z.unknown()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slug: z.string().min(2, "El slug debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const orderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(2, "Nombre requerido"),
    street: z.string().min(5, "Dirección requerida"),
    city: z.string().min(2, "Ciudad requerida"),
    state: z.string().min(2, "Estado requerido"),
    zipCode: z.string().min(4, "Código postal requerido"),
    country: z.string().min(2, "País requerido"),
    phone: z.string().optional(),
  }),
  notes: z.string().optional(),
});

export const pcBuildSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  components: z.array(z.string()).min(1, "Debe agregar al menos un componente"),
});

export const reviewSchema = z.object({
  productId: z.string().uuid("ID de producto inválido"),
  rating: z.number().int().min(1, "El rating debe ser al menos 1").max(5, "El rating debe ser máximo 5"),
  title: z.string().max(200, "El título no puede exceder 200 caracteres").optional(),
  content: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ComponentInput = z.infer<typeof componentSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type PCBuildInput = z.infer<typeof pcBuildSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
