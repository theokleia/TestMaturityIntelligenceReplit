import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/colors";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "primary" | "success" | "warning" | "danger" | "blue" | "purple" | "teal";
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  labelPosition?: "top" | "side" | "inside";
  showValue?: boolean;
  className?: string;
  animated?: boolean;
  striped?: boolean;
  glowEffect?: boolean;
  radius?: "none" | "sm" | "md" | "full";
}

export function ProgressBar({
  value,
  max = 100,
  color = "blue",
  size = "sm",
  showLabel = false,
  label,
  labelPosition = "top",
  showValue = false,
  className,
  animated = false,
  striped = false,
  glowEffect = false,
  radius = "full"
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  // Progress bar colors
  const colorMap = {
    primary: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    blue: "atmf-progress-blue",
    purple: "atmf-progress-purple",
    teal: "atmf-progress-teal",
  };
  
  // Progress bar glow effects
  const glowEffectMap = {
    primary: "shadow-[0_0_8px_rgba(255,255,255,0.5)]",
    success: "shadow-[0_0_8px_rgba(47,255,170,0.5)]",
    warning: "shadow-[0_0_8px_rgba(255,187,58,0.5)]",
    danger: "shadow-[0_0_8px_rgba(255,74,107,0.5)]",
    blue: "shadow-[0_0_8px_rgba(46,117,255,0.5)]",
    purple: "shadow-[0_0_8px_rgba(138,86,255,0.5)]",
    teal: "shadow-[0_0_8px_rgba(47,255,221,0.5)]",
  };
  
  // Border radius based on setting
  const radiusMap = {
    none: "rounded-none",
    sm: "rounded",
    md: "rounded-md",
    full: "rounded-full"
  };
  
  // Progress bar sizes
  const sizeMap = {
    xs: "h-1",
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };
  
  // Stripe pattern
  const stripeStyle = striped ? {
    backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
    backgroundSize: '1rem 1rem'
  } : {};
  
  // Animation class
  const animationClass = animated ? "animate-progress" : "";
  
  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && labelPosition === "top" && (
        <div className="flex justify-between mb-1 text-xs text-atmf-muted">
          <span>{label || ''}</span>
          {showValue && <span>{value}/{max} ({percentage.toFixed(0)}%)</span>}
        </div>
      )}
      
      <div className={cn("relative", labelPosition === "side" && "flex items-center gap-3")}>
        {(label || showValue) && labelPosition === "side" && (
          <div className="flex-shrink-0 min-w-[4rem] text-xs text-atmf-muted">
            {label || (showValue ? `${percentage.toFixed(0)}%` : '')}
          </div>
        )}
        
        <div className={cn(
          "w-full bg-black/30 overflow-hidden border border-white/5",
          radiusMap[radius],
          sizeMap[size]
        )}>
          <div
            className={cn(
              "h-full transition-all duration-500",
              radiusMap[radius],
              colorMap[color],
              animationClass,
              glowEffect && glowEffectMap[color]
            )}
            style={{ 
              width: `${percentage}%`, 
              ...stripeStyle
            }}
          >
            {(showLabel || showValue) && labelPosition === "inside" && size === "lg" && (
              <div className="px-2 text-xs text-white h-full flex items-center justify-center">
                {label ? label : showValue ? `${percentage.toFixed(0)}%` : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}