import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IconWrapperProps {
  children: ReactNode;
  color?: "primary" | "success" | "warning" | "danger" | "muted" | "blue" | "purple" | "teal";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function IconWrapper({ children, color = "primary", size = "sm", className }: IconWrapperProps) {
  // Colors for the icon backgrounds
  const colorMap = {
    primary: "bg-primary/20 text-primary",
    success: "bg-[#2FFFAA]/20 text-[#2FFFAA]",
    warning: "bg-[#FFBB3A]/20 text-[#FFBB3A]",
    danger: "bg-[#FF4A6B]/20 text-[#FF4A6B]",
    muted: "bg-text-muted/20 text-text-muted",
    blue: "bg-[#2E75FF]/20 text-[#2E75FF]",
    purple: "bg-[#8A56FF]/20 text-[#8A56FF]",
    teal: "bg-[#2FFFDD]/20 text-[#2FFFDD]",
  };

  // Sizes for the wrapper
  const sizeMap = {
    xs: "h-5 w-5 text-xs",
    sm: "h-6 w-6 text-sm",
    md: "h-8 w-8 text-base",
    lg: "h-10 w-10 text-lg",
  };

  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0",
        colorMap[color],
        sizeMap[size],
        className
      )}
    >
      {children}
    </div>
  );
}