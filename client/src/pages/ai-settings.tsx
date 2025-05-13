import { useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

// Define PageContainer component inline since it might not be available
const PageContainer = ({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) => (
  <div className="container mx-auto p-6">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-primary">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
    {children}
  </div>
);

interface GlobalSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export default function AISettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Redirect if not an admin
  if (user && user.role !== "admin") {
    return <Redirect to="/" />;
  }
  
  const [openAIKey, setOpenAIKey] = useState("");
  const [openAIModel, setOpenAIModel] = useState("gpt-4o");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [anthropicModel, setAnthropicModel] = useState("claude-3-7-sonnet-20250219");
  
  // Fetch AI settings
  const { data: aiSettings, isLoading } = useQuery<GlobalSetting[]>({
    queryKey: ["/api/global-settings"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/global-settings?category=AI");
        if (!res.ok) throw new Error("Failed to fetch AI settings");
        return await res.json();
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        throw error;
      }
    },
    enabled: !!user && user.role === "admin"
  });
  
  // Update existing setting
  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, value }: { id: number; value: string }) => {
      const res = await fetch(`/api/global-settings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("Failed to update setting");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/global-settings"] });
      toast({
        title: "Settings updated",
        description: "AI configuration has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });
  
  // Create new setting
  const createSettingMutation = useMutation({
    mutationFn: async (setting: Omit<GlobalSetting, "id" | "createdAt" | "updatedAt">) => {
      const res = await fetch("/api/global-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(setting),
      });
      if (!res.ok) throw new Error("Failed to create setting");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/global-settings"] });
      toast({
        title: "Setting created",
        description: "New AI configuration has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  // Load settings into state when data is available
  useEffect(() => {
    if (aiSettings) {
      const openAIKeySetting = aiSettings.find(setting => setting.key === "openai_api_key");
      const openAIModelSetting = aiSettings.find(setting => setting.key === "openai_model");
      const anthropicKeySetting = aiSettings.find(setting => setting.key === "anthropic_api_key");
      const anthropicModelSetting = aiSettings.find(setting => setting.key === "anthropic_model");
      
      if (openAIKeySetting) setOpenAIKey(openAIKeySetting.value);
      if (openAIModelSetting) setOpenAIModel(openAIModelSetting.value);
      if (anthropicKeySetting) setAnthropicKey(anthropicKeySetting.value);
      if (anthropicModelSetting) setAnthropicModel(anthropicModelSetting.value);
    }
  }, [aiSettings]);
  
  // Save OpenAI settings
  const saveOpenAISettings = async () => {
    const openAIKeySetting = aiSettings?.find(setting => setting.key === "openai_api_key");
    const openAIModelSetting = aiSettings?.find(setting => setting.key === "openai_model");
    
    // If settings exist, update them
    if (openAIKeySetting) {
      await updateSettingMutation.mutateAsync({ id: openAIKeySetting.id, value: openAIKey });
    } else {
      // Create new settings if they don't exist
      await createSettingMutation.mutateAsync({
        key: "openai_api_key",
        value: openAIKey,
        description: "OpenAI API key for AI features",
        category: "AI"
      });
    }
    
    if (openAIModelSetting) {
      await updateSettingMutation.mutateAsync({ id: openAIModelSetting.id, value: openAIModel });
    } else {
      await createSettingMutation.mutateAsync({
        key: "openai_model",
        value: openAIModel,
        description: "OpenAI model to use for general AI features",
        category: "AI"
      });
    }
  };
  
  // Save Anthropic settings
  const saveAnthropicSettings = async () => {
    const anthropicKeySetting = aiSettings?.find(setting => setting.key === "anthropic_api_key");
    const anthropicModelSetting = aiSettings?.find(setting => setting.key === "anthropic_model");
    
    if (anthropicKeySetting) {
      await updateSettingMutation.mutateAsync({ id: anthropicKeySetting.id, value: anthropicKey });
    } else {
      await createSettingMutation.mutateAsync({
        key: "anthropic_api_key",
        value: anthropicKey,
        description: "Anthropic API key for document generation",
        category: "AI"
      });
    }
    
    if (anthropicModelSetting) {
      await updateSettingMutation.mutateAsync({ id: anthropicModelSetting.id, value: anthropicModel });
    } else {
      await createSettingMutation.mutateAsync({
        key: "anthropic_model",
        value: anthropicModel,
        description: "Anthropic model to use for document generation",
        category: "AI"
      });
    }
  };
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  return (
    <PageContainer 
      title="AI Configuration" 
      subtitle="Manage API keys and models for AI services"
    >
      {isLoading ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="openai" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="openai">OpenAI Configuration</TabsTrigger>
            <TabsTrigger value="anthropic">Anthropic Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="openai">
            <Card>
              <CardHeader>
                <CardTitle>OpenAI Settings</CardTitle>
                <CardDescription>
                  Configure your OpenAI API key and model preferences for general AI features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    value={openAIKey}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                    placeholder="sk-..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openai-model">Model</Label>
                  <Select value={openAIModel} onValueChange={setOpenAIModel}>
                    <SelectTrigger id="openai-model">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o (Latest)</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="mt-4 w-full" 
                  onClick={saveOpenAISettings}
                  disabled={updateSettingMutation.isPending}
                >
                  {updateSettingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save OpenAI Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="anthropic">
            <Card>
              <CardHeader>
                <CardTitle>Anthropic Settings</CardTitle>
                <CardDescription>
                  Configure your Anthropic API key and model preferences for document generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="anthropic-key">API Key</Label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-ant-..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anthropic-model">Model</Label>
                  <Select value={anthropicModel} onValueChange={setAnthropicModel}>
                    <SelectTrigger id="anthropic-model">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet (Latest)</SelectItem>
                      <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="mt-4 w-full" 
                  onClick={saveAnthropicSettings}
                  disabled={updateSettingMutation.isPending}
                >
                  {updateSettingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Anthropic Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </PageContainer>
  );
}