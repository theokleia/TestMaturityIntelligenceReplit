import { useState, useEffect, useCallback } from "react";
import { useProject } from "@/context/ProjectContext";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useDropzone } from 'react-dropzone';
import { useToast } from "@/hooks/use-toast";

import { PageContainer, PageContent } from "@/components/design-system/page-container";
import { ATMFCard, ATMFCardHeader, ATMFCardBody } from "@/components/design-system/atmf-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckSquare, Database, Github, Save, Settings2, AlertTriangle, Info, FileText, Upload, Plus, Files, Trash2, X, Tag, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TabView } from "@/components/design-system/tab-view";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface DocumentTag {
  id: string;
  name: string;
  category: 'document_type' | 'content_type' | 'purpose' | 'custom';
}

// Aligned with server schema
interface ProjectDocument {
  id: number;
  title: string;          // Maps to document name in UI
  description: string;
  type: string;           // "Knowledge Base" for uploaded documents
  content: string;        // Base64 encoded file content
  tags: string[];         // Only tag names (not full DocumentTag objects)
  projectId: number;
  createdBy?: number;     // Current user ID
  version?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Used for UI display
interface DocumentDisplay {
  id: string;
  name: string;
  description: string;
  uploadDate: string;
  fileType: string;
  fileSize: string;
  tags: DocumentTag[];
}

interface ProjectSettings {
  language: string;
  // Project details for AI context
  projectType: string;
  industryArea: string;
  regulations: string;
  additionalContext: string;
  qualityFocus: string;
  // Integration settings
  jiraUrl: string;
  jiraProjectId: string;
  jiraApiKey: string;
  jiraJql: string;
  jiraIssueType: string;
  githubToken: string;
  githubRepo: string;
  testCaseFormat: "structured" | "plain";
  outputFormat: "markdown" | "pdf" | "html";
  // Knowledge base documents (local display only)
  knowledgeBaseDocuments: DocumentDisplay[];
}

// Predefined document tags organized by category
const PREDEFINED_TAGS: DocumentTag[] = [
  // Document type tags
  { id: 'requirements', name: 'Requirements', category: 'document_type' },
  { id: 'design', name: 'Design', category: 'document_type' },
  { id: 'architecture', name: 'Architecture', category: 'document_type' },
  { id: 'api_spec', name: 'API Specification', category: 'document_type' },
  { id: 'user_guide', name: 'User Guide', category: 'document_type' },
  { id: 'srs', name: 'System Requirements Spec', category: 'document_type' },
  
  // Content type tags
  { id: 'workflows', name: 'Workflows', category: 'content_type' },
  { id: 'functions', name: 'Functions', category: 'content_type' },
  { id: 'system_elements', name: 'System Elements', category: 'content_type' },
  { id: 'data_model', name: 'Data Model', category: 'content_type' },
  { id: 'ui_components', name: 'UI Components', category: 'content_type' },
  { id: 'algorithm', name: 'Algorithm', category: 'content_type' },
  
  // Purpose tags
  { id: 'usage', name: 'Usage', category: 'purpose' },
  { id: 'implementation', name: 'Implementation', category: 'purpose' },
  { id: 'reference', name: 'Reference', category: 'purpose' },
  { id: 'test_input', name: 'Test Input', category: 'purpose' },
  { id: 'specification', name: 'Specification', category: 'purpose' },
  { id: 'guidelines', name: 'Guidelines', category: 'purpose' },
];

const defaultSettings: ProjectSettings = {
  language: "English",
  // Project details defaults
  projectType: "",
  industryArea: "",
  regulations: "",
  additionalContext: "",
  qualityFocus: "",
  // Integration settings
  jiraUrl: "",
  jiraProjectId: "",
  jiraApiKey: "",
  jiraJql: "",
  jiraIssueType: "Bug",
  githubToken: "",
  githubRepo: "",
  testCaseFormat: "structured",
  outputFormat: "markdown",
  // Knowledge base documents
  knowledgeBaseDocuments: []
};

export default function ProjectSettings() {
  const { selectedProject } = useProject();
  const [settings, setSettings] = useState<ProjectSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // Document upload state
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<DocumentTag[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isAnalyzingDocument, setIsAnalyzingDocument] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<DocumentTag[]>([]);
  const [documentContent, setDocumentContent] = useState<string>("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Document save mutation
  const saveDocumentMutation = useMutation({
    mutationFn: async (document: Omit<ProjectDocument, "id">) => {
      const response = await apiRequest("POST", "/api/documents", document);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save document");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document saved",
        description: "Your document has been successfully saved to the database",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving document",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Initialize settings when selected project changes
  useEffect(() => {
    if (selectedProject) {
      // Initialize with project values for connections
      setSettings({
        ...defaultSettings,
        // Project details
        projectType: selectedProject.projectType || '',
        industryArea: selectedProject.industryArea || '',
        regulations: selectedProject.regulations || '',
        additionalContext: selectedProject.additionalContext || '',
        qualityFocus: selectedProject.qualityFocus || '',
        // Integration settings
        githubRepo: selectedProject.githubRepo || '',
        githubToken: selectedProject.githubToken ? '••••••••••••••••' : '',
        jiraUrl: selectedProject.jiraUrl || '',
        jiraProjectId: selectedProject.jiraProjectId || '',
        jiraApiKey: selectedProject.jiraApiKey ? '••••••••••••••••' : '',
        jiraJql: selectedProject.jiraJql || '',
        jiraIssueType: selectedProject.jiraIssueType || 'Bug',
        testCaseFormat: selectedProject.testCaseFormat || 'structured',
        outputFormat: selectedProject.outputFormat || 'markdown',
        // For now, we'll use an empty array for knowledge base documents
        // In the future, this would be populated from the database
        knowledgeBaseDocuments: []
      });
      setSaveSuccess(false);
    }
  }, [selectedProject?.id]);
  
  // Handle document file upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // First start the analysis process without showing the dialog yet
      setIsAnalyzingDocument(true);
      
      // Set the uploaded document and prepare the filename
      setUploadedDocument(file);
      const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      setDocumentName(fileNameWithoutExt);
      
      try {
        // Wait for analysis to complete before showing the dialog
        await analyzeDocumentForTags(file);
        
        // Now show the dialog with the analysis results ready
        setIsDocumentDialogOpen(true);
      } finally {
        // Ensure we clear the loading state even if analysis fails
        setIsAnalyzingDocument(false);
      }
    }
  };
  
  // AI analysis of document to suggest tags and description
  const analyzeDocumentForTags = async (file: File) => {
    // Analysis is already marked as in progress by the parent function
    
    try {
      // Read the file content
      const content = await readFileAsText(file);
      
      if (!content) {
        throw new Error("Could not read file content");
      }
      
      // Send the document to our analysis API
      const response = await fetch("/api/ai/analyze-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content,
          fileName: file.name,
          fileType: file.type,
          projectId: selectedProject?.id
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze document");
      }
      
      const data = await response.json();
      
      // Update state with AI suggestions
      if (data.suggestedTags && data.suggestedTags.length > 0) {
        setSuggestedTags(data.suggestedTags);
        // Automatically select the suggested tags
        setSelectedTags(data.suggestedTags);
      }
      
      // Set the description if provided
      if (data.description) {
        setDocumentDescription(data.description);
      }
    } catch (error) {
      console.error("Error analyzing document:", error);
      // Show error toast or message to user
      
      // Fallback to some default tags if AI analysis fails
      const fallbackTags = PREDEFINED_TAGS
        .filter((tag) => 
          tag.name.toLowerCase().includes("reference") || 
          tag.name.toLowerCase().includes("document")
        ).slice(0, 2);
      
      setSuggestedTags(fallbackTags);
    } finally {
      setIsAnalyzingDocument(false);
    }
  };
  
  // Helper function to read file contents
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("File read error"));
      reader.readAsText(file);
    });
  };
  
  // Add a tag to the selected tags list
  const addTag = (tag: DocumentTag) => {
    // Check if tag is already selected
    if (!selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Remove a tag from the selected tags list
  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
  };
  
  // Add a custom tag
  const addCustomTag = () => {
    if (customTag.trim() !== '') {
      const newTag: DocumentTag = {
        id: `custom-${Date.now()}`,
        name: customTag.trim(),
        category: 'custom'
      };
      
      setSelectedTags([...selectedTags, newTag]);
      setCustomTag('');
    }
  };
  
  // Handle document saving
  const handleSaveDocument = async () => {
    if (!uploadedDocument || !documentName.trim()) {
      toast({
        title: "Validation Error",
        description: "Document name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!documentContent) {
      toast({
        title: "Document Error",
        description: "Document content is missing. Please try uploading the document again.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedProject) {
      toast({
        title: "Project Error",
        description: "No project selected",
        variant: "destructive"
      });
      return;
    }
    
    // Extract tag names from the selected tag objects
    const tagNames = selectedTags.map(tag => tag.name);
    
    // Create server document object
    const newServerDocument: Omit<ProjectDocument, "id"> = {
      title: documentName,
      description: documentDescription,
      type: "Knowledge Base",
      content: documentContent,
      tags: tagNames,
      projectId: selectedProject.id,
      status: "active",
      version: "1.0"
    };
    
    // Save to database
    try {
      await saveDocumentMutation.mutateAsync(newServerDocument);
      
      // Create a display object for the UI
      const newDisplayDocument: DocumentDisplay = {
        id: `local-${Date.now()}`, // Temporary ID until we refresh
        name: documentName,
        description: documentDescription,
        uploadDate: new Date().toISOString().split('T')[0],
        fileType: uploadedDocument.type,
        fileSize: formatFileSize(uploadedDocument.size),
        tags: selectedTags
      };
      
      // Add to local state for immediate display
      setSettings(prev => ({
        ...prev,
        knowledgeBaseDocuments: [...prev.knowledgeBaseDocuments, newDisplayDocument]
      }));
      
      // Reset form and close dialog
      resetDocumentForm();
      setIsDocumentDialogOpen(false);
    } catch (error) {
      // Error is handled by the mutation
      console.error("Error saving document:", error);
    }
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Reset document form
  const resetDocumentForm = () => {
    setUploadedDocument(null);
    setDocumentName("");
    setDocumentDescription("");
    setSelectedTags([]);
    setCustomTag("");
    setSuggestedTags([]);
  };

  const handleChange = (name: keyof ProjectSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
    setSaveSuccess(false);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Save all general settings
      console.log("Saving settings for project:", selectedProject?.id);
      console.log("Settings data:", settings);
      
      // We need to update the project settings in the backend
      if (selectedProject?.id) {
        // Prepare the update payload
        const updatePayload: Record<string, any> = {
          testCaseFormat: settings.testCaseFormat,
          outputFormat: settings.outputFormat
        };
        
        // Add project details
        updatePayload.projectType = settings.projectType;
        updatePayload.industryArea = settings.industryArea;
        updatePayload.regulations = settings.regulations;
        updatePayload.additionalContext = settings.additionalContext;
        updatePayload.qualityFocus = settings.qualityFocus;
        
        // Add Jira URL if provided
        if (settings.jiraUrl) {
          updatePayload.jiraUrl = settings.jiraUrl;
        }
        
        // Add Jira Project ID if provided
        if (settings.jiraProjectId) {
          updatePayload.jiraProjectId = settings.jiraProjectId.toUpperCase();
        }
        
        // Add JQL if provided
        if (settings.jiraJql) {
          updatePayload.jiraJql = settings.jiraJql;
        } else if (settings.jiraProjectId) {
          // Create a default JQL if project ID is provided but no custom JQL
          updatePayload.jiraJql = `project = ${settings.jiraProjectId.toUpperCase()}`;
        }
        
        // Add API key if provided
        if (settings.jiraApiKey && settings.jiraApiKey !== '••••••••••••••••') {
          updatePayload.jiraApiKey = settings.jiraApiKey;
        }
        
        // Add Jira issue type for test failures
        if (settings.jiraIssueType) {
          updatePayload.jiraIssueType = settings.jiraIssueType;
        }
        
        // Add GitHub repo if provided
        if (settings.githubRepo) {
          updatePayload.githubRepo = settings.githubRepo;
        }
        
        // Add GitHub token if provided and not masked
        if (settings.githubToken && settings.githubToken !== '••••••••••••••••') {
          updatePayload.githubToken = settings.githubToken;
        }
        
        // Make the update request
        try {
          const response = await fetch(`/api/projects/${selectedProject.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatePayload),
          });
          
          const responseData = await response.json();
          console.log("API Response:", response.status, responseData);
          
          if (!response.ok) {
            throw new Error('Failed to update project settings');
          }
        } catch (error: any) {
          console.error("API Error details:", error);
          throw new Error('Error processing response: ' + (error.message || 'Unknown error'));
        }
        
        // Show success message and refresh context with a small delay
        setIsSaving(false);
        setSaveSuccess(true);
        
        // Add a small delay before reloading to show the success message
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // For other non-API saves (only if we're not handling a project update)
        setIsSaving(false);
        setSaveSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setIsSaving(false);
      // Show error message here
      alert("Failed to save settings. Please try again.");
    }
  };

  if (!selectedProject) {
    return (
      <PageContainer
        title="Project Settings"
        subtitle="Configure project-specific options and integrations"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <IconWrapper variant="muted" size="xl" className="mb-4">
            <Settings2 className="h-8 w-8" />
          </IconWrapper>
          <h3 className="text-xl font-medium mb-2">No Project Selected</h3>
          <p className="text-atmf-muted max-w-md text-center">
            Select a project from the dropdown in the top navigation bar to configure its settings.
          </p>
        </div>
      </PageContainer>
    );
  }

  // General Settings content
  const generalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* General Settings Card */}
      <ATMFCard>
        <ATMFCardHeader>
          <h3 className="text-lg font-medium">General Settings</h3>
        </ATMFCardHeader>
        <ATMFCardBody className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Project Language</Label>
            <Select 
              value={settings.language} 
              onValueChange={(value) => handleChange("language", value)}
            >
              <SelectTrigger className="bg-atmf-main border-white/10 focus:border-white/20">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-atmf-card border-white/10">
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="German">German</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Hungarian">Hungarian</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-atmf-muted">Choose the primary language for this project</p>
          </div>
        </ATMFCardBody>
      </ATMFCard>

      {/* Output Format Settings Card */}
      <ATMFCard>
        <ATMFCardHeader>
          <h3 className="text-lg font-medium">Output Format</h3>
        </ATMFCardHeader>
        <ATMFCardBody className="space-y-6">
          <div className="space-y-2">
            <Label>Output Format</Label>
            <RadioGroup 
              value={settings.outputFormat}
              onValueChange={(value) => handleChange("outputFormat", value as "markdown" | "pdf" | "html")}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2 rounded-md bg-atmf-main p-3 border border-white/5">
                <RadioGroupItem value="markdown" id="markdown" className="border-white/20 text-primary" />
                <Label htmlFor="markdown" className="flex-1 cursor-pointer">
                  <div className="font-medium">Markdown</div>
                  <div className="text-xs text-atmf-muted">Lightweight markup language with plain text formatting syntax</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-atmf-main p-3 border border-white/5">
                <RadioGroupItem value="pdf" id="pdf" className="border-white/20 text-primary" />
                <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                  <div className="font-medium">PDF</div>
                  <div className="text-xs text-atmf-muted">Standard document format that preserves formatting across devices</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-atmf-main p-3 border border-white/5">
                <RadioGroupItem value="html" id="html" className="border-white/20 text-primary" />
                <Label htmlFor="html" className="flex-1 cursor-pointer">
                  <div className="font-medium">HTML</div>
                  <div className="text-xs text-atmf-muted">Web-based format for browser viewing with rich formatting</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </ATMFCardBody>
      </ATMFCard>

      {/* Test Case Format Card */}
      <ATMFCard className="md:col-span-2">
        <ATMFCardHeader>
          <h3 className="text-lg font-medium">Test Case Format</h3>
        </ATMFCardHeader>
        <ATMFCardBody className="space-y-6">
          <div className="space-y-2">
            <Label>Test Case Template Format</Label>
            <RadioGroup 
              value={settings.testCaseFormat}
              onValueChange={(value) => handleChange("testCaseFormat", value as "structured" | "plain")}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 rounded-md bg-atmf-main p-3 border border-white/5">
                <RadioGroupItem value="structured" id="structured" className="border-white/20 text-primary" />
                <Label htmlFor="structured" className="flex-1 cursor-pointer">
                  <div className="font-medium">Structured</div>
                  <div className="text-xs text-atmf-muted">
                    Organized with step number, action, data used, and expected result
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-atmf-main p-3 border border-white/5">
                <RadioGroupItem value="plain" id="plain" className="border-white/20 text-primary" />
                <Label htmlFor="plain" className="flex-1 cursor-pointer">
                  <div className="font-medium">Plain</div>
                  <div className="text-xs text-atmf-muted">
                    Free text format for more flexible test case descriptions
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </ATMFCardBody>
      </ATMFCard>
    </div>
  );

  // Project Context content
  const projectContextContent = (
    <ATMFCard>
      <ATMFCardHeader>
        <h3 className="text-lg font-medium flex items-center">
          <Info className="h-5 w-5 mr-2 text-purple-400" />
          Project Details for AI
        </h3>
      </ATMFCardHeader>
      <ATMFCardBody className="space-y-4">
        <Alert className="bg-slate-900/30 border-white/10">
          <Info className="h-4 w-4" />
          <AlertDescription>
            The following details help our AI features better understand your project context when generating documents, test cases, and recommendations.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="projectType">Project Type</Label>
            <Select 
              value={settings.projectType} 
              onValueChange={(value) => handleChange("projectType", value)}
            >
              <SelectTrigger id="projectType" className="bg-atmf-main border-white/10 focus:border-white/20">
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent className="bg-atmf-card border-white/10">
                <SelectItem value="Greenfield">Greenfield (Brand New)</SelectItem>
                <SelectItem value="New Development">New Development (Existing Organization)</SelectItem>
                <SelectItem value="Legacy Modernization">Legacy Modernization</SelectItem>
                <SelectItem value="Maintenance">Maintenance & Support</SelectItem>
                <SelectItem value="Replatforming">Replatforming / Migration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industryArea">Industry Area</Label>
            <Select 
              value={settings.industryArea} 
              onValueChange={(value) => handleChange("industryArea", value)}
            >
              <SelectTrigger id="industryArea" className="bg-atmf-main border-white/10 focus:border-white/20">
                <SelectValue placeholder="Select industry area" />
              </SelectTrigger>
              <SelectContent className="bg-atmf-card border-white/10">
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="regulations">Applicable Regulations</Label>
          <Input
            id="regulations"
            placeholder="e.g., HIPAA, SOX, GDPR, etc."
            className="bg-atmf-main border-white/10 focus:border-white/20"
            value={settings.regulations}
            onChange={(e) => handleChange("regulations", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalContext">Additional Project Context</Label>
          <textarea
            id="additionalContext"
            placeholder="Please provide details about intended use, target users, business context, and other relevant information that would help AI features better understand this project."
            className="w-full min-h-[150px] p-3 rounded-md bg-atmf-main border border-white/10 focus:border-white/20 focus:outline-none text-white"
            value={settings.additionalContext}
            onChange={(e) => handleChange("additionalContext", e.target.value)}
          />
          <p className="text-xs text-atmf-muted">This information helps our AI generate more relevant and accurate content for your project</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qualityFocus">Quality Focus Areas</Label>
          <Input
            id="qualityFocus"
            placeholder="e.g., Security, Performance, Accessibility, etc."
            className="bg-atmf-main border-white/10 focus:border-white/20"
            value={settings.qualityFocus}
            onChange={(e) => handleChange("qualityFocus", e.target.value)}
          />
          <p className="text-xs text-atmf-muted">Areas of quality that need special focus in testing</p>
        </div>
      </ATMFCardBody>
    </ATMFCard>
  );

  // Integrations content
  const integrationsContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Jira Integration Card */}
      <ATMFCard>
        <ATMFCardHeader>
          <h3 className="text-lg font-medium flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-400" />
            Jira Integration
          </h3>
        </ATMFCardHeader>
        <ATMFCardBody className="space-y-4">
          <Alert className="bg-slate-900/30 border-white/10">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Connect to Jira to import issues and export test results.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="jiraUrl">Jira Base URL</Label>
            <Input
              id="jiraUrl"
              placeholder="https://your-domain.atlassian.net"
              className="bg-atmf-main border-white/10 focus:border-white/20"
              value={settings.jiraUrl}
              onChange={(e) => handleChange("jiraUrl", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jiraProjectId">Jira Project ID</Label>
            <Input
              id="jiraProjectId"
              placeholder="e.g., TMS"
              className="bg-atmf-main border-white/10 focus:border-white/20"
              value={settings.jiraProjectId}
              onChange={(e) => handleChange("jiraProjectId", e.target.value)}
            />
            <p className="text-xs text-atmf-muted">The project key in Jira (max 10 characters)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jiraJql">JQL Search Query (Optional)</Label>
            <Input
              id="jiraJql"
              placeholder="e.g., project = TMS AND issuetype = Bug"
              className="bg-atmf-main border-white/10 focus:border-white/20"
              value={settings.jiraJql}
              onChange={(e) => handleChange("jiraJql", e.target.value)}
            />
            <p className="text-xs text-atmf-muted">Default: <code>project = {settings.jiraProjectId || "YOUR_PROJECT_ID"}</code></p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jiraIssueType">Issue Type for Test Failures</Label>
            <Input
              id="jiraIssueType"
              placeholder="e.g., Bug"
              className="bg-atmf-main border-white/10 focus:border-white/20"
              value={settings.jiraIssueType}
              onChange={(e) => handleChange("jiraIssueType", e.target.value)}
            />
            <p className="text-xs text-atmf-muted">When creating Jira issues from failed tests</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jiraApiKey">Jira API Key</Label>
            <Input
              id="jiraApiKey"
              placeholder="email:token"
              className="bg-atmf-main border-white/10 focus:border-white/20"
              type="password"
              value={settings.jiraApiKey}
              onChange={(e) => handleChange("jiraApiKey", e.target.value)}
            />
            <p className="text-xs text-atmf-muted">Format: your-email@example.com:your-api-token</p>
          </div>
        </ATMFCardBody>
      </ATMFCard>

      {/* GitHub Integration Card */}
      <ATMFCard>
        <ATMFCardHeader>
          <h3 className="text-lg font-medium flex items-center">
            <Github className="h-5 w-5 mr-2 text-slate-400" />
            GitHub Integration
          </h3>
        </ATMFCardHeader>
        <ATMFCardBody className="space-y-4">
          <Alert className="bg-slate-900/30 border-white/10">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Connect to GitHub to analyze code changes and link test results to commits.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="githubRepo">GitHub Repository</Label>
            <Input
              id="githubRepo"
              placeholder="username/repository"
              className="bg-atmf-main border-white/10 focus:border-white/20"
              value={settings.githubRepo}
              onChange={(e) => handleChange("githubRepo", e.target.value)}
            />
            <p className="text-xs text-atmf-muted">Format: username/repository-name</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubToken">GitHub Token</Label>
            <Input
              id="githubToken"
              placeholder="your-github-token"
              className="bg-atmf-main border-white/10 focus:border-white/20"
              type="password"
              value={settings.githubToken}
              onChange={(e) => handleChange("githubToken", e.target.value)}
            />
            <p className="text-xs text-atmf-muted">Personal Access Token with repo permissions</p>
          </div>
        </ATMFCardBody>
      </ATMFCard>
    </div>
  );

  // Document Upload Dialog
  const DocumentUploadDialog = () => {
    return (
      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent className="bg-atmf-card border-atmf-card-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add Knowledge Base Document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Loading indicator for document analysis */}
            {isAnalyzingDocument && (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-atmf-accent mb-4" />
                <p className="text-center text-sm text-atmf-muted">
                  Analyzing document content with AI...
                </p>
              </div>
            )}
            
            {/* File Upload Section */}
            {!uploadedDocument && !isAnalyzingDocument ? (
              <div 
                className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-md bg-atmf-main/50"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add('border-blue-500');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('border-blue-500');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('border-blue-500');
                  
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    // Use the first file
                    const file = files[0];
                    // Check if the file type is acceptable
                    const acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.md', '.json'];
                    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                    
                    if (acceptedTypes.some(type => 
                      type === fileExt || 
                      type === file.type ||
                      (type === '.pdf' && file.type === 'application/pdf') ||
                      (type === '.doc' && file.type === 'application/msword') ||
                      (type === '.docx' && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                    )) {
                      // Create a mock event to reuse the existing handler
                      const mockEvent = {
                        target: {
                          files: [file]
                        }
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      
                      handleDocumentUpload(mockEvent);
                    } else {
                      alert('Invalid file type. Please upload a PDF, DOC, DOCX, TXT, MD, or JSON file.');
                    }
                  }
                }}
              >
                <IconWrapper variant="muted" size="lg" className="mb-3">
                  <Upload className="h-6 w-6" />
                </IconWrapper>
                <p className="text-center mb-4 text-sm text-atmf-muted">
                  Drag and drop your document here, or click to browse
                </p>
                <div className="relative inline-block">
                  <Button 
                    type="button"
                    size="sm" 
                    className="bg-atmf-accent hover:bg-atmf-accent/90 relative z-10"
                    onClick={() => {
                      document.getElementById('document-upload')?.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                  <input
                    id="document-upload"
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer z-0"
                    accept=".pdf,.doc,.docx,.txt,.md,.json"
                    onChange={handleDocumentUpload}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 border border-white/10 rounded-md bg-atmf-main/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-400 mr-2" />
                    <span className="font-medium">{uploadedDocument?.name || "Document"}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-white/5"
                    onClick={() => setUploadedDocument(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-atmf-muted">
                  {uploadedDocument ? `${formatFileSize(uploadedDocument.size)} • ${uploadedDocument.type}` : ""}
                </div>
              </div>
            )}
            
            {/* Document Details - only show when analysis is complete */}
            {uploadedDocument && !isAnalyzingDocument && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="document-name">Document Name</Label>
                  <Input
                    id="document-name"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Enter document name"
                    className="bg-atmf-main border-white/10 focus:border-white/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="document-description">Description</Label>
                  <Textarea
                    id="document-description"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    placeholder="Brief description of the document content and purpose"
                    className="h-20 bg-atmf-main border-white/10 focus:border-white/20"
                  />
                </div>
                
                {/* Tag Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Document Tags</Label>
                    {isAnalyzingDocument && (
                      <div className="flex items-center text-xs text-atmf-muted">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Analyzing document...
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map(tag => (
                      <Badge 
                        key={tag.id} 
                        className={`px-2 py-1 ${
                          tag.category === 'document_type' ? 'bg-blue-900/50 hover:bg-blue-900/70' :
                          tag.category === 'content_type' ? 'bg-purple-900/50 hover:bg-purple-900/70' :
                          tag.category === 'purpose' ? 'bg-green-900/50 hover:bg-green-900/70' :
                          'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        <span>{tag.name}</span>
                        <button 
                          className="ml-1 text-white/70 hover:text-white"
                          onClick={() => removeTag(tag.id)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  {/* AI Suggested Tags */}
                  {suggestedTags.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-atmf-muted mb-2">AI-suggested tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTags.map(tag => (
                          <Badge 
                            key={tag.id}
                            variant="outline" 
                            className="cursor-pointer px-2 py-1 bg-white/5 hover:bg-white/10"
                            onClick={() => addTag(tag)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Predefined Tag Categories */}
                  <div className="space-y-3 pt-2">
                    {['document_type', 'content_type', 'purpose'].map(category => (
                      <div key={category} className="space-y-1">
                        <p className="text-xs text-atmf-muted capitalize">
                          {category.replace('_', ' ')}:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {PREDEFINED_TAGS
                            .filter(tag => tag.category === category && !selectedTags.some(t => t.id === tag.id))
                            .map(tag => (
                              <Badge 
                                key={tag.id}
                                variant="outline" 
                                className="cursor-pointer px-2 py-1 bg-white/5 hover:bg-white/10"
                                onClick={() => addTag(tag)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                {tag.name}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Custom Tag Input */}
                  <div className="flex items-center gap-2 mt-4">
                    <Input
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Add custom tag"
                      className="bg-atmf-main border-white/10 focus:border-white/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomTag();
                        }
                      }}
                    />
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={addCustomTag}
                      className="bg-atmf-main border-white/10"
                      disabled={!customTag.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="bg-atmf-main border-white/10">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleSaveDocument}
              className="bg-atmf-accent hover:bg-atmf-accent/90"
              disabled={!uploadedDocument || !documentName.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Knowledge Base content
  const knowledgeBaseContent = (
    <ATMFCard>
      <ATMFCardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-400" />
            Project Knowledge Base
          </h3>
          <Button 
            size="sm" 
            className="bg-atmf-accent hover:bg-atmf-accent/90"
            onClick={() => setIsDocumentDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
      </ATMFCardHeader>
      <ATMFCardBody className="space-y-4">
        <Alert className="bg-slate-900/30 border-white/10">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Upload documentation about your project to provide additional context for test generation and AI features. 
            This can include project specifications, user workflows, industry guidelines, or other relevant documents.
          </AlertDescription>
        </Alert>

        {settings.knowledgeBaseDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3 border border-dashed border-white/10 rounded-md bg-atmf-main/50">
            <IconWrapper variant="muted" size="lg">
              <Files className="h-6 w-6" />
            </IconWrapper>
            <div className="text-center space-y-1">
              <h4 className="font-medium">No documents yet</h4>
              <p className="text-sm text-atmf-muted max-w-md">
                Upload project documentation to help the AI better understand your project context and generate more relevant test cases and recommendations.
              </p>
            </div>
            <Button 
              size="sm" 
              className="mt-2 bg-atmf-accent hover:bg-atmf-accent/90"
              onClick={() => setIsDocumentDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {settings.knowledgeBaseDocuments.map((doc) => (
              <div key={doc.id} className="flex flex-col p-3 rounded-md bg-atmf-main border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <p className="text-xs text-atmf-muted">{doc.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/5">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/5">
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
                
                {/* Document metadata */}
                <div className="flex items-center text-xs text-atmf-muted mb-3">
                  <span className="mr-3">{doc.fileType}</span>
                  <span className="mr-3">{doc.fileSize}</span>
                  <span>Added: {doc.uploadDate}</span>
                </div>
                
                {/* Document tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.map(tag => (
                      <Badge 
                        key={tag.id} 
                        className={`text-xs px-2 py-1 ${
                          tag.category === 'document_type' ? 'bg-blue-900/50' :
                          tag.category === 'content_type' ? 'bg-purple-900/50' :
                          tag.category === 'purpose' ? 'bg-green-900/50' :
                          'bg-gray-800'
                        }`}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ATMFCardBody>
      
      {/* Document Upload Dialog */}
      <DocumentUploadDialog />
    </ATMFCard>
  );

  // Configure the tabs for the TabView component
  const tabs = [
    {
      id: "general",
      label: (
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          <span>General</span>
        </div>
      ),
      content: generalContent
    },
    {
      id: "project-context",
      label: (
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span>Project Context</span>
        </div>
      ),
      content: projectContextContent
    },
    {
      id: "integrations",
      label: (
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>Integrations</span>
        </div>
      ),
      content: integrationsContent
    },
    {
      id: "knowledge-base",
      label: (
        <div className="flex items-center gap-2">
          <Files className="h-4 w-4" />
          <span>Knowledge Base</span>
        </div>
      ),
      content: knowledgeBaseContent
    }
  ];

  return (
    <PageContainer
      title={`${selectedProject.name} Settings`}
      subtitle="Configure project-specific options and integrations"
      actions={
        <Button
          className="bg-atmf-accent hover:bg-atmf-accent/90"
          onClick={handleSaveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      }
    >
      <PageContent>
        {saveSuccess && (
          <Alert className="mb-4 bg-emerald-950/30 border-emerald-600/30 text-emerald-400">
            <CheckSquare className="h-4 w-4" />
            <AlertTitle>Settings Saved</AlertTitle>
            <AlertDescription>
              Your project settings have been saved successfully.
            </AlertDescription>
          </Alert>
        )}

        <TabView
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />
      </PageContent>
    </PageContainer>
  );
}