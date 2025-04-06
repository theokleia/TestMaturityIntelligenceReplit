import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BackgroundVariant = 
  | "default"       // Default blue gradient
  | "dark"          // Darker gradient
  | "purple"        // Purple gradient
  | "blue-purple"   // Blue to purple gradient
  | "teal"          // Teal gradient
  | "none";         // No gradient (just solid background)

interface BackgroundProps {
  children: ReactNode;
  variant?: BackgroundVariant;
  className?: string;
}

/**
 * Reusable background component that provides consistent background styling
 * across the application, including gradients and styling.
 */
export function Background({ 
  children, 
  variant = "default",
  className 
}: BackgroundProps) {
  // Map variants to class names
  const gradientMap = {
    "default": "bg-gradient-radial-blue",
    "dark": "bg-gradient-radial-dark-blue",
    "purple": "bg-gradient-radial-purple",
    "blue-purple": "bg-gradient-radial-blue-purple",
    "teal": "bg-gradient-radial-teal",
    "none": ""
  };
  
  const gradientClass = gradientMap[variant];
  
  return (
    <div className={cn(
      "min-h-screen w-full bg-atmf-main",
      gradientClass,
      className
    )}>
      {children}
    </div>
  );
}

/**
 * This is a page wrapper component that applies the app background to a page.
 * Use this for individual pages to ensure consistent background styling.
 */
export function PageBackground({ 
  children, 
  variant = "default",
  className 
}: BackgroundProps) {
  return (
    <div className={cn(
      "w-full rounded-lg p-6",
      { 
        "bg-gradient-radial-blue": variant === "default",
        "bg-gradient-radial-dark-blue": variant === "dark",
        "bg-gradient-radial-purple": variant === "purple",
        "bg-gradient-radial-blue-purple": variant === "blue-purple",
        "bg-gradient-radial-teal": variant === "teal"
      },
      className
    )}>
      {children}
    </div>
  );
}