import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useProject } from "@/context/ProjectContext";
import { animate, motion, useAnimation, AnimatePresence } from "framer-motion";
import { Sparkles, Lightbulb, X, CheckCheck, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTestCycles } from "@/hooks/test-execution/useTestCycles";
import { useTestCycleItems } from "@/hooks/test-execution/useTestCycleItems";
import { useTestCases } from "@/hooks/test-management";

interface SuggestionData {
  text: string;
  priority?: "low" | "medium" | "high";
}

interface Suggestion {
  text: string;
  seen: boolean;
  priority?: "low" | "medium" | "high";
}

export function WhisperAssistant() {
  const [location] = useLocation();
  const { selectedProject } = useProject();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const controls = useAnimation();
  const hasShownRef = useRef(false);
  const { toast } = useToast();
  
  // Determine if we're on the test execution page
  const isTestExecutionPage = location.includes('test-execution');
  
  // Fetch test execution data when on test execution page
  const { data: testCycles } = useTestCycles(
    isTestExecutionPage && selectedProject ? selectedProject.id : undefined
  );
  
  // Get the first test cycle for now - in the future we could handle the active cycle
  const activeCycle = testCycles && testCycles.length > 0 ? testCycles[0] : undefined;
  
  // Fetch test cycle items for the active cycle
  const { data: cycleItems } = useTestCycleItems(
    isTestExecutionPage && activeCycle ? activeCycle.id : undefined
  );
  
  // Fetch test cases for the project
  const { testCases } = useTestCases({
    projectId: isTestExecutionPage && selectedProject ? selectedProject.id : undefined
  });
  
  // Prepare test execution analytics data for whisper suggestions
  const prepareTestExecutionData = () => {
    if (!isTestExecutionPage || !cycleItems || !testCases) return null;
    
    // Count test statuses
    const statusCounts = {
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
      'not-run': 0
    };
    
    // Need to cast these to proper arrays to avoid TypeScript errors
    const cycleItemsArray = Array.isArray(cycleItems) ? cycleItems : [];
    const testCasesArray = Array.isArray(testCases) ? testCases : [];
    
    cycleItemsArray.forEach(item => {
      const status = (item.status as string) || 'not-run';
      statusCounts[status as keyof typeof statusCounts] = (statusCounts[status as keyof typeof statusCounts] || 0) + 1;
    });
    
    // Calculate completion percentage
    const totalTests = cycleItemsArray.length;
    const completedTests = totalTests - statusCounts['not-run'];
    const completionPercentage = totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0;
    
    // Identify test cases by priority
    const highPriorityNotRun = cycleItemsArray
      .filter(item => item.status === 'not-run')
      .map(item => {
        const testCase = testCasesArray.find(tc => tc.id === item.testCaseId);
        return testCase ? { ...testCase, itemId: item.id } : null;
      })
      .filter(Boolean)
      .filter(tc => tc.priority === 'high')
      .map(tc => ({ id: tc.id, title: tc.title, priority: tc.priority }));
    
    // Find failed tests without previous passes
    const failedTestIds = cycleItemsArray
      .filter(item => item.status === 'failed')
      .map(item => item.testCaseId);
    
    return {
      activeCycle: activeCycle ? { id: activeCycle.id, name: activeCycle.name, status: activeCycle.status } : null,
      statusCounts,
      completionPercentage,
      totalTests,
      completedTests,
      highPriorityNotRun: highPriorityNotRun.slice(0, 3), // Just sending top 3 for brevity
      failedTests: failedTestIds.length
    };
  };
  
  // Fetch whisper suggestions when location or project changes
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['/api/ai/whisper', selectedProject?.id, location, cycleItems?.length],
    queryFn: async () => {
      if (!selectedProject) return null;
      
      // Prepare test execution data if on test execution page
      const testExecutionData = prepareTestExecutionData();
      
      const response = await fetch('/api/ai/whisper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          projectName: selectedProject.name, // Keep for backward compatibility
          contextPath: location,
          contextData: testExecutionData // Include test execution data when available
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch whisper suggestions');
      }
      
      return response.json();
    },
    enabled: !!selectedProject && !dismissed,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  // Update suggestions when data is received
  useEffect(() => {
    if (data && data.suggestions) {
      // Make sure we're handling the data correctly regardless of structure
      const suggestionArray = Array.isArray(data.suggestions) 
        ? data.suggestions 
        : [data.suggestions]; // Handle in case it's a string
        
      if (suggestionArray.length > 0) {
        // Process suggestions which could be objects or strings
        const newSuggestions = suggestionArray.map((item: string | SuggestionData) => {
          // If the item is a string, create a simple suggestion object
          if (typeof item === 'string') {
            return { text: item, seen: false };
          }
          
          // If the item has a 'text' property (new format with text + priority)
          if (typeof item === 'object' && item !== null) {
            // Handle both formats: {text: string} and {text: {text: string, priority: string}}
            if (typeof item.text === 'object' && item.text !== null && 'text' in item.text) {
              // Handle nested text object format
              const textObj = item.text as {text: string; priority?: string};
              return { 
                text: textObj.text,
                seen: false,
                priority: textObj.priority as "low" | "medium" | "high" | undefined
              };
            } else {
              // Handle simple object format
              return { 
                text: typeof item.text === 'string' ? item.text : String(item.text),
                seen: false,
                priority: item.priority as "low" | "medium" | "high" | undefined
              };
            }
          }
          
          // Fallback for any other format
          return { text: String(item), seen: false };
        });
        
        setSuggestions(newSuggestions);
        
        // Determine the highest priority among all suggestions or use the global priority
        const highestPriority = newSuggestions
          .map((s: Suggestion) => s.priority)
          .reduce((highest: "low" | "medium" | "high", current?: "low" | "medium" | "high") => {
            if (!current) return highest;
            if (current === 'high') return 'high';
            if (current === 'medium' && highest !== 'high') return 'medium';
            return highest;
          }, data.priority as "low" | "medium" | "high" || 'low');
        
        setPriority(highestPriority);
        
        // Show the component
        if (!hasShownRef.current && !dismissed) {
          setTimeout(() => {
            setVisible(true);
            hasShownRef.current = true;
          }, 2000); // Show after 2 seconds on the page
        }
        
        console.log("Whisper suggestions loaded:", newSuggestions);
      }
    }
  }, [data, dismissed]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Error fetching whisper suggestions:", error);
    }
  }, [error]);
  
  // Reset when location or project changes
  useEffect(() => {
    hasShownRef.current = false;
    setVisible(false);
    setExpanded(false);
    setDismissed(false);
  }, [location, selectedProject]);
  
  // Animation for pulse effect on priority indicator
  useEffect(() => {
    if (visible && !expanded) {
      controls.start({
        scale: [1, 1.1, 1],
        transition: { repeat: Infinity, duration: 2 }
      });
    } else {
      controls.stop();
      controls.set({ scale: 1 });
    }
  }, [visible, expanded, controls]);
  
  // Mark all suggestions as seen when expanded
  useEffect(() => {
    if (expanded) {
      setSuggestions(prev => prev.map(s => ({ ...s, seen: true })));
    }
  }, [expanded]);
  
  // Get the count of unread suggestions
  const unreadCount = suggestions.filter(s => !s.seen).length;
  
  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };
  
  const handleAccept = () => {
    setVisible(false);
    toast({
      title: "Suggestions noted",
      description: "Whisper suggestions have been acknowledged",
      duration: 3000
    });
  };
  
  if (!visible || !suggestions.length || !selectedProject) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed right-6 top-20 z-40"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <div className={cn(
          "bg-atmf-card backdrop-blur-sm border border-atmf-card-alt/30 rounded-lg shadow-lg overflow-hidden transition-all duration-300",
          expanded ? "w-80" : "w-auto"
        )}>
          {/* Header */}
          <div 
            className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-300" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white">Whisper Suggestions</span>
                {unreadCount > 0 && (
                  <motion.span 
                    animate={controls}
                    className={cn(
                      "inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold",
                      priority === "high" ? "bg-red-500 text-white" :
                      priority === "medium" ? "bg-amber-500 text-white" : 
                      "bg-blue-500 text-white"
                    )}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {expanded ? (
                <ChevronUp className="h-3 w-3 text-blue-300" />
              ) : (
                <ChevronDown className="h-3 w-3 text-blue-300" />
              )}
            </div>
          </div>
          
          {/* Content */}
          {expanded && (
            <div className="p-3 text-white/90">
              <ul className="space-y-2 mb-3">
                {suggestions.map((suggestion, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <Sparkles className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                    <span>{suggestion.text}</span>
                  </motion.li>
                ))}
              </ul>
              
              {/* Actions */}
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs hover:bg-red-600/20 text-red-300 hover:text-red-200"
                  onClick={handleDismiss}
                >
                  <X className="h-3 w-3 mr-1" />
                  Dismiss
                </Button>
                <Button
                  variant="ghost"
                  size="sm" 
                  className="text-xs hover:bg-green-600/20 text-green-300 hover:text-green-200"
                  onClick={handleAccept}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Got it
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}