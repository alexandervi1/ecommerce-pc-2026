"use client";

import { AlertTriangle, XCircle, Info } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: "error" | "warning" | "info";
  className?: string;
  onRetry?: () => void;
}

const variants = {
  error: {
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
};

export function ErrorMessage({
  title,
  message,
  variant = "error",
  className = "",
  onRetry,
}: ErrorMessageProps) {
  const v = variants[variant];
  const Icon = v.icon;

  return (
    <div className={`${v.bg} border ${v.border} rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className={`${v.iconBg} p-2 rounded-lg ${v.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          {title && <h3 className={`font-semibold ${v.text} mb-1`}>{title}</h3>}
          <p className={`text-sm ${v.text}`}>{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={`mt-3 text-sm font-medium ${v.iconColor} hover:underline`}
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface FormErrorProps {
  error?: string;
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null;
  return <p className="text-sm text-red-600 mt-1">{error}</p>;
}

interface FieldErrorProps {
  error?: string;
}

export function FieldError({ error }: FieldErrorProps) {
  if (!error) return null;
  return <p className="text-sm text-red-600 mt-1">{error}</p>;
}