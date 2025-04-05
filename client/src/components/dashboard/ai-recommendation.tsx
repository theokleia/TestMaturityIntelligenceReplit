import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  useAiInsights,
  useGenerateRecommendation,
  useAnalyzeTestingData,
  AiInsight
} from "@/hooks/use-ai-recommendations";
import { type Recommendation } from "@shared/schema";
import { InsightCard } from "./insight-card";

interface AiRecommendationProps {
  dimensionId: number;
  className?: string;
  onNewRecommendation?: (recommendation: Recommendation) => void;
}

export function AiRecommendation({ dimensionId, className, onNewRecommendation }: AiRecommendationProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fetch AI insights for the current dimension
  const { 
    data: insightsData, 
    isLoading: isLoadingInsights,
    error: insightsError
  } = useAiInsights(dimensionId);
  
  // Generate recommendation mutation
  const generateRecommendation = useGenerateRecommendation();
  
  // Handle generating a new recommendation
  const handleGenerateRecommendation = async () => {
    setIsGenerating(true);
    try {
      const response = await generateRecommendation.mutateAsync({ dimensionId });
      
      toast({
        title: "Recommendation Generated",
        description: "New AI recommendation has been created successfully",
      });
      
      if (onNewRecommendation && response) {
        onNewRecommendation(response as Recommendation);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (isLoadingInsights) {
    return (
      <div className={className}>
        <div className="glassmorphism rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    );
  }
  
  if (insightsError) {
    return (
      <div className={className}>
        <div className="glassmorphism rounded-2xl p-6 border border-white/5">
          <div className="text-center">
            <h3 className="text-lg font-heading font-bold mb-2">AI Insights Unavailable</h3>
            <p className="text-text-muted text-sm mb-4">
              We couldn't load AI insights for this dimension. Please try again later.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="glassmorphism rounded-2xl p-6 border border-primary-purple/20 neon-border-purple">
        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-[#8A56FF]/20 flex items-center justify-center flex-shrink-0">
            <i className="bx bx-bulb text-lg text-[#8A56FF]"></i>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-heading font-bold mb-2">AI Insight</h3>
            <p className="text-text-muted text-sm mb-4">
              {insightsData?.insights ? String(insightsData.insights) : "No insights available for this dimension."}
            </p>
            
            <div className="flex items-center space-x-3">
              <Button 
                className="px-3 py-1.5 rounded-lg bg-[#8A56FF]/20 text-[#8A56FF] text-sm"
                onClick={handleGenerateRecommendation}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <i className="bx bx-loader-alt animate-spin mr-1"></i>
                    Generating...
                  </>
                ) : (
                  "Generate Recommendation"
                )}
              </Button>
              <Button 
                variant="ghost" 
                className="px-3 py-1.5 rounded-lg bg-white/5 text-text-muted text-sm"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AiAnalysisCardProps {
  title: string;
  className?: string;
}

export function AiAnalysisCard({ title, className }: AiAnalysisCardProps) {
  // This is a simpler card for displaying AI analysis results like test prioritization
  // or defect prediction that doesn't require API calls
  
  return (
    <div className={`glassmorphism rounded-2xl p-6 border border-white/5 ${className}`}>
      <h3 className="text-lg font-heading font-bold mb-4">{title}</h3>
      {title === "Test Prioritization" ? (
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="h-5 w-5 rounded-full bg-[#2FFFAA]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="bx bx-check text-[#2FFFAA]"></i>
            </div>
            <span className="ml-2 text-sm">Prioritize API integration tests</span>
          </li>
          <li className="flex items-start">
            <div className="h-5 w-5 rounded-full bg-[#FFBB3A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="bx bx-time text-[#FFBB3A]"></i>
            </div>
            <span className="ml-2 text-sm">Focus on payment processing module</span>
          </li>
          <li className="flex items-start">
            <div className="h-5 w-5 rounded-full bg-text-muted/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="bx bx-minus text-text-muted"></i>
            </div>
            <span className="ml-2 text-sm">Reduce redundant UI tests</span>
          </li>
        </ul>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Authentication Module</span>
            <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-1/4 bg-[#2FFFAA] rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Payment Processing</span>
            <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-[#FF4A6B] rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">User Profile</span>
            <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-2/4 bg-[#FFBB3A] rounded-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}