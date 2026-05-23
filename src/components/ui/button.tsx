"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "accent";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary/80 shadow-[0_0_20px_rgba(124,58,237,0.3)]",
  accent: "bg-accent text-white hover:bg-accent/80 shadow-[0_0_20px_rgba(244,63,94,0.3)]",
  secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
  outline: "border-2 border-primary text-primary hover:bg-primary/10",
  ghost: "text-gray-400 hover:bg-white/5 hover:text-white",
  danger: "bg-red-500 text-white hover:bg-red-600",
  success: "bg-emerald-500 text-white hover:bg-emerald-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs uppercase tracking-widest",
  md: "px-5 py-2.5 text-sm uppercase tracking-widest",
  lg: "px-8 py-4 text-base uppercase tracking-widest",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
}

export function IconButton({
  className,
  icon,
  variant = "ghost",
  size = "md",
  label,
  ...props
}: IconButtonProps) {
  const iconSizeClasses: Record<ButtonSize, string> = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90",
        variantClasses[variant],
        iconSizeClasses[size],
        className
      )}
      aria-label={label}
      {...props}
    >
      {icon}
    </button>
  );
}

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className = "" }: ButtonGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {children}
    </div>
  );
}
