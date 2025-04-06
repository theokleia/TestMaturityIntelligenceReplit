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
  jiraApiKey: string;
  githubToken: string;
  githubRepo: string;
  testCaseFormat: "structured" | "plain";
  outputFormat: "markdown" | "pdf" | "html";
}

const defaultSettings: ProjectSettings = {
  language: "English",
  jiraUrl: "",
  jiraApiKey: "",
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

  // Reset settings when selected project changes
  useEffect(() => {
    if (selectedProject) {
      // In a real implementation, we would fetch project settings from the backend
      // For now, just reset to defaults
      setSettings(defaultSettings);
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

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real implementation, we would save to the backend
      console.log("Saving settings for project:", selectedProject?.id);
      console.log("Settings data:", settings);
      
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 800);
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
                  <p className="text-xs text-atmf-muted">Enter your Atlassian Jira base URL</p>
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
                  <p className="text-xs text-atmf-muted">
                    Your Jira API key is stored securely and used for API requests
                  </p>
                </div>

                <Button className="btn-atmf-secondary w-full mt-2" disabled={!settings.jiraUrl || !settings.jiraApiKey}>
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
                    Create a token with 'repo' scope for private repositories
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

                <Button className="btn-atmf-secondary w-full mt-2" disabled={!settings.githubToken || !settings.githubRepo}>
                  <Github className="h-4 w-4 mr-2" />
                  Connect to GitHub
                </Button>
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