import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/colors";

interface StatusBadgeProps {
  status: string;
  className?: string;
  variant?: 'test' | 'assessment' | 'automation' | 'priority' | 'severity';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusBadge({ 
  status, 
  className, 
  variant = 'test', 
  size = 'md',
  showIcon = false 
}: StatusBadgeProps) {
  // Test status colors
  const testStatusColors = {
    draft: "bg-slate-800 border-slate-600 text-slate-300",
    active: "bg-emerald-900/60 border-emerald-600 text-emerald-300",
    inactive: "bg-amber-900/60 border-amber-600 text-amber-300",
    deprecated: "bg-red-900/60 border-red-600 text-red-300",
    completed: "bg-sky-900/60 border-sky-600 text-sky-300",
    "in-review": "bg-purple-900/60 border-purple-600 text-purple-300",
  };

  // Assessment status colors
  const assessmentStatusColors = {
    scheduled: "bg-sky-900/60 border-sky-600 text-sky-300",
    "in_progress": "bg-amber-900/60 border-amber-600 text-amber-300",
    completed: "bg-emerald-900/60 border-emerald-600 text-emerald-300",
  };

  // Automation status colors
  const automationStatusColors = {
    automated: "bg-emerald-900/60 border-emerald-600 text-emerald-300",
    "in-progress": "bg-amber-900/60 border-amber-600 text-amber-300",
    "not-automated": "bg-slate-800 border-slate-600 text-slate-300",
  };

  // Priority colors
  const priorityColors = {
    high: "bg-red-900/60 border-red-600 text-red-300",
    medium: "bg-amber-900/60 border-amber-600 text-amber-300",
    low: "bg-sky-900/60 border-sky-600 text-sky-300",
  };

  // Severity colors
  const severityColors = {
    critical: "bg-rose-900/60 border-rose-600 text-rose-300",
    high: "bg-red-900/60 border-red-600 text-red-300",
    normal: "bg-amber-900/60 border-amber-600 text-amber-300",
    low: "bg-sky-900/60 border-sky-600 text-sky-300",
  };

  // Icons for statuses
  const getStatusIcon = () => {
    if (!showIcon) return null;
    
    // Map status to appropriate icon
    switch (statusKey) {
      case 'active':
      case 'automated':
      case 'completed':
        return "✓ ";
      case 'in-progress':
      case 'in_progress':
      case 'scheduled':
        return "⟳ ";
      case 'high':
      case 'critical':
        return "! ";
      case 'draft':
      case 'low':
        return "○ ";
      case 'inactive':
      case 'not-automated':
      case 'deprecated':
        return "× ";
      default:
        return "• ";
    }
  };

  // Size variants
  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5"
  };

  // Select the appropriate color map based on variant
  const getColorMap = () => {
    switch (variant) {
      case 'test':
        return testStatusColors;
      case 'assessment':
        return assessmentStatusColors;
      case 'automation':
        return automationStatusColors;
      case 'priority':
        return priorityColors;
      case 'severity':
        return severityColors;
      default:
        return testStatusColors;
    }
  };

  const colorMap = getColorMap();
  const statusKey = status.toLowerCase() as keyof typeof colorMap;
  const statusStyle = colorMap[statusKey] || "bg-slate-800 border-slate-600 text-slate-300";
  const icon = getStatusIcon();

  return (
    <Badge className={cn(
      statusStyle, 
      "font-medium border",
      sizeStyles[size],
      "shadow-sm backdrop-blur-sm",
      className
    )}>
      {icon}{status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ').replace(/-/g, ' ')}
    </Badge>
  );
}