import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type IconWrapperVariant = 
  | "blue"      // Blue background with blue icon
  | "purple"    // Purple background with purple icon
  | "teal"      // Teal background with teal icon
  | "success"   // Success/green background
  | "warning"   // Warning/yellow background
  | "danger"    // Danger/red background
  | "muted";    // Gray/muted background

export type IconWrapperSize =
  | "sm"      // Small icon (h-6 w-6)
  | "md"      // Medium icon (h-8 w-8)
  | "lg"      // Large icon (h-10 w-10)
  | "xl";     // Extra large icon (h-12 w-12)

interface IconWrapperProps {
  children: ReactNode;
  variant?: IconWrapperVariant;
  size?: IconWrapperSize;
  className?: string;
  rounded?: "full" | "lg" | "md";
}

/**
 * IconWrapper component provides consistent styling for icons
 * with background colors according to the ATMosFera design system
 */
export function IconWrapper({
  children,
  variant = "blue",
  size = "md",
  rounded = "full",
  className
}: IconWrapperProps) {
  // Size classes
  const sizeClasses = {
    sm: "h-6 w-6 text-sm",
    md: "h-8 w-8 text-base",
    lg: "h-10 w-10 text-lg",
    xl: "h-12 w-12 text-xl"
  };
  
  // Background and text color classes based on variant
  const variantClasses = {
    blue: "bg-neon-blue/20 text-neon-blue",
    purple: "bg-neon-purple/20 text-neon-purple",
    teal: "bg-neon-teal/20 text-neon-teal",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    danger: "bg-danger/20 text-danger",
    muted: "bg-white/10 text-text-muted"
  };
  
  // Rounded corner classes
  const roundedClasses = {
    full: "rounded-full",
    lg: "rounded-lg",
    md: "rounded-md"
  };
  
  return (
    <div className={cn(
      "flex items-center justify-center flex-shrink-0",
      sizeClasses[size],
      variantClasses[variant],
      roundedClasses[rounded],
      className
    )}>
      {children}
    </div>
  );
}