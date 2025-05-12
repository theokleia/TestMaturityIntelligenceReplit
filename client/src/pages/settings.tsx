import { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";

import { PageContainer } from "@/components/design-system/page-container";
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
import { CheckSquare, Database, Github, Save, Settings2, AlertTriangle, Info, FileText, Upload, Plus, Files, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectDocument {
  id: string;
  name: string;
  description: string;
  uploadDate: string;
  fileType: string;
  fileSize: string;
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
  // Knowledge base documents
  knowledgeBaseDocuments: ProjectDocument[];
}

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
      <>
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
      </>
    );
  }

  return (
    <>
      <PageContainer
        title={`${selectedProject.name} Settings`}
        subtitle="Configure project-specific options and integrations"
        actions={
          <Button
            className="btn-atmf-accent"
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
        {saveSuccess && (
          <Alert className="mb-4 bg-emerald-950/30 border-emerald-600/30 text-emerald-400">
            <CheckSquare className="h-4 w-4" />
            <AlertTitle>Settings Saved</AlertTitle>
            <AlertDescription>
              Your project settings have been saved successfully.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="project-context" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Project Context</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge-base" className="flex items-center gap-2">
              <Files className="h-4 w-4" />
              <span>Knowledge Base</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="mt-0">
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
          </TabsContent>

          {/* Project Context Tab */}
          <TabsContent value="project-context" className="mt-0">
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
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="mt-0">
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
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge-base" className="mt-0">
            <ATMFCard>
              <ATMFCardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-400" />
                    Project Knowledge Base
                  </h3>
                  <Button size="sm" className="bg-atmf-accent hover:bg-atmf-accent/90">
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
                    <Button size="sm" className="mt-2 bg-atmf-accent hover:bg-atmf-accent/90">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {settings.knowledgeBaseDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-md bg-atmf-main border border-white/10">
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
                    ))}
                  </div>
                )}
              </ATMFCardBody>
            </ATMFCard>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </>
  );
}