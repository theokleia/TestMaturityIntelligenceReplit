import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/colors";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  centered?: boolean;
}

export function PageContainer({
  children,
  className,
  maxWidth = "xl",
  padding = "md",
  centered = false
}: PageContainerProps) {
  // Max width mapping
  const maxWidthMap = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full"
  };

  // Padding mapping
  const paddingMap = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  return (
    <div 
      className={cn(
        "w-full mx-auto",
        maxWidthMap[maxWidth],
        paddingMap[padding],
        centered && "flex flex-col items-center",
        className
      )}
    >
      {children}
    </div>
  );
}

interface PageBodyProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export function PageBody({
  children,
  className,
  padding = "md"
}: PageBodyProps) {
  // Padding mapping
  const paddingMap = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  return (
    <div 
      className={cn(
        "w-full",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-atmf-primary">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-atmf-muted">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

interface PageSectionProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  noDivider?: boolean;
}

export function PageSection({
  children,
  title,
  description,
  className,
  noDivider = false
}: PageSectionProps) {
  return (
    <section className={cn("mb-8", className)}>
      {!noDivider && <div className="w-full h-px bg-white/5 mb-6" />}
      
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-xl font-semibold text-atmf-primary">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-atmf-muted">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div>
        {children}
      </div>
    </section>
  );
}

interface PageGridProps {
  children: ReactNode;
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number; };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PageGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 'md',
  className
}: PageGridProps) {
  // Gap mapping
  const gapMap = {
    sm: "gap-3",
    md: "gap-6",
    lg: "gap-8"
  };

  // Get grid column classes based on columns
  const getGridColumns = () => {
    if (typeof columns === "number") {
      return `grid-cols-1 md:grid-cols-${Math.min(columns, 12)}`;
    }
    
    const { sm = 1, md, lg, xl } = columns;
    return cn(
      `grid-cols-${Math.min(sm, 12)}`,
      md && `md:grid-cols-${Math.min(md, 12)}`,
      lg && `lg:grid-cols-${Math.min(lg, 12)}`,
      xl && `xl:grid-cols-${Math.min(xl, 12)}`
    );
  };

  return (
    <div className={cn(
      "grid",
      getGridColumns(),
      gapMap[gap],
      className
    )}>
      {children}
    </div>
  );
}