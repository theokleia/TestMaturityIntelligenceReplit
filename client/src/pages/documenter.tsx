import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageContainer, PageHeader, PageContent } from "@/components/design-system/page-container";
import { TabView } from "@/components/design-system/tab-view";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, FileEdit, Trash2, Save, RefreshCcw, FileTerminal, GitBranch, Sparkles, Book, ClipboardList, Layers } from "lucide-react";
import { ATMFCard, ATMFCardHeader } from "@/components/design-system/atmf-card";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, StatusBadgeVariant } from "@/components/design-system/status-badge";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useProject } from "@/context/ProjectContext";
import { Markdown } from "@/components/markdown";

// Define the document type schema
const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Document type is required"),
  description: z.string().optional(),
  content: z.string().optional(),
  status: z.string().default("draft"),
  projectId: z.number(),
  aiPrompt: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Type for the document form
type DocumentFormValues = z.infer<typeof documentSchema>;

// Types to match backend schema
interface Document {
  id: number;
  title: string;
  type: string;
  content: string;
  description: string;
  createdBy: number | null;
  projectId: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  version: string;
  status: string;
  aiPrompt?: string;
}

// Document types
type DocumentType = "PRD" | "SRS" | "SDDS" | "Trace Matrix" | "Test Plan" | "Test Report" | "Custom";

