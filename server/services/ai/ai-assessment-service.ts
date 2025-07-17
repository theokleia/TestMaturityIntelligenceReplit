/**
 * AI Assessment Service
 * Handles AI readiness assessments across five key areas
 */

import { aiClientManager } from './ai-client-manager';
import { contextManager } from './context-manager';
import { promptTemplates } from './prompt-templates';
import { storage } from '../../storage';
import { AiAssessment, InsertAiAssessment, AiAssessmentActionItem, InsertAiAssessmentActionItem } from '@shared/schema';

export interface AssessmentRequest {
  projectId: number;
  assessmentType: 'project_definition' | 'ai_coverage' | 'ai_execution' | 'ai_automation' | 'documentation';
  runBy?: number;
}

export interface AssessmentResult {
  readinessScore: number;
  analysis: string;
  strengths: string[];
  recommendations: string[];
  actionItems: {
    title: string;
    description: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: number;
  }[];
}

class AIAssessmentService {
  /**
   * Run a specific AI readiness assessment
   */
  async runAssessment(request: AssessmentRequest): Promise<AiAssessment> {
    console.log(`Running ${request.assessmentType} assessment for project ${request.projectId}`);

    try {
      // Get project context
      const context = await contextManager.getProjectContext(request.projectId);
      const project = context.project;

      // Get historical assessments for this type
      const previousAssessments = await storage.getAiAssessments({
        projectId: request.projectId,
        assessmentType: request.assessmentType
      });

      // Run the specific assessment based on type
      let result: AssessmentResult;
      switch (request.assessmentType) {
        case 'project_definition':
          result = await this.assessProjectDefinitionReadiness(context, previousAssessments);
          break;
        case 'ai_coverage':
          result = await this.assessAICoverageReadiness(context, previousAssessments);
          break;
        case 'ai_execution':
          result = await this.assessAIExecutionReadiness(context, previousAssessments);
          break;
        case 'ai_automation':
          result = await this.assessAIAutomationReadiness(context, previousAssessments);
          break;
        case 'documentation':
          result = await this.assessDocumentationReadiness(context, previousAssessments);
          break;
        default:
          throw new Error(`Unknown assessment type: ${request.assessmentType}`);
      }

      // Store the assessment result
      const assessment = await storage.createAiAssessment({
        projectId: request.projectId,
        assessmentType: request.assessmentType,
        readinessScore: result.readinessScore,
        analysis: result.analysis,
        strengths: result.strengths,
        recommendations: result.recommendations,
        runBy: request.runBy
      });

      // Create action items
      for (const actionItem of result.actionItems) {
        await storage.createAiAssessmentActionItem({
          assessmentId: assessment.id,
          projectId: request.projectId,
          title: actionItem.title,
          description: actionItem.description,
          category: actionItem.category,
          priority: actionItem.priority,
          estimatedImpact: actionItem.estimatedImpact
        });
      }

      return assessment;
    } catch (error: unknown) {
      console.error(`Error running ${request.assessmentType} assessment:`, error);
      throw new Error(
        error instanceof Error 
          ? `Failed to run assessment: ${error.message}` 
          : "Failed to run assessment due to an unknown error"
      );
    }
  }

  /**
   * Assess Project Definition Readiness
   * Analyzes project settings, integrations, and knowledge completeness
   */
  private async assessProjectDefinitionReadiness(context: any, previousAssessments: AiAssessment[]): Promise<AssessmentResult> {
    const prompt = `
Analyze the project definition readiness for AI-assisted development:

**Project Information:**
- Name: ${context.project.name}
- Description: ${context.project.description}
- Type: ${context.project.projectType}
- Industry: ${context.project.industryArea}
- Regulations: ${context.project.regulations}
- Quality Focus: ${context.project.qualityFocus}

**Integration Status:**
- Jira Connected: ${Boolean(context.project.jiraUrl && context.project.jiraProjectId && context.project.jiraApiKey)}
- GitHub Connected: ${Boolean(context.project.githubRepo && context.project.githubToken)}

**Knowledge Base:**
- Documents Available: ${context.documents.length}

**Previous Assessments:**
${previousAssessments.length > 0 ? previousAssessments.map(a => `- Score: ${a.readinessScore}% on ${a.createdAt}`).join('\n') : 'None'}

Evaluate how well this project is defined for AI to understand and generate appropriate artifacts. Consider completeness of context, clarity of requirements, and integration setup.

Respond with JSON containing: readinessScore (0-100), analysis, strengths[], recommendations[], actionItems[{title, description, category, priority, estimatedImpact}]
`;

    const response = await aiClientManager.callOpenAI([
      { role: 'user', content: prompt }
    ], {
      systemMessage: `You are an AI project readiness assessor. Analyze the project definition completeness for AI-assisted development.
      
      Evaluate:
      1. Project context and description clarity
      2. Integration setup (Jira, GitHub)
      3. Regulatory requirements documentation
      4. Quality focus areas definition
      5. Testing strategy comprehensiveness
      6. Knowledge base completeness
      
      Provide a score (0-100), detailed analysis, strengths, and specific action items.
      Respond in JSON format with: readinessScore, analysis, strengths, recommendations, actionItems.`,
      temperature: 0.3
    });

    return this.parseAssessmentResponse(response);
  }

