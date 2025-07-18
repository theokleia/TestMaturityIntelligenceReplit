import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { invalidateResource } from "@/lib/queryUtils";
// Import TestCase and TestCaseStep types from our refactored module
import { TestCase, TestStep } from "./test-management";

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
  projectId?: number;
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

export interface MaturityRoadmapLevel {
  level: number;
  name: string;
  description: string;
  keyInitiatives: string[];
  estimatedTimeframe: string;
}

export interface MaturityRoadmap {
  levels: MaturityRoadmapLevel[];
}

export interface TestPatternData {
  patterns: string[];
  coverage: {
    component: string;
    percentage: number;
  }[];
  executionTimes: {
    suite: string;
    time: number;
  }[];
}

export interface TestPatternAnalysis {
  optimizationOpportunities: Array<{
    title: string;
    description: string;
    potentialImpact: "high" | "medium" | "low";
    implementationEffort: "high" | "medium" | "low";
  }>;
  redundancies: string[];
  coverageGaps: string[];
}

export interface TestStrategyRequest {
  type: string;
  technologies: string[];
  teamSize: number;
  releaseFrequency: string;
  qualityGoals: string[];
}

export interface TestStrategy {
  strategyOverview: string;
  testLevels: Array<{
    level: string;
    focus: string;
    recommendedApproach: string;
    automationRecommendation: string;
  }>;
  toolRecommendations: Array<{
    category: string;
    recommendation: string;
    rationale: string;
  }>;
}

export interface GenerateTestCasesRequest {
  feature: string;
  requirements: string;
  complexity: string;
  testSuiteId: number;
  projectId?: number;
}

// Hook to fetch AI insights for a specific dimension
export function useAiInsights(dimensionId: number, projectId?: number) {
  return useQuery<AiInsight>({
    queryKey: ['/api/ai/insights', dimensionId, { projectId }],
    enabled: !!dimensionId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to generate a new AI recommendation
export function useGenerateRecommendation() {
  return useMutation({
    mutationFn: async (request: GenerateRecommendationRequest) => {
      return apiRequest('/api/ai/recommendations', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    },
    onSuccess: () => {
      // Invalidate recommendations cache when a new one is created
      invalidateResource('/api/recommendations');
    },
  });
}

// Hook to analyze testing data
export function useAnalyzeTestingData() {
  return useMutation({
    mutationFn: async (request: TestDataAnalysisRequest) => {
      return apiRequest<TestDataAnalysis>('/api/ai/analyze', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    },
  });
}

// Hook to fetch a maturity roadmap for a dimension
export function useMaturityRoadmap(dimensionId: number, currentLevel: number = 1, projectId?: number) {
  return useQuery<MaturityRoadmap>({
    queryKey: ['/api/ai/roadmap', dimensionId, currentLevel, { projectId }],
    enabled: !!dimensionId,
    refetchOnWindowFocus: false,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook to analyze test patterns
export function useAnalyzeTestPatterns() {
  return useMutation({
    mutationFn: async (request: TestPatternData) => {
      return apiRequest<TestPatternAnalysis>('/api/ai/test-patterns', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    },
  });
}

// Hook to generate test strategy
export function useGenerateTestStrategy() {
  return useMutation({
    mutationFn: async (request: TestStrategyRequest) => {
      return apiRequest<TestStrategy>('/api/ai/test-strategy', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    },
  });
}

// Hook to generate AI-powered test cases
export function useGenerateTestCases() {
  return useMutation({
    mutationFn: async (request: GenerateTestCasesRequest) => {
      return apiRequest<{
        message: string;
        testCases: TestCase[];
      }>('/api/test-cases/generate', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    },
    onSuccess: () => {
      // Invalidate test cases cache when new ones are created
      invalidateResource('/api/test-cases');
    },
  });
}