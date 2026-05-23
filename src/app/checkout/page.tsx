"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema, type OrderInput } from "@/lib/schemas";
import { useCart } from "@/components/providers/cart-context";
import { formatPrice, cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  CreditCard as CardIcon, 
  Truck, 
  Check, 
  Loader2, 
  Wallet, 
  Building2,
  Info,
  ShieldCheck,
  ShoppingBag
} from "lucide-react";
import { EmptyCart } from "@/components/ui/empty-state";

// --- Sub-components ---

const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(
    "glass rounded-[32px] border-white/5 overflow-hidden",
    className
  )}>
    {children}
  </div>
);

const InputField = ({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
      {label}
    </label>
    <input
      {...props}
      className={cn(
        "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-accent/50 transition-all",
        error && "border-red-500/50 focus:border-red-500"
      )}
    />
    {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
  </div>
);

const InteractiveCreditCard = ({ 
  number = "•••• •••• •••• ••••", 
  name = "NOMBRE DEL TITULAR", 
  expiry = "MM/AA", 
  cvv = "•••",
  focused = "" 
}: { 
  number?: string; 
  name?: string; 
  expiry?: string; 
  cvv?: string;
  focused?: string;
}) => {
  const isFlipped = focused === "cvv";
  
  return (
    <div className="relative w-full max-w-[340px] h-[200px] mx-auto perspective-1000 mb-8">
      <div className={cn(
        "relative w-full h-full transition-transform duration-700 preserve-3d cursor-default",
        isFlipped && "rotate-y-180"
      )}>
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-primary to-accent rounded-2xl p-6 shadow-2xl flex flex-col justify-between text-white border border-white/20 overflow-hidden">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="flex justify-between items-start relative z-10">
            <div className="w-12 h-8 bg-yellow-400/80 rounded-md shadow-inner" /> {/* Chip */}
            <div className="text-sm font-black italic tracking-tighter opacity-90 uppercase">KelectronicaEC</div>
          </div>
          <div className="text-xl tracking-[0.2em] font-mono relative z-10 py-2">
            {number || "•••• •••• •••• ••••"}
          </div>
          <div className="flex justify-between items-end relative z-10">
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-black opacity-60 tracking-widest">Titular Operativo</span>
              <span className="text-xs font-black tracking-wide uppercase truncate max-w-[180px]">
                {name || "OPERADOR SISTEMA"}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[8px] uppercase font-black opacity-60 tracking-widest">Expiración</span>
              <span className="text-xs font-black tracking-wide">{expiry || "MM/AA"}</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#0F0F23] to-[#1A1A35] rounded-2xl shadow-2xl border border-white/10 flex flex-col justify-between py-6">
          <div className="w-full h-10 bg-black/80 mt-2" />
          <div className="px-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-white/40 mr-1 mb-1">CVV</span>
              <div className="w-full h-9 bg-white/90 rounded flex items-center justify-end px-3 text-black font-mono tracking-widest italic shadow-inner">
                {cvv || "•••"}
              </div>
            </div>
          </div>
          <div className="px-6 flex items-center gap-2 opacity-30">
            <div className="w-8 h-8 rounded-full bg-white/20" />
            <div className="w-12 h-2 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "wallet">("card");
  const [cardData, setCardData] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [focusedField, setFocusedField] = useState("");

  const shippingCost = subtotal > 500 ? 0 : 15;
  const tax = subtotal * 0.15; // 15% VAT example
  const total = subtotal + shippingCost + tax;

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      shippingAddress: {
        country: "Ecuador"
      }
    }
  });

  const handleNextStep = async () => {
    const isValid = await trigger("shippingAddress");
    if (isValid) setStep(2);
  };

  const handleProcessOrder = async (data: OrderInput) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("Order Processed:", { ...data, paymentMethod, total, items });
    clearCart();
    setStep(3);
    setIsLoading(false);
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32 pt-56 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Progress HUD */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
          <div className="space-y-4">
            <button 
              onClick={() => step > 1 && step < 3 ? setStep(step - 1) : router.back()}
              className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] hover:text-white transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>{step === 2 ? "VOLVER A LOGÍSTICA" : "VOLVER AL ARSENAL"}</span>
            </button>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
              Despliegue <span className="text-rose-500">Operativo</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[28px] border border-white/5 shadow-2xl">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[10px] transition-all duration-500 border",
                  step >= s 
                    ? "bg-rose-500 border-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]" 
                    : "bg-white/5 border-white/10 text-gray-600"
                )}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && <div className={cn(
                  "h-1 w-10 rounded-full transition-all duration-500",
                  step > s ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-white/10"
                )} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-7 space-y-8">
            {step === 1 && (
              <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 animate-in slide-in-from-left-8 duration-700">
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <Truck className="h-7 w-7 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Coordenadas de Envío</h2>
                  </div>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <InputField label="NOMBRE COMPLETO" error={errors.shippingAddress?.fullName?.message} {...register("shippingAddress.fullName")} />
                  </div>
                  <div className="md:col-span-2">
                    <InputField label="DIRECCIÓN EXACTA" error={errors.shippingAddress?.street?.message} {...register("shippingAddress.street")} />
                  </div>
                  <InputField label="CIUDAD" error={errors.shippingAddress?.city?.message} {...register("shippingAddress.city")} />
                  <InputField label="PROVINCIA" error={errors.shippingAddress?.state?.message} {...register("shippingAddress.state")} />
                  <InputField label="CÓDIGO POSTAL" error={errors.shippingAddress?.zipCode?.message} {...register("shippingAddress.zipCode")} />
                  <InputField label="PAÍS" error={errors.shippingAddress?.country?.message} {...register("shippingAddress.country")} />
                  <div className="md:col-span-2">
                    <InputField label="TELÉFONO" error={errors.shippingAddress?.phone?.message} {...register("shippingAddress.phone")} />
                  </div>

                  <div className="md:col-span-2 pt-6">
                    <button type="button" onClick={handleNextStep} className="w-full bg-rose-500 text-white py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(244,63,94,0.4)] transition-all active:scale-[0.98]">
                      CONTINUAR AL PAGO
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 animate-in slide-in-from-left-8 duration-700">
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <CardIcon className="h-7 w-7 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Cifrado de Pago</h2>
                  </div>
                </div>

                <div className="flex gap-4 mb-12 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    { id: "card", label: "TARJETA", icon: CardIcon },
                    { id: "transfer", label: "TRANSFERENCIA", icon: Building2 },
                    { id: "wallet", label: "BILLETERA", icon: Wallet },
                  ].map((method) => (
                    <button 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={cn(
                        "flex-1 min-w-[140px] flex flex-col items-center gap-4 p-6 rounded-[28px] border transition-all",
                        paymentMethod === method.id 
                          ? "bg-rose-500/10 border-rose-500/50 text-rose-500" 
                          : "bg-white/5 border-white/10 text-gray-500"
                      )}
                    >
                      <method.icon className="w-6 h-6" />
                      <span className="font-black text-[10px] uppercase tracking-widest">{method.label}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-10 animate-in fade-in duration-700">
                    <InteractiveCreditCard focused={focusedField} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2">
                        <InputField label="TITULAR" onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField("")} />
                      </div>
                      <div className="md:col-span-2">
                        <InputField label="NÚMERO DE TARJETA" onFocus={() => setFocusedField("number")} onBlur={() => setFocusedField("")} />
                      </div>
                      <InputField label="VENCIMIENTO" onFocus={() => setFocusedField("expiry")} onBlur={() => setFocusedField("")} />
                      <InputField label="CVV" type="password" maxLength={3} onFocus={() => setFocusedField("cvv")} onBlur={() => setFocusedField("")} />
                    </div>
                  </div>
                )}

                <div className="mt-16 space-y-6 text-center">
                  <button type="button" onClick={handleSubmit(handleProcessOrder)} disabled={isLoading} className="w-full bg-rose-500 text-white py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(244,63,94,0.4)] transition-all flex items-center justify-center gap-4">
                    {isLoading ? <Loader2 className="animate-spin" /> : <span>CONFIRMAR DESPLIEGUE</span>}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-emerald-500/5 p-16 rounded-[48px] border border-white/10 text-center animate-in zoom-in-95 duration-700">
                <div className="w-28 h-28 bg-emerald-500/20 rounded-[36px] flex items-center justify-center mx-auto mb-10 text-emerald-500 border border-emerald-500/30">
                  <Check className="w-14 h-14" />
                </div>
                <h2 className="text-5xl font-black text-white tracking-tighter mb-6 uppercase italic">¡Misión Cumplida!</h2>
                <button onClick={() => router.push("/products")} className="bg-rose-500 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                  VOLVER AL CATÁLOGO
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 shadow-2xl">
              <button onClick={() => setIsSummaryExpanded(!isSummaryExpanded)} className="w-full flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Arsenal de Orden</h3>
                {isSummaryExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              <div className={cn("space-y-6 overflow-hidden transition-all duration-700", isSummaryExpanded ? "max-h-[1000px] mb-10" : "max-h-0")}>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-5 p-4 rounded-[24px] bg-white/[0.02] border border-white/5">
                    <div className="w-20 h-20 bg-black rounded-2xl border border-white/10 p-2 shrink-0">
                      <img src={item.image || "/file.svg"} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs text-white uppercase truncate">{item.name}</p>
                      <div className="flex justify-between items-end mt-4">
                        <span className="text-[10px] font-black text-gray-600">CANT: {item.quantity}</span>
                        <span className="font-black text-white text-xs">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-5 pt-8 border-t border-white/5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="pt-8 border-t border-white/10">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-1">TOTAL</p>
                  <p className="text-4xl font-black text-white italic">{formatPrice(total)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
