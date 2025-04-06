import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageBackgroundProps {
  children: ReactNode;
  variant?: "default" | "blue" | "purple" | "teal" | "dark";
  className?: string;
}

/**
 * PageBackground component for consistent background styling
 * based on the ATMosFera design system.
 */
export function PageBackground({ 
  children, 
  variant = "default",
  className 
}: PageBackgroundProps) {
  // Background class based on variant
  const backgroundClass = {
    default: "bg-atmf-main bg-gradient-radial-blue",
    blue: "bg-atmf-main bg-gradient-radial-blue-purple",
    purple: "bg-atmf-main bg-gradient-radial-purple",
    teal: "bg-atmf-main bg-gradient-radial-teal",
    dark: "bg-atmf-dark bg-gradient-radial-dark-blue"
  };
  
  return (
    <div className={cn(
      backgroundClass[variant],
      "min-h-screen",
      className
    )}>
      {children}
    </div>
  );
}