import { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import Layout from "@/components/layout/layout";
import { PageContainer } from "@/components/design-system/page-container";
import { ATMFCard, ATMFCardHeader, ATMFCardBody, ATMFCardFooter } from "@/components/design-system/atmf-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/design-system/status-badge";
import { TabView } from "@/components/design-system/tab-view";
import { Plus, Edit, Trash2, Clock, Check, ArrowUpDown, Search, Database } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { format } from "date-fns";

export default function Projects() {
  const { projects, selectedProject, setSelectedProject, addProject } = useProject();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    jiraProjectId: "",
    jiraJql: ""
  });

  // Log projects when they change
  useEffect(() => {
    console.log("Projects page - All projects:", projects);
  }, [projects]);
  
  // Filter projects when search term changes
  useEffect(() => {
    console.log("Filtering projects with search term:", searchTerm);
    
    const filtered = projects.filter(
      project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    console.log("Projects page - Filtered projects:", filtered);
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  const handleCreateProject = () => {
    if (projectForm.name.trim()) {
      console.log("Creating project with form data:", projectForm);
      
      try {
        // Add the project using the context function with the trimmed values
        // We need to update the addProject function definition in ProjectContext
        const newProject = {
          id: 0, // Will be replaced by the addProject function
          name: projectForm.name.trim(),
          description: projectForm.description ? projectForm.description.trim() : "",
          jiraProjectId: projectForm.jiraProjectId ? projectForm.jiraProjectId.trim() : "",
          jiraJql: projectForm.jiraJql ? projectForm.jiraJql.trim() : "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add the project and get back the updated version with ID assigned
        const createdProject = addProject(
          newProject.name, 
          newProject.description,
          projectForm.jiraProjectId ? projectForm.jiraProjectId.trim() : "",
          projectForm.jiraJql ? projectForm.jiraJql.trim() : ""
        );
        
        // This next part is a temporary solution until we update the addProject function
        // to accept all fields. For now, we'll just use what we get back.
        console.log("Project added successfully:", createdProject);
        
        // Update filtered projects immediately to show the new project
        setFilteredProjects(prev => [...prev, createdProject]);
        
        // Close the dialog and reset form
        setIsNewProjectOpen(false);
        setProjectForm({
          name: "",
          description: "",
          jiraProjectId: "",
          jiraJql: ""
        });
        
        // Force a re-fetch of projects from the context
        setTimeout(() => {
          console.log("Current projects after adding:", projects);
        }, 100);
      } catch (error) {
        console.error("Error adding project:", error);
      }
    }
  };

  const resetForm = () => {
    setProjectForm({
      name: "",
      description: "",
      jiraProjectId: "",
      jiraJql: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create tabs for Active and Archived projects
  const tabs = [
    {
      id: "active",
      label: (
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Active Projects</span>
        </div>
      ),
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search projects..." 
                className="pl-10 bg-atmf-card border-white/10 focus:border-white/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-white/10 hover:bg-atmf-card hover:border-white/20"
                onClick={() => {
                  // Create a quick test project with pre-filled values
                  const testProject = addProject(
                    "Test Project " + new Date().toLocaleTimeString(),
                    "This is an auto-generated test project for demonstration purposes",
                    "TEST",
                    "project = TEST AND component = Demo"
                  );
                  setSelectedProject(testProject);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Test Project
              </Button>
              <Button 
                className="btn-atmf-accent"
                onClick={() => setIsNewProjectOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ATMFCard 
                key={project.id} 
                className={selectedProject?.id === project.id ? "neon-border-blue" : ""}
                neonBorder={selectedProject?.id === project.id ? "blue" : "none"}
                onClick={() => setSelectedProject(project)}
              >
                <ATMFCardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{project.name}</h3>
                    {selectedProject?.id === project.id && (
                      <StatusBadge variant="blue" dot>Active</StatusBadge>
                    )}
                  </div>
                </ATMFCardHeader>
                <ATMFCardBody>
                  <p className="text-atmf-muted">{project.description || "No description provided"}</p>
                  
                  {/* Jira integration info */}
                  {project.jiraProjectId && (
                    <div className="mt-3 flex items-center space-x-2 rounded-md bg-slate-900/30 p-2 text-xs text-atmf-muted border border-white/5">
                      <div className="text-primary">
                        <Database className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white flex items-center">
                          <span>Jira Integration:</span>
                          <span className="ml-1 text-emerald-400">{project.jiraProjectId}</span>
                        </p>
                        {project.jiraJql && (
                          <p className="truncate text-xs text-atmf-muted">{project.jiraJql}</p>
                        )}
                      </div>
                    </div>
                  )}
                </ATMFCardBody>
                <ATMFCardFooter>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-atmf-muted">
                      {project.createdAt ? `Created ${format(new Date(project.createdAt), 'MMM d, yyyy')}` : "Recently added"}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-atmf-card">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-atmf-card hover:text-red-400">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </ATMFCardFooter>
              </ATMFCard>
            ))}
            
            {filteredProjects.length === 0 && (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="text-center">
                  <IconWrapper variant="blue" size="lg" className="mx-auto mb-4">
                    <Search className="h-6 w-6" />
                  </IconWrapper>
                  <h3 className="text-lg font-medium mb-2">No projects found</h3>
                  <p className="text-atmf-muted max-w-md">
                    We couldn't find any projects matching your search criteria. Try adjusting your search or create a new project.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: "archived",
      label: (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Archived Projects</span>
        </div>
      ),
      content: (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <IconWrapper variant="muted" size="lg" className="mx-auto mb-4">
              <Clock className="h-6 w-6" />
            </IconWrapper>
            <h3 className="text-lg font-medium mb-2">No archived projects</h3>
            <p className="text-atmf-muted max-w-md">
              Archived projects will appear here. Archive a project when it's no longer active but you still want to keep its data.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <PageContainer 
        title="Projects" 
        subtitle="Manage your testing projects and control which project you're working with"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-white/10 hover:bg-atmf-card hover:border-white/20"
              onClick={() => {
                // Create a quick test project with pre-filled values
                const testProject = addProject(
                  "Test Project " + new Date().toLocaleTimeString(),
                  "This is an auto-generated test project for demonstration purposes",
                  "TEST",
                  "project = TEST AND component = Demo"
                );
                setSelectedProject(testProject);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Test Project
            </Button>
            <Button 
              className="btn-atmf-accent"
              onClick={() => setIsNewProjectOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        }
      >
        <ATMFCard>
          <ATMFCardBody>
            <TabView tabs={tabs} defaultTab="active" />
          </ATMFCardBody>
        </ATMFCard>
        
        {/* New Project Dialog */}
        <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
          <DialogContent className="bg-atmf-card border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription className="text-atmf-muted">
                Add a new testing project to your ATMosFera workspace.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Project Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter project name"
                  className="bg-atmf-main border-white/10 focus:border-white/20"
                  value={projectForm.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter project description"
                  className="bg-atmf-main border-white/10 focus:border-white/20 min-h-[100px]"
                  value={projectForm.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="jiraProjectId" className="text-sm font-medium">
                  Jira Project ID <span className="text-xs text-atmf-muted">(Optional)</span>
                </label>
                <Input
                  id="jiraProjectId"
                  name="jiraProjectId"
                  placeholder="Enter Jira Project ID"
                  maxLength={10}
                  className="bg-atmf-main border-white/10 focus:border-white/20"
                  value={projectForm.jiraProjectId}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-atmf-muted">Max 10 characters</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="jiraJql" className="text-sm font-medium">
                  Jira JQL Query <span className="text-xs text-atmf-muted">(Optional)</span>
                </label>
                <Textarea
                  id="jiraJql"
                  name="jiraJql"
                  placeholder="Enter Jira JQL search query"
                  className="bg-atmf-main border-white/10 focus:border-white/20 min-h-[80px]"
                  value={projectForm.jiraJql}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-atmf-muted">JQL query to filter Jira tickets</p>
              </div>
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsNewProjectOpen(false);
                }}
                className="border-white/10 hover:bg-atmf-main hover:border-white/20"
              >
                Cancel
              </Button>
              <Button 
                className="btn-atmf-accent"
                onClick={handleCreateProject}
                disabled={!projectForm.name}
              >
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </Layout>
  );
}