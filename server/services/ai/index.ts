/**
 * AI Services Index
 * Central export point for all AI-related services
 */

export { aiClientManager } from './ai-client-manager';
export type { AIClientConfig } from './ai-client-manager';
export { contextManager } from './context-manager';
export type { ProjectContext, ContextOptions } from './context-manager';
export { testGenerationService } from './test-generation-service';
export type { 
  TestCaseGenerationRequest,
  TestStepsGenerationRequest,
  TestCoverageAnalysisRequest,
  GeneratedTestCase
} from './test-generation-service';
export { documentGenerationService } from './document-generation-service';
export type {
  DocumentGenerationRequest,
  GeneratedDocument
} from './document-generation-service';
export { promptTemplates, PromptTemplateEngine } from './prompt-templates';

/**
 * Unified AI Service Interface
 * Provides a single entry point for all AI operations
 */
export class AIService {
  /**
   * Generate test cases using AI
   */
  static async generateTestCases(request: TestCaseGenerationRequest) {
    return testGenerationService.generateTestCases(request);
  }

  /**
   * Generate test steps using AI
   */
  static async generateTestSteps(request: TestStepsGenerationRequest) {
    return testGenerationService.generateTestSteps(request);
  }

  /**
   * Analyze test coverage using AI
   */
  static async analyzeTestCoverage(request: TestCoverageAnalysisRequest) {
    return testGenerationService.analyzeTestCoverage(request);
  }

  /**
   * Generate documents using AI
   */
  static async generateDocument(request: DocumentGenerationRequest) {
    return documentGenerationService.generateDocument(request);
  }

  /**
   * Generate analysis reports using AI
   */
  static async generateAnalysisReport(
    projectId: number,
    analysisType: 'quality' | 'coverage' | 'maturity' | 'performance',
    timeRange?: { start: Date; end: Date }
  ) {
    return documentGenerationService.generateAnalysisReport(projectId, analysisType, timeRange);
  }

  /**
   * Refresh AI clients with updated configuration
   */
  static async refreshClients() {
    return aiClientManager.refreshClients();
  }

  /**
   * Get project context for AI operations
   */
  static async getProjectContext(projectId: number, options?: ContextOptions) {
    return contextManager.aggregateProjectContext(projectId, options);
  }
}

export default AIService;