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

export default function ProjectSelector() {
  const { selectedProject, setSelectedProject, projects } = useProject();
  const [, navigate] = useLocation();
  
  // Log the current projects and selected project for debugging
  console.log("ProjectSelector - Projects:", projects);
  console.log("ProjectSelector - Selected project:", selectedProject);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="max-w-[200px] px-3 bg-atmf-card border-white/10 hover:bg-atmf-card/80 hover:border-white/20 flex items-center gap-1"
        >
          {selectedProject ? (
            <span className="truncate">{selectedProject.name}</span>
          ) : (
            <span className="text-muted-foreground">Select Project</span>
          )}
          <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px] bg-atmf-card border-white/10">
        <DropdownMenuLabel className="text-white">Projects</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              selectedProject?.id === project.id && "bg-primary/10"
            )}
            onClick={() => setSelectedProject(project)}
          >
            <div className="flex flex-col">
              <span className="font-medium">{project.name}</span>
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
        ))}
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