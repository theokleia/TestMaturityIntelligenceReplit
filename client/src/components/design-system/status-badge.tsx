import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusBadgeVariant = 
  | "blue"
  | "purple"
  | "teal"
  | "success"
  | "warning"
  | "danger"
  | "muted"
  | "test"
  | "priority"
  | "severity"
  | "automation"
  | "assessment";

export type StatusBadgeSize = "sm" | "md" | "lg";

interface StatusBadgeProps {
  children?: ReactNode;
  variant?: StatusBadgeVariant;
  size?: StatusBadgeSize;
  className?: string;
  dot?: boolean;
  status?: string;
}

/**
 * StatusBadge component for displaying statuses with consistent styling
 * based on the ATMosFera design system.
 */
export function StatusBadge({ 
  children, 
  variant = "blue", 
  size = "md",
  dot = false,
  className,
  status
}: StatusBadgeProps) {
  // Determine background color class based on variant
  const bgColorClass = {
    blue: "bg-neon-blue/20 text-neon-blue",
    purple: "bg-neon-purple/20 text-neon-purple",
    teal: "bg-neon-teal/20 text-neon-teal",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    danger: "bg-danger/20 text-danger",
    muted: "bg-white/10 text-text-muted",
    test: "bg-sky-500/20 text-sky-400",
    priority: "bg-amber-500/20 text-amber-400",
    severity: "bg-rose-500/20 text-rose-400",
    automation: "bg-emerald-500/20 text-emerald-400",
    assessment: "bg-violet-500/20 text-violet-400"
  };
  
  // Determine size class
  const sizeClass = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-0.5 text-xs",
    lg: "px-2.5 py-1 text-sm"
  };
  
  // Determine dot size
  const dotSize = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5"
  };
  
  // Determine dot color
  const dotColor = {
    blue: "bg-neon-blue",
    purple: "bg-neon-purple",
    teal: "bg-neon-teal",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    muted: "bg-white/40",
    test: "bg-sky-400",
    priority: "bg-amber-400",
    severity: "bg-rose-400",
    automation: "bg-emerald-400",
    assessment: "bg-violet-400"
  };
  
  // Use status as children if provided and no children
  const content = children || status;
  
  return (
    <span 
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        bgColorClass[variant],
        sizeClass[size],
        className
      )}
    >
      {dot && (
        <span className={cn(
          "mr-1.5 rounded-full",
          dotSize[size],
          dotColor[variant]
        )} />
      )}
      {content}
    </span>
  );
}