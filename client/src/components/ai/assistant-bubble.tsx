import { useState, useEffect } from "react";
import { Bot, X, CornerDownLeft, Sparkles, Loader2 } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ATMFCard } from "@/components/design-system/atmf-card";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export function AIAssistantBubble({ contextPath = "" }: { contextPath?: string }) {
  const { selectedProject } = useProject();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate a contextual welcome message when the component mounts or the selected project changes
  useEffect(() => {
    if (selectedProject) {
      // Reset messages when project changes
      setMessages([
        {
          role: "assistant",
          content: generateWelcomeMessage(selectedProject.name, contextPath)
        }
      ]);
    }
  }, [selectedProject, contextPath]);

  // Function to generate a contextual welcome message based on the project and current page
  const generateWelcomeMessage = (projectName: string, path: string): string => {
    let baseMessage = `Hello! I'm your ATMosFera AI assistant. I can help you with your "${projectName}" project. `;
    
    // Add context-specific messaging based on the current path
    if (path.includes("project-health")) {
      return baseMessage + "I see you're looking at the project health dashboard. Would you like tips on improving any specific metrics?";
    } else if (path.includes("assessments")) {
      return baseMessage + "Need help with test maturity assessments? I can guide you through the process or explain what the results mean.";
    } else if (path.includes("test-management")) {
      return baseMessage + "Looking for test management best practices? Ask me about test case design, automation strategy, or how to improve your coverage.";
    } else if (path.includes("ai-insights")) {
      return baseMessage + "I can help you interpret AI-generated insights or generate new ones based on your testing data.";
    } else {
      return baseMessage + "How can I assist you today? Ask me about test strategies, automation approaches, or quality improvement ideas.";
    }
  };

  // Function to get project-specific tips based on the project type and user query
  const getProjectSpecificTips = async (query: string) => {
    setLoading(true);
    
    try {
      if (!selectedProject) {
        // Handle case where no project is selected
        const noProjectResponse = "Please select a project first to get personalized recommendations.";
        setMessages(prev => [
          ...prev,
          { role: "user", content: query },
          { role: "assistant", content: noProjectResponse }
        ]);
        setInput("");
        return;
      }
      
      // Log the interaction 
      console.log("AI Assistant Query:", {
        projectId: selectedProject?.id,
        projectName: selectedProject?.name,
        contextPath,
        query
      });
      
      // Call the OpenAI API through our backend endpoint
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          projectName: selectedProject.name, // Keep for backward compatibility
          query,
          contextPath
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add the user's message and the AI response to the messages array
      setMessages(prev => [
        ...prev,
        { role: "user", content: query },
        { role: "assistant", content: data.response }
      ]);
      
      // Clear the input field
      setInput("");
      
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      
      // Add the user's message and an error response
      setMessages(prev => [
        ...prev,
        { role: "user", content: query },
        { role: "assistant", content: "I'm sorry, I wasn't able to process your request. Please try again later." }
      ]);
      
      toast({
        title: "Error",
        description: "Failed to get AI recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      getProjectSpecificTips(input);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 p-0"
            onClick={() => setOpen(true)}
          >
            <Bot className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-atmf-background"></span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 sm:w-96 p-0 border-atmf-card bg-atmf-card shadow-xl"
          align="end"
          sideOffset={16}
        >
          <div className="h-96 flex flex-col">
            <div className="flex items-center justify-between bg-atmf-card-alt p-3 border-b border-atmf-main/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="font-medium">ATMosFera Assistant</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-atmf-main"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex flex-col gap-1",
                    message.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div 
                    className={cn(
                      "px-3 py-2 rounded-lg max-w-[85%]",
                      message.role === "user" 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-atmf-main text-white rounded-tl-none"
                    )}
                  >
                    <div className="whitespace-pre-line text-sm">{message.content}</div>
                  </div>
                  <span className="text-xs text-atmf-muted px-1">
                    {message.role === "user" ? "You" : "Assistant"}
                  </span>
                </div>
              ))}
              
              {loading && (
                <div className="flex items-center gap-2 text-atmf-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </div>
            
            <form 
              onSubmit={handleSubmit}
              className="p-3 border-t border-atmf-main/10"
            >
              <div className="relative">
                <Textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about your project..."
                  className="pl-3 pr-10 py-2 min-h-10 max-h-32 bg-atmf-main resize-none border-white/10"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button 
                  type="submit"
                  size="icon"
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full",
                    !input.trim() || loading
                      ? "text-atmf-muted hover:text-atmf-muted"
                      : "text-blue-400 hover:text-blue-300 hover:bg-transparent"
                  )}
                  disabled={!input.trim() || loading}
                  variant="ghost"
                >
                  <CornerDownLeft className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}