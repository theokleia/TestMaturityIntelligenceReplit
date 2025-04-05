import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ATMFCardProps {
  children: ReactNode;
  className?: string;
  neonEffect?: "blue" | "purple" | "teal" | "none";
}

export function ATMFCard({ children, className, neonEffect = "none" }: ATMFCardProps) {
  const neonStyles = {
    blue: "border-primary-blue/20 shadow-[0_0_5px_rgba(46,117,255,0.5),0_0_15px_rgba(46,117,255,0.3)]",
    purple: "border-primary-purple/20 shadow-[0_0_5px_rgba(138,86,255,0.5),0_0_15px_rgba(138,86,255,0.3)]",
    teal: "border-primary-teal/20 shadow-[0_0_5px_rgba(47,255,221,0.5),0_0_15px_rgba(47,255,221,0.3)]",
    none: ""
  };

  return (
    <Card 
      className={cn(
        "backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-white/20", 
        neonEffect !== "none" && neonStyles[neonEffect],
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
    <CardHeader className={cn("flex flex-row items-start justify-between space-y-0", className)}>
      <div className="flex items-start">
        {icon && (
          <div className="mr-3 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <CardTitle className={cn(
            typeof title === "string" ? "text-lg font-bold" : ""
          )}>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-1">
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