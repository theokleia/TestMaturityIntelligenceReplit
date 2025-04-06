import { useProject } from "@/context/ProjectContext";
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
import { Project } from "@/context/ProjectContext";

export default function ProjectSelector() {
  const { selectedProject, setSelectedProject, projects, isLoading } = useProject();
  const [, navigate] = useLocation();
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  
  // Log the current projects and selected project for debugging
  console.log("ProjectSelector - Projects:", projects);

  // Ensure we update our local state when project context changes
  useEffect(() => {
    // Update local projects whenever the projects array changes
    // We don't need to check for length as we want to reflect empty arrays too
    if (!isLoading) {
      console.log("Setting local projects:", projects);
      setLocalProjects(projects);
    }
  }, [projects, isLoading]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "max-w-[200px] px-3 bg-atmf-card border-white/10 hover:bg-atmf-card/80 hover:border-white/20 flex items-center gap-1",
            isLoading && "opacity-70"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-1">
              <div className="h-4 w-24 bg-atmf-main/30 animate-pulse rounded"></div>
              <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
            </div>
          ) : selectedProject ? (
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
          [...Array(3)].map((_, index) => (
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
        ) : localProjects && localProjects.length > 0 ? (
          // Project items when loaded
          localProjects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              className={cn(
                "flex items-center justify-between cursor-pointer",
                selectedProject?.id === project.id && "bg-primary/10"
              )}
              onClick={() => setSelectedProject(project)}
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