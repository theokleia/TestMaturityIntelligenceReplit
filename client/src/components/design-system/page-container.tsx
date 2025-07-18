import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLayout } from "@/components/layout/layout";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  description?: string; // For backward compatibility
  actions?: ReactNode;
  className?: string;
  withPadding?: boolean;
  breadcrumb?: BreadcrumbItem[];
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

export function PageContainer({
  children,
  title,
  subtitle,
  description,
  actions,
  className,
  withPadding = true,
  breadcrumb
}: PageContainerProps) {
  // Use the Layout context to set the page title and actions in the Topbar
  const { setPageTitle, setPageActions } = useLayout();
  
  // Update the topbar title and actions when they change
  useEffect(() => {
    if (title) {
      setPageTitle(title);
    }
    if (actions) {
      setPageActions(actions);
    }
    
    // Clean up when unmounting
    return () => {
      setPageTitle("");
      setPageActions(null);
    };
  }, [title, actions, setPageTitle, setPageActions]);
  
  return (
    <div
      className={cn(
        "min-h-[calc(100vh-4rem)] w-full bg-[radial-gradient(circle_at_20%_30%,rgba(46,117,255,0.15)_0%,transparent_30%),radial-gradient(circle_at_80%_70%,rgba(138,86,255,0.1)_0%,transparent_40%)] bg-atmf-main text-atmf-primary",
        withPadding && "px-6 py-8 space-y-8",
        className,
      )}
    >
      {/* Breadcrumb navigation if provided */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-atmf-muted mb-4">
          {breadcrumb.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-3 w-3 mx-1 opacity-50" />}
              {index === breadcrumb.length - 1 ? (
                <span className="text-white opacity-90">{item.label}</span>
              ) : (
                <Link 
                  href={item.href} 
                  className="hover:text-white hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
      
      {(title || subtitle) && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {(subtitle || description) && (
              <p className="text-atmf-muted">{subtitle || description}</p>
            )}
          </div>
          {/* We don't need to render actions here anymore since they're in the topbar */}
        </div>
      )}
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  // Use the Layout context to set the page title and actions in the Topbar
  const { setPageTitle, setPageActions } = useLayout();
  
  // Update the topbar title and actions when they change
  useEffect(() => {
    if (title) {
      setPageTitle(title);
    }
    if (actions) {
      setPageActions(actions);
    }
    
    // Clean up when unmounting
    return () => {
      setPageTitle("");
      setPageActions(null);
    };
  }, [title, actions, setPageTitle, setPageActions]);
  
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6", className)}>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-atmf-muted">{description}</p>}
      </div>
      {/* We don't render actions here anymore since they're in the topbar */}
    </div>
  );
}

export function PageContent({
  children,
  className,
}: PageContentProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}

// Export as default as well to maintain compatibility
export default PageContainer;
