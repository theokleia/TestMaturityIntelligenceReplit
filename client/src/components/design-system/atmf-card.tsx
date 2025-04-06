import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { COLORS, SHADOWS } from "@/lib/colors";

interface ATMFCardProps {
  children: ReactNode;
  className?: string;
  neonEffect?: "blue" | "purple" | "teal" | "none";
  elevation?: "flat" | "raised";
  hoverable?: boolean;
}

export function ATMFCard({ 
  children, 
  className, 
  neonEffect = "none", 
  elevation = "flat",
  hoverable = false 
}: ATMFCardProps) {
  const neonStyles = {
    blue: "neon-border-blue",
    purple: "neon-border-purple",
    teal: "neon-border-teal",
    none: ""
  };

  const elevationStyles = {
    flat: "",
    raised: "shadow-lg"
  };

  return (
    <Card 
      className={cn(
        "backdrop-blur-sm bg-atmf-card border-atmf", 
        neonEffect !== "none" && neonStyles[neonEffect],
        elevationStyles[elevation],
        hoverable && "transition-all duration-200 hover:translate-y-[-2px]",
        className
      )}
    >
      {children}
    </Card>
  );
}

interface ATMFCardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function ATMFCardHeader({ title, description, icon, action, className }: ATMFCardHeaderProps) {
  return (
    <CardHeader className={cn("flex flex-row items-start justify-between space-y-0 border-b border-divider-color", className)}>
      <div className="flex items-start">
        {icon && (
          <div className="mr-3 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-black/20">
            {icon}
          </div>
        )}
        <div>
          <CardTitle className={cn(
            typeof title === "string" ? "text-lg font-bold text-atmf-primary" : ""
          )}>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-1 text-atmf-muted">
              {description}
            </CardDescription>
          )}
        </div>
      </div>
      {action && (
        <div>
          {action}
        </div>
      )}
    </CardHeader>
  );
}

interface ATMFCardContentProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function ATMFCardContent({ children, className, padded = true }: ATMFCardContentProps) {
  return (
    <CardContent className={cn(
      padded ? "p-6" : "p-0",
      className
    )}>
      {children}
    </CardContent>
  );
}

interface ATMFCardFooterProps {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
}

export function ATMFCardFooter({ children, className, bordered = false }: ATMFCardFooterProps) {
  return (
    <CardFooter className={cn(
      "px-6 py-4",
      bordered && "border-t border-divider-color",
      className
    )}>
      {children}
    </CardFooter>
  );
}