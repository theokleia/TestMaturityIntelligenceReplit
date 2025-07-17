/**
 * Prompt Templates for AI Services
 * Centralized prompt management with optimized templates for different AI features
 */

export const promptTemplates = {
  /**
   * Test Case Generation Template
   */
  testCaseGeneration: `You are an expert test engineer tasked with generating comprehensive test cases based on requirements and project context.

REQUIREMENTS TO TEST:
{{REQUIREMENTS}}

PROJECT CONTEXT:
{{PROJECT_CONTEXT}}

TESTING STRATEGY:
{{TESTING_STRATEGY}}

Generate comprehensive test cases that cover:
1. Happy path scenarios
2. Edge cases and boundary conditions
3. Error conditions and negative scenarios
4. Integration and cross-functional scenarios
5. Security and performance considerations (where applicable)

For each test case, provide:
- title: Clear, descriptive test case title
- description: Detailed description of what is being tested
- preconditions: Prerequisites before test execution
- steps: Array of test steps with step and expected result
- expectedResults: Overall expected outcome
- priority: high/medium/low based on business impact
- severity: critical/high/normal/low based on failure impact
- automatable: true/false based on feasibility
- tags: Relevant categorization tags

Return ONLY a valid JSON object in this format:
{
  "testCases": [
    {
      "title": "Test case title",
      "description": "Detailed description",
      "preconditions": "Prerequisites",
      "steps": [
        {
          "step": "Action to perform",
          "expected": "Expected result"
        }
      ],
      "expectedResults": "Overall expected outcome",
      "priority": "high|medium|low",
      "severity": "critical|high|normal|low",
      "automatable": true|false,
      "tags": ["tag1", "tag2"]
    }
  ]
}`,

  /**
   * Test Steps Generation Template
   */
  testStepsGeneration: `You are an expert test engineer tasked with creating detailed test steps for an existing test case.

TEST CASE TO ENHANCE:
Title: {{TEST_CASE_TITLE}}
Description: {{TEST_CASE_DESCRIPTION}}

PROJECT CONTEXT:
{{PROJECT_CONTEXT}}

Create detailed, executable test steps that include:
1. Clear preconditions that must be met before starting
2. Step-by-step instructions that are specific and actionable
3. Expected results for each step
4. Overall expected results for the complete test case
5. Any relevant test data or configuration needed

Each step should be:
- Specific and unambiguous
- Executable by someone unfamiliar with the system
- Include expected results for verification
- Account for realistic user scenarios

Return ONLY a valid JSON object in this format:
{
  "preconditions": "Detailed prerequisites before test execution",
  "steps": [
    {
      "step": "Specific action to perform",
      "expected": "Expected result for this step"
    }
  ],
  "expectedResults": "Overall expected outcome of the test case",
  "updatedDescription": "Enhanced description if needed"
}`,

  /**
   * Coverage Analysis Template
   */
  coverageAnalysis: `You are an expert test analyst tasked with analyzing test coverage gaps and proposing new test cases.

JIRA TICKETS TO ANALYZE:
{{JIRA_TICKETS}}

PROJECT CONTEXT:
{{PROJECT_CONTEXT}}

ADDITIONAL CONTEXT:
{{ADDITIONAL_CONTEXT}}

Analyze the provided tickets and existing test coverage to identify:
1. Requirements that lack test coverage
2. High-risk areas that need additional testing
3. Edge cases and boundary conditions not covered
4. Integration scenarios that may be missing
5. Error conditions and negative scenarios

For each identified gap, propose specific test cases that would provide coverage. Focus on:
- Business-critical functionality
- User-facing features
- Integration points
- Error conditions
- Security considerations
- Performance requirements

Return ONLY a valid JSON object in this format:
{
  "analysis": {
    "coverageGaps": ["Description of identified gaps"],
    "riskAreas": ["High-risk areas needing attention"],
    "recommendations": ["General testing recommendations"]
  },
  "proposedTestCases": [
    {
      "title": "Test case title",
      "description": "What this test covers",
      "preconditions": "Prerequisites",
      "steps": [
        {
          "step": "Action to perform",
          "expected": "Expected result"
        }
      ],
      "expectedResults": "Overall expected outcome",
      "priority": "high|medium|low",
      "severity": "critical|high|normal|low",
      "automatable": true|false,
      "tags": ["coverage", "gap-analysis"],
      "coverageReason": "Why this test case is needed"
    }
  ]
}`,

  /**
   * Document Generation Template
   */
  documentGeneration: `You are an expert technical writer and business analyst tasked with generating comprehensive documentation.

DOCUMENT TYPE: {{DOCUMENT_TYPE}}

PROJECT CONTEXT:
{{PROJECT_CONTEXT}}

REQUIREMENTS:
{{REQUIREMENTS}}

Generate a comprehensive {{DOCUMENT_TYPE}} that includes:
- Professional structure and formatting
- Detailed analysis based on project context
- Industry best practices and standards
- Clear, actionable content
- Proper technical depth for the audience

The document should be:
- Well-structured with clear headings
- Professionally written
- Comprehensive yet concise
- Relevant to the project context
- Following industry standards for {{DOCUMENT_TYPE}}

Return the document in markdown format with proper structure and formatting.`,

  /**
   * Whisper Suggestions Template
   */
  whisperSuggestions: `You are an AI assistant providing contextual suggestions based on user activity and project state.

CURRENT CONTEXT:
Path: {{CURRENT_PATH}}
Project: {{PROJECT_NAME}}
User Activity: {{USER_ACTIVITY}}

PROJECT STATE:
{{PROJECT_CONTEXT}}

Generate 3-5 brief, actionable suggestions that would help the user in their current context. Suggestions should be:
- Contextually relevant to what they're doing
- Actionable and specific
- Focused on improving quality or efficiency
- Brief (max 10 words each)

Return ONLY a valid JSON object:
{
  "suggestions": [
    "Brief actionable suggestion",
    "Another helpful suggestion",
    "Quality improvement tip"
  ]
}`,

  /**
   * Maturity Assessment Template
   */
  maturityAssessment: `You are an expert in testing maturity frameworks providing recommendations for improvement.

CURRENT ASSESSMENT:
{{CURRENT_ASSESSMENT}}

DIMENSION FOCUS:
{{DIMENSION_NAME}}: {{DIMENSION_DESCRIPTION}}

PROJECT CONTEXT:
{{PROJECT_CONTEXT}}

Based on the current maturity level and project context, provide specific, actionable recommendations for improving in this dimension. Recommendations should be:
- Specific to the current maturity level
- Achievable given the project context
- Prioritized by impact and effort
- Aligned with industry best practices

Return ONLY a valid JSON object:
{
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "effort": "low|medium|high",
      "impact": "low|medium|high",
      "timeframe": "weeks|months|quarters",
      "prerequisites": ["Any prerequisites needed"]
    }
  ]
}`
};

/**
 * Template utility functions
 */
export class PromptTemplateEngine {
  /**
   * Replace template variables with actual values
   */
  static render(template: string, variables: Record<string, string>): string {
    let rendered = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value || '');
    }
    
    return rendered;
  }

  /**
   * Validate template has all required variables
   */
  static validateTemplate(template: string, requiredVars: string[]): boolean {
    return requiredVars.every(varName => {
      const placeholder = `{{${varName}}}`;
      return template.includes(placeholder);
    });
  }

  /**
   * Extract template variables from template string
   */
  static extractVariables(template: string): string[] {
    const matches = template.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    
    return matches.map(match => match.replace(/[{}]/g, ''));
  }
}

export default promptTemplates;