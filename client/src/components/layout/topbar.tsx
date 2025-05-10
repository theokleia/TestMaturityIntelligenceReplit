import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectSelector from "./project-selector";

interface TopbarProps {
  title?: string;
  actions?: ReactNode;
}

export default function Topbar({ title, actions }: TopbarProps) {
  return (
    <div className={cn(
      "fixed top-0 right-0 left-64 px-6 py-4 flex items-center justify-between",
      "bg-atmf-dark bg-opacity-80 backdrop-blur-md border-b border-white/10",
      "z-20 h-14" // Add z-index and fixed height
    )}>
      <div className="flex items-center gap-4">
        <div className="text-xl font-semibold text-white mr-4">
          {title || "ATMosFera"}
        </div>
        
        {/* Project Selector */}
        <ProjectSelector />
      </div>

      <div className="flex items-center gap-4">
        {/* Page-specific actions (e.g. "Start New Assessment" or "New Project") */}
        {actions}
        
        {/* Settings button */}
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-atmf-card">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}