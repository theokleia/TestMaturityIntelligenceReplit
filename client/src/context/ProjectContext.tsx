import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

// Define the Project interface
export interface Project {
  id: number;
  name: string;
  description?: string;
  status?: "active" | "archived"; // Project status - active or archived
  createdAt?: string;
  updatedAt?: string;
  // Project details for AI context
  projectType?: string; // Greenfield, New Software, Legacy, etc.
  industryArea?: string; // Healthcare, Finance, E-commerce, etc.
  regulations?: string; // Applicable regulations (HIPAA, SOX, GDPR, etc.)
  additionalContext?: string; // Detailed text about intended use, users, and business context
  qualityFocus?: string; // Areas of quality focus (security, performance, usability)
  // Integration settings
  jiraProjectId?: string; // Add Jira Project ID (optional, max 10 chars)
  jiraUrl?: string; // Add Jira base URL (optional)
  jiraJql?: string; // Add Jira JQL search query (optional)
  jiraApiKey?: string; // Add Jira API key (optional)
  jiraIssueType?: string; // Add Jira issue type for test failures (optional)
  githubRepo?: string; // Add GitHub repository (optional)
  githubToken?: string; // Add GitHub token (optional)
  testCaseFormat?: "structured" | "plain"; // Format for test cases
  outputFormat?: "markdown" | "pdf" | "html"; // Format for output
}

// Define the context type
interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projects: Project[];
  addProject: (name: string, description?: string, jiraProjectId?: string, jiraJql?: string) => Promise<Project>;
  updateProject: (id: number, project: Partial<Project>) => Promise<Project | undefined>;
  deleteProject: (id: number) => Promise<boolean>;
  archiveProject: (id: number) => Promise<Project | undefined>;
  unarchiveProject: (id: number) => Promise<Project | undefined>;
  isLoading: boolean;
}

