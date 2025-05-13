import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectSelector from "./project-selector";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

interface TopbarProps {
  title?: string;
  actions?: ReactNode;
}

export default function Topbar({ title, actions }: TopbarProps) {
  const { user } = useAuth();
  
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
        
        {/* Settings button with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-atmf-card">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/settings">
                General Settings
              </Link>
            </DropdownMenuItem>
            {user?.role === "admin" && (
              <DropdownMenuItem asChild>
                <Link to="/ai-settings">
                  AI Configuration
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}