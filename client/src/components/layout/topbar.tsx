import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Bell, Settings, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProjectSelector from "./project-selector";

interface TopbarProps {
  title?: string;
  actions?: ReactNode;
}

export default function Topbar({ title, actions }: TopbarProps) {
  return (
    <div className={cn(
      "w-full px-6 py-4 flex items-center justify-between bg-atmf-dark bg-opacity-80 backdrop-blur-md border-b border-white/10 z-10"
    )}>
      <div className="flex items-center gap-4">
        <div className="text-xl font-semibold text-white mr-4">
          {title || "ATMosFera"}
        </div>
        
        {/* Project Selector */}
        <ProjectSelector />
      </div>

      <div className="flex-1 mx-12 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-10 bg-atmf-card border-white/10 focus:border-white/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Page-specific actions (e.g. "Start New Assessment") */}
        {actions}
        
        {/* Icon buttons */}
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-atmf-card">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>
        
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-atmf-card">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Button>
        
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
          <span className="text-sm font-medium text-white">AT</span>
        </div>
      </div>
    </div>
  );
}