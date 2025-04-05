import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "primary" | "success" | "warning" | "danger" | "blue" | "purple" | "teal";
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = "primary",
  size = "sm",
  showLabel = false,
  label,
  className
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  // Progress bar colors
  const colorMap = {
    primary: "bg-primary",
    success: "bg-[#2FFFAA]",
    warning: "bg-[#FFBB3A]",
    danger: "bg-[#FF4A6B]",
    blue: "bg-[#2E75FF]",
    purple: "bg-[#8A56FF]",
    teal: "bg-[#2FFFDD]",
  };
  
  // Progress bar sizes
  const sizeMap = {
    xs: "h-1",
    sm: "h-2",
    md: "h-3",
  };
  
  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1 text-xs text-text-muted">
          <span>{label || `${percentage.toFixed(0)}%`}</span>
          {showLabel && !label && <span>{value}/{max}</span>}
        </div>
      )}
      <div className={cn("w-full bg-white/10 rounded-full overflow-hidden", sizeMap[size])}>
        <div
          className={cn("rounded-full transition-all", colorMap[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}