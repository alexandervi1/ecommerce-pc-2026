"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import Verify2FAContent from "./Verify2FAContent";

export default function Verify2FAPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F23]">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Cargando...</p>
        </div>
      }
    >
      <Verify2FAContent />
    </Suspense>
  );
}
