import { useState, useEffect } from "react";
import { useProject, Project } from "@/context/ProjectContext";

import { PageContainer } from "@/components/design-system/page-container";
import { ATMFCard, ATMFCardHeader, ATMFCardBody, ATMFCardFooter } from "@/components/design-system/atmf-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/design-system/status-badge";
import { TabView } from "@/components/design-system/tab-view";
import { Plus, Edit, Trash2, Clock, Check, ArrowUpDown, Search, Database, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export default function Projects() {
  const { 
    projects, 
    selectedProject, 
    setSelectedProject, 
    addProject, 
    updateProject,
    deleteProject,
    archiveProject,
    unarchiveProject,
    isLoading 
  } = useProject();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [localIsLoading, setLocalIsLoading] = useState(true);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    jiraProjectId: "",
    jiraJql: ""
  });

  // Load projects directly from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLocalIsLoading(true);
        
        // Fetch active projects
        console.log(`Fetching active projects...`);
        const activeResponse = await fetch(`/api/projects?status=active`);
        if (!activeResponse.ok) {
          throw new Error(`Failed to fetch active projects: ${activeResponse.status}`);
        }
        const activeData = await activeResponse.json();
        console.log(`Active projects fetched:`, activeData);
        setActiveProjects(activeData);
        
        // Fetch archived projects
        console.log(`Fetching archived projects...`);
        const archivedResponse = await fetch(`/api/projects?status=archived`);
        if (!archivedResponse.ok) {
          throw new Error(`Failed to fetch archived projects: ${archivedResponse.status}`);
        }
        const archivedData = await archivedResponse.json();
        console.log(`Archived projects fetched:`, archivedData);
        setArchivedProjects(archivedData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLocalIsLoading(false);
      }
    };

    // Always fetch projects directly to ensure we have the latest data
    console.log("Projects page - Fetching all projects");
    fetchProjects();
  }, []);

  // Update filtered projects based on active tab and search term
  useEffect(() => {
    if (localIsLoading) {
      console.log("Still loading projects");
      return;
    }
    
    // Get the correct project list based on active tab
    const projectsToFilter = activeTab === "active" ? activeProjects : archivedProjects;
    
    if (projectsToFilter.length === 0) {
      console.log(`No ${activeTab} projects to filter`);
      setFilteredProjects([]);
      return;
    }
    
    console.log(`Filtering ${activeTab} projects with search term:`, searchTerm);
    
    if (!searchTerm.trim()) {
      setFilteredProjects(projectsToFilter);
      return;
    }
    
    const filtered = projectsToFilter.filter(
      (project: Project) => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    console.log(`Filtered ${activeTab} projects:`, filtered);
    setFilteredProjects(filtered);
  }, [searchTerm, activeProjects, archivedProjects, activeTab, localIsLoading]);

  const handleCreateProject = async () => {
    if (projectForm.name.trim()) {
      console.log("Creating project with form data:", projectForm);
      
      try {
        // Add the project using the context function with the trimmed values
        const createdProject = await addProject(
          projectForm.name.trim(), 
          projectForm.description ? projectForm.description.trim() : "",
          projectForm.jiraProjectId ? projectForm.jiraProjectId.trim() : "",
          projectForm.jiraJql ? projectForm.jiraJql.trim() : ""
        );
        
        console.log("Project added successfully:", createdProject);
        
        // Close the dialog and reset form
        setIsNewProjectOpen(false);
        resetForm();
      } catch (error) {
        console.error("Error adding project:", error);
      }
    }
  };

  const handleEditProject = async () => {
    if (!currentProjectId || !projectForm.name.trim()) return;
    
    console.log("Updating project with form data:", projectForm);
    
    try {
      const updatedProject = await updateProject(currentProjectId, {
        name: projectForm.name.trim(),
        description: projectForm.description ? projectForm.description.trim() : "",
        jiraProjectId: projectForm.jiraProjectId ? projectForm.jiraProjectId.trim() : "",
        jiraJql: projectForm.jiraJql ? projectForm.jiraJql.trim() : ""
      });
      
      console.log("Project updated successfully:", updatedProject);
      
      // Close the dialog and reset form
      setIsEditProjectOpen(false);
      setCurrentProjectId(null);
      resetForm();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProjectId) return;
    
    try {
      const success = await deleteProject(currentProjectId);
      
      if (success) {
        console.log("Project deleted successfully:", currentProjectId);
        
        // Refresh project lists
        console.log("Refreshing project lists after deletion");
        
        // Fetch active projects
        const activeResponse = await fetch(`/api/projects?status=active`);
        if (activeResponse.ok) {
          const activeData = await activeResponse.json();
          console.log(`Updated active projects after deletion:`, activeData);
          setActiveProjects(activeData);
        }
        
        // Fetch archived projects
        const archivedResponse = await fetch(`/api/projects?status=archived`);
        if (archivedResponse.ok) {
          const archivedData = await archivedResponse.json();
          console.log(`Updated archived projects after deletion:`, archivedData);
          setArchivedProjects(archivedData);
        }
      } else {
        console.error("Failed to delete project:", currentProjectId);
      }
      
      // Close the dialog
      setIsDeleteConfirmOpen(false);
      setCurrentProjectId(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleArchiveProject = async (id: number) => {
    try {
      const archivedProject = await archiveProject(id);
      console.log("Project archived successfully:", archivedProject);
      
      // Refresh both active and archived project lists
      console.log("Refreshing project lists after archiving");
      
      // Fetch active projects
      const activeResponse = await fetch(`/api/projects?status=active`);
      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        console.log(`Updated active projects after archive:`, activeData);
        setActiveProjects(activeData);
      }
      
      // Fetch archived projects
      const archivedResponse = await fetch(`/api/projects?status=archived`);
      if (archivedResponse.ok) {
        const archivedData = await archivedResponse.json();
        console.log(`Updated archived projects after archive:`, archivedData);
        setArchivedProjects(archivedData);
      }
    } catch (error) {
      console.error("Error archiving project:", error);
    }
  };

  const handleUnarchiveProject = async (id: number) => {
    try {
      const unarchivedProject = await unarchiveProject(id);
      console.log("Project unarchived successfully:", unarchivedProject);
      
      // Refresh both active and archived project lists
      console.log("Refreshing project lists after unarchiving");
      
      // Fetch active projects
      const activeResponse = await fetch(`/api/projects?status=active`);
      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        console.log(`Updated active projects after unarchive:`, activeData);
        setActiveProjects(activeData);
      }
      
      // Fetch archived projects
      const archivedResponse = await fetch(`/api/projects?status=archived`);
      if (archivedResponse.ok) {
        const archivedData = await archivedResponse.json();
        console.log(`Updated archived projects after unarchive:`, archivedData);
        setArchivedProjects(archivedData);
      }
    } catch (error) {
      console.error("Error unarchiving project:", error);
    }
  };

  const openEditDialog = (project: Project) => {
    setCurrentProjectId(project.id);
    setProjectForm({
      name: project.name,
      description: project.description || "",
      jiraProjectId: project.jiraProjectId || "",
      jiraJql: project.jiraJql || ""
    });
    setIsEditProjectOpen(true);
  };

  const openDeleteDialog = (id: number) => {
    setCurrentProjectId(id);
    setIsDeleteConfirmOpen(true);
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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
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
            <Button 
              className="btn-atmf-accent"
              onClick={() => setIsNewProjectOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localIsLoading ? (
              // Loading state - show 3 loading skeleton cards
              [...Array(3)].map((_, index) => (
                <ATMFCard key={`loading-${index}`} className="opacity-70">
                  <ATMFCardHeader>
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-40 bg-atmf-card animate-pulse rounded"></div>
                    </div>
                  </ATMFCardHeader>
                  <ATMFCardBody>
                    <div className="h-4 w-full bg-atmf-card animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-atmf-card animate-pulse rounded"></div>
                  </ATMFCardBody>
                  <ATMFCardFooter>
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-24 bg-atmf-card animate-pulse rounded"></div>
                      <div className="flex gap-2">
                        <div className="h-8 w-8 bg-atmf-card animate-pulse rounded-full"></div>
                        <div className="h-8 w-8 bg-atmf-card animate-pulse rounded-full"></div>
                      </div>
                    </div>
                  </ATMFCardFooter>
                </ATMFCard>
              ))
            ) : filteredProjects.length > 0 ? (
              // Actual project cards when loaded
              filteredProjects.map(project => (
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full hover:bg-atmf-card"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(project);
                          }}
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full hover:bg-atmf-card hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(project.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </ATMFCardFooter>
                </ATMFCard>
              ))
            ) : (
              // No projects found
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="text-center">
                  <IconWrapper variant="blue" size="lg" className="mx-auto mb-4">
                    <Search className="h-6 w-6" />
                  </IconWrapper>
                  <h3 className="text-lg font-medium mb-2">
                    {activeTab === "active" ? "No active projects found" : "No archived projects found"}
                  </h3>
                  <p className="text-atmf-muted max-w-md">
                    {activeTab === "active" 
                      ? "We couldn't find any active projects matching your search criteria. Try adjusting your search or create a new project."
                      : "We couldn't find any archived projects matching your search criteria. Try adjusting your search or check if you have any archived projects."
                    }
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
        <div className="space-y-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search archived projects..." 
              className="pl-10 bg-atmf-card border-white/10 focus:border-white/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localIsLoading ? (
              // Loading state for archived projects
              [...Array(3)].map((_, index) => (
                <ATMFCard key={`loading-archived-${index}`} className="opacity-70">
                  <ATMFCardHeader>
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-40 bg-atmf-card animate-pulse rounded"></div>
                    </div>
                  </ATMFCardHeader>
                  <ATMFCardBody>
                    <div className="h-4 w-full bg-atmf-card animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-atmf-card animate-pulse rounded"></div>
                  </ATMFCardBody>
                  <ATMFCardFooter>
                    <div className="h-4 w-24 bg-atmf-card animate-pulse rounded"></div>
                  </ATMFCardFooter>
                </ATMFCard>
              ))
            ) : filteredProjects.length > 0 ? (
              // Archived project cards when loaded
              filteredProjects.map(project => (
                <ATMFCard key={project.id} className="opacity-80 border border-white/5 hover:border-white/10">
                  <ATMFCardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{project.name}</h3>
                      <div className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/10 text-text-muted">
                        Archived
                      </div>
                    </div>
                  </ATMFCardHeader>
                  <ATMFCardBody>
                    <p className="text-atmf-muted">{project.description || "No description provided"}</p>
                  </ATMFCardBody>
                  <ATMFCardFooter>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-atmf-muted">
                        {project.createdAt ? `Created ${format(new Date(project.createdAt), 'MMM d, yyyy')}` : "Recently added"}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs border-white/10 hover:bg-atmf-main hover:border-white/20"
                        onClick={() => handleUnarchiveProject(project.id)}
                      >
                        Restore
                      </Button>
                    </div>
                  </ATMFCardFooter>
                </ATMFCard>
              ))
            ) : (
              // No archived projects found
              <div className="col-span-full flex justify-center items-center py-12">
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
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      <PageContainer 
        title="Projects" 
        subtitle="Manage your testing projects and control which project you're working with"
        actions={
          <Button 
            className="btn-atmf-accent"
            onClick={() => setIsNewProjectOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        }
      >
        <ATMFCard>
          <ATMFCardBody>
            <TabView tabs={tabs} defaultTab="active" />
          </ATMFCardBody>
        </ATMFCard>
        
        {/* New Project Dialog */}
        <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
          <DialogContent className="bg-atmf-main border-white/10 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new testing project to your ATMosFera workspace.</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
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
        
        {/* Edit Project Dialog */}
        <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
          <DialogContent className="bg-atmf-main border-white/10 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>Update your project details.</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Project Name</Label>
                <Input 
                  id="edit-name" 
                  name="name"
                  placeholder="Enter project name" 
                  className="bg-atmf-main border-white/10 focus:border-white/20"
                  value={projectForm.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea 
                  id="edit-description" 
                  name="description"
                  placeholder="Describe your project" 
                  className="bg-atmf-main border-white/10 min-h-24 focus:border-white/20"
                  value={projectForm.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-jiraProjectId">Jira Project ID (Optional)</Label>
                <Input 
                  id="edit-jiraProjectId" 
                  name="jiraProjectId"
                  placeholder="e.g. PROJ" 
                  className="bg-atmf-main border-white/10 focus:border-white/20"
                  value={projectForm.jiraProjectId}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-jiraJql">Jira JQL Query (Optional)</Label>
                <Input 
                  id="edit-jiraJql" 
                  name="jiraJql"
                  placeholder="project = PROJ AND type = Bug" 
                  className="bg-atmf-main border-white/10 focus:border-white/20"
                  value={projectForm.jiraJql}
                  onChange={handleInputChange}
                />
              </div>

              {activeTab === "active" && (
                <Button 
                  variant="outline" 
                  className="w-full border-white/10 hover:bg-red-900/20 hover:text-red-400 hover:border-red-400/50"
                  onClick={() => {
                    if (currentProjectId) {
                      handleArchiveProject(currentProjectId);
                      setIsEditProjectOpen(false);
                      setCurrentProjectId(null);
                    }
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Project
                </Button>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditProjectOpen(false);
                  setCurrentProjectId(null);
                  resetForm();
                }}
                className="border-white/10 hover:bg-atmf-main hover:border-white/20"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditProject}
                disabled={!projectForm.name.trim()}
                className="btn-atmf-accent"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent className="bg-atmf-main border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription className="text-atmf-muted">
                Are you sure you want to delete this project? This action cannot be undone.
                <br />
                All data, test cases, and assessments associated with this project will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setCurrentProjectId(null);
                }}
                className="border-white/10 hover:bg-atmf-main hover:border-white/20"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteProject}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageContainer>
    </>
  );
}