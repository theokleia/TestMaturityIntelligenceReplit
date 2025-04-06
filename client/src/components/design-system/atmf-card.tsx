import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ATMFCardProps {
  children: ReactNode;
  className?: string;
  neonBorder?: "blue" | "purple" | "teal" | "none"; 
  glassmorphism?: boolean;
}

interface ATMFCardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface ATMFCardBodyProps {
  children: ReactNode;
  className?: string;
}

interface ATMFCardFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * ATMF Card component for displaying content in a card container
 * based on the ATMosFera design system.
 */
export function ATMFCard({ 
  children, 
  className,
  neonBorder = "none",
  glassmorphism = false
}: ATMFCardProps) {
  // Determine neon border class based on the variant
  const neonBorderClass = {
    blue: "neon-border-blue",
    purple: "neon-border-purple",
    teal: "neon-border-teal",
    none: ""
  };
  
  return (
    <div className={cn(
      glassmorphism ? "glassmorphism" : "atmf-card",
      neonBorder !== "none" && neonBorderClass[neonBorder],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Card header component with bottom border
 */
export function ATMFCardHeader({ children, className }: ATMFCardHeaderProps) {
  return (
    <div className={cn("atmf-card-header", className)}>
      {children}
    </div>
  );
}

/**
 * Card body component for main content
 */
export function ATMFCardBody({ children, className }: ATMFCardBodyProps) {
  return (
    <div className={cn("atmf-card-body", className)}>
      {children}
    </div>
  );
}

/**
 * Card footer component with top border
 */
export function ATMFCardFooter({ children, className }: ATMFCardFooterProps) {
  return (
    <div className={cn("atmf-card-footer", className)}>
      {children}
    </div>
  );
}