  /**
   * Assess AI Coverage Readiness
   * Evaluates ability to generate detailed test cases from requirements
   */
  private async assessAICoverageReadiness(context: any, previousAssessments: AiAssessment[]): Promise<AssessmentResult> {
    const jiraTickets = context.jiraTickets?.slice(0, 10) || [];
    const prompt = `
Analyze the AI coverage readiness for test case generation:

**Project Context:**
- Name: ${context.project.name}
- Regulations: ${context.project.regulations}
- Quality Focus: ${context.project.qualityFocus}

**Testing Strategy:**
${context.project.testStrategy}

**Sample Jira Tickets:**
${jiraTickets.map(ticket => `- ${ticket.jiraKey}: ${ticket.summary}\n  Priority: ${ticket.priority}, Status: ${ticket.status}\n  Description: ${ticket.description}`).join('\n')}

**Previous Assessments:**
${previousAssessments.length > 0 ? previousAssessments.map(a => `- Score: ${a.readinessScore}% - ${a.analysis.substring(0, 100)}...`).join('\n') : 'None'}

Evaluate how effectively AI can generate comprehensive test cases from the available information. Consider ticket detail levels, requirement clarity, and testing strategy specificity.

Respond with JSON containing: readinessScore (0-100), analysis, strengths[], recommendations[], actionItems[{title, description, category, priority, estimatedImpact}]
`;

    const response = await aiClientManager.callOpenAI([
      { role: 'user', content: prompt }
    ], {
      systemMessage: `You are an AI test coverage readiness assessor. Analyze how well the project can generate detailed test cases using AI.
      
      Evaluate:
      1. Jira ticket detail level and clarity
      2. Testing strategy specificity
      3. Quality focus area coverage
      4. Regulatory requirement mapping
      5. Requirement traceability
      6. Test scenario derivability
      
      Score how effectively AI can generate comprehensive test cases. Respond in JSON format.`,
      temperature: 0.3
    });

    return this.parseAssessmentResponse(response);
  }

  /**
   * Assess AI Execution Readiness
   * Evaluates automated test execution capabilities
   */
  private async assessAIExecutionReadiness(context: any, previousAssessments: AiAssessment[]): Promise<AssessmentResult> {
    const testCycles = context.testCycles || [];
    const prompt = `
Analyze the AI execution readiness for automated browser testing:

**Project Context:**
- Name: ${context.project.name}
- Environment Setup: ${context.project.additionalContext}

**Test Cycles Configuration:**
${testCycles.map(cycle => `- ${cycle.name}: ${cycle.description}\n  Test URL: ${cycle.testInstanceUrl}\n  Test Data: ${cycle.testData}`).join('\n')}

**GitHub Code Analysis:**
${context.githubCode ? 'Code structure available for UI pattern analysis' : 'No GitHub code available'}

**Previous Assessments:**
${previousAssessments.length > 0 ? previousAssessments.map(a => `- Score: ${a.readinessScore}% - Key issues: ${a.recommendations.join(', ')}`).join('\n') : 'None'}

Evaluate readiness for automated browser-based test execution. Consider environment descriptions, test data availability, URL configurations, and UI navigation understanding.

Respond with JSON containing: readinessScore (0-100), analysis, strengths[], recommendations[], actionItems[{title, description, category, priority, estimatedImpact}]
`;

    const response = await aiClientManager.callOpenAI([
      { role: 'user', content: prompt }
    ], {
      systemMessage: `You are an AI test execution readiness assessor. Analyze browser automation and execution capabilities.
      
      Evaluate:
      1. Test environment descriptions
      2. Test data availability and structure
      3. UI navigation understanding from code
      4. Test instance URLs configuration
      5. User credential management
      6. Browser automation feasibility
      
      Score readiness for automated test execution. Respond in JSON format.`,
      temperature: 0.3
    });

    return this.parseAssessmentResponse(response);
  }