// Create a default context value
const defaultContextValue: ProjectContextType = {
  selectedProject: null,
  setSelectedProject: () => {},
  projects: [],
  addProject: async () => ({ id: 0, name: "" }),
  updateProject: async () => undefined,
  deleteProject: async () => false,
  archiveProject: async () => undefined,
  unarchiveProject: async () => undefined,
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
      
      // Check if we already have a selected project
      let selectedProject = projectsState.selectedProject;
      
      // If we have a selected project, make sure it's still in the fetched projects
      if (selectedProject) {
        // Find updated version of the current project
        const updatedProject = fetchedProjects.find(p => p.id === selectedProject?.id);
        
        if (updatedProject) {
          // Update with latest data
          selectedProject = updatedProject;
        } else {
          // Project was deleted, reset selection
          selectedProject = null;
          localStorage.removeItem('selectedProjectId');
        }
      } else {
        // No selected project, try to get from localStorage
        const storedSelectedProjectId = localStorage.getItem('selectedProjectId');
        
        if (storedSelectedProjectId && fetchedProjects.length > 0) {
          const projectId = parseInt(storedSelectedProjectId);
          selectedProject = fetchedProjects.find(p => p.id === projectId) || null;
          
          if (!selectedProject) {
            console.log("Stored project no longer exists, clearing selection");
            localStorage.removeItem('selectedProjectId');
          }
        }
        
        // Default to the first project if no selection and projects exist
        if (!selectedProject && fetchedProjects.length > 0) {
          selectedProject = fetchedProjects[0];
          console.log("Auto-selecting first project:", selectedProject);
          localStorage.setItem('selectedProjectId', selectedProject.id.toString());
        }
      }
      
      // Log the updated state
      console.log("Updating projects state with:", fetchedProjects.length, "projects and selected:", selectedProject?.name || "none");
      
      // Update projects state with the fetched projects
      setProjectsState({
        projects: fetchedProjects,
        selectedProject,
        isLoading: false
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjectsState(current => ({ 
        ...current, 
        isLoading: false 
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Set selected project (wrapped to maintain consistency)
  const setSelectedProject = useCallback((project: Project | null) => {
    console.log("Setting selected project to:", project?.name || "null");
    
    if (!project) {
      // Remove selected project
      localStorage.removeItem('selectedProjectId');
      setProjectsState(current => ({
        ...current,
        selectedProject: null
      }));
      
      // Force a refresh of relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dimensions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/levels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/roadmap'] });
      
      return;
    }
    
    // Save only the ID to localStorage
    localStorage.setItem('selectedProjectId', project.id.toString());
    
    // Update immediately with current project data
    setProjectsState(current => {
      // Find the most up-to-date version of this project
      const updatedProject = current.projects.find(p => p.id === project.id) || project;
      
      return {
        ...current,
        selectedProject: updatedProject
      };
    });
    
    // Force a refresh of relevant queries
    queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
    queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dimensions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/levels'] });
    queryClient.invalidateQueries({ queryKey: ['/api/ai/roadmap'] });
    
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

  // Update project
  const updateProject = useCallback(async (id: number, project: Partial<Project>): Promise<Project | undefined> => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.status}`);
      }
      
      const updatedProject: Project = await response.json();
      console.log("Updated project:", updatedProject);
      
      // Update projects state
      setProjectsState(current => {
        const updatedProjects = current.projects.map(p => 
          p.id === updatedProject.id ? updatedProject : p
        );
        
        // If this is the selected project, update it too
        const newSelectedProject = current.selectedProject?.id === updatedProject.id 
          ? updatedProject 
          : current.selectedProject;
        
        return {
          projects: updatedProjects,
          selectedProject: newSelectedProject,
          isLoading: false
        };
      });
      
      // Invalidate projects query cache
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      return updatedProject;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  }, []);
  
  // Delete project
  const deleteProject = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.status}`);
      }
      
      console.log("Deleted project with ID:", id);
      
      // Update projects state
      setProjectsState(current => {
        const updatedProjects = current.projects.filter(p => p.id !== id);
        
        // If this was the selected project, select another one
        let newSelectedProject = current.selectedProject;
        if (current.selectedProject?.id === id) {
          localStorage.removeItem('selectedProjectId');
          newSelectedProject = updatedProjects.length > 0 ? updatedProjects[0] : null;
          
          if (newSelectedProject) {
            localStorage.setItem('selectedProjectId', newSelectedProject.id.toString());
          }
        }
        
        return {
          projects: updatedProjects,
          selectedProject: newSelectedProject,
          isLoading: false
        };
      });
      
      // Invalidate projects query cache
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
      return false;
    }
  }, []);
  
  // Archive project
  const archiveProject = useCallback(async (id: number): Promise<Project | undefined> => {
    try {
      const response = await fetch(`/api/projects/${id}/archive`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to archive project: ${response.status}`);
      }
      
      const archivedProject: Project = await response.json();
      console.log("Archived project:", archivedProject);
      
      // Update projects state
      setProjectsState(current => {
        const updatedProjects = current.projects.map(p => 
          p.id === archivedProject.id ? archivedProject : p
        );
        
        // If this is the selected project, update it too
        const newSelectedProject = current.selectedProject?.id === archivedProject.id 
          ? archivedProject 
          : current.selectedProject;
        
        return {
          projects: updatedProjects,
          selectedProject: newSelectedProject,
          isLoading: false
        };
      });
      
      // Invalidate projects query cache
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      return archivedProject;
    } catch (error) {
      console.error("Error archiving project:", error);
      throw error;
    }
  }, []);
  
  // Unarchive project
  const unarchiveProject = useCallback(async (id: number): Promise<Project | undefined> => {
    try {
      const response = await fetch(`/api/projects/${id}/unarchive`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to unarchive project: ${response.status}`);
      }
      
      const unarchivedProject: Project = await response.json();
      console.log("Unarchived project:", unarchivedProject);
      
      // Update projects state
      setProjectsState(current => {
        const updatedProjects = current.projects.map(p => 
          p.id === unarchivedProject.id ? unarchivedProject : p
        );
        
        // If this is the selected project, update it too
        const newSelectedProject = current.selectedProject?.id === unarchivedProject.id 
          ? unarchivedProject 
          : current.selectedProject;
        
        return {
          projects: updatedProjects,
          selectedProject: newSelectedProject,
          isLoading: false
        };
      });
      
      // Invalidate projects query cache
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      return unarchivedProject;
    } catch (error) {
      console.error("Error unarchiving project:", error);
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
      updateProject,
      deleteProject,
      archiveProject,
      unarchiveProject,
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