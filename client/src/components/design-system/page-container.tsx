import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  withPadding?: boolean;
}

export function PageContainer({ 
  children, 
  className, 
  maxWidth = 'full', 
  withPadding = true 
}: PageContainerProps) {
  const maxWidthStyles = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      'w-full mx-auto',
      maxWidthStyles[maxWidth],
      withPadding && 'px-4 md:px-6',
      className
    )}>
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
    <div className={cn('flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4', className)}>
      <div>
        <h1 className={cn(
          'text-2xl md:text-3xl font-bold tracking-tight',
          typeof title === 'string' ? 'text-white' : ''
        )}>
          {title}
        </h1>
        {description && (
          <p className="text-text-muted mt-1.5">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 md:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}

interface PageBodyProps {
  children: ReactNode;
  className?: string;
}

export function PageBody({ children, className }: PageBodyProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  );
}

interface PageSectionProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

export function PageSection({ children, title, description, className }: PageSectionProps) {
  return (
    <section className={cn('', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h2 className={cn(
              'text-xl font-semibold',
              typeof title === 'string' ? 'text-white' : ''
            )}>
              {title}
            </h2>
          )}
          {description && (
            <p className="text-text-muted mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}