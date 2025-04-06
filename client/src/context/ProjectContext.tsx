import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

// Define the Project interface
export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Initial mock projects for the selector
const initialProjects: Project[] = [
  { id: 1, name: "E-Commerce Platform", description: "Modernized test suite for online store" },
  { id: 2, name: "Banking API", description: "Security and performance test automation" },
  { id: 3, name: "Healthcare Mobile App", description: "End-to-end testing framework" },
  { id: 4, name: "Cloud Infrastructure", description: "DevOps pipeline testing" },
  { id: 5, name: "IoT Device Management", description: "Test automation for connected devices" },
];

// Create the context with default values
interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projects: Project[];
  addProject: (name: string, description?: string) => Project;
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

// Provider component to wrap the app
export function ProjectProvider({ children }: { children: ReactNode }) {
  // Define state for projects and selected project
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(null);
  
  // Initialize from localStorage on component mount
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        console.log("Loaded projects from localStorage:", parsedProjects);
        setProjects(parsedProjects);
      } else {
        console.log("No projects in localStorage, using initial projects:", initialProjects);
        // Save initial projects to localStorage
        localStorage.setItem('projects', JSON.stringify(initialProjects));
      }
      
      const savedSelectedProject = localStorage.getItem('selectedProject');
      if (savedSelectedProject) {
        setSelectedProjectState(JSON.parse(savedSelectedProject));
      }
    } catch (error) {
      console.error("Error loading projects from localStorage:", error);
      // If there was an error, ensure we at least have the initial projects
      setProjects(initialProjects);
    }
  }, []);
  
  // Save projects to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);
  
  // Save selected project to local storage whenever it changes
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProject', JSON.stringify(selectedProject));
    } else {
      localStorage.removeItem('selectedProject');
    }
  }, [selectedProject]);
  
  // Wrapper for setSelectedProject to ensure we're always using the latest project data
  const setSelectedProject = useCallback((project: Project | null) => {
    if (project) {
      // Find the most up-to-date version of this project
      const updatedProject = projects.find(p => p.id === project.id) || project;
      setSelectedProjectState(updatedProject);
    } else {
      setSelectedProjectState(null);
    }
  }, [projects]);
  
  // Add a new project
  const addProject = useCallback((name: string, description?: string): Project => {
    console.log("Adding project:", name, description);
    
    // Generate a new unique ID
    const maxId = projects.reduce((max, project) => Math.max(max, project.id), 0);
    const newId = maxId + 1;
    
    // Create the new project with current timestamp
    const newProject: Project = {
      id: newId,
      name,
      description: description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log("New project:", newProject);
    
    // Update the projects state with the new project
    setProjects(currentProjects => [...currentProjects, newProject]);
    
    // Select the new project
    setSelectedProjectState(newProject);
    
    console.log("Project added successfully");
    
    return newProject;
  }, [projects]);
  
  // Create the context value object
  const contextValue: ProjectContextType = {
    selectedProject,
    setSelectedProject,
    projects,
    addProject
  };
  
  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

// Custom hook to use the project context
export function useProject() {
  const context = useContext(ProjectContext);
  
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  
  return context;
}