import { aiClientManager } from "./ai-client-manager";
import { contextManager, ProjectContext } from "./context-manager";
import { promptTemplates } from "./prompt-templates";

/**
 * Test Generation Service
 * Handles AI-powered test case generation, test steps, and coverage analysis
 */

export interface TestCaseGenerationRequest {
  projectId: number;
  requirements: string;
  suiteId?: number;
  includeDocuments?: boolean;
  includeJira?: boolean;
  testingStrategy?: string;
}

export interface TestStepsGenerationRequest {
  projectId: number;
  testCase: any;
  includeDocuments?: boolean;
  includeJira?: boolean;
}

export interface TestCoverageAnalysisRequest {
  projectId: number;
  jiraTickets: any[];
  context?: string;
}

export interface GeneratedTestCase {
  title: string;
  description: string;
  preconditions: string;
  steps: Array<{
    step: string;
    expected: string;
  }>;
  expectedResults: string;
  priority: 'high' | 'medium' | 'low';
  severity: 'critical' | 'high' | 'normal' | 'low';
  automatable: boolean;
  tags: string[];
}

export class TestGenerationService {
  /**
   * Generate test cases based on requirements and project context
   */
  async generateTestCases(request: TestCaseGenerationRequest): Promise<GeneratedTestCase[]> {
    try {
      console.log(`Generating test cases for project ${request.projectId}`);

      // Aggregate project context
      const context = await contextManager.getOptimizedContextForFeature(
        request.projectId,
        'test-generation',
        {
          includeDocuments: request.includeDocuments,
          includeJira: request.includeJira
        }
      );

      // Build the prompt
      const prompt = await this.buildTestCaseGenerationPrompt(request, context);
      
      // Call OpenAI API
      const response = await aiClientManager.callOpenAI(
        [{ role: "user", content: prompt }],
        {
          max_tokens: 2000,
          temperature: 0.7,
          response_format: { type: "json_object" }
        }
      );

      // Parse and validate response
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content received from OpenAI API");
      }

      const parsed = JSON.parse(content);
      return this.validateAndNormalizeTestCases(parsed.testCases || []);

    } catch (error) {
      console.error("Error generating test cases:", error);
      throw new Error(`Failed to generate test cases: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate detailed test steps for an existing test case
   */
  async generateTestSteps(request: TestStepsGenerationRequest): Promise<any> {
    try {
      console.log(`Generating test steps for project ${request.projectId}`);

      // Aggregate project context
      const context = await contextManager.getOptimizedContextForFeature(
        request.projectId,
        'test-generation',
        {
          includeDocuments: request.includeDocuments,
          includeJira: request.includeJira
        }
      );

      // Build the prompt
      const prompt = await this.buildTestStepsGenerationPrompt(request, context);
      
      // Call OpenAI API
      const response = await aiClientManager.callOpenAI(
        [{ role: "user", content: prompt }],
        {
          max_tokens: 1500,
          temperature: 0.7,
          response_format: { type: "json_object" }
        }
      );

      // Parse and return response
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content received from OpenAI API");
      }

      return JSON.parse(content);

    } catch (error) {
      console.error("Error generating test steps:", error);
      throw new Error(`Failed to generate test steps: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze test coverage and propose improvements
   */
  async analyzeTestCoverage(request: TestCoverageAnalysisRequest): Promise<GeneratedTestCase[]> {
    try {
      console.log(`Analyzing test coverage for project ${request.projectId}`);

      // Aggregate project context
      const context = await contextManager.getOptimizedContextForFeature(
        request.projectId,
        'analysis'
      );

      // Build the prompt
      const prompt = await this.buildCoverageAnalysisPrompt(request, context);
      
      // Call OpenAI API
      const response = await aiClientManager.callOpenAI(
        [{ role: "user", content: prompt }],
        {
          max_tokens: 2500,
          temperature: 0.6,
          response_format: { type: "json_object" }
        }
      );

      // Parse and validate response
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content received from OpenAI API");
      }

      const parsed = JSON.parse(content);
      return this.validateAndNormalizeTestCases(parsed.proposedTestCases || []);

    } catch (error) {
      console.error("Error analyzing test coverage:", error);
      throw new Error(`Failed to analyze test coverage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build prompt for test case generation
   */
  private async buildTestCaseGenerationPrompt(
    request: TestCaseGenerationRequest,
    context: ProjectContext
  ): Promise<string> {
    const contextString = contextManager.buildContextString(context, 3000);
    
    return promptTemplates.testCaseGeneration
      .replace('{{REQUIREMENTS}}', request.requirements)
      .replace('{{PROJECT_CONTEXT}}', contextString)
      .replace('{{TESTING_STRATEGY}}', request.testingStrategy || context.project.testStrategy || '');
  }

  /**
   * Build prompt for test steps generation
   */
  private async buildTestStepsGenerationPrompt(
    request: TestStepsGenerationRequest,
    context: ProjectContext
  ): Promise<string> {
    const contextString = contextManager.buildContextString(context, 2500);
    
    return promptTemplates.testStepsGeneration
      .replace('{{TEST_CASE_TITLE}}', request.testCase.title || '')
      .replace('{{TEST_CASE_DESCRIPTION}}', request.testCase.description || '')
      .replace('{{PROJECT_CONTEXT}}', contextString);
  }

  /**
   * Build prompt for coverage analysis
   */
  private async buildCoverageAnalysisPrompt(
    request: TestCoverageAnalysisRequest,
    context: ProjectContext
  ): Promise<string> {
    const contextString = contextManager.buildContextString(context, 2000);
    const jiraTicketsString = request.jiraTickets
      .map(ticket => `- ${ticket.jiraKey}: ${ticket.summary}`)
      .join('\n');
    
    return promptTemplates.coverageAnalysis
      .replace('{{JIRA_TICKETS}}', jiraTicketsString)
      .replace('{{PROJECT_CONTEXT}}', contextString)
      .replace('{{ADDITIONAL_CONTEXT}}', request.context || '');
  }

  /**
   * Validate and normalize generated test cases
   */
  private validateAndNormalizeTestCases(testCases: any[]): GeneratedTestCase[] {
    return testCases
      .filter(tc => tc && tc.title && tc.description)
      .map(tc => ({
        title: tc.title || '',
        description: tc.description || '',
        preconditions: tc.preconditions || '',
        steps: Array.isArray(tc.steps) ? tc.steps : [],
        expectedResults: tc.expectedResults || '',
        priority: this.normalizeEnumValue(tc.priority, ['high', 'medium', 'low'], 'medium'),
        severity: this.normalizeEnumValue(tc.severity, ['critical', 'high', 'normal', 'low'], 'normal'),
        automatable: Boolean(tc.automatable),
        tags: Array.isArray(tc.tags) ? tc.tags : []
      }));
  }

  /**
   * Normalize enum values with fallback
   */
  private normalizeEnumValue<T extends string>(
    value: any, 
    validValues: T[], 
    defaultValue: T
  ): T {
    if (typeof value === 'string' && validValues.includes(value as T)) {
      return value as T;
    }
    return defaultValue;
  }
}

// Singleton instance
export const testGenerationService = new TestGenerationService();