import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface AiInsight {
  insights: string;
  dimension: {
    id: number;
    name: string;
    description: string;
    color: string;
  };
  currentLevel: {
    id: number;
    level: number;
    name: string;
    description: string;
    status: string;
  };
}

export interface GenerateRecommendationRequest {
  dimensionId: number;
  levelId?: number;
}

export interface TestDataAnalysisRequest {
  testData: any;
}

export interface TestDataAnalysis {
  insights: string[];
  riskAreas: {
    area: string;
    risk: number;
  }[];
}

// Hook to fetch AI insights for a specific dimension
export function useAiInsights(dimensionId: number) {
  return useQuery<AiInsight>({
    queryKey: ['/api/ai/insights', dimensionId],
    enabled: !!dimensionId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to generate a new AI recommendation
export function useGenerateRecommendation() {
  return useMutation({
    mutationFn: async (request: GenerateRecommendationRequest) => {
      const res = await apiRequest('POST', '/api/ai/recommendations', request);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate recommendations cache when a new one is created
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
    },
  });
}

// Hook to analyze testing data
export function useAnalyzeTestingData() {
  return useMutation({
    mutationFn: async (request: TestDataAnalysisRequest) => {
      const res = await apiRequest('POST', '/api/ai/analyze', request);
      return res.json();
    },
  });
}