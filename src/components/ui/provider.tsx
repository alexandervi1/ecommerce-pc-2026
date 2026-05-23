"use client";

import { ReactNode } from "react";
import { ToastProvider } from "./toast";
import { CompareProvider } from "@/components/compare/compare-context";
import { CompareBar } from "@/components/compare/compare-bar";

export function UIProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CompareProvider>
        {children}
        <CompareBar />
      </CompareProvider>
    </ToastProvider>
  );
}