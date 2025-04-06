import { useProject } from "@/context/ProjectContext";
import type { Project } from "@/context/ProjectContext";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "@/lib/queryClient";

export default function ProjectSelector() {
  const { selectedProject, setSelectedProject } = useProject();
  const [, navigate] = useLocation();
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use the projects from context instead of fetching them directly
  const { projects } = useProject();
  
  // Sync projects from context to local state
  useEffect(() => {
    if (projects && projects.length > 0) {
      setLocalProjects(projects);
      setIsLoading(false);
    }
  }, [projects]);
  
  // Basic initialization of loading state (can be removed if causing issues)
  useEffect(() => {
    setIsLoading(projects.length === 0);
  }, [projects.length]);

  // Simple project selection handler
  const handleSelectProject = (project: Project) => {
    console.log("User selected project:", project);
    
    // Only update if selecting a different project
    if (!selectedProject || selectedProject.id !== project.id) {
      // Let the context handle localStorage and invalidation
      setSelectedProject(project);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="max-w-[200px] px-3 bg-atmf-card border-white/10 hover:bg-atmf-card/80 hover:border-white/20 flex items-center gap-1"
        >
          {selectedProject ? (
            <>
              <span className="truncate">{selectedProject.name}</span>
              <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
            </>
          ) : (
            <>
              <span className="text-muted-foreground">Select Project</span>
              <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px] bg-atmf-card border-white/10">
        <DropdownMenuLabel className="text-white">Projects</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        
        {isLoading ? (
          // Loading skeleton items
          Array.from({ length: 3 }).map((_, index) => (
            <div 
              key={`loading-${index}`} 
              className="flex items-center justify-between py-2 px-2"
            >
              <div className="flex flex-col gap-1 w-full">
                <div className="h-4 w-3/4 bg-atmf-main/20 animate-pulse rounded"></div>
                <div className="h-3 w-1/2 bg-atmf-main/20 animate-pulse rounded"></div>
              </div>
            </div>
          ))
        ) : localProjects.length > 0 ? (
          // Project items when loaded
          localProjects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              className={cn(
                "flex items-center justify-between cursor-pointer",
                selectedProject?.id === project.id && "bg-primary/10"
              )}
              onClick={() => handleSelectProject(project)}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{project.name}</span>
                  {project.jiraProjectId && (
                    <span className="text-xs font-medium bg-emerald-950/50 text-emerald-400 px-1 rounded">
                      {project.jiraProjectId}
                    </span>
                  )}
                </div>
                {project.description && (
                  <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {project.description}
                  </span>
                )}
              </div>
              {selectedProject?.id === project.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))
        ) : (
          // No projects found
          <div className="py-2 px-2 text-center text-sm text-muted-foreground">
            No projects found
          </div>
        )}
        
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem 
          className="text-muted-foreground flex justify-center hover:text-white"
          onClick={() => {
            navigate("/projects");
          }}
        >
          Manage projects
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}