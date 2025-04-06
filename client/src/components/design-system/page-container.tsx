import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  withPadding?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

// Alias for PageContent to maintain compatibility with existing code
interface PageBodyProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageContainer component for consistent page layout structure
 * based on the ATMosFera design system
 */
export function PageContainer({ children, className, withPadding = false }: PageContainerProps) {
  return (
    <div className={cn("space-y-8", withPadding ? "p-6" : "", className)}>
      {children}
    </div>
  );
}

/**
 * PageHeader component for page titles and actions
 */
export function PageHeader({ 
  title, 
  description, 
  actions,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-8", className)}>
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">{title}</h1>
        {description && (
          <p className="text-text-muted">{description}</p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center space-x-4">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * PageContent component for the main content area
 */
export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}

/**
 * PageBody component - alias for PageContent to maintain
 * compatibility with existing code
 */
export function PageBody({ children, className }: PageBodyProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}