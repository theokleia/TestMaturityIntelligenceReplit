import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

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

// Default sample projects
const defaultProjects: Project[] = [
  { 
    id: 1, 
    name: "E-Commerce Platform", 
    description: "Modernized test suite for online store",
    jiraProjectId: "ECOM",
    jiraJql: "project = ECOM AND issuetype in (Bug, Test) AND status != Closed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: 2, 
    name: "Banking API", 
    description: "Security and performance test automation",
    jiraProjectId: "BANK",
    jiraJql: "project = BANK AND component = API AND priority >= Medium",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString() 
  },
  { 
    id: 3, 
    name: "Healthcare Mobile App", 
    description: "End-to-end testing framework",
    jiraProjectId: "HEALTH",
    jiraJql: "project = HEALTH AND labels = mobile",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString() 
  },
  { 
    id: 4, 
    name: "Cloud Infrastructure", 
    description: "DevOps pipeline testing",
    jiraProjectId: "CLOUD",
    jiraJql: "project = CLOUD AND component in (AWS, Azure, GCP)",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString() 
  },
  { 
    id: 5, 
    name: "IoT Device Management", 
    description: "Test automation for connected devices",
    jiraProjectId: "IOT",
    jiraJql: "project = IOT AND issuetype = Test",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString() 
  }
];

// Define the context type
interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projects: Project[];
  addProject: (name: string, description?: string, jiraProjectId?: string, jiraJql?: string) => Project;
}

// Create a default context value
const defaultContextValue: ProjectContextType = {
  selectedProject: null,
  setSelectedProject: () => {},
  projects: [],
  addProject: () => ({ id: 0, name: "" })
};

// Create the context
const ProjectContext = createContext<ProjectContextType>(defaultContextValue);

// For debugging only - uncomment to reset local storage
// if (typeof window !== 'undefined') {
//   console.log("Clearing localStorage for fresh start");
//   localStorage.removeItem('projects');
//   localStorage.removeItem('selectedProject');
// }

// Provider component to wrap the app
export function ProjectProvider({ children }: { children: ReactNode }) {
  // Initialize state
  const [projectsState, setProjectsState] = useState<{
    projects: Project[],
    selectedProject: Project | null,
    initialized: boolean
  }>({
    projects: [],
    selectedProject: null,
    initialized: false
  });

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = () => {
      try {
        // Attempt to load projects from localStorage
        const storedProjects = localStorage.getItem('projects');
        let initialProjects = defaultProjects;
        let initialSelectedProject = null;

        // If localStorage has projects, use them
        if (storedProjects) {
          const parsedProjects = JSON.parse(storedProjects);
          if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
            console.log("Found stored projects:", parsedProjects);
            initialProjects = parsedProjects;
          } else {
            console.log("Invalid or empty stored projects, using defaults");
            // Save defaults to localStorage
            localStorage.setItem('projects', JSON.stringify(defaultProjects));
          }
        } else {
          console.log("No stored projects found, using defaults");
          // Save defaults to localStorage 
          localStorage.setItem('projects', JSON.stringify(defaultProjects));
        }

        // Check for selected project
        const storedSelectedProject = localStorage.getItem('selectedProject');
        if (storedSelectedProject) {
          try {
            const parsedSelectedProject = JSON.parse(storedSelectedProject);
            // Make sure the selected project exists in our list
            const projectExists = initialProjects.some(p => p.id === parsedSelectedProject.id);
            
            if (projectExists) {
              initialSelectedProject = parsedSelectedProject;
            } else {
              console.log("Selected project doesn't exist in project list, ignoring");
              localStorage.removeItem('selectedProject');
            }
          } catch (e) {
            console.error("Error parsing selected project:", e);
            localStorage.removeItem('selectedProject');
          }
        }

        // Update state with initial data
        setProjectsState({
          projects: initialProjects,
          selectedProject: initialSelectedProject,
          initialized: true
        });
        
        console.log("ProjectContext initialized with:", {
          projects: initialProjects,
          selectedProject: initialSelectedProject
        });
      } catch (error) {
        console.error("Error initializing project context:", error);
        // Fall back to defaults if anything goes wrong
        setProjectsState({
          projects: defaultProjects,
          selectedProject: null,
          initialized: true
        });
        
        // Reset localStorage
        localStorage.setItem('projects', JSON.stringify(defaultProjects));
        localStorage.removeItem('selectedProject');
      }
    };

    // Only load initial data if not already initialized
    if (!projectsState.initialized) {
      loadInitialData();
    }
  }, [projectsState.initialized]);

  // Set selected project (wrapped to maintain consistency)
  const setSelectedProject = useCallback((project: Project | null) => {
    setProjectsState(current => {
      if (!project) {
        // Remove selected project
        localStorage.removeItem('selectedProject');
        return {
          ...current,
          selectedProject: null
        };
      }
      
      // Find the most up-to-date version of this project
      const updatedProject = current.projects.find(p => p.id === project.id) || project;
      
      // Save to localStorage
      localStorage.setItem('selectedProject', JSON.stringify(updatedProject));
      
      return {
        ...current,
        selectedProject: updatedProject
      };
    });
  }, []);

  // Add a new project
  const addProject = useCallback((name: string, description?: string, jiraProjectId?: string, jiraJql?: string): Project => {
    console.log("Adding new project:", { name, description, jiraProjectId, jiraJql });
    
    let newProject: Project = { id: 0, name: "" };
    
    setProjectsState(current => {
      // Generate a new ID
      const maxId = current.projects.length > 0
        ? Math.max(...current.projects.map(p => p.id))
        : 0;
      
      // Create new project
      newProject = {
        id: maxId + 1,
        name: name.trim(),
        description: description ? description.trim() : "",
        jiraProjectId: jiraProjectId ? jiraProjectId.trim() : "",
        jiraJql: jiraJql ? jiraJql.trim() : "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log("Created new project object:", newProject);
      
      // Add to projects array
      const updatedProjects = [...current.projects, newProject];
      
      // Save to localStorage
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      // Also set as selected project
      localStorage.setItem('selectedProject', JSON.stringify(newProject));
      
      console.log("Updated projects list:", updatedProjects);
      
      return {
        ...current,
        projects: updatedProjects,
        selectedProject: newProject
      };
    });
    
    // Return the new project (this isn't ideal but works for now)
    // In a real app, we'd wait for state update to complete
    return newProject;
  }, []);

  // Provide context
  return (
    <ProjectContext.Provider value={{
      selectedProject: projectsState.selectedProject,
      setSelectedProject,
      projects: projectsState.projects,
      addProject
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