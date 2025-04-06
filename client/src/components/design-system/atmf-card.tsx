import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ATMFCardProps {
  children: ReactNode;
  className?: string;
  neonBorder?: "blue" | "purple" | "teal" | "none";
  neonEffect?: string; // Alternative prop name used in some pages
  glassmorphism?: boolean;
  onClick?: () => void;
}

interface ATMFCardHeaderProps {
  children?: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
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
  neonEffect,
  glassmorphism = false,
  onClick
}: ATMFCardProps) {
  // Determine neon border class based on the variant
  const neonBorderClass = {
    blue: "neon-border-blue",
    purple: "neon-border-purple",
    teal: "neon-border-teal",
    none: ""
  };
  
  // Handle neonEffect (alternative to neonBorder)
  const effectBorder = neonEffect ? (
    neonEffect === "blue" || neonEffect === "purple" || neonEffect === "teal" ? 
    `neon-border-${neonEffect}` : "neon-border-blue"
  ) : null;
  
  return (
    <div 
      className={cn(
        glassmorphism ? "glassmorphism" : "atmf-card",
        neonBorder !== "none" && neonBorderClass[neonBorder],
        effectBorder,
        onClick && "cursor-pointer hover:brightness-110 transition-all",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * Card header component with bottom border
 */
export function ATMFCardHeader({ 
  children, 
  className,
  title,
  description,
  action,
  icon
}: ATMFCardHeaderProps) {
  // If children are provided, render them directly
  if (children) {
    return (
      <div className={cn("atmf-card-header", className)}>
        {children}
      </div>
    );
  }
  
  // Otherwise, render the structured header layout
  return (
    <div className={cn("atmf-card-header", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className="text-lg font-medium">{title}</h3>}
            {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
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