  /**
   * Assess AI Automation Readiness
   * Reviews automation potential and ROI
   */
  private async assessAIAutomationReadiness(context: any, previousAssessments: AiAssessment[]): Promise<AssessmentResult> {
    const testCases = context.testCases?.slice(0, 20) || [];
    const jiraTickets = context.jiraTickets?.slice(0, 10) || [];
    const prompt = `
Analyze the AI automation readiness and ROI potential:

**Project Context:**
- Name: ${context.project.name}
- Type: ${context.project.projectType}

**Test Cases Sample:**
${testCases.map(tc => `- ${tc.title}: ${tc.description}\n  Priority: ${tc.priority}, Automatable: ${tc.automatable}\n  Steps: ${tc.steps?.length || 0} steps`).join('\n')}

**Jira Tickets Sample:**
${jiraTickets.map(ticket => `- ${ticket.jiraKey}: ${ticket.summary} (${ticket.priority})`).join('\n')}

**Code Analysis:**
${context.githubCode ? 'GitHub repository connected for code analysis' : 'No code repository available'}

**Previous Assessments:**
${previousAssessments.length > 0 ? `Previous automation score: ${previousAssessments[0].readinessScore}%` : 'None'}

Evaluate automation potential, ROI, and strategy recommendations. Consider test case complexity, repetition patterns, and maintenance overhead.

Respond with JSON containing: readinessScore (0-100), analysis, strengths[], recommendations[], actionItems[{title, description, category, priority, estimatedImpact}]
`;

    const response = await aiClientManager.callOpenAI([
      { role: 'user', content: prompt }
    ], {
      systemMessage: `You are an AI automation readiness assessor. Analyze test automation potential and ROI.
      
      Evaluate:
      1. Test case automation potential
      2. Code complexity for automation
      3. ROI estimation for automation
      4. Automation strategy recommendations
      5. Tool selection guidance
      6. Maintenance considerations
      
      Score automation readiness and provide strategy recommendations. Respond in JSON format.`,
      temperature: 0.3
    });

    return this.parseAssessmentResponse(response);
  }

  /**
   * Assess Documentation Readiness
   * Evaluates AI document generation capabilities
   */
  private async assessDocumentationReadiness(context: any, previousAssessments: AiAssessment[]): Promise<AssessmentResult> {
    const testCases = context.testCases?.slice(0, 10) || [];
    const jiraTickets = context.jiraTickets?.slice(0, 10) || [];
    const testSuites = context.testSuites?.slice(0, 5) || [];
    const prompt = `
Analyze the documentation readiness for AI document generation:

**Project Information:**
- Name: ${context.project.name}
- Description: ${context.project.description}
- Type: ${context.project.projectType}
- Industry: ${context.project.industryArea}

**Available Documents:**
${context.documents.map(doc => `- ${doc.title} (${doc.type}): ${doc.content?.length || 0} characters`).join('\n')}

**Test Assets:**
- Test Suites: ${testSuites.length}
- Test Cases: ${testCases.length}
- Jira Tickets: ${jiraTickets.length}

**Previous Assessments:**
${previousAssessments.length > 0 ? `Documentation readiness trend: ${previousAssessments.map(a => a.readinessScore).join('% → ')}%` : 'None'}

Evaluate readiness for generating PRD, SRS, Software Design, Test Plans, and Test Reports. Consider data completeness, traceability, and cross-referencing capabilities.

Respond with JSON containing: readinessScore (0-100), analysis, strengths[], recommendations[], actionItems[{title, description, category, priority, estimatedImpact}]
`;

    const response = await aiClientManager.callOpenAI([
      { role: 'user', content: prompt }
    ], {
      systemMessage: `You are an AI documentation readiness assessor. Analyze document generation capabilities.
      
      Evaluate:
      1. Data completeness for PRD generation
      2. Information availability for SRS creation
      3. Technical details for Software Design docs
      4. Traceability for matrix generation
      5. Test planning information sufficiency
      6. Reporting data availability
      
      Score readiness for AI document generation across all document types. Respond in JSON format.`,
      temperature: 0.3
    });

    return this.parseAssessmentResponse(response);
  }

  /**
   * Parse AI response into structured assessment result
   */
  private parseAssessmentResponse(response: any): AssessmentResult {
    try {
      let content = '';
      
      // Handle different response formats
      if (response && response.choices && response.choices[0] && response.choices[0].message) {
        content = response.choices[0].message.content;
      } else if (typeof response === 'string') {
        content = response;
      } else {
        throw new Error('Invalid response format');
      }

      // Try to parse as JSON
      let parsed: any;
      try {
        // Extract JSON from response if it's wrapped in text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = JSON.parse(content);
        }
      } catch {
        // If JSON parsing fails, create a structured response
        return {
          readinessScore: 50,
          analysis: content || 'Assessment completed but response format was unexpected.',
          strengths: ['Assessment completed'],
          recommendations: ['Review assessment results'],
          actionItems: [{
            title: 'Review assessment output',
            description: 'The assessment completed but needs manual review.',
            category: 'review',
            priority: 'medium',
            estimatedImpact: 5
          }]
        };
      }

      return {
        readinessScore: parsed.readinessScore || 0,
        analysis: parsed.analysis || 'No analysis provided',
        strengths: parsed.strengths || [],
        recommendations: parsed.recommendations || [],
        actionItems: parsed.actionItems || []
      };
    } catch (error) {
      console.error('Error parsing assessment response:', error);
      return {
        readinessScore: 0,
        analysis: 'Error processing assessment results.',
        strengths: [],
        recommendations: ['Retry assessment'],
        actionItems: [{
          title: 'Retry assessment',
          description: 'Previous assessment failed to process correctly.',
          category: 'system',
          priority: 'high',
          estimatedImpact: 10
        }]
      };
    }
  }
}

export const aiAssessmentService = new AIAssessmentService();