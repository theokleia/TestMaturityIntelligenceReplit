import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/colors";

interface IconWrapperProps {
  children: ReactNode;
  color?: "primary" | "success" | "warning" | "danger" | "muted" | "blue" | "purple" | "teal";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "filled" | "outlined" | "ghost";
  glowing?: boolean;
}

export function IconWrapper({ 
  children, 
  color = "primary", 
  size = "sm", 
  className,
  variant = "filled",
  glowing = false
}: IconWrapperProps) {
  // Color styles for different variants
  const colorVariants = {
    filled: {
      primary: "bg-black/40 text-white",
      success: "bg-emerald-900/60 text-emerald-300",
      warning: "bg-amber-900/60 text-amber-300",
      danger: "bg-red-900/60 text-red-300",
      muted: "bg-slate-900/60 text-slate-300",
      blue: "bg-blue-900/60 text-blue-300",
      purple: "bg-purple-900/60 text-purple-300",
      teal: "bg-teal-900/60 text-teal-300",
    },
    outlined: {
      primary: "bg-transparent border border-white/20 text-white",
      success: "bg-transparent border border-emerald-700/40 text-emerald-400",
      warning: "bg-transparent border border-amber-700/40 text-amber-400",
      danger: "bg-transparent border border-red-700/40 text-red-400",
      muted: "bg-transparent border border-slate-700/40 text-slate-400",
      blue: "bg-transparent border border-blue-700/40 text-blue-400",
      purple: "bg-transparent border border-purple-700/40 text-purple-400",
      teal: "bg-transparent border border-teal-700/40 text-teal-400",
    },
    ghost: {
      primary: "bg-transparent text-white",
      success: "bg-transparent text-emerald-400",
      warning: "bg-transparent text-amber-400",
      danger: "bg-transparent text-red-400",
      muted: "bg-transparent text-slate-400",
      blue: "bg-transparent text-blue-400",
      purple: "bg-transparent text-purple-400",
      teal: "bg-transparent text-teal-400",
    }
  };

  // Glow effects for different colors
  const glowEffects = {
    primary: "shadow-[0_0_8px_rgba(255,255,255,0.3)]",
    success: "shadow-[0_0_8px_rgba(47,255,170,0.3)]",
    warning: "shadow-[0_0_8px_rgba(255,187,58,0.3)]",
    danger: "shadow-[0_0_8px_rgba(255,74,107,0.3)]",
    muted: "shadow-[0_0_8px_rgba(255,255,255,0.15)]",
    blue: "shadow-[0_0_8px_rgba(46,117,255,0.3)]",
    purple: "shadow-[0_0_8px_rgba(138,86,255,0.3)]",
    teal: "shadow-[0_0_8px_rgba(47,255,221,0.3)]",
  };

  // Sizes for the wrapper
  const sizeMap = {
    xs: "h-5 w-5 text-xs",
    sm: "h-6 w-6 text-sm",
    md: "h-8 w-8 text-base",
    lg: "h-10 w-10 text-lg",
    xl: "h-12 w-12 text-xl",
  };

  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0",
        colorVariants[variant][color],
        sizeMap[size],
        glowing && glowEffects[color],
        className
      )}
    >
      {children}
    </div>
  );
}