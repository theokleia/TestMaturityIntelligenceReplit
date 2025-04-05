import { cn } from "@/lib/utils";
import { type Metric } from "@shared/schema";

interface MetricsCardProps {
  metric: Metric;
  className?: string;
}

export function MetricsCard({ metric, className }: MetricsCardProps) {
  const getStatusColor = () => {
    const positive = metric.isPositive;
    const direction = metric.changeDirection;

    // For positive metrics (like coverage), up is good
    // For negative metrics (like defect density), down is good
    const isGood = 
      (positive && direction === "up") || 
      (!positive && direction === "down");

    return isGood ? "text-[#2FFFAA]" : "text-[#FF4A6B]";
  };

  const getStatusIcon = () => {
    return metric.changeDirection === "up" ? "bx-up-arrow-alt" : "bx-down-arrow-alt";
  };

  const getProgressColor = () => {
    return metric.color || "#2E75FF";
  };

  const getProgressWidth = () => {
    // This is a simplified approach - in a real app, you might calculate this based on
    // current value vs target value or some other meaningful way
    if (metric.value.includes("%")) {
      return metric.value.replace("%", "");
    }
    
    // Default to 50% if we can't determine a percentage
    return "50";
  };

  return (
    <div className={cn(
      "glassmorphism rounded-2xl p-6 border border-white/5",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">{metric.name}</h3>
        <div className={cn("flex items-center text-xs", getStatusColor())}>
          <i className={cn("bx", getStatusIcon())}></i>
          <span>{metric.change}</span>
        </div>
      </div>
      
      <div className="text-3xl font-bold mb-4">{metric.value}</div>
      
      <div className="h-2 w-full bg-white/10 rounded-full mb-2">
        <div 
          className="h-full rounded-full" 
          style={{ 
            width: `${getProgressWidth()}%`, 
            backgroundColor: getProgressColor() 
          }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>Previous: {metric.previousValue}</span>
        <span>Target: {metric.targetValue}</span>
      </div>
    </div>
  );
}
