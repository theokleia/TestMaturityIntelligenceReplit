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
}

export interface TestCaseStep {
  step: string;
  expected: string;
}

export interface TestCase {
  id: number;
  title: string;
  description: string;
  preconditions: string;
  steps: TestCaseStep[];
  expectedResults: string;
  priority: string;
  severity: string;
  status: string;
  suiteId: number;
  userId: number;
  aiGenerated: boolean;
  automatable: boolean;
  automationStatus: string;
  createdAt: string;
  updatedAt: string;
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

// Hook to fetch a maturity roadmap for a dimension
export function useMaturityRoadmap(dimensionId: number, currentLevel: number = 1) {
  return useQuery<MaturityRoadmap>({
    queryKey: ['/api/ai/roadmap', dimensionId, currentLevel],
    enabled: !!dimensionId,
    refetchOnWindowFocus: false,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook to analyze test patterns
export function useAnalyzeTestPatterns() {
  return useMutation({
    mutationFn: async (request: TestPatternData) => {
      const res = await apiRequest('POST', '/api/ai/test-patterns', request);
      return res.json() as Promise<TestPatternAnalysis>;
    },
  });
}

// Hook to generate test strategy
export function useGenerateTestStrategy() {
  return useMutation({
    mutationFn: async (request: TestStrategyRequest) => {
      const res = await apiRequest('POST', '/api/ai/test-strategy', request);
      return res.json() as Promise<TestStrategy>;
    },
  });
}

// Hook to generate AI-powered test cases
export function useGenerateTestCases() {
  return useMutation({
    mutationFn: async (request: GenerateTestCasesRequest) => {
      const res = await apiRequest('POST', '/api/ai/generate-test-cases', request);
      return res.json() as Promise<{
        message: string;
        testCases: TestCase[];
      }>;
    },
    onSuccess: () => {
      // Invalidate test cases cache when new ones are created
      queryClient.invalidateQueries({ queryKey: ['/api/test-cases'] });
    },
  });
}