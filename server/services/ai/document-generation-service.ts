import { aiClientManager } from "./ai-client-manager";
import { contextManager, ProjectContext } from "./context-manager";
import { promptTemplates, PromptTemplateEngine } from "./prompt-templates";

/**
 * Document Generation Service
 * Handles AI-powered document generation using Anthropic Claude
 */

export interface DocumentGenerationRequest {
  projectId: number;
  documentType: 'PRD' | 'SRS' | 'SDDS' | 'Test Plan' | 'Test Report' | 'Custom';
  includeJira?: boolean;
  includeGithub?: boolean;
  customPrompt?: string;
  templateId?: string;
}

export interface GeneratedDocument {
  title: string;
  content: string;
  type: string;
  metadata: {
    projectId: number;
    generatedAt: string;
    aiProvider: string;
    model: string;
    wordCount: number;
    sections: string[];
  };
}

export class DocumentGenerationService {
  /**
   * Generate technical documents using Anthropic Claude
   */
  async generateDocument(request: DocumentGenerationRequest): Promise<GeneratedDocument> {
    try {
      console.log(`Generating ${request.documentType} for project ${request.projectId}`);

      // Aggregate comprehensive project context for document generation
      const context = await contextManager.getOptimizedContextForFeature(
        request.projectId,
        'document-generation',
        {
          includeJira: request.includeJira,
          includeGithub: request.includeGithub,
          maxTokens: 6000 // Higher token limit for document generation
        }
      );

      // Build the document generation prompt
      const prompt = await this.buildDocumentPrompt(request, context);
      
      // Use Anthropic Claude for document generation
      const response = await aiClientManager.callAnthropic(
        [{ role: "user", content: prompt }],
        this.getSystemPromptForDocumentType(request.documentType),
        {
          max_tokens: 4000,
          temperature: 0.5 // Lower temperature for more consistent document structure
        }
      );

      // Extract content from response
      const content = this.extractContentFromResponse(response);
      
      // Generate document metadata
      const metadata = this.generateDocumentMetadata(request, context, content);

      return {
        title: this.generateDocumentTitle(request.documentType, context.project.name),
        content,
        type: request.documentType,
        metadata
      };

    } catch (error) {
      console.error("Error generating document:", error);
      throw new Error(`Failed to generate ${request.documentType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate analysis documents and reports
   */
  async generateAnalysisReport(
    projectId: number,
    analysisType: 'quality' | 'coverage' | 'maturity' | 'performance',
    timeRange?: { start: Date; end: Date }
  ): Promise<GeneratedDocument> {
    try {
      console.log(`Generating ${analysisType} analysis report for project ${projectId}`);

      // Get project context with focus on analytics data
      const context = await contextManager.getOptimizedContextForFeature(
        projectId,
        'analysis'
      );

      // Build analysis-specific prompt
      const prompt = this.buildAnalysisPrompt(analysisType, context, timeRange);
      
      // Generate report using Anthropic
      const response = await aiClientManager.callAnthropic(
        [{ role: "user", content: prompt }],
        this.getSystemPromptForAnalysis(analysisType),
        {
          max_tokens: 3000,
          temperature: 0.4
        }
      );

      const content = this.extractContentFromResponse(response);
      const metadata = this.generateDocumentMetadata(
        { projectId, documentType: 'Test Report' } as DocumentGenerationRequest,
        context,
        content
      );

      return {
        title: `${this.capitalizeFirst(analysisType)} Analysis Report - ${context.project.name}`,
        content,
        type: 'Analysis Report',
        metadata
      };

    } catch (error) {
      console.error("Error generating analysis report:", error);
      throw new Error(`Failed to generate ${analysisType} analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build document generation prompt based on type and context
   */
  private async buildDocumentPrompt(
    request: DocumentGenerationRequest,
    context: ProjectContext
  ): Promise<string> {
    const contextString = contextManager.buildContextString(context, 4000);
    
    // Use custom prompt if provided
    if (request.customPrompt) {
      return PromptTemplateEngine.render(request.customPrompt, {
        PROJECT_CONTEXT: contextString,
        PROJECT_NAME: context.project.name,
        DOCUMENT_TYPE: request.documentType
      });
    }

    // Use built-in template for document generation
    return PromptTemplateEngine.render(promptTemplates.documentGeneration, {
      DOCUMENT_TYPE: request.documentType,
      PROJECT_CONTEXT: contextString,
      REQUIREMENTS: this.extractRequirementsFromContext(context)
    });
  }

  /**
   * Build analysis-specific prompts
   */
  private buildAnalysisPrompt(
    analysisType: string,
    context: ProjectContext,
    timeRange?: { start: Date; end: Date }
  ): string {
    const contextString = contextManager.buildContextString(context, 3000);
    
    let analysisPrompt = `Generate a comprehensive ${analysisType} analysis report for the project "${context.project.name}".

PROJECT CONTEXT:
${contextString}`;

    if (timeRange) {
      analysisPrompt += `\n\nTIME RANGE: ${timeRange.start.toISOString()} to ${timeRange.end.toISOString()}`;
    }

    switch (analysisType) {
      case 'quality':
        analysisPrompt += `\n\nFocus on:
- Test execution results and trends
- Defect patterns and root causes
- Quality metrics and improvements
- Risk assessment and mitigation
- Recommendations for quality enhancement`;
        break;

      case 'coverage':
        analysisPrompt += `\n\nFocus on:
- Test coverage analysis across features
- Gap identification and recommendations
- Coverage trends over time
- Risk-based coverage assessment
- Optimization opportunities`;
        break;

      case 'maturity':
        analysisPrompt += `\n\nFocus on:
- Current maturity assessment across dimensions
- Progress tracking and improvements
- Benchmark comparisons
- Maturity roadmap and recommendations
- Implementation strategies`;
        break;

      case 'performance':
        analysisPrompt += `\n\nFocus on:
- Test execution performance metrics
- System performance indicators
- Bottleneck identification
- Performance trends and patterns
- Optimization recommendations`;
        break;
    }

    analysisPrompt += `\n\nGenerate a professional, structured report with:
- Executive summary
- Detailed analysis with data-driven insights
- Visual data representations (described)
- Actionable recommendations
- Next steps and priorities

Format the report in markdown with proper structure and professional language.`;

    return analysisPrompt;
  }

  /**
   * Get system prompt for different document types
   */
  private getSystemPromptForDocumentType(documentType: string): string {
    const basePrompt = "You are an expert technical writer and business analyst specializing in software development documentation.";

    switch (documentType) {
      case 'PRD':
        return `${basePrompt} You excel at creating Product Requirements Documents that clearly define product vision, features, and success criteria.`;
      
      case 'SRS':
        return `${basePrompt} You specialize in Software Requirements Specifications that detail technical requirements, system architecture, and functional specifications.`;
      
      case 'SDDS':
        return `${basePrompt} You are skilled at creating Software Design Description Specifications that document system architecture, design decisions, and implementation details.`;
      
      case 'Test Plan':
        return `${basePrompt} You are experienced in creating comprehensive test plans that define test strategy, scope, approach, and execution criteria.`;
      
      case 'Test Report':
        return `${basePrompt} You specialize in creating detailed test reports that summarize test execution results, quality metrics, and recommendations.`;
      
      default:
        return basePrompt;
    }
  }

  /**
   * Get system prompt for analysis reports
   */
  private getSystemPromptForAnalysis(analysisType: string): string {
    return `You are an expert quality analyst and testing consultant with deep expertise in ${analysisType} analysis. You excel at interpreting testing data, identifying patterns, and providing actionable insights and recommendations.`;
  }

  /**
   * Extract content from Anthropic response
   */
  private extractContentFromResponse(response: any): string {
    if (response.content && Array.isArray(response.content)) {
      return response.content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text)
        .join('\n');
    }
    
    if (typeof response.content === 'string') {
      return response.content;
    }
    
    throw new Error("Invalid response format from Anthropic API");
  }

  /**
   * Generate document metadata
   */
  private generateDocumentMetadata(
    request: DocumentGenerationRequest,
    context: ProjectContext,
    content: string
  ): any {
    const wordCount = content.split(/\s+/).length;
    const sections = this.extractSections(content);

    return {
      projectId: request.projectId,
      generatedAt: new Date().toISOString(),
      aiProvider: 'Anthropic',
      model: 'claude-3-7-sonnet', // This should come from client manager
      wordCount,
      sections,
      projectName: context.project.name,
      projectType: context.project.projectType,
      includeJira: request.includeJira || false,
      includeGithub: request.includeGithub || false
    };
  }

  /**
   * Generate document title
   */
  private generateDocumentTitle(documentType: string, projectName: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${projectName} ${documentType} - ${timestamp}`;
  }

  /**
   * Extract requirements from project context
   */
  private extractRequirementsFromContext(context: ProjectContext): string {
    const requirements: string[] = [];

    // Add project description
    if (context.project.description) {
      requirements.push(context.project.description);
    }

    // Add Jira ticket summaries as requirements
    context.jiraTickets.forEach(ticket => {
      if (ticket.summary) {
        requirements.push(`${ticket.jiraKey}: ${ticket.summary}`);
      }
    });

    // Add document content as requirements
    context.documents.forEach(doc => {
      if (doc.content && doc.content.length > 0) {
        const snippet = doc.content.substring(0, 300);
        requirements.push(`${doc.title}: ${snippet}...`);
      }
    });

    return requirements.join('\n\n');
  }

  /**
   * Extract sections from markdown content
   */
  private extractSections(content: string): string[] {
    const sections: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.match(/^#+\s+/)) {
        const sectionTitle = line.replace(/^#+\s+/, '').trim();
        sections.push(sectionTitle);
      }
    }
    
    return sections;
  }

  /**
   * Capitalize first letter of string
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Singleton instance
export const documentGenerationService = new DocumentGenerationService();