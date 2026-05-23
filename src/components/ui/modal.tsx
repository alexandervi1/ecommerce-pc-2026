"use client";

import { Fragment, ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  full: "max-w-5xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnOverlay = true,
  showCloseButton = true,
  className = "",
}: ModalProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Dark overlay — opaque enough to block content behind */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Modal panel — cosmic dark, never transparent */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className={cn(
            "relative w-full my-8",
            "bg-[oklch(12%_0.02_260)] border border-white/15",
            "rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.7)]",
            "transition-all duration-300",
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle internal glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />

          {title && (
            <div className="flex items-center justify-between px-7 py-5 border-b border-white/10">
              <h3 className="text-base font-black text-white uppercase tracking-tight italic">
                {title}
              </h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-all active:scale-90"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          <div className="p-7 relative z-10">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}

interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ModalHeader({ children, className = "" }: ModalHeaderProps) {
  return (
    <div className={cn("px-7 py-5 border-b border-white/10", className)}>
      {children}
    </div>
  );
}

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export function ModalBody({ children, className = "" }: ModalBodyProps) {
  return <div className={cn("px-7 py-5", className)}>{children}</div>;
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div className={cn("px-7 py-5 border-t border-white/10 rounded-b-3xl", className)}>
      <div className="flex justify-end gap-3">{children}</div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const variantStyles = {
  danger: "bg-red-500/90 hover:bg-red-500 text-white border border-red-400/20",
  warning: "bg-amber-500/90 hover:bg-amber-500 text-white border border-amber-400/20",
  info: "bg-primary/90 hover:bg-primary text-white border border-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.3)]",
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-300 mb-8 leading-relaxed font-medium">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-xs font-black uppercase tracking-widest border border-white/10"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            "px-5 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest",
            variantStyles[variant],
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? "Procesando..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: "left" | "right";
  size?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  size = "max-w-md",
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const positionClasses = {
    left: "left-0 rounded-r-3xl rounded-l-none",
    right: "right-0 rounded-l-3xl rounded-r-none",
  };

  return (
    <Fragment>
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed top-0 bottom-0 z-50 bg-[oklch(12%_0.02_260)] border-white/15 shadow-[0_0_80px_rgba(0,0,0,0.8)] transform transition-transform duration-300",
          size,
          positionClasses[position],
          position === "right" ? "border-l" : "border-r",
          isOpen ? "translate-x-0" : position === "right" ? "translate-x-full" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h3 className="text-sm font-black text-white uppercase tracking-tight italic">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-all active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto h-[calc(100%-65px)]">{children}</div>
      </div>
    </Fragment>
  );
}