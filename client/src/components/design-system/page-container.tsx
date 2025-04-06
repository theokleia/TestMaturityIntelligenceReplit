import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  description?: string; // For backward compatibility
  actions?: ReactNode;
  className?: string;
  withPadding?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string; // For backward compatibility
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
 * based on the ATMosFera design system with background gradient
 */
export function PageContainer({ 
  children, 
  title, 
  subtitle, 
  description, // For backward compatibility
  actions, 
  className, 
  withPadding = false 
}: PageContainerProps) {
  const displaySubtitle = subtitle || description; // Use either subtitle or description
  
  return (
    <div className={cn(
      "min-h-screen w-full",
      "bg-[radial-gradient(circle_at_20%_30%,rgba(46,117,255,0.15)_0%,transparent_30%),radial-gradient(circle_at_80%_70%,rgba(138,86,255,0.1)_0%,transparent_40%)]", 
      "bg-atmf-main text-atmf-primary",
      withPadding ? "px-6 py-8" : "", 
      "space-y-8",
      className
    )}>
      {(title || displaySubtitle || actions) && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {displaySubtitle && <p className="text-atmf-muted">{displaySubtitle}</p>}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      )}
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
  subtitle,
  actions,
  className 
}: PageHeaderProps) {
  const displaySubtitle = subtitle || description; // Use either subtitle or description
  
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-8", className)}>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {displaySubtitle && (
          <p className="text-atmf-muted">{displaySubtitle}</p>
        )}
      </div>
      
      {actions && (
        <div className="flex-shrink-0">
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