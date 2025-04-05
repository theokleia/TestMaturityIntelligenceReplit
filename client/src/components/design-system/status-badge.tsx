import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  variant?: 'test' | 'assessment' | 'automation' | 'priority' | 'severity';
}

export function StatusBadge({ status, className, variant = 'test' }: StatusBadgeProps) {
  // Test status colors
  const testStatusColors = {
    draft: "bg-slate-500",
    active: "bg-green-500",
    inactive: "bg-yellow-500",
    deprecated: "bg-red-500",
    completed: "bg-blue-500",
    "in-review": "bg-purple-500",
  };

  // Assessment status colors
  const assessmentStatusColors = {
    scheduled: "bg-blue-500",
    "in_progress": "bg-yellow-500",
    completed: "bg-green-500",
  };

  // Automation status colors
  const automationStatusColors = {
    automated: "bg-green-500",
    "in-progress": "bg-yellow-500",
    "not-automated": "bg-slate-500",
  };

  // Priority colors
  const priorityColors = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-blue-500",
  };

  // Severity colors
  const severityColors = {
    critical: "bg-red-700",
    high: "bg-red-500",
    normal: "bg-yellow-500",
    low: "bg-blue-500",
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
  const bgColor = colorMap[statusKey] || "bg-slate-500";

  return (
    <Badge className={cn(bgColor, "text-white", className)}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
    </Badge>
  );
}