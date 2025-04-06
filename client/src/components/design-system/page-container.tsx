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
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-[radial-gradient(circle_at_20%_30%,rgba(46,117,255,0.15)_0%,transparent_30%),radial-gradient(circle_at_80%_70%,rgba(138,86,255,0.1)_0%,transparent_40%)] bg-atmf-main text-atmf-primary",
        withPadding && "px-6 py-8 space-y-8",
        className,
      )}
    >
      {(title || subtitle || actions) && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {(subtitle || description) && (
              <p className="text-atmf-muted">{subtitle || description}</p>
            )}
          </div>
          {actions && <div>{actions}</div>}
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
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6", className)}>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-atmf-muted">{description}</p>}
      </div>
      {actions && <div>{actions}</div>}
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
