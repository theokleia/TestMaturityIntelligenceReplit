import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: "blue" | "purple" | "teal" | "success" | "warning" | "danger";
  color?: string;  // Alternative to variant for backward compatibility
  size?: string;   // Alternative to height for backward compatibility
  showLabel?: boolean; // Alternative to showPercentage for backward compatibility
  label?: string;  // Optional label to display with percentage
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
  color,
  size,
  showLabel,
  label,
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
  
  // Map color prop to variant prop if provided
  let actualVariant = variant;
  if (color) {
    // Map color to variant if it's one of the predefined colors
    const colorToVariantMap: Record<string, typeof variant> = {
      blue: "blue",
      purple: "purple",
      teal: "teal",
      success: "success",
      warning: "warning",
      danger: "danger",
    };
    
    actualVariant = colorToVariantMap[color] || variant;
  }
  
  // Map size prop to height prop if provided
  const actualHeight = size ? (size === "lg" ? "lg" : size === "sm" ? "sm" : "md") : height;
  
  // Show label (alternative to showPercentage)
  const shouldShowLabel = showLabel || showPercentage;
  const displayLabel = label || `${Math.round(percentage)}%`;
  
  return (
    <div className={cn("w-full", className)}>
      {/* If we have a label and showLabel is true, show it before the progress bar */}
      {label && showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-atmf-text">{label}</span>
          <span className="text-sm text-atmf-muted">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={cn(
        "atmf-progress-container bg-white/10 rounded-full overflow-hidden",
        heightClasses[actualHeight]
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colorClasses[actualVariant],
            animated && "animate-progress bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Only show percentage below if showPercentage is true and we're not already showing a label above */}
      {showPercentage && !showLabel && (
        <div className="text-xs text-atmf-muted mt-1 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}