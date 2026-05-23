"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const icons = {
    success: CheckCircle,
    error: X,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const iconColors = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right",
        colors[toast.type]
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0", iconColors[toast.type])} />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-medium">{toast.title}</p>}
        <p className="text-sm opacity-90">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 hover:opacity-70 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastHookOptions {
  type?: ToastType;
  title?: string;
  duration?: number;
}

export function useToastMessage() {
  const { addToast } = useToast();

  const success = useCallback(
    (message: string, options?: ToastHookOptions) => {
      addToast({ type: "success", message, ...options });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, options?: ToastHookOptions) => {
      addToast({ type: "error", message, ...options });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, options?: ToastHookOptions) => {
      addToast({ type: "warning", message, ...options });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, options?: ToastHookOptions) => {
      addToast({ type: "info", message, ...options });
    },
    [addToast]
  );

  return { success, error, warning, info };
}