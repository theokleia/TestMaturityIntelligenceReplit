import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type MaturityLevel } from "@shared/schema";

interface MaturityCardProps {
  level: MaturityLevel;
  className?: string;
  isHighlighted?: boolean;
}

export function MaturityCard({ level, className, isHighlighted = false }: MaturityCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const statusColors = {
    completed: "bg-[#2FFFAA]",
    in_progress: "bg-[#FFBB3A]",
    not_started: "bg-text-muted/30",
  };
  
  const statusLabels = {
    completed: "Completed",
    in_progress: "In Progress",
    not_started: "Not Started",
  };

  return (
    <div 
      className={cn(
        "maturity-card rounded-2xl glassmorphism p-6 border border-white/5 relative overflow-hidden",
        isHighlighted ? "border-primary/20 neon-border" : "",
        (isHovered && !isHighlighted) ? "neon-border" : "",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-0 right-0 rounded-bl-xl bg-white/5 px-3 py-1 text-xs">
        Level {level.level}
      </div>
      
      <h3 className="text-xl font-heading font-bold mb-4 mt-4">{level.name}</h3>
      
      <p className="text-text-muted text-sm mb-4">{level.description}</p>
      
      <div className="mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={cn("h-3 w-3 rounded-full mr-2", statusColors[level.status as keyof typeof statusColors])}></div>
            <span className="text-xs">{statusLabels[level.status as keyof typeof statusLabels]}</span>
          </div>
          <Button variant="link" size="sm" className="text-xs text-primary p-0 h-auto">
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
