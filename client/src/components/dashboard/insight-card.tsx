import { cn } from "@/lib/utils";
import { type Recommendation } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface InsightCardProps {
  insight: Recommendation;
  className?: string;
  type?: "primary" | "teal" | "purple";
}

export function InsightCard({ insight, className, type = "primary" }: InsightCardProps) {
  // Define style variants based on type
  const typeStyles = {
    primary: "border-primary/20 neon-border",
    teal: "border-primary-teal/20 neon-border-teal",
    purple: "border-primary-purple/20 neon-border-purple",
  };
  
  const iconBgStyles = {
    primary: "bg-primary/20",
    teal: "bg-[#2FFFDD]/20",
    purple: "bg-[#8A56FF]/20",
  };
  
  const iconTextStyles = {
    primary: "text-primary",
    teal: "text-[#2FFFDD]",
    purple: "text-[#8A56FF]",
  };
  
  const actionButtonStyles = {
    primary: "bg-primary/20 text-primary",
    teal: "bg-[#2FFFDD]/20 text-[#2FFFDD]",
    purple: "bg-[#8A56FF]/20 text-[#8A56FF]",
  };

  return (
    <div className={cn(
      "glassmorphism rounded-2xl p-6",
      typeStyles[type],
      className
    )}>
      <div className="flex items-start">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
          iconBgStyles[type]
        )}>
          <i className={cn(
            "bx bx-bulb text-lg",
            iconTextStyles[type]
          )}></i>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-heading font-bold mb-2">{insight.title}</h3>
          <p className="text-text-muted text-sm mb-4">{insight.description}</p>
          
          <div className="flex flex-wrap gap-3">
            {insight.actions?.map((action, index) => {
              if (index === 0) {
                // Primary action
                return (
                  <Button 
                    key={action} 
                    size="sm"
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm",
                      actionButtonStyles[type]
                    )}
                  >
                    {action}
                  </Button>
                );
              }
              
              // Secondary actions
              return (
                <Button 
                  key={action} 
                  variant="ghost" 
                  size="sm"
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-text-muted text-sm"
                >
                  {action}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
