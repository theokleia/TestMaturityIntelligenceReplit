import { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";

import { PageContainer } from "@/components/design-system/page-container";
import { ATMFCard, ATMFCardHeader, ATMFCardBody, ATMFCardFooter } from "@/components/design-system/atmf-card";
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
import { CheckSquare, Database, Github, Save, Settings2, AlertTriangle, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProjectSettings {
  language: string;
  jiraUrl: string;
  jiraProjectId: string;  // Added Jira Project ID field
  jiraApiKey: string;
  jiraJql: string;
  githubToken: string;
  githubRepo: string;
  testCaseFormat: "structured" | "plain";
  outputFormat: "markdown" | "pdf" | "html";
}

const defaultSettings: ProjectSettings = {
  language: "English",
  jiraUrl: "",
  jiraProjectId: "",  // Added Jira Project ID field
  jiraApiKey: "",
  jiraJql: "",
  githubToken: "",
  githubRepo: "",
  testCaseFormat: "structured",
  outputFormat: "markdown"
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
        // Pre-fill GitHub repo if set
        githubRepo: selectedProject.githubRepo || '',
        // Use the saved Jira URL if available
        jiraUrl: selectedProject.jiraUrl || '',
        // Use the saved Jira project ID if available
        jiraProjectId: selectedProject.jiraProjectId || '',
        // For API key, if stored, initialize it (masked for security)
        jiraApiKey: selectedProject.jiraApiKey ? '••••••••••••••••' : '',
        // Load saved JQL query if available
        jiraJql: selectedProject.jiraJql || '',
        // Load saved test case format preference
        testCaseFormat: selectedProject.testCaseFormat || 'structured',
        // Load saved output format preference
        outputFormat: selectedProject.outputFormat || 'markdown',
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
        
        // Add GitHub repo if provided
        if (settings.githubRepo) {
          updatePayload.githubRepo = settings.githubRepo;
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <div className="space-y-2">
                <Label>Test Case Template Format</Label>
                <RadioGroup 
                  value={settings.testCaseFormat}
                  onValueChange={(value) => handleChange("testCaseFormat", value as "structured" | "plain")}
                  className="flex flex-col space-y-2"
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
                      <div className="text-xs text-atmf-muted">
                        Lightweight markup language with plain text formatting syntax
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-atmf-main p-3 border border-white/5">
                    <RadioGroupItem value="pdf" id="pdf" className="border-white/20 text-primary" />
                    <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                      <div className="font-medium">PDF</div>
                      <div className="text-xs text-atmf-muted">
                        Standard document format that preserves formatting across devices
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-atmf-main p-3 border border-white/5">
                    <RadioGroupItem value="html" id="html" className="border-white/20 text-primary" />
                    <Label htmlFor="html" className="flex-1 cursor-pointer">
                      <div className="font-medium">HTML</div>
                      <div className="text-xs text-atmf-muted">
                        Web-based format for browser viewing with rich formatting
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </ATMFCardBody>
          </ATMFCard>

          {/* Integrations Card */}
          <div className="space-y-6">
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
                  <p className="text-xs text-atmf-muted">Enter your Atlassian Jira base URL (without project-specific path)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jiraProjectId">Jira Project ID</Label>
                  <Input
                    id="jiraProjectId"
                    placeholder="PROJECT"
                    className="bg-atmf-main border-white/10 focus:border-white/20"
                    value={settings.jiraProjectId}
                    onChange={(e) => handleChange("jiraProjectId", e.target.value)}
                  />
                  <p className="text-xs text-atmf-muted">
                    The project identifier in Jira (usually uppercase, like "PROJ" or "TEST")
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jiraApiKey">Jira API Key</Label>
                  <Input
                    id="jiraApiKey"
                    type="password"
                    placeholder="Enter your Jira API key"
                    className="bg-atmf-main border-white/10 focus:border-white/20"
                    value={settings.jiraApiKey}
                    onChange={(e) => handleChange("jiraApiKey", e.target.value)}
                  />
                  <div className="text-xs text-atmf-muted space-y-1">
                    <p>For Jira Cloud, use your email address followed by the API token in this format:</p>
                    <p className="text-blue-400 bg-gray-900/50 p-1 rounded">your-email@example.com:your-api-token</p>
                    <p>Get your API token at: <span className="text-blue-400">https://id.atlassian.com/manage-profile/security/api-tokens</span></p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jiraJql">
                    JQL Query <span className="text-xs text-atmf-muted">(Jira Query Language)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="jiraJql"
                      placeholder="project = KEY AND type = Story"
                      className="bg-atmf-main border-white/10 focus:border-white/20"
                      value={settings.jiraJql || ''}
                      onChange={(e) => handleChange("jiraJql", e.target.value)}
                    />
                    {!settings.jiraJql && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="text-xs text-atmf-muted bg-atmf-main px-2 py-1 rounded-sm opacity-70">
                          Press Enter to use default
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-atmf-muted space-y-1">
                    <p>
                      Define a JQL query to filter which Jira issues should be imported and analyzed for test case generation
                    </p>
                    <p className="text-atmf-muted/70 text-[10px]">
                      Examples: 
                      <span className="ml-1 text-blue-400">project = KEY AND type = Story</span> or 
                      <span className="ml-1 text-blue-400">project = KEY AND status != "Done" AND component = Backend</span>
                    </p>
                  </div>
                </div>

                <Button 
                  className="btn-atmf-secondary w-full mt-2" 
                  disabled={!settings.jiraUrl || !settings.jiraProjectId || !settings.jiraApiKey}
                  onClick={handleSaveSettings}
                >
                  <Database className="h-4 w-4 mr-2" />
                  {selectedProject.jiraProjectId ? "Update Jira Connection" : "Connect to Jira"}
                </Button>

                {selectedProject.jiraProjectId && (
                  <div className="mt-2 flex items-start space-x-2 rounded-md bg-slate-900/30 p-2 text-xs text-atmf-muted border border-white/5">
                    <div className="text-emerald-400 mt-0.5">
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        Connected to Jira Project: <span className="text-emerald-400">{selectedProject.jiraProjectId}</span>
                      </p>
                      {selectedProject.jiraUrl && (
                        <p className="mt-1 text-xs text-atmf-muted">
                          <span className="text-blue-400">Jira URL:</span> {selectedProject.jiraUrl}
                        </p>
                      )}
                      {selectedProject.jiraJql && (
                        <p className="mt-1 text-xs text-atmf-muted">
                          <span className="text-blue-400">JQL Query:</span> {selectedProject.jiraJql}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </ATMFCardBody>
            </ATMFCard>

            <ATMFCard>
              <ATMFCardHeader>
                <h3 className="text-lg font-medium flex items-center">
                  <Github className="h-5 w-5 mr-2 text-purple-400" />
                  GitHub Integration
                </h3>
              </ATMFCardHeader>
              <ATMFCardBody className="space-y-4">
                <Alert className="bg-slate-900/30 border-white/10">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Connect to GitHub to link test cases to issues and commits.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="githubToken">GitHub Personal Access Token</Label>
                  <Input
                    id="githubToken"
                    type="password"
                    placeholder="Enter your GitHub token"
                    className="bg-atmf-main border-white/10 focus:border-white/20"
                    value={settings.githubToken}
                    onChange={(e) => handleChange("githubToken", e.target.value)}
                  />
                  <p className="text-xs text-atmf-muted">
                    Create a token with 'repo' scope for private repositories. This is required for AI features to access your code.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubRepo">GitHub Repository</Label>
                  <Input
                    id="githubRepo"
                    placeholder="username/repository"
                    className="bg-atmf-main border-white/10 focus:border-white/20"
                    value={settings.githubRepo}
                    onChange={(e) => handleChange("githubRepo", e.target.value)}
                  />
                  <p className="text-xs text-atmf-muted">
                    Format: username/repository (e.g., atmf/test-management)
                  </p>
                </div>

                <Button 
                  className="btn-atmf-secondary w-full mt-2" 
                  disabled={!settings.githubToken || !settings.githubRepo}
                  onClick={handleSaveSettings}
                >
                  <Github className="h-4 w-4 mr-2" />
                  {selectedProject.githubRepo ? "Update GitHub Connection" : "Connect to GitHub"}
                </Button>

                {selectedProject.githubRepo && (
                  <div className="mt-2 flex items-start space-x-2 rounded-md bg-slate-900/30 p-2 text-xs text-atmf-muted border border-white/5">
                    <div className="text-emerald-400 mt-0.5">
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        Connected to GitHub Repository: <span className="text-emerald-400">{selectedProject.githubRepo}</span>
                      </p>
                    </div>
                  </div>
                )}
              </ATMFCardBody>
            </ATMFCard>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
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
        </div>
      </PageContainer>
    </>
  );
}