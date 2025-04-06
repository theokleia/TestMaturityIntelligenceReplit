import { cn } from "@/lib/utils";

export type HealthStatus = "critical" | "warning" | "healthy" | "unknown";

interface HealthIndicatorProps {
  status: HealthStatus;
  label?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function HealthIndicator({
  status,
  label,
  size = "md",
  showLabel = false,
  className
}: HealthIndicatorProps) {
  const statusColors = {
    critical: {
      bg: "bg-red-500",
      glow: "shadow-[0_0_10px_rgba(239,68,68,0.7)]",
      label: label || "Critical"
    },
    warning: {
      bg: "bg-amber-500",
      glow: "shadow-[0_0_10px_rgba(245,158,11,0.7)]",
      label: label || "Warning"
    },
    healthy: {
      bg: "bg-emerald-500",
      glow: "shadow-[0_0_10px_rgba(16,185,129,0.7)]",
      label: label || "Healthy"
    },
    unknown: {
      bg: "bg-slate-400",
      glow: "shadow-[0_0_10px_rgba(148,163,184,0.7)]",
      label: label || "Unknown"
    }
  };

  const currentStatus = statusColors[status];
  
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div 
        className={cn(
          "rounded-full transition-all duration-300",
          currentStatus.bg,
          currentStatus.glow,
          sizeClasses[size]
        )}
      />
      {showLabel && (
        <span className="text-sm font-medium">{currentStatus.label}</span>
      )}
    </div>
  );
}

interface HealthIndicatorGroupProps {
  items: {
    status: HealthStatus;
    label: string;
  }[];
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function HealthIndicatorGroup({
  items,
  size = "md",
  className
}: HealthIndicatorGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {items.map((item, index) => (
        <HealthIndicator 
          key={index}
          status={item.status}
          label={item.label}
          size={size}
          showLabel={true}
        />
      ))}
    </div>
  );
}