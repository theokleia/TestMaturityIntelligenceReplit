/**
 * OpenAI Service - Refactored Compatibility Layer
 * 
 * This file provides backward compatibility for existing code while
 * delegating to the new modular AI service architecture.
 * 
 * New code should use the modular AI services directly:
 * - import { AIService } from "./services/ai"
 * - import { testGenerationService } from "./services/ai"
 * - import { documentGenerationService } from "./services/ai"
 */

import { AIService, TestCaseGenerationRequest, TestStepsGenerationRequest, TestCoverageAnalysisRequest, DocumentGenerationRequest } from "./services/ai";
import { Project } from "@shared/schema";
import { storage } from "./storage";

/**
 * Generate test cases using AI - Legacy compatibility wrapper
 */
export async function generateTestCases(
  projectId: number,
  requirements: string,
  includeDocuments = true,
  includeJira = true,
  suiteId?: number
) {
  const request: TestCaseGenerationRequest = {
    projectId,
    requirements,
    suiteId,
    includeDocuments,
    includeJira
  };

  return AIService.generateTestCases(request);
}

/**
 * Generate test steps using AI - Legacy compatibility wrapper
 */
export async function generateTestSteps(
  projectId: number,
  testCase: any,
  includeDocuments = true,
  includeJira = true
) {
  const request: TestStepsGenerationRequest = {
    projectId,
    testCase,
    includeDocuments,
    includeJira
  };

  return AIService.generateTestSteps(request);
}

/**
 * Analyze test coverage using AI - Legacy compatibility wrapper
 */
export async function analyzeTestCoverage(
  projectId: number,
  jiraTickets: any[],
  context?: string
) {
  const request: TestCoverageAnalysisRequest = {
    projectId,
    jiraTickets,
    context
  };

  return AIService.analyzeTestCoverage(request);
}

/**
 * Generate documents using AI - Legacy compatibility wrapper
 */
export async function generateDocument(
  projectId: number,
  documentType: 'PRD' | 'SRS' | 'SDDS' | 'Test Plan' | 'Test Report',
  includeJira = true,
  includeGithub = false,
  customPrompt?: string
) {
  const request: DocumentGenerationRequest = {
    projectId,
    documentType,
    includeJira,
    includeGithub,
    customPrompt
  };

  return AIService.generateDocument(request);
}

/**
 * Generate analysis reports - Legacy compatibility wrapper
 */
export async function generateAnalysisReport(
  projectId: number,
  analysisType: 'quality' | 'coverage' | 'maturity' | 'performance',
  timeRange?: { start: Date; end: Date }
) {
  return AIService.generateAnalysisReport(projectId, analysisType, timeRange);
}

/**
 * Get project context - Legacy compatibility wrapper
 */
export async function getProjectContext(projectId: number) {
  return AIService.getProjectContext(projectId);
}

// Re-export new AI services for direct use
export { AIService } from "./services/ai";
export { 
  testGenerationService,
  documentGenerationService,
  aiClientManager,
  contextManager
} from "./services/ai";

// Legacy function aliases for backward compatibility
export const callOpenAI = async (...args: any[]) => {
  console.warn("callOpenAI is deprecated. Use aiClientManager.callOpenAI() instead.");
  throw new Error("Direct OpenAI calls should use the new aiClientManager service");
};

export const callAnthropic = async (...args: any[]) => {
  console.warn("callAnthropic is deprecated. Use aiClientManager.callAnthropic() instead.");
  throw new Error("Direct Anthropic calls should use the new aiClientManager service");
};

// Temporary stub functions for missing exports during transition
export async function generateWhisperSuggestions(project: any, contextPath: string, contextData: any) {
  console.warn("generateWhisperSuggestions is not yet implemented in the new AI service architecture");
  return { suggestions: ["Feature under development"], priority: "low" };
}

export async function generateMaturityInsights(...args: any[]) {
  console.warn("generateMaturityInsights is not yet implemented in the new AI service architecture");
  return { insights: ["Feature under development"] };
}

export async function generateRecommendations(...args: any[]) {
  console.warn("generateRecommendations is not yet implemented in the new AI service architecture");
  return { recommendations: ["Feature under development"] };
}

export async function analyzeTestingData(...args: any[]) {
  console.warn("analyzeTestingData is not yet implemented in the new AI service architecture");
  return { analysis: "Feature under development" };
}

export async function generateMaturityRoadmap(...args: any[]) {
  console.warn("generateMaturityRoadmap is not yet implemented in the new AI service architecture");
  return { roadmap: "Feature under development" };
}

export async function analyzeTestPatterns(...args: any[]) {
  console.warn("analyzeTestPatterns is not yet implemented in the new AI service architecture");
  return { patterns: "Feature under development" };
}

export async function generateTestStrategy(...args: any[]) {
  console.warn("generateTestStrategy is not yet implemented in the new AI service architecture");
  return { strategy: "Feature under development" };
}

export async function generateTestSuites(...args: any[]) {
  console.warn("generateTestSuites is not yet implemented in the new AI service architecture");
  return { testSuites: [] };
}

export async function generateAssistantResponse(...args: any[]) {
  console.warn("generateAssistantResponse is not yet implemented in the new AI service architecture");
  return "Feature under development";
}

export async function analyzeDocumentContent(...args: any[]) {
  console.warn("analyzeDocumentContent is not yet implemented in the new AI service architecture");
  return { analysis: "Feature under development" };
}

/**
 * Migration note for developers:
 * 
 * Old usage:
 * import { generateTestCases } from "./openai-service";
 * 
 * New usage (recommended):
 * import { AIService } from "./services/ai";
 * AIService.generateTestCases(request);
 * 
 * Or for specific services:
 * import { testGenerationService } from "./services/ai";
 * testGenerationService.generateTestCases(request);
 */