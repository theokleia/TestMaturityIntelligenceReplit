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
  projects: Project[]; // Mock projects list
}

const ProjectContext = createContext<ProjectContextType>({
  selectedProject: null,
  setSelectedProject: () => {},
  projects: [],
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
  
  return (
    <ProjectContext.Provider value={{ 
      selectedProject, 
      setSelectedProject,
      projects: mockProjects
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