import { Project } from "@shared/schema";
import { storage } from "../../storage";
import { fetchJiraIssues, getJiraContextForAI } from "../jira-service";
import { fetchRepoFiles, fetchRecentCommits, fetchFileContent, getGitHubContextForAI } from "../github-service";

/**
 * Context Manager
 * Handles aggregation and optimization of project context for AI features
 */

export interface ProjectContext {
  project: Project;
  documents: any[];
  jiraTickets: any[];
  githubData: any;
  testSuites: any[];
  testCases: any[];
  maturityAssessments: any[];
  testStrategy?: string;
}

export interface ContextOptions {
  includeDocuments?: boolean;
  includeJira?: boolean;
  includeGithub?: boolean;
  includeTestData?: boolean;
  includeMaturity?: boolean;
  maxTokens?: number;
  timeRangeMinutes?: number;
}

export class ContextManager {
  /**
   * Aggregate comprehensive project context for AI features
   */
  async aggregateProjectContext(
    projectId: number, 
    options: ContextOptions = {}
  ): Promise<ProjectContext> {
    const {
      includeDocuments = true,
      includeJira = true,
      includeGithub = false,
      includeTestData = true,
      includeMaturity = false
    } = options;

    try {
      // Get project information
      const project = await storage.getProject(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      // Initialize context
      const context: ProjectContext = {
        project,
        documents: [],
        jiraTickets: [],
        githubData: null,
        testSuites: [],
        testCases: [],
        maturityAssessments: []
      };

      // Fetch context data in parallel for better performance
      const promises: Promise<void>[] = [];

      // Documents context
      if (includeDocuments) {
        promises.push(this.loadDocumentsContext(projectId, context));
      }

      // Jira context
      if (includeJira) {
        promises.push(this.loadJiraContext(projectId, context));
      }

      // GitHub context
      if (includeGithub) {
        promises.push(this.loadGithubContext(projectId, context));
      }

      // Test data context
      if (includeTestData) {
        promises.push(this.loadTestDataContext(projectId, context));
      }

      // Maturity assessment context
      if (includeMaturity) {
        promises.push(this.loadMaturityContext(projectId, context));
      }

      // Wait for all context loading to complete
      await Promise.all(promises);

      return context;
    } catch (error) {
      console.error("Error aggregating project context:", error);
      throw new Error(`Failed to aggregate context for project ${projectId}`);
    }
  }

  /**
   * Build AI-optimized context string from project context
   */
  buildContextString(context: ProjectContext, maxTokens: number = 4000): string {
    let contextParts: string[] = [];

    // Project information
    contextParts.push(`Project: ${context.project.name}`);
    contextParts.push(`Type: ${context.project.projectType || 'N/A'}`);
    contextParts.push(`Industry: ${context.project.industryArea || 'N/A'}`);
    
    if (context.project.description) {
      contextParts.push(`Description: ${context.project.description}`);
    }

    // Test strategy
    if (context.project.testStrategy) {
      contextParts.push(`Test Strategy: ${context.project.testStrategy}`);
    }

    // Documents
    if (context.documents.length > 0) {
      contextParts.push(`\nDocuments (${context.documents.length}):`);
      context.documents.slice(0, 5).forEach(doc => {
        contextParts.push(`- ${doc.title}: ${doc.type}`);
        if (doc.content && doc.content.length > 0) {
          // Include a snippet of document content
          const snippet = doc.content.substring(0, 200);
          contextParts.push(`  ${snippet}${doc.content.length > 200 ? '...' : ''}`);
        }
      });
    }

    // Jira tickets
    if (context.jiraTickets.length > 0) {
      contextParts.push(`\nJira Tickets (${context.jiraTickets.length}):`);
      context.jiraTickets.slice(0, 10).forEach(ticket => {
        contextParts.push(`- ${ticket.jiraKey}: ${ticket.summary}`);
        if (ticket.description) {
          const snippet = ticket.description.substring(0, 150);
          contextParts.push(`  ${snippet}${ticket.description.length > 150 ? '...' : ''}`);
        }
      });
    }

    // Test suites and cases
    if (context.testSuites.length > 0) {
      contextParts.push(`\nTest Suites (${context.testSuites.length}):`);
      context.testSuites.slice(0, 5).forEach(suite => {
        contextParts.push(`- ${suite.name}: ${suite.description || 'No description'}`);
      });
    }

    if (context.testCases.length > 0) {
      contextParts.push(`\nExisting Test Cases (${context.testCases.length}):`);
      context.testCases.slice(0, 8).forEach(testCase => {
        contextParts.push(`- ${testCase.title}: ${testCase.description || 'No description'}`);
      });
    }

    // GitHub data
    if (context.githubData) {
      contextParts.push(`\nGitHub Repository Context:`);
      contextParts.push(`- Repository: ${context.githubData.repository || 'N/A'}`);
      if (context.githubData.structure) {
        contextParts.push(`- Structure: ${JSON.stringify(context.githubData.structure).substring(0, 200)}...`);
      }
    }

    // Combine all parts and truncate if necessary
    let fullContext = contextParts.join('\n');
    
    // Rough token estimation (1 token ≈ 4 characters)
    const estimatedTokens = fullContext.length / 4;
    
    if (estimatedTokens > maxTokens) {
      // Truncate to fit within token limit
      const maxChars = maxTokens * 4;
      fullContext = fullContext.substring(0, maxChars) + '\n... [Context truncated due to length]';
    }

    return fullContext;
  }

  /**
   * Load documents context
   */
  private async loadDocumentsContext(projectId: number, context: ProjectContext): Promise<void> {
    try {
      const documents = await storage.getDocuments(projectId);
      context.documents = documents || [];
    } catch (error) {
      console.warn("Error loading documents context:", error);
      context.documents = [];
    }
  }

  /**
   * Load Jira context
   */
  private async loadJiraContext(projectId: number, context: ProjectContext): Promise<void> {
    try {
      const jiraTickets = await fetchJiraIssues(projectId);
      context.jiraTickets = jiraTickets || [];
    } catch (error) {
      console.warn("Error loading Jira context:", error);
      context.jiraTickets = [];
    }
  }

  /**
   * Load GitHub context
   */
  private async loadGithubContext(projectId: number, context: ProjectContext): Promise<void> {
    try {
      const githubData = await getGitHubContextForAI(projectId);
      context.githubData = githubData;
    } catch (error) {
      console.warn("Error loading GitHub context:", error);
      context.githubData = null;
    }
  }

  /**
   * Load test data context
   */
  private async loadTestDataContext(projectId: number, context: ProjectContext): Promise<void> {
    try {
      const [testSuites, testCases] = await Promise.all([
        storage.getTestSuites(projectId),
        storage.getTestCases(projectId)
      ]);
      
      context.testSuites = testSuites || [];
      context.testCases = testCases || [];
    } catch (error) {
      console.warn("Error loading test data context:", error);
      context.testSuites = [];
      context.testCases = [];
    }
  }

  /**
   * Load maturity assessment context
   */
  private async loadMaturityContext(projectId: number, context: ProjectContext): Promise<void> {
    try {
      const assessments = await storage.getAssessments(projectId);
      context.maturityAssessments = assessments || [];
    } catch (error) {
      console.warn("Error loading maturity context:", error);
      context.maturityAssessments = [];
    }
  }

  /**
   * Get optimized context for specific AI feature types
   */
  async getOptimizedContextForFeature(
    projectId: number, 
    featureType: 'test-generation' | 'document-generation' | 'analysis' | 'recommendations',
    customOptions?: Partial<ContextOptions>
  ): Promise<ProjectContext> {
    const baseOptions: ContextOptions = {
      maxTokens: 4000,
      timeRangeMinutes: 60 * 24 * 7 // Last week
    };

    let featureOptions: ContextOptions;

    switch (featureType) {
      case 'test-generation':
        featureOptions = {
          ...baseOptions,
          includeDocuments: true,
          includeJira: true,
          includeTestData: true,
          includeGithub: false,
          includeMaturity: false
        };
        break;

      case 'document-generation':
        featureOptions = {
          ...baseOptions,
          includeDocuments: true,
          includeJira: true,
          includeTestData: true,
          includeGithub: true,
          includeMaturity: true
        };
        break;

      case 'analysis':
        featureOptions = {
          ...baseOptions,
          includeDocuments: false,
          includeJira: true,
          includeTestData: true,
          includeGithub: false,
          includeMaturity: true
        };
        break;

      case 'recommendations':
        featureOptions = {
          ...baseOptions,
          includeDocuments: true,
          includeJira: false,
          includeTestData: true,
          includeGithub: false,
          includeMaturity: true
        };
        break;

      default:
        featureOptions = baseOptions;
    }

    // Merge with custom options
    const finalOptions = { ...featureOptions, ...customOptions };

    return this.aggregateProjectContext(projectId, finalOptions);
  }
}

// Singleton instance
export const contextManager = new ContextManager();