// Component for the Documenter AI page
export default function DocumenterPage() {
  const [createDocumentOpen, setCreateDocumentOpen] = useState(false);
  const [editDocumentOpen, setEditDocumentOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewDocumentOpen, setViewDocumentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedProject } = useProject();

  // Define document form
  const createDocumentForm = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      type: "",
      description: "",
      content: "",
      status: "draft",
      projectId: selectedProject?.id || 0,
      tags: []
    }
  });

  // Reset form when selected project changes
  useEffect(() => {
    if (selectedProject?.id) {
      createDocumentForm.setValue("projectId", selectedProject.id);
    }
  }, [selectedProject, createDocumentForm]);

  // Edit document form
  const editDocumentForm = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      type: "",
      description: "",
      content: "",
      status: "draft",
      projectId: selectedProject?.id || 0,
      tags: []
    }
  });

  // Set edit form values when document is selected
  useEffect(() => {
    if (selectedDocument) {
      editDocumentForm.reset({
        title: selectedDocument.title,
        type: selectedDocument.type,
        description: selectedDocument.description,
        content: selectedDocument.content,
        status: selectedDocument.status,
        projectId: selectedDocument.projectId,
        tags: selectedDocument.tags || [],
        aiPrompt: selectedDocument.aiPrompt
      });
    }
  }, [selectedDocument, editDocumentForm]);

  // Query for fetching AI-generated documents (all except Knowledge Base type)
  const { data: documents, isLoading: isLoadingDocuments, refetch: refetchDocuments } = useQuery<Document[]>({
    queryKey: ["/api/documents", selectedProject?.id, "ai-generated"],
    queryFn: async () => {
      if (!selectedProject?.id) return [];
      
      console.log(`Fetching AI-generated documents for project:`, selectedProject.id);
      
      try {
        // Using regular fetch instead of apiRequest to get better error handling
        console.log(`Using direct fetch to access API endpoint`);
        const res = await fetch(`/api/documents?projectId=${selectedProject.id}`);
        
        if (!res.ok) {
          console.error(`Error fetching documents: ${res.status} ${res.statusText}`);
          
          // If unauthorized, redirect to login or re-authenticate
          if (res.status === 401) {
            console.error("Authentication required - please log in to access documents");
            // Don't throw here, just return empty array
            return [];
          }
          
          throw new Error(`Failed to fetch documents: ${res.statusText}`);
        }
        
        const allDocuments = await res.json();
        
        // Add more detailed logging to debug filtering
        console.log(`All documents:`, allDocuments);
        
        // Filter out Knowledge Base documents
        const filteredDocuments = allDocuments.filter((doc: Document) => {
          const isKnowledgeBase = doc.type === "Knowledge Base";
          console.log(`Document ${doc.id} - ${doc.title} type: ${doc.type} - Include? ${!isKnowledgeBase}`);
          return !isKnowledgeBase;
        });
        
        console.log(`All documents count:`, allDocuments.length);
        console.log(`AI-generated documents loaded:`, filteredDocuments.length);
        console.log(`AI-generated documents:`, filteredDocuments);
        
        return filteredDocuments;
      } catch (error) {
        console.error("Error in document fetch:", error);
        return [];
      }
    },
    enabled: !!selectedProject?.id,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0 // Always refetch when component mounts
  });

  // Mutation for creating documents
  const createDocumentMutation = useMutation({
    mutationFn: async (document: DocumentFormValues) => {
      // Add logging to debug document creation
      console.log("Saving document to server:", document);
      
      // The apiRequest function already calls res.json() and returns the result
      const result = await apiRequest("/api/documents", { 
        method: "POST", 
        body: JSON.stringify(document) 
      });
      
      console.log("Document saved successfully with ID:", result.id);
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Document created",
        description: "Your document has been created successfully.",
      });
      setCreateDocumentOpen(false);
      createDocumentForm.reset();
      
      // Force invalidation with specific project ID and document type filter
      if (selectedProject?.id) {
        console.log("Fetching AI-generated documents for project:", selectedProject.id);
        queryClient.invalidateQueries({ 
          queryKey: ["/api/documents", selectedProject.id, "ai-generated"] 
        });
      }
      
      // Also refresh the document list with a direct refetch
      refetchDocuments();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create document",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation for updating documents
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, document }: { id: number; document: Partial<DocumentFormValues> }) => {
      console.log(`Updating document ${id} with data:`, document);
      // The apiRequest function already calls res.json() and returns the result
      const result = await apiRequest(`/api/documents/${id}`, { 
        method: "PATCH", 
        body: JSON.stringify(document) 
      });
      console.log("Document updated successfully:", result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Document updated",
        description: "Your document has been updated successfully.",
      });
      setEditDocumentOpen(false);
      
      // More specific cache invalidation with project ID and document type filter
      if (selectedProject?.id) {
        console.log("Invalidating AI-generated documents cache for project:", selectedProject.id);
        queryClient.invalidateQueries({ 
          queryKey: ["/api/documents", selectedProject.id, "ai-generated"] 
        });
      }
      
      // Also force a direct refetch
      refetchDocuments();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update document",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation for deleting documents
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`Deleting document with ID: ${id}`);
      await apiRequest(`/api/documents/${id}`, { method: "DELETE" });
      console.log(`Document ${id} deleted successfully`);
    },
    onSuccess: () => {
      toast({
        title: "Document deleted",
        description: "Your document has been deleted successfully.",
      });
      
      // More specific cache invalidation with project ID and document type filter
      if (selectedProject?.id) {
        console.log(`Invalidating AI-generated documents cache for project ${selectedProject.id}`);
        queryClient.invalidateQueries({ 
          queryKey: ["/api/documents", selectedProject.id, "ai-generated"] 
        });
      }
      
      // Also force a direct refetch
      refetchDocuments();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete document",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation for generating a document with AI
  const generateDocumentMutation = useMutation({
    mutationFn: async (data: { projectId: number, type: string, customPrompt?: string }) => {
      // The apiRequest function already calls res.json() and returns the result
      return await apiRequest("/api/ai/generate-document", { 
        method: "POST", 
        body: JSON.stringify(data) 
      });
    },
    onSuccess: (data) => {
      // Set the form values for creating a new document
      createDocumentForm.reset({
        title: data.title,
        type: data.type,
        description: data.description,
        content: data.content,
        status: "draft",
        projectId: data.projectId,
        tags: [],
        aiPrompt: data.prompt
      });
      
      // Open the create document dialog
      setCreateDocumentOpen(true);
      
      // Don't show a toast here - we'll show it only after actual document creation
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate document",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle document creation form submission
  const onCreateDocumentSubmit = (data: DocumentFormValues) => {
    createDocumentMutation.mutate(data);
  };

  // Handle document edit form submission
  const onEditDocumentSubmit = (data: DocumentFormValues) => {
    if (selectedDocument) {
      updateDocumentMutation.mutate({ id: selectedDocument.id, document: data });
    }
  };

  // Handle document deletion
  const handleDeleteDocument = (document: Document) => {
    if (confirm(`Are you sure you want to delete "${document.title}"?`)) {
      deleteDocumentMutation.mutate(document.id);
    }
  };

  // Handle document generation
  const handleGenerateDocument = (type: DocumentType) => {
    if (!selectedProject?.id) {
      toast({
        title: "No project selected",
        description: "Please select a project first.",
        variant: "destructive",
      });
      return;
    }
    
    generateDocumentMutation.mutate({ 
      projectId: selectedProject.id,
      type
    });
  };

  // Icons for document types
  const documentTypeIcons: Record<string, React.ReactNode> = {
    "PRD": <FileText className="w-5 h-5" />,
    "SRS": <Book className="w-5 h-5" />,
    "SDDS": <Layers className="w-5 h-5" />,
    "Trace Matrix": <GitBranch className="w-5 h-5" />,
    "Test Plan": <ClipboardList className="w-5 h-5" />,
    "Test Report": <FileTerminal className="w-5 h-5" />,
    "Custom": <FileText className="w-5 h-5" />
  };

  // Generate Document UI
  const generateDocumentContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      <Card className="border border-slate-700/50 hover:border-slate-700 transition-colors shadow-md bg-gradient-to-br from-slate-900 to-slate-950">
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconWrapper color="blue" size="md">
              <FileText className="w-5 h-5" />
            </IconWrapper>
            <div>
              <CardTitle className="text-lg text-primary">Product Requirements Document</CardTitle>
              <CardDescription>Outline product features, user stories, and requirements</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            A comprehensive document outlining the product requirements, features, user stories,
            and success criteria. Useful for product managers and stakeholders.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="default" 
            onClick={() => handleGenerateDocument("PRD")}
            disabled={!selectedProject || generateDocumentMutation.isPending}
            className="w-full"
          >
            {generateDocumentMutation.isPending && generateDocumentMutation.variables?.type === "PRD"
              ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              : <Sparkles className="w-4 h-4 mr-2" />
            }
            Generate PRD
          </Button>
        </CardFooter>
      </Card>

      <Card className="border border-slate-700/50 hover:border-slate-700 transition-colors shadow-md bg-gradient-to-br from-slate-900 to-slate-950">
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconWrapper color="purple" size="md">
              <Book className="w-5 h-5" />
            </IconWrapper>
            <div>
              <CardTitle className="text-lg text-primary">Software Requirements Spec</CardTitle>
              <CardDescription>Technical requirements and specifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            A detailed technical document outlining the software requirements, interfaces, 
            dependencies, and system behavior. Useful for developers.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="default" 
            onClick={() => handleGenerateDocument("SRS")}
            disabled={!selectedProject || generateDocumentMutation.isPending}
            className="w-full"
          >
            {generateDocumentMutation.isPending && generateDocumentMutation.variables?.type === "SRS"
              ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              : <Sparkles className="w-4 h-4 mr-2" />
            }
            Generate SRS
          </Button>
        </CardFooter>
      </Card>

      <Card className="border border-slate-700/50 hover:border-slate-700 transition-colors shadow-md bg-gradient-to-br from-slate-900 to-slate-950">
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconWrapper color="teal" size="md">
              <Layers className="w-5 h-5" />
            </IconWrapper>
            <div>
              <CardTitle className="text-lg text-primary">Software Design Document</CardTitle>
              <CardDescription>System architecture and component design</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            A technical document describing the software architecture, component design,
            data models, and interfaces. Based on GitHub codebase analysis.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="default" 
            onClick={() => handleGenerateDocument("SDDS")}
            disabled={!selectedProject || generateDocumentMutation.isPending}
            className="w-full"
          >
            {generateDocumentMutation.isPending && generateDocumentMutation.variables?.type === "SDDS"
              ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              : <Sparkles className="w-4 h-4 mr-2" />
            }
            Generate SDDS
          </Button>
        </CardFooter>
      </Card>

      <Card className="border border-slate-700/50 hover:border-slate-700 transition-colors shadow-md bg-gradient-to-br from-slate-900 to-slate-950">
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconWrapper color="orange" size="md">
              <GitBranch className="w-5 h-5" />
            </IconWrapper>
            <div>
              <CardTitle className="text-lg text-primary">Traceability Matrix</CardTitle>
              <CardDescription>Map requirements to test cases</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            A document that maps requirements from Jira to test cases, showing coverage
            and relationships between requirements and tests.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="default" 
            onClick={() => handleGenerateDocument("Trace Matrix")}
            disabled={!selectedProject || generateDocumentMutation.isPending}
            className="w-full"
          >
            {generateDocumentMutation.isPending && generateDocumentMutation.variables?.type === "Trace Matrix"
              ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              : <Sparkles className="w-4 h-4 mr-2" />
            }
            Generate Matrix
          </Button>
        </CardFooter>
      </Card>

      <Card className="border border-slate-700/50 hover:border-slate-700 transition-colors shadow-md bg-gradient-to-br from-slate-900 to-slate-950">
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconWrapper color="green" size="md">
              <ClipboardList className="w-5 h-5" />
            </IconWrapper>
            <div>
              <CardTitle className="text-lg text-primary">Test Plan</CardTitle>
              <CardDescription>Strategy, scope, and test schedule</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            A comprehensive test plan outlining the test strategy, scope, schedule,
            resources, and deliverables for the project.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="default" 
            onClick={() => handleGenerateDocument("Test Plan")}
            disabled={!selectedProject || generateDocumentMutation.isPending}
            className="w-full"
          >
            {generateDocumentMutation.isPending && generateDocumentMutation.variables?.type === "Test Plan"
              ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              : <Sparkles className="w-4 h-4 mr-2" />
            }
            Generate Test Plan
          </Button>
        </CardFooter>
      </Card>

      <Card className="border border-slate-700/50 hover:border-slate-700 transition-colors shadow-md bg-gradient-to-br from-slate-900 to-slate-950">
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconWrapper color="red" size="md">
              <FileTerminal className="w-5 h-5" />
            </IconWrapper>
            <div>
              <CardTitle className="text-lg text-primary">Test Report</CardTitle>
              <CardDescription>Test results and defect summary</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            A detailed report of test execution results, including test coverage,
            defect metrics, and quality assessment.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="default" 
            onClick={() => handleGenerateDocument("Test Report")}
            disabled={!selectedProject || generateDocumentMutation.isPending}
            className="w-full"
          >
            {generateDocumentMutation.isPending && generateDocumentMutation.variables?.type === "Test Report"
              ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              : <Sparkles className="w-4 h-4 mr-2" />
            }
            Generate Report
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  // Format document status for display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "draft":
        return { label: "Draft", variant: "warning" as StatusBadgeVariant };
      case "published":
        return { label: "Published", variant: "success" as StatusBadgeVariant };
      case "archived":
        return { label: "Archived", variant: "danger" as StatusBadgeVariant };
      default:
        return { label: status, variant: "muted" as StatusBadgeVariant };
    }
  };

  // My Documents UI - shows documents generated by AI, excluding Knowledge Base documents
  const myDocumentsContent = (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">AI-Generated Documents</h3>
        <Button
          onClick={() => {
            createDocumentForm.reset({
              title: "",
              type: "",
              description: "",
              content: "",
              status: "draft",
              projectId: selectedProject?.id || 0,
              tags: []
            });
            setCreateDocumentOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Document
        </Button>
      </div>

      {isLoadingDocuments ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border border-slate-700/50">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : !documents || documents.length === 0 ? (
        <Card className="border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-950">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="w-12 h-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No AI-generated documents found</h3>
            <p className="text-sm text-gray-400 text-center max-w-md">
              There are no AI-generated documents for this project yet. Use one of the document generation options 
              (PRD, SRS, etc.) from the "Generate" tab to create your first AI document.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((document) => (
            <ATMFCard key={document.id} neonBorder="blue">
              <ATMFCardHeader 
                title={document.title}
                description={`Type: ${document.type}`}
                action={
                  <StatusBadge 
                    variant={getStatusDisplay(document.status).variant} 
                    status={getStatusDisplay(document.status).label} 
                  />
                }
                icon={
                  <IconWrapper color="blue" size="md" className="shrink-0">
                    {documentTypeIcons[document.type] || <FileText className="w-5 h-5" />}
                  </IconWrapper>
                }
              />
              <div className="p-5">
                <p className="text-sm text-gray-400 mb-4">
                  {document.description || "No description provided."}
                </p>
                <div className="text-xs text-gray-500 flex justify-between items-center">
                  <span>Created: {new Date(document.createdAt).toLocaleDateString()}</span>
                  <span>Version: {document.version}</span>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDocument(document);
                      setViewDocumentOpen(true);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDocument(document);
                      setEditDocumentOpen(true);
                    }}
                  >
                    <FileEdit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDocument(document)}
                    disabled={deleteDocumentMutation.isPending}
                  >
                    {deleteDocumentMutation.isPending ? (
                      <RefreshCcw className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-1" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            </ATMFCard>
          ))}
        </div>
      )}
    </div>
  );

  // Create document form dialog
  const createDocumentDialog = (
    <Dialog open={createDocumentOpen} onOpenChange={setCreateDocumentOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Document</DialogTitle>
          <DialogDescription>
            Create a new document for your project.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...createDocumentForm}>
          <form onSubmit={createDocumentForm.handleSubmit(onCreateDocumentSubmit)} className="space-y-4">
            <FormField
              control={createDocumentForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Document title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={createDocumentForm.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PRD">Product Requirements Document</SelectItem>
                      <SelectItem value="SRS">Software Requirements Specification</SelectItem>
                      <SelectItem value="SDDS">Software Design Document</SelectItem>
                      <SelectItem value="Trace Matrix">Traceability Matrix</SelectItem>
                      <SelectItem value="Test Plan">Test Plan</SelectItem>
                      <SelectItem value="Test Report">Test Report</SelectItem>
                      <SelectItem value="Custom">Custom Document</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={createDocumentForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the document"
                      className="min-h-20" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={createDocumentForm.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content (Markdown)</FormLabel>
                  <div className="border rounded-md p-2 bg-slate-950">
                    <div className="flex space-x-2 mb-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const content = field.value || "";
                          field.onChange(content + "\n## New Section\n");
                        }}
                      >
                        Add Heading
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const content = field.value || "";
                          field.onChange(content + "\n- List item\n");
                        }}
                      >
                        Add List
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const content = field.value || "";
                          field.onChange(content + "\n```\nCode block\n```\n");
                        }}
                      >
                        Add Code
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder="Document content in Markdown format"
                        className="min-h-48 font-mono text-sm" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={createDocumentForm.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setCreateDocumentOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createDocumentMutation.isPending}
              >
                {createDocumentMutation.isPending ? (
                  <>
                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Document
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  // Edit document form dialog
  const editDocumentDialog = (
    <Dialog open={editDocumentOpen} onOpenChange={setEditDocumentOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>
            Edit your document.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...editDocumentForm}>
          <form onSubmit={editDocumentForm.handleSubmit(onEditDocumentSubmit)} className="space-y-4">
            <FormField
              control={editDocumentForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Document title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={editDocumentForm.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PRD">Product Requirements Document</SelectItem>
                      <SelectItem value="SRS">Software Requirements Specification</SelectItem>
                      <SelectItem value="SDDS">Software Design Document</SelectItem>
                      <SelectItem value="Trace Matrix">Traceability Matrix</SelectItem>
                      <SelectItem value="Test Plan">Test Plan</SelectItem>
                      <SelectItem value="Test Report">Test Report</SelectItem>
                      <SelectItem value="Custom">Custom Document</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={editDocumentForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the document"
                      className="min-h-20" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={editDocumentForm.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content (Markdown)</FormLabel>
                  <div className="border rounded-md p-2 bg-slate-950">
                    <div className="flex space-x-2 mb-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const content = field.value || "";
                          field.onChange(content + "\n## New Section\n");
                        }}
                      >
                        Add Heading
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const content = field.value || "";
                          field.onChange(content + "\n- List item\n");
                        }}
                      >
                        Add List
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const content = field.value || "";
                          field.onChange(content + "\n```\nCode block\n```\n");
                        }}
                      >
                        Add Code
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder="Document content in Markdown format"
                        className="min-h-48 font-mono text-sm" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={editDocumentForm.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setEditDocumentOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateDocumentMutation.isPending}
              >
                {updateDocumentMutation.isPending ? (
                  <>
                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Document
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  // View document dialog
  const viewDocumentDialog = (
    <Dialog open={viewDocumentOpen} onOpenChange={setViewDocumentOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedDocument?.title}</DialogTitle>
          <DialogDescription>
            {selectedDocument?.description}
          </DialogDescription>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2">
              <StatusBadge 
                variant={getStatusDisplay(selectedDocument?.status || "draft").variant} 
                status={getStatusDisplay(selectedDocument?.status || "draft").label} 
              />
              <span className="text-xs text-gray-400">Type: {selectedDocument?.type}</span>
            </div>
            <div className="text-xs text-gray-400">
              Last updated: {selectedDocument ? new Date(selectedDocument.updatedAt).toLocaleString() : ""}
            </div>
          </div>
        </DialogHeader>
        
        <div className="prose prose-invert prose-sm max-w-none mt-4 p-4 bg-slate-950 rounded-md border border-slate-800 overflow-auto">
          {selectedDocument?.content ? (
            <Markdown content={selectedDocument.content} />
          ) : (
            <p className="text-gray-400">No content available.</p>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setViewDocumentOpen(false)}
          >
            Close
          </Button>
          <Button 
            type="button"
            onClick={() => {
              setViewDocumentOpen(false);
              setEditDocumentOpen(true);
            }}
          >
            <FileEdit className="w-4 h-4 mr-2" />
            Edit Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const tabs = [
    { id: "generate", label: "Generate Documents", content: generateDocumentContent },
    { id: "documents", label: "My Documents", content: myDocumentsContent }
  ];

  return (
    <AppLayout>
      <PageContainer withPadding className="py-8">
        <PageHeader 
          title="Documenter AI"
          description="Generate and manage project documentation with AI assistance"
          actions={
            <Button 
              onClick={() => {
                createDocumentForm.reset({
                  title: "",
                  type: "",
                  description: "",
                  content: "",
                  status: "draft",
                  projectId: selectedProject?.id || 0,
                  tags: []
                });
                setCreateDocumentOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Document
            </Button>
          }
        />
        
        <PageContent>
          <TabView 
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underline"
          />
          
          {/* Create document dialog */}
          {createDocumentDialog}
          
          {/* Edit document dialog */}
          {editDocumentDialog}
          
          {/* View document dialog */}
          {viewDocumentDialog}
        </PageContent>
      </PageContainer>
    </AppLayout>
  );
}