import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: "blue" | "purple" | "teal" | "success" | "warning" | "danger";
  animated?: boolean;
  showPercentage?: boolean;
  height?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Progress bar component based on the ATMosFera design system.
 */
export function ProgressBar({
  value,
  max = 100,
  variant = "blue",
  animated = false,
  showPercentage = false,
  height = "md",
  className,
}: ProgressBarProps) {
  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  // Determine color class based on variant
  const colorClasses = {
    blue: "atmf-progress-blue",
    purple: "atmf-progress-purple",
    teal: "atmf-progress-teal",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };
  
  // Determine height class
  const heightClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };
  
  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "atmf-progress-container bg-white/10 rounded-full overflow-hidden",
        heightClasses[height]
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colorClasses[variant],
            animated && "animate-progress bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showPercentage && (
        <div className="text-xs text-atmf-muted mt-1 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}