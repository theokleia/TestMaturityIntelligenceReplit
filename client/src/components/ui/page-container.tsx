import { ReactNode } from "react";

interface PageContainerProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  actions?: ReactNode;
}

const PageContainer = ({ 
  title, 
  subtitle, 
  children, 
  actions 
}: PageContainerProps) => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">{title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {actions && (
          <div className="flex space-x-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default PageContainer;