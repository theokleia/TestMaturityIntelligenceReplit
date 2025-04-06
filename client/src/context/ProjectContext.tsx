import { createContext, useContext, useState, ReactNode } from "react";

// Define the Project interface
export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Create the context with default values
interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projects: Project[]; // Projects list
  addProject: (name: string, description?: string) => void;
}

const ProjectContext = createContext<ProjectContextType>({
  selectedProject: null,
  setSelectedProject: () => {},
  projects: [],
  addProject: () => {},
});

// Mock projects for the selector
const mockProjects: Project[] = [
  { id: 1, name: "E-Commerce Platform", description: "Modernized test suite for online store" },
  { id: 2, name: "Banking API", description: "Security and performance test automation" },
  { id: 3, name: "Healthcare Mobile App", description: "End-to-end testing framework" },
  { id: 4, name: "Cloud Infrastructure", description: "DevOps pipeline testing" },
  { id: 5, name: "IoT Device Management", description: "Test automation for connected devices" },
];

// Provider component to wrap the app
export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  
  const addProject = (name: string, description?: string) => {
    console.log("Adding project:", name, description);
    console.log("Current projects:", projects);
    
    // Generate a new unique ID (in a real app, this would come from the backend)
    const maxId = projects.reduce((max, project) => Math.max(max, project.id), 0);
    const newId = maxId + 1;
    
    // Create the new project with current timestamp
    const newProject = {
      id: newId,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log("New project to add:", newProject);
    
    // Add the new project to the list
    setProjects([...projects, newProject]);
    
    // Optionally select the new project
    setSelectedProject(newProject);
    
    console.log("Updated projects list should be:", [...projects, newProject]);
    
    return newProject;
  };
  
  return (
    <ProjectContext.Provider value={{ 
      selectedProject, 
      setSelectedProject,
      projects,
      addProject
    }}>
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