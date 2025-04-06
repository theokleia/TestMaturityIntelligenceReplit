import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

// Define the Project interface
export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  jiraProjectId?: string; // Add Jira Project ID (optional, max 10 chars)
  jiraJql?: string; // Add Jira JQL search query (optional)
}

// Define the context type
interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projects: Project[];
  addProject: (name: string, description?: string, jiraProjectId?: string, jiraJql?: string) => Promise<Project>;
  isLoading: boolean;
}

// Create a default context value
const defaultContextValue: ProjectContextType = {
  selectedProject: null,
  setSelectedProject: () => {},
  projects: [],
  addProject: async () => ({ id: 0, name: "" }),
  isLoading: true
};

// Create the context
const ProjectContext = createContext<ProjectContextType>(defaultContextValue);

// Provider component to wrap the app
export function ProjectProvider({ children }: { children: ReactNode }) {
  // Initialize state
  const [projectsState, setProjectsState] = useState<{
    projects: Project[],
    selectedProject: Project | null,
    isLoading: boolean
  }>({
    projects: [],
    selectedProject: null,
    isLoading: true
  });

  // Function to fetch projects from API
  const fetchProjects = useCallback(async () => {
    try {
      setProjectsState(current => ({ ...current, isLoading: true }));
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }
      
      const fetchedProjects: Project[] = await response.json();
      console.log("Fetched projects from database:", fetchedProjects);
      
      // Always update the state with fetched projects, even if empty
      // This ensures we're not keeping stale data in the state
      
      // Get selected project from localStorage
      const storedSelectedProjectId = localStorage.getItem('selectedProjectId');
      let selectedProject = null;
      
      if (storedSelectedProjectId && fetchedProjects.length > 0) {
        const projectId = parseInt(storedSelectedProjectId);
        selectedProject = fetchedProjects.find(p => p.id === projectId) || null;
        
        if (!selectedProject) {
          console.log("Selected project no longer exists, clearing selection");
          localStorage.removeItem('selectedProjectId');
        }
      }
      
      // Default to the first project if none is selected and projects exist
      if (!selectedProject && fetchedProjects.length > 0) {
        selectedProject = fetchedProjects[0];
        localStorage.setItem('selectedProjectId', selectedProject.id.toString());
      }
      
      // Log the updated state
      console.log("Updating ProjectContext with projects:", fetchedProjects);
      
      // Update projects state with the fetched projects
      setProjectsState({
        projects: fetchedProjects,
        selectedProject,
        isLoading: false
      });
      
      console.log("ProjectContext initialized with:", {
        projects: fetchedProjects,
        selectedProject
      });
      
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjectsState(current => ({ 
        ...current, 
        isLoading: false 
      }));
    }
  }, []);

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Set selected project (wrapped to maintain consistency)
  const setSelectedProject = useCallback((project: Project | null) => {
    setProjectsState(current => {
      if (!project) {
        // Remove selected project
        localStorage.removeItem('selectedProjectId');
        return {
          ...current,
          selectedProject: null
        };
      }
      
      // Find the most up-to-date version of this project
      const updatedProject = current.projects.find(p => p.id === project.id) || project;
      
      // Save only the ID to localStorage
      localStorage.setItem('selectedProjectId', updatedProject.id.toString());
      
      return {
        ...current,
        selectedProject: updatedProject
      };
    });
  }, []);

  // Add a new project
  const addProject = useCallback(async (
    name: string, 
    description?: string, 
    jiraProjectId?: string, 
    jiraJql?: string
  ): Promise<Project> => {
    console.log("Adding new project:", { name, description, jiraProjectId, jiraJql });
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description ? description.trim() : "",
          jiraProjectId: jiraProjectId ? jiraProjectId.trim() : "",
          jiraJql: jiraJql ? jiraJql.trim() : "",
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.status}`);
      }
      
      const newProject: Project = await response.json();
      console.log("Created new project:", newProject);
      
      // Update projects state
      setProjectsState(current => {
        const updatedProjects = [...current.projects, newProject];
        
        // Set as the selected project
        localStorage.setItem('selectedProjectId', newProject.id.toString());
        
        return {
          projects: updatedProjects,
          selectedProject: newProject,
          isLoading: false
        };
      });
      
      // Invalidate projects query cache
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }, []);

  // Provide context
  return (
    <ProjectContext.Provider value={{
      selectedProject: projectsState.selectedProject,
      setSelectedProject,
      projects: projectsState.projects,
      addProject,
      isLoading: projectsState.isLoading
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

// Custom hook to use the project context
export const useProject = () => {
  const context = useContext(ProjectContext);
  
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  
  return context;
}