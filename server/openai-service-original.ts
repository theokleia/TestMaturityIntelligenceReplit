/**
 * Legacy OpenAI Service - Refactored to use new modular AI services
 * This file now serves as a compatibility layer for existing code
 * New implementations should use the modular AI services directly
 */

import { AIService } from "./services/ai";
import { Project } from "@shared/schema";

// Function to get OpenAI client with API key from global settings (or fallback to env var)
async function getOpenAIClient() {
  try {
    // Try to get API key from global settings
    let apiKey = process.env.OPENAI_API_KEY;
    
    try {
      const setting = await storage.getGlobalSetting("openai_api_key");
      if (setting?.value) {
        apiKey = setting.value;
      }
    } catch (dbError) {
      console.warn("Database error when getting OpenAI key, using environment variable:", dbError);
    }
    
    if (!apiKey) {
      console.warn("OpenAI API key not found in global settings or environment variables");
    }
    
    return new OpenAI({ apiKey });
  } catch (error) {
    console.error("Error getting OpenAI client, falling back to environment variable:", error);
    // Fallback to environment variable
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
}

// Function to get the configured model from global settings (or use default)
async function getOpenAIModel() {
  // Default model
  const defaultModel = "gpt-4o";
  
  try {
    // Try to get model from global settings
    try {
      const setting = await storage.getGlobalSetting("openai_model");
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      return setting?.value || defaultModel;
    } catch (dbError) {
      console.warn("Database error when getting OpenAI model, using default:", dbError);
      return defaultModel;
    }
  } catch (error) {
    console.error("Error getting OpenAI model, using default:", error);
    return defaultModel;
  }
}

// Helper function to make OpenAI API calls with dynamic client and model
async function callOpenAI(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options: { 
    max_tokens?: number; 
    temperature?: number; 
    response_format?: { type: "json_object" } | { type: "text" } 
  } = {}
) {
  try {
    const openaiClient = await getOpenAIClient();
    const model = await getOpenAIModel();
    
    return openaiClient.chat.completions.create({
      model,
      messages,
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0.7,
      response_format: options.response_format
    });
  } catch (error: unknown) {
    console.error("Error calling OpenAI API:", error);
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    } else {
      throw new Error("Unknown error calling OpenAI API");
    }
  }
}

// Function to get Anthropic client with API key from global settings
async function getAnthropicClient() {
  try {
    // Try to get API key from global settings
    let apiKey = process.env.ANTHROPIC_API_KEY;
    
    try {
      const setting = await storage.getGlobalSetting("anthropic_api_key");
      if (setting?.value) {
        apiKey = setting.value;
      }
    } catch (dbError) {
      console.warn("Database error when getting Anthropic key, using environment variable:", dbError);
    }
    
    if (!apiKey) {
      console.warn("Anthropic API key not found in global settings or environment variables");
    }
    
    return new Anthropic({ apiKey });
  } catch (error) {
    console.error("Error getting Anthropic client, falling back to environment variable:", error);
    // Fallback to environment variable
    return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
}

// Function to get the configured Anthropic model from global settings
async function getAnthropicModel() {
  // Default model
  const defaultModel = "claude-3-7-sonnet-20250219";
  
  try {
    // Try to get model from global settings
    try {
      const setting = await storage.getGlobalSetting("anthropic_model");
      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      return setting?.value || defaultModel;
    } catch (dbError) {
      console.warn("Database error when getting Anthropic model, using default:", dbError);
      return defaultModel;
    }
  } catch (error) {
    console.error("Error getting Anthropic model, using default:", error);
    return defaultModel;
  }
}

// Helper function to make Anthropic API calls with dynamic client and model
async function callAnthropic(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt?: string,
  options: { 
    max_tokens?: number; 
    temperature?: number;
  } = {}
) {
  try {
    const anthropicClient = await getAnthropicClient();
    const model = await getAnthropicModel();
    
    return anthropicClient.messages.create({
      model,
      messages,
      system: systemPrompt,
      max_tokens: options.max_tokens || 4000,
      temperature: options.temperature || 0.7
    });
  } catch (error: unknown) {
    console.error("Error calling Anthropic API:", error);
    if (error instanceof Error) {
      throw new Error(`Anthropic API error: ${error.message}`);
    } else {
      throw new Error("Unknown error when calling Anthropic API");
    }
  }
}

// Define project contexts to enhance assistant responses
interface ProjectContext {
  type: string;
  focus: string;
  keyRisks: string[];
  recommendedPractices: string[];
}

// Map of project types to their testing contexts
const PROJECT_CONTEXTS: Record<string, ProjectContext> = {
  iot: {
    type: "IoT Device Management",
    focus: "Embedded systems, connectivity, and firmware testing",
    keyRisks: [
      "Device connectivity failures",
      "Battery optimization issues",
      "Firmware update problems",
      "Security vulnerabilities"
    ],
    recommendedPractices: [
      "Device simulation for scale testing",
      "Power consumption monitoring",
      "OTA update verification",
      "Security penetration testing"
    ]
  },
  ecommerce: {
    type: "E-Commerce Platform",
    focus: "User experience, payment processing, and catalog management",
    keyRisks: [
      "Payment processing errors",
      "Performance bottlenecks during peak traffic",
      "Product catalog consistency issues",
      "Cross-browser compatibility problems"
    ],
    recommendedPractices: [
      "End-to-end transaction testing",
      "Load testing for sales events",
      "Automated visual regression testing",
      "API contract testing"
    ]
  },
  banking: {
    type: "Banking API",
    focus: "Security, compliance, and transaction integrity",
    keyRisks: [
      "Security breaches",
      "Data integrity violations",
      "Compliance failures",
      "Transaction processing errors"
    ],
    recommendedPractices: [
      "Security penetration testing",
      "Compliance verification testing",
      "Transaction integrity validation",
      "API throttling and rate limit testing"
    ]
  },
  healthcare: {
    type: "Healthcare Mobile App",
    focus: "Data privacy, accessibility, and regulatory compliance",
    keyRisks: [
      "Patient data privacy breaches",
      "Accessibility issues",
      "Regulatory compliance failures",
      "Cross-device compatibility problems"
    ],
    recommendedPractices: [
      "HIPAA compliance testing",
      "Accessibility testing",
      "Offline functionality testing",
      "Cross-device compatibility testing"
    ]
  },
  cloud: {
    type: "Cloud Infrastructure",
    focus: "Scalability, resilience, and cost optimization",
    keyRisks: [
      "Infrastructure provisioning failures",
      "Scaling limitations",
      "Disaster recovery failures",
      "Cost overruns"
    ],
    recommendedPractices: [
      "Infrastructure as code testing",
      "Auto-scaling validation",
      "Disaster recovery testing",
      "Cost optimization monitoring"
    ]
  },
  general: {
    type: "General Software Project",
    focus: "Quality assurance, test automation, and continuous integration practices",
    keyRisks: [
      "Test flakiness",
      "Insufficient coverage",
      "Manual testing bottlenecks",
      "Regression issues"
    ],
    recommendedPractices: [
      "CI/CD integration for automated testing",
      "Test pyramid implementation",
      "Test data management strategy",
      "Quality metrics and dashboards"
    ]
  }
};

// ATMF dimensions from the mindmap
const ATMF_DIMENSIONS = [
  {
    id: 1,
    name: "Automation Intelligence",
    description: "Focuses on incorporating AI/ML into testing processes for smart test generation, execution, and analysis."
  },
  {
    id: 2,
    name: "Test Execution Efficiency",
    description: "Emphasizes optimizing test execution speed, parallelization, and resource utilization."
  },
  {
    id: 3,
    name: "Test Coverage Optimization",
    description: "Focuses on achieving comprehensive test coverage with minimal redundancy."
  },
  {
    id: 4,
    name: "Strategic Quality Management",
    description: "Aligns testing activities with business objectives and quality goals."
  },
  {
    id: 5,
    name: "Continuous Quality Integration",
    description: "Integrates testing throughout the development lifecycle for early defect detection."
  }
];

/**
 * Generate maturity assessment insights based on provided testing data
 */
export async function generateMaturityInsights(
  dimensionName: string,
  currentLevelData: any,
  metricsData: any[]
): Promise<string> {
  try {
    const prompt = `
      As an expert in test automation and quality engineering, analyze the current maturity level and metrics for the "${dimensionName}" dimension.
      
      Current Level: ${JSON.stringify(currentLevelData)}
      Metrics: ${JSON.stringify(metricsData)}
      
      Based on this data, provide a concise, actionable insight that would help the team improve their testing maturity in this dimension.
      Focus on practical steps they can take to move to the next maturity level.
      Limit your response to 3-4 sentences maximum and use plain text only.
    `;

    const response = await callOpenAI([
      { role: "system", content: "You are an expert testing consultant specializing in the Adaptive Testing Maturity Framework (ATMF)." },
      { role: "user", content: prompt }
    ], {
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0].message.content || "No insights available.";
  } catch (error) {
    console.error("Error generating maturity insights:", error);
    return "Unable to generate insights at this time.";
  }
}

/**
 * Generate specific recommendations based on testing data
 */
export async function generateRecommendations(
  dimensionName: string,
  currentLevel: number,
  metricsData: any[]
): Promise<{ title: string; description: string; priority: string; actions: string[] }> {
  try {
    const prompt = `
      As an expert in test automation and quality engineering, generate a specific recommendation for the "${dimensionName}" dimension.
      The team is currently at maturity level ${currentLevel}.
      
      Metrics: ${JSON.stringify(metricsData)}
      
      Provide a recommendation with:
      1. A concise title (5-7 words)
      2. A detailed description (2-3 sentences)
      3. Priority (high, normal, or low)
      4. 2-3 specific actions the team can take
      
      Return your response in JSON format with these fields: title, description, priority, and actions (array).
    `;

    const response = await callOpenAI([
      { role: "system", content: "You are an expert testing consultant specializing in the Adaptive Testing Maturity Framework (ATMF)." },
      { role: "user", content: prompt }
    ], {
      temperature: 0.7,
      max_tokens: 400,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      title: result.title || "Test Automation Recommendation",
      description: result.description || "No detailed description available.",
      priority: result.priority || "normal",
      actions: result.actions || ["Review testing strategy", "Implement recommendation"]
    };
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return {
      title: "Test Automation Recommendation",
      description: "Unable to generate personalized recommendations at this time.",
      priority: "normal",
      actions: ["Review testing strategy", "Contact support"]
    };
  }
}

/**
 * Analyze testing data to provide insights on potential issues and areas for improvement
 */
export async function analyzeTestingData(
  testData: any
): Promise<{ insights: string[]; riskAreas: { area: string; risk: number }[] }> {
  try {
    const prompt = `
      Analyze the following testing data:
      ${JSON.stringify(testData)}
      
      Provide:
      1. Three key insights based on this data
      2. Three potential risk areas with a risk score (0-100)
      
      Return your response in JSON format with these fields: insights (array of strings) and riskAreas (array of objects with area and risk properties).
    `;

    const response = await callOpenAI([
      { role: "system", content: "You are an expert testing consultant specializing in the Adaptive Testing Maturity Framework (ATMF)." },
      { role: "user", content: prompt }
    ], {
      temperature: 0.7,
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      insights: result.insights || ["No insights available."],
      riskAreas: result.riskAreas || []
    };
  } catch (error) {
    console.error("Error analyzing testing data:", error);
    return {
      insights: ["Unable to analyze testing data at this time."],
      riskAreas: []
    };
  }
}

/**
 * Generate a maturity roadmap for a specific dimension
 */
export async function generateMaturityRoadmap(
  dimensionId: number,
  currentLevel: number
): Promise<{
  levels: Array<{
    level: number;
    name: string;
    description: string;
    keyInitiatives: string[];
    estimatedTimeframe: string;
  }>
}> {
  try {
    // Find the dimension from our known dimensions
    const dimension = ATMF_DIMENSIONS.find(d => d.id === dimensionId);
    if (!dimension) {
      throw new Error(`Dimension with ID ${dimensionId} not found`);
    }

    const prompt = `
      Generate a testing maturity roadmap for the "${dimension.name}" dimension of the Adaptive Testing Maturity Framework (ATMF).
      The team is currently at maturity level ${currentLevel} out of 5.
      
      For each maturity level from ${currentLevel} to 5, provide:
      1. A name for the level (1-3 words)
      2. A brief description of what this level represents (1-2 sentences)
      3. 2-3 key initiatives required to achieve this level
      4. Estimated timeframe to achieve this level from the previous one (e.g., "3-6 months")
      
      Return your response in JSON format with a "levels" array containing objects with these properties:
      level, name, description, keyInitiatives (array), estimatedTimeframe.
    `;

    const response = await callOpenAI([
      { 
        role: "system", 
        content: "You are an expert testing consultant specializing in the Adaptive Testing Maturity Framework (ATMF)." 
      },
      { role: "user", content: prompt }
    ], {
      temperature: 0.7,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      levels: result.levels || []
    };
  } catch (error) {
    console.error("Error generating maturity roadmap:", error);
    return {
      levels: []
    };
  }
}

/**
 * Analyze test patterns to identify optimization opportunities
 */
export async function analyzeTestPatterns(
  testData: {
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
): Promise<{
  optimizationOpportunities: Array<{
    title: string;
    description: string;
    potentialImpact: "high" | "medium" | "low";
    implementationEffort: "high" | "medium" | "low";
  }>;
  redundancies: string[];
  coverageGaps: string[];
}> {
  try {
    const prompt = `
      Analyze the following test pattern data:
      ${JSON.stringify(testData)}
      
      Identify:
      1. Three specific optimization opportunities with title, description, potential impact (high/medium/low), and implementation effort (high/medium/low)
      2. Two potential test redundancies
      3. Two test coverage gaps
      
      Return your response in JSON format with these fields:
      - optimizationOpportunities (array of objects with title, description, potentialImpact, implementationEffort)
      - redundancies (array of strings)
      - coverageGaps (array of strings)
    `;

    const response = await callOpenAI([
        { 
          role: "system", 
          content: "You are an expert testing consultant specializing in test automation optimization." 
        },
        { role: "user", content: prompt }
      ], {
      temperature: 0.7,
      max_tokens: 800
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      optimizationOpportunities: result.optimizationOpportunities || [],
      redundancies: result.redundancies || [],
      coverageGaps: result.coverageGaps || []
    };
  } catch (error) {
    console.error("Error analyzing test patterns:", error);
    return {
      optimizationOpportunities: [],
      redundancies: [],
      coverageGaps: []
    };
  }
}

/**
 * Generate test cases based on feature description and requirements
 */
export async function generateTestCases(
  feature: string,
  requirements: string,
  complexity: string,
  jiraInfo?: {
    jiraProjectId?: string;
    jiraJql?: string;
  },
  project?: {
    testStrategy?: string;
    projectType?: string;
    qualityFocus?: string;
  }
): Promise<{
  testCases: Array<{
    title: string;
    description: string;
    preconditions: string;
    steps: Array<{ step: string; expected: string }>;
    expectedResults: string;
    priority: string;
    severity: string;
    automatable: boolean;
  }>;
}> {
  try {
    // Build the Jira context string if available
    let jiraContext = '';
    if (jiraInfo && jiraInfo.jiraProjectId) {
      jiraContext = `\nJira Project ID: ${jiraInfo.jiraProjectId}`;
      
      if (jiraInfo.jiraJql) {
        jiraContext += `\nJira JQL Query: ${jiraInfo.jiraJql}`;
        jiraContext += `\nPlease consider Jira issues matching the above JQL query when creating test cases.`;
      }
    }

    // Build project context string if available
    let projectContext = '';
    if (project) {
      if (project.testStrategy) {
        projectContext += `\nProject Testing Strategy:\n${project.testStrategy}`;
      }
      if (project.projectType) {
        projectContext += `\nProject Type: ${project.projectType}`;
      }
      if (project.qualityFocus) {
        projectContext += `\nQuality Focus: ${project.qualityFocus}`;
      }
    }

    const prompt = `
      Generate detailed test cases for the following feature:
      
      Feature: ${feature}
      Requirements: ${requirements}
      Complexity: ${complexity}${jiraContext}${projectContext}
      
      Provide 3 detailed test cases, each with:
      1. Title
      2. Description
      3. Preconditions
      4. Test steps (each with a step description and expected result)
      5. Overall expected results
      6. Priority (high, medium, low based on complexity and criticality)
      7. Severity (critical, high, normal, low)
      8. Whether the test case is automatable (true/false)
      
      Return your response in JSON format with a "testCases" array containing objects with these properties:
      title, description, preconditions, steps (array of objects with step and expected properties), 
      expectedResults, priority, severity, automatable.
      
      Make the test cases specific and detailed, with clear preconditions and steps that would be actionable for a tester.
      ${project?.testStrategy ? 'Ensure the test cases align with the project testing strategy and principles provided above.' : ''}
      ${jiraInfo?.jiraJql ? 'Incorporate specific details from Jira issues matching the JQL query to make the test cases more relevant and aligned with actual project requirements.' : ''}
    `;

    const response = await callOpenAI([
        { 
          role: "system", 
          content: "You are an expert test engineer specializing in test case design and automation." 
        },
        { role: "user", content: prompt }
      ], {
      temperature: 0.7,
      max_tokens: 1500
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      testCases: result.testCases || []
    };
  } catch (error) {
    console.error("Error generating test cases:", error);
    return {
      testCases: []
    };
  }
}

/**
 * Generate AI Test Steps - analyze test case context and generate preconditions, steps, and expected results
 */
export async function generateTestSteps(
  project: Project,
  testCase: {
    title: string;
    description: string;
    preconditions?: string;
    expectedResults?: string;
    jiraTicketIds?: string[];
  },
  includeDocuments: boolean = true,
  includeJira: boolean = true
): Promise<{
  preconditions: string;
  steps: Array<{ step: string; expected: string }>;
  expectedResults: string;
  updatedDescription?: string;
}> {
  try {
    console.log(`Generating test steps for test case: ${testCase.title}`);
    
    // Get project context
    const projectContext = `
PROJECT: ${project.name} (${project.projectType})
INDUSTRY: ${project.industryArea}
REGULATIONS: ${project.regulations}
TESTING STRATEGY: ${project.testStrategy || 'Standard testing approach'}
`;
    
    // Fetch related Jira tickets if specified
    let jiraContext = "";
    if (includeJira && testCase.jiraTicketIds && testCase.jiraTicketIds.length > 0) {
      try {
        const jiraTickets = await storage.getJiraTickets(project.id);
        const relevantTickets = jiraTickets.filter(ticket => 
          testCase.jiraTicketIds!.includes(ticket.jiraKey || ticket.key)
        );
        
        if (relevantTickets.length > 0) {
          jiraContext = `
RELATED JIRA TICKETS:
${relevantTickets.map(ticket => `
- ${ticket.jiraKey || ticket.key}: ${ticket.summary}
  Priority: ${ticket.priority}
  Status: ${ticket.status}
  Description: ${ticket.description || 'No description'}
  Labels: ${ticket.labels?.join(', ') || 'None'}
`).join('\n')}`;
        }
      } catch (error) {
        console.warn("Error fetching Jira tickets for test steps generation:", error);
      }
    }
    
    // Get knowledge base context
    let knowledgeBaseContext = "";
    if (includeDocuments) {
      try {
        const allDocuments = await storage.getDocuments(project.id);
        const relevantDocs = allDocuments.filter(doc => 
          doc.title.toLowerCase().includes(testCase.title.toLowerCase().split(' ').slice(0, 2).join(' ')) ||
          doc.content.toLowerCase().includes(testCase.title.toLowerCase().split(' ').slice(0, 2).join(' '))
        );
        
        if (relevantDocs.length > 0) {
          knowledgeBaseContext = `
RELEVANT KNOWLEDGE BASE DOCUMENTS:
${relevantDocs.map(doc => `
**${doc.title}** (${doc.category}):
${doc.content.substring(0, 800)}...
`).join('\n\n')}`;
        }
      } catch (error) {
        console.warn("Error fetching documents for test steps generation:", error);
      }
    }

    const prompt = `You are an expert test engineer specializing in creating comprehensive test cases. Generate detailed test steps for the following test case based on the provided context.

**PROJECT CONTEXT:**
${projectContext}

**TEST CASE INFORMATION:**
- Title: ${testCase.title}
- Description: ${testCase.description}
- Current Preconditions: ${testCase.preconditions || 'None provided'}
- Current Expected Results: ${testCase.expectedResults || 'None provided'}

${jiraContext}

${knowledgeBaseContext}

**INSTRUCTIONS:**
1. **Analyze** the test case title, description, and all provided context
2. **Generate comprehensive preconditions** that ensure the test environment is properly set up
3. **Create detailed test steps** that are:
   - Clear and actionable
   - Logically sequenced
   - Include specific actions to perform
   - Cover all necessary test scenarios based on the context
4. **Provide expected results** for each step that are:
   - Specific and measurable
   - Aligned with the test case objective
   - Technically accurate
5. **Update the overall expected results** to better reflect the complete test objective based on context
6. **Optionally improve the description** if needed for clarity

**RESPONSE FORMAT:**
Provide your response as a JSON object with the following structure:
{
  "preconditions": "Detailed preconditions as a string",
  "steps": [
    {"step": "Step 1 action", "expected": "Expected result for step 1"},
    {"step": "Step 2 action", "expected": "Expected result for step 2"}
  ],
  "expectedResults": "Overall expected results for the entire test case",
  "updatedDescription": "Improved description if needed (optional)"
}

Focus on creating test steps that are practical, executable, and aligned with the project's testing strategy and technical context.`;

    const response = await callOpenAI(
      [{ role: "user", content: prompt }],
      { 
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: "json_object" }
      }
    );

    const result = JSON.parse(response.choices[0].message.content || "{}");
    console.log("Generated test steps:", result);
    
    return {
      preconditions: result.preconditions || testCase.preconditions || "",
      steps: result.steps || [],
      expectedResults: result.expectedResults || testCase.expectedResults || "",
      updatedDescription: result.updatedDescription || testCase.description
    };
    
  } catch (error) {
    console.error("Error generating test steps:", error);
    throw new Error("Failed to generate test steps. Please try again.");
  }
}

/**
 * Generate AI Test Coverage - analyze project context and propose test cases for a test suite
 */
export async function generateTestCoverage(
  project: Project,
  testSuite: { name: string; description: string; projectArea: string; coverage?: string },
  documents: any[],
  jiraTickets: any[],
  existingTestCases: any[] = []
): Promise<{
  proposedTestCases: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    jiraTicketIds: string[];
    reasoning: string;
  }>;
  analysis: {
    existingCoverage: string;
    gaps: string[];
    recommendation: string;
  };
}> {
  try {
    // Extract required Jira tickets from coverage field
    const requiredJiraTickets = [];
    const requiredDocuments = [];
    
    if (testSuite.coverage) {
      const coverageParts = testSuite.coverage.split(' | ');
      for (const part of coverageParts) {
        if (part.startsWith('JIRA_TICKETS:')) {
          const ticketIds = part.replace('JIRA_TICKETS:', '').trim().split(',').map(t => t.trim());
          requiredJiraTickets.push(...ticketIds);
        } else if (part.startsWith('DOCUMENTS:')) {
          const docNames = part.replace('DOCUMENTS:', '').trim();
          requiredDocuments.push(docNames);
        }
      }
    }

    // Get all required Jira tickets (these MUST be covered)
    const requiredTickets = jiraTickets.filter(ticket => 
      requiredJiraTickets.includes(ticket.jiraKey || ticket.key)
    );

    // Get additional relevant tickets (these MAY be covered if relevant)
    const additionalTickets = jiraTickets.filter(ticket => {
      const ticketKey = ticket.jiraKey || ticket.key;
      const ticketSummary = ticket.summary || ticket.fields?.summary || '';
      const ticketComponents = ticket.components || ticket.fields?.components || [];
      const ticketLabels = ticket.labels || ticket.fields?.labels || [];
      
      return !requiredJiraTickets.includes(ticketKey) && (
        ticketSummary.toLowerCase().includes(testSuite.projectArea.toLowerCase()) ||
        ticketSummary.toLowerCase().includes(testSuite.name.toLowerCase()) ||
        ticketComponents.some((comp: any) => {
          const compName = typeof comp === 'string' ? comp : comp.name;
          return testSuite.projectArea.toLowerCase().includes(compName.toLowerCase());
        }) ||
        ticketLabels.some((label: string) => 
          testSuite.projectArea.toLowerCase().includes(label.toLowerCase())
        )
      );
    });

    // Combine required and additional tickets, prioritizing required ones
    const relevantTickets = [...requiredTickets, ...additionalTickets];

    // Filter relevant documents
    const relevantDocs = documents.filter(doc => 
      requiredDocuments.some(reqDoc => 
        doc.title?.toLowerCase().includes(reqDoc.toLowerCase()) ||
        doc.content?.toLowerCase().includes(reqDoc.toLowerCase())
      ) ||
      doc.type === 'requirement' || 
      doc.type === 'specification' ||
      doc.type === 'test_plan' ||
      doc.tags?.some((tag: string) => 
        testSuite.projectArea.toLowerCase().includes(tag.toLowerCase()) ||
        testSuite.name.toLowerCase().includes(tag.toLowerCase())
      )
    );

    const existingTestCasesContext = existingTestCases.length > 0 
      ? `## Existing Test Cases in Suite:
${existingTestCases.map(tc => `- ${tc.title}: ${tc.description} (Priority: ${tc.priority})`).join('\n')}`
      : "## Existing Test Cases: None (this is a new test suite)";

    const prompt = `
      As an expert QA analyst, analyze the following context and provide a comprehensive test coverage analysis for the test suite "${testSuite.name}".

      ## Project Context:
      - Name: ${project.name}
      - Description: ${project.description}
      - Industry: ${project.industryArea}
      - Type: ${project.projectType}
      - Regulations: ${project.regulations}
      - Quality Focus: ${project.qualityFocus}

      ## Test Suite Context:
      - Name: ${testSuite.name}
      - Description: ${testSuite.description}
      - Project Area: ${testSuite.projectArea}

      ## Test Strategy:
      ${project.testStrategy || 'Standard risk-based testing approach'}

      ${existingTestCasesContext}

      ## MANDATORY Coverage Requirements:
      ${requiredJiraTickets.length > 0 ? `
      **CRITICAL: The following Jira tickets MUST be covered by comprehensive test cases. Analyze each ticket's full content to generate complete test coverage:**
      ${requiredTickets.map(ticket => {
        // Handle both database tickets and Jira API tickets
        const ticketKey = ticket.jiraKey || ticket.key;
        const ticketSummary = ticket.summary || ticket.fields?.summary || 'No summary';
        const description = ticket.description || ticket.fields?.description || 'No description';
        const priority = ticket.priority || ticket.fields?.priority?.name || 'Unknown';
        const status = ticket.status || ticket.fields?.status?.name || 'Unknown';
        const issueType = ticket.issueType || ticket.fields?.issuetype?.name || 'Unknown';
        const assignee = ticket.assignee || ticket.fields?.assignee?.displayName || 'Unassigned';
        const reporter = ticket.reporter || ticket.fields?.reporter?.displayName || 'Unknown';
        const created = ticket.jiraCreatedAt || ticket.fields?.created || ticket.createdAt || 'Unknown';
        const updated = ticket.jiraUpdatedAt || ticket.fields?.updated || ticket.updatedAt || 'Unknown';
        
        // Handle components and labels (can be arrays from DB or objects from API)
        const components = ticket.components || ticket.fields?.components || [];
        const labels = ticket.labels || ticket.fields?.labels || [];
        const componentsText = Array.isArray(components) 
          ? components.map(c => typeof c === 'string' ? c : c.name).join(', ') 
          : 'None';
        const labelsText = Array.isArray(labels) 
          ? labels.join(', ') 
          : 'None';
        
        return `### ${ticketKey}: ${ticketSummary}
        - Type: ${issueType}
        - Priority: ${priority}
        - Status: ${status}
        - Components: ${componentsText}
        - Labels: ${labelsText}
        - Description: ${description}
        - Assignee: ${assignee}
        - Reporter: ${reporter}
        - Created: ${created}
        - Updated: ${updated}
        `;
      }).join('\n\n')}
      ` : 'No mandatory Jira tickets specified in coverage field.'}

      ## Required Documentation Coverage:
      ${requiredDocuments.length > 0 ? `
      **Required Documents to Cover (analyze full content for test requirements):**
      ${requiredDocuments.map(doc => `- ${doc}`).join('\n')}
      ` : 'No mandatory documents specified in coverage field.'}

      ## Additional Relevant Documentation:
      ${relevantDocs.map(doc => `### ${doc.title}
      - Type: ${doc.type}
      - Tags: ${doc.tags?.join(', ') || 'None'}
      - Content: ${doc.content?.substring(0, 1000)}...`).join('\n\n')}

      ## Additional Relevant Jira Tickets (Optional Coverage):
      ${additionalTickets.length > 0 ? additionalTickets.map(ticket => {
        const ticketKey = ticket.jiraKey || ticket.key;
        const ticketSummary = ticket.summary || ticket.fields?.summary || 'No summary';
        const description = ticket.description || ticket.fields?.description || 'No description';
        const descriptionText = typeof description === 'string' ? description.substring(0, 300) : 'No description';
        const issueType = ticket.issueType || ticket.fields?.issuetype?.name || 'Unknown';
        const status = ticket.status || ticket.fields?.status?.name || 'Unknown';
        
        return `### ${ticketKey}: ${ticketSummary}
        - Type: ${issueType}
        - Status: ${status}
        - Description: ${descriptionText}`;
      }).join('\n\n') : 'No additional relevant tickets found.'}

      ## Task:
      ${existingTestCases.length > 0 
        ? `Analyze the existing test cases and identify coverage gaps. Generate comprehensive test cases to ensure ALL mandatory Jira tickets receive complete coverage.`
        : `Generate comprehensive test cases that provide thorough coverage for this test suite based on the full content analysis.`
      }

      ## CRITICAL REQUIREMENTS:
      1. **Mandatory Jira Coverage**: EVERY ticket in the required list (${requiredJiraTickets.join(', ')}) MUST have comprehensive test coverage
      2. **Deep Content Analysis**: Analyze the full description, acceptance criteria, and requirements in each Jira ticket
      3. **Complete User Flows**: Generate test cases covering all user workflows, edge cases, and error scenarios mentioned in tickets
      4. **Functional & Non-Functional**: Include both functional tests (user actions) and non-functional tests (performance, security, compliance)
      5. **Risk-Based Prioritization**: Prioritize test cases based on business impact and technical risk
      6. **Regulatory Compliance**: Ensure ${project.regulations} requirements are thoroughly tested
      7. **Integration Testing**: Cover integration points and data flow between components
      8. **Negative Testing**: Include error handling, validation, and boundary condition tests
      9. **User Experience**: Cover accessibility, usability, and user interaction scenarios
      10. **Data Privacy**: Include GDPR compliance and data protection testing where applicable

      ## Test Case Generation Strategy:
      For each required Jira ticket, generate:
      - **Happy Path Tests**: Main user workflows and success scenarios
      - **Edge Case Tests**: Boundary conditions and unusual inputs
      - **Error Handling Tests**: Invalid inputs, system failures, and error recovery
      - **Integration Tests**: Data flow between components and external systems
      - **Performance Tests**: Response times, load handling, and scalability
      - **Security Tests**: Authentication, authorization, and data protection
      - **Compliance Tests**: Regulatory requirements and audit trails
      - **User Experience Tests**: Accessibility, usability, and responsive design

      ## Analysis Approach:
      1. Parse each Jira ticket's full description for functional requirements
      2. Identify all user stories, acceptance criteria, and business rules
      3. Map requirements to specific test scenarios
      4. Consider the project's testing strategy: ${project.testStrategy || 'risk-based approach'}
      5. Generate test cases that validate both positive and negative scenarios
      6. Ensure traceability between test cases and specific ticket requirements

      Return a JSON object with this structure:
      {
        "proposedTestCases": [
          {
            "title": "Clear, specific test case title focusing on the exact functionality tested",
            "description": "Detailed description of what this test validates, including specific user actions, expected behaviors, and validation points",
            "priority": "high|medium|low based on business impact, technical risk, and regulatory requirements",
            "jiraTicketIds": ["Array of relevant Jira ticket keys that this test case addresses"],
            "jiraTickets": [{"key": "TICKET-123", "summary": "Shortened summary of the ticket (max 50 chars)"}],
            "reasoning": "Detailed explanation of why this test case is critical, what risks it mitigates, and how it aligns with the project's testing strategy",
            "testType": "functional|performance|security|compliance|integration|usability",
            "testCategory": "happy-path|edge-case|error-handling|boundary-condition|negative-testing"
          }
        ],
        "analysis": {
          "existingCoverage": "${existingTestCases.length > 0 ? 'Detailed analysis of what existing test cases cover and their effectiveness' : 'No existing coverage - comprehensive test suite needed'}",
          "gaps": ["Detailed array of specific coverage gaps identified with impact assessment"],
          "recommendation": "Comprehensive recommendation about the test coverage strategy, including prioritization rationale and additional considerations",
          "jiraTicketCoverage": {
            "requiredTickets": ["List of required Jira tickets that must be covered"],
            "coveredTickets": ["List of tickets that will be covered by proposed test cases"],
            "uncoveredTickets": ["List of any tickets that still need additional coverage"]
          }
        }
      }

      ## Important Instructions:
      - Generate 8-15 comprehensive test cases for complete coverage
      - Each required Jira ticket should have multiple test cases covering different aspects
      - Include both functional and non-functional test cases
      - Prioritize test cases based on business risk and regulatory requirements
      - Ensure test cases are detailed enough to be actionable for testers
      - Consider the full user journey and system interactions

      Return ONLY valid JSON with no markdown formatting, code blocks, or additional text.
    `;

    console.log(`Generating test coverage for test suite: ${testSuite.name}`);
    console.log(`Required Jira tickets: ${requiredJiraTickets.join(', ')}`);
    console.log(`Required documents: ${requiredDocuments.join(', ')}`);
    console.log(`Found ${requiredTickets.length} required tickets, ${additionalTickets.length} additional tickets`);
    
    const response = await callOpenAI([
      { role: "system", content: "You are an expert QA analyst specializing in comprehensive test coverage analysis and risk-based testing strategies. You excel at analyzing detailed Jira ticket content and generating thorough test cases that cover functional, non-functional, and compliance requirements." },
      { role: "user", content: prompt }
    ], {
      temperature: 0.7,
      max_tokens: 4000
    });

    let content = response.choices[0].message.content || '{"proposedTestCases": [], "analysis": {"existingCoverage": "", "gaps": [], "recommendation": ""}}';
    
    // Clean up markdown formatting if present
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    const result = JSON.parse(content);
    
    // Enhance proposed test cases with actual Jira ticket data
    const enhancedTestCases = result.proposedTestCases?.map((testCase: any) => {
      const jiraTickets = testCase.jiraTicketIds?.map((ticketKey: string) => {
        const ticket = relevantTickets.find(t => (t.key === ticketKey) || (t.jiraKey === ticketKey));
        if (ticket) {
          const summary = ticket.summary || ticket.fields?.summary || 'No summary';
          const summaryText = typeof summary === 'string' ? summary.substring(0, 50) : 'No summary';
          return {
            key: ticketKey,
            summary: summaryText
          };
        }
        return { key: ticketKey, summary: 'Ticket not found' };
      }) || [];
      
      return {
        ...testCase,
        jiraTickets,
        testType: testCase.testType || 'functional',
        testCategory: testCase.testCategory || 'happy-path'
      };
    }) || [];

    // Validate that ALL required Jira tickets are covered
    const coveredTickets = new Set();
    enhancedTestCases.forEach(testCase => {
      testCase.jiraTicketIds?.forEach(ticketId => {
        if (requiredJiraTickets.includes(ticketId)) {
          coveredTickets.add(ticketId);
        }
      });
    });

    // Check existing test cases for coverage of required tickets
    existingTestCases.forEach(testCase => {
      if (testCase.jiraTicketIds && Array.isArray(testCase.jiraTicketIds)) {
        testCase.jiraTicketIds.forEach(ticketId => {
          if (requiredJiraTickets.includes(ticketId)) {
            coveredTickets.add(ticketId);
          }
        });
      }
    });

    const uncoveredTickets = requiredJiraTickets.filter(ticketId => !coveredTickets.has(ticketId));
    
    // Generate additional test cases for uncovered required tickets
    const additionalTestCases = [];
    if (uncoveredTickets.length > 0) {
      for (const ticketId of uncoveredTickets) {
        const ticket = requiredTickets.find(t => (t.key === ticketId) || (t.jiraKey === ticketId));
        if (ticket) {
          const summary = ticket.summary || ticket.fields?.summary || 'No summary';
          const shortSummary = typeof summary === 'string' ? summary.substring(0, 50) : 'No summary';
          
          additionalTestCases.push({
            title: `Test ${ticketId}: ${shortSummary}`,
            description: `Verify functionality and requirements specified in ${ticketId}`,
            priority: "high" as const,
            jiraTicketIds: [ticketId],
            jiraTickets: [{
              key: ticketId,
              summary: shortSummary
            }],
            reasoning: `Required to ensure coverage of mandatory ticket ${ticketId}`
          });
        }
      }
    }

    // Combine original and additional test cases
    const finalTestCases = [...enhancedTestCases, ...additionalTestCases];

    // Update analysis to reflect coverage status
    const analysisGaps = result.analysis?.gaps || [];
    if (uncoveredTickets.length > 0) {
      analysisGaps.push(`Missing coverage for required Jira tickets: ${uncoveredTickets.join(', ')}`);
    }

    // Log coverage analysis results
    console.log(`Generated ${finalTestCases.length} test cases for ${requiredJiraTickets.length} required tickets`);
    console.log(`Covered tickets: ${Array.from(coveredTickets).join(', ')}`);
    if (uncoveredTickets.length > 0) {
      console.log(`Uncovered tickets: ${uncoveredTickets.join(', ')}`);
    }

    // Ensure proper structure
    return {
      proposedTestCases: finalTestCases,
      analysis: {
        existingCoverage: result.analysis?.existingCoverage || (existingTestCases.length > 0 ? "Existing test cases provide partial coverage" : "No existing coverage"),
        gaps: analysisGaps,
        recommendation: uncoveredTickets.length > 0 
          ? `Generated additional test cases to ensure ALL required Jira tickets (${requiredJiraTickets.join(', ')}) are covered. ${result.analysis?.recommendation || ''}`
          : result.analysis?.recommendation || "All required Jira tickets are covered",
        jiraTicketCoverage: {
          requiredTickets: requiredJiraTickets,
          coveredTickets: Array.from(coveredTickets),
          uncoveredTickets: uncoveredTickets
        }
      },
      jiraTicketsContext: relevantTickets.map(ticket => ({
        key: ticket.key,
        summary: typeof ticket.fields?.summary === 'string' ? ticket.fields.summary : 'No summary',
        status: ticket.fields?.status?.name || 'Unknown'
      }))
    };
  } catch (error) {
    console.error("Error generating test coverage:", error);
    return {
      proposedTestCases: [],
      analysis: {
        existingCoverage: existingTestCases.length > 0 ? "Existing test cases provide partial coverage" : "No existing coverage",
        gaps: ["Error analyzing coverage gaps"],
        recommendation: "Manual review recommended due to analysis error"
      }
    };
  }
}

/**
 * Generate test strategy recommendations based on project context
 */
export async function generateTestStrategy(
  projectContext: {
    type: string;
    technologies: string[];
    teamSize: number;
    releaseFrequency: string;
    qualityGoals: string[];
  }
): Promise<{
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
}> {
  try {
    const prompt = `
      Generate a test strategy recommendation for a project with the following context:
      ${JSON.stringify(projectContext)}
      
      Provide:
      1. A concise strategy overview (2-3 sentences)
      2. Recommendations for different test levels (unit, integration, e2e, etc.) with focus, approach, and automation recommendation
      3. Tool recommendations with rationale
      
      Return your response in JSON format with these fields:
      - strategyOverview (string)
      - testLevels (array of objects with level, focus, recommendedApproach, automationRecommendation)
      - toolRecommendations (array of objects with category, recommendation, rationale)
    `;

    const response = await callOpenAI([
        { 
          role: "system", 
          content: "You are an expert testing consultant specializing in test strategy development." 
        },
        { role: "user", content: prompt }
      ], {
      temperature: 0.7,
      max_tokens: 1200
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      strategyOverview: result.strategyOverview || "",
      testLevels: result.testLevels || [],
      toolRecommendations: result.toolRecommendations || []
    };
  } catch (error) {
    console.error("Error generating test strategy:", error);
    return {
      strategyOverview: "",
      testLevels: [],
      toolRecommendations: []
    };
  }
}

/**
 * Generate AI-powered test suite recommendations based on project context
 */
export async function generateTestSuites(
  project: Project,
  organizationType: string,
  projectDocuments: any[],
  jiraTickets: any[]
): Promise<{
  name: string;
  projectArea: string;
  description: string;
  type: string;
  priority: string;
  coverage: string;
}[]> {
  try {
    console.log(`Generating AI test suites for project ${project.id} - ${project.name} with organization: ${organizationType}`);
    console.log(`Jira tickets data:`, jiraTickets?.length > 0 ? jiraTickets.slice(0, 2) : 'No tickets');
    
    // Format Jira tickets into groups by organization type for better analysis
    let jiraAnalysis = "No Jira tickets available.";
    if (jiraTickets && jiraTickets.length > 0) {
      // Group tickets by organization type
      const ticketGroups = groupJiraTicketsByOrganization(jiraTickets, organizationType);
      
      jiraAnalysis = `
JIRA TICKETS ANALYSIS (Primary Data Source - ${jiraTickets.length} tickets):
${Object.entries(ticketGroups).map(([group, tickets]) => `
${group.toUpperCase()} GROUP:
${tickets.map(t => `- ${t.key || t.jiraKey}: ${t.fields?.summary || t.summary || 'No summary'} (${t.fields?.issuetype?.name || t.issueType || 'Unknown'} | ${t.fields?.status?.name || t.status || 'Unknown'})`).join('\n')}
`).join('\n')}

COMPLIANCE REQUIREMENTS FROM TICKETS:
${extractComplianceFromTickets(jiraTickets)}

FEATURE AREAS IDENTIFIED:
${extractFeatureAreasFromTickets(jiraTickets)}
`;
    }

    // Format project information (supporting context)
    const projectInfo = `
PROJECT CONTEXT (Supporting Information):
- Name: ${project.name}
- Description: ${project.description}
- Type: ${project.projectType}
- Industry: ${project.industryArea}
- Regulations: ${project.regulations}
- Quality Focus: ${project.qualityFocus || 'Not specified'}
- Test Strategy: ${project.testStrategy || 'Standard testing approach'}
- Additional Context: ${project.additionalContext || 'None provided'}
`;

    // Format documents context (supplementary information)
    let documentsContext = "No project documents available.";
    if (projectDocuments && projectDocuments.length > 0) {
      documentsContext = `
KNOWLEDGE BASE DOCUMENTS (Supplementary Context - ${projectDocuments.length} documents):
${projectDocuments.map(doc => `
- Title: ${doc.title}
- Type: ${doc.tags?.join(', ') || 'Untagged'}
- Description: ${doc.description}
- Key Sections: ${extractKeyDocumentSections(doc.content)}
`).join('\n')}`;
    }

    const prompt = `
You are an expert test analyst creating comprehensive test suites for the "${project.name}" project.

INSTRUCTION: Analyze Jira tickets FIRST to ensure complete coverage, then group them by ${organizationType} as specified. Use project information and documents as supporting context for HOW to test, not WHAT to test.

${jiraAnalysis}

${projectInfo}

${documentsContext}

TASK: Generate 6-8 test suites organized by ${organizationType} that:

${jiraTickets && jiraTickets.length > 0 
  ? `1. PRIMARY GOAL: Cover ALL Jira tickets by grouping them logically according to ${organizationType}
2. SECONDARY GOAL: Add any additional test suites needed based on project context (regulations, quality focus, documents)
3. Each suite should include detailed coverage information

Requirements:
- Start with Jira tickets and group them by ${organizationType}
- Ensure every ticket is assigned to at least one test suite
- Add supplementary suites for compliance, performance, security as needed based on project context
- Include specific coverage details for each suite`
  : `1. PRIMARY GOAL: Create comprehensive test suites based on project context, regulations, and quality focus
2. SECONDARY GOAL: Use project information to design test suites by ${organizationType}
3. Each suite should include detailed coverage information

Requirements (No Jira tickets available):
- Create test suites based on project type (${project.projectType}) and industry area (${project.industryArea})
- Focus on regulations (${project.regulations}) and quality requirements
- Organize suites by ${organizationType}
- Include compliance, performance, security suites as needed`}

For each test suite, provide:
- name: Clear, descriptive name indicating the ${organizationType} grouping
- projectArea: High-level functional area
- description: What this suite covers and why it's important
- type: One of "functional", "integration", "performance", "security", "usability", "api"
- priority: "high", "medium", "low" based on business criticality and ticket priorities
- coverage: Structured text describing exactly what this suite covers:
  * "JIRA_TICKETS: [ticket1, ticket2, ...] | COMPLIANCE: [requirement1, requirement2] | DOCUMENTS: [section1, section2]"

Respond with valid JSON array format only:
[
  {
    "name": "Suite Name",
    "projectArea": "Area",
    "description": "Detailed description",
    "type": "functional",
    "priority": "high",
    "coverage": "JIRA_TICKETS: XAM-123, XAM-124 | COMPLIANCE: GDPR data processing | DOCUMENTS: User authentication section"
  }
]
`;

    const response = await callOpenAI([
      { 
        role: "system", 
        content: "You are a senior test architect specializing in Jira-driven test planning. Your primary responsibility is ensuring complete ticket coverage while organizing test suites logically. Always respond with valid JSON only." 
      },
      { role: "user", content: prompt }
    ], {
      temperature: 0.7,
      max_tokens: 3000
    });

    const responseText = response.choices[0].message.content || "[]";
    
    try {
      // Clean the response to remove markdown code blocks if present
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const testSuites = JSON.parse(cleanedResponse);
      console.log(`Generated ${testSuites.length} test suites for project ${project.name} with coverage information`);
      return testSuites;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw response:", responseText);
      return [];
    }
  } catch (error) {
    console.error("Error generating test suites:", error);
    return [];
  }
}

// Helper function to group Jira tickets by organization type
function groupJiraTicketsByOrganization(jiraTickets: any[], organizationType: string): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  
  jiraTickets.forEach(ticket => {
    let groupKey = 'Other';
    
    switch (organizationType) {
      case 'functions':
        // Group by business function/feature area
        groupKey = extractBusinessFunction(ticket);
        break;
      case 'components':
        // Group by system component
        groupKey = extractSystemComponent(ticket);
        break;
      case 'modules':
        // Group by technical module
        groupKey = extractTechnicalModule(ticket);
        break;
      case 'test-types':
        // Group by test type needed
        groupKey = determineTestType(ticket);
        break;
      case 'environments':
        // Group by environment/deployment context
        groupKey = extractEnvironmentContext(ticket);
        break;
      case 'user-personas':
        // Group by user type/persona
        groupKey = extractUserPersona(ticket);
        break;
      default:
        groupKey = 'General';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(ticket);
  });
  
  return groups;
}

// Helper functions for ticket analysis
function extractBusinessFunction(ticket: any): string {
  const summary = ticket.fields?.summary?.toLowerCase() || '';
  const description = ticket.fields?.description?.toLowerCase() || '';
  
  if (summary.includes('auth') || summary.includes('login') || summary.includes('signin')) return 'Authentication';
  if (summary.includes('payment') || summary.includes('billing') || summary.includes('invoice')) return 'Financial';
  if (summary.includes('user') || summary.includes('profile') || summary.includes('account')) return 'User Management';
  if (summary.includes('report') || summary.includes('analytics') || summary.includes('dashboard')) return 'Reporting';
  if (summary.includes('admin') || summary.includes('config') || summary.includes('setting')) return 'Administration';
  if (summary.includes('api') || summary.includes('integration') || summary.includes('webhook')) return 'Integration';
  
  return 'General Features';
}

function extractSystemComponent(ticket: any): string {
  const components = ticket.fields?.components?.map((c: any) => c.name).join(' ') || '';
  const labels = ticket.fields?.labels?.join(' ') || '';
  
  if (components.includes('frontend') || labels.includes('ui')) return 'Frontend';
  if (components.includes('backend') || labels.includes('api')) return 'Backend';
  if (components.includes('database') || labels.includes('db')) return 'Database';
  if (components.includes('auth') || labels.includes('security')) return 'Security';
  
  return 'Core System';
}

function extractTechnicalModule(ticket: any): string {
  const summary = ticket.fields?.summary?.toLowerCase() || '';
  
  if (summary.includes('security') || summary.includes('encryption')) return 'Security Module';
  if (summary.includes('performance') || summary.includes('optimization')) return 'Performance Module';
  if (summary.includes('ui') || summary.includes('interface')) return 'UI Module';
  if (summary.includes('data') || summary.includes('storage')) return 'Data Module';
  
  return 'Business Logic Module';
}

function determineTestType(ticket: any): string {
  const issueType = ticket.fields?.issuetype?.name?.toLowerCase() || '';
  const summary = ticket.fields?.summary?.toLowerCase() || '';
  
  if (summary.includes('performance') || summary.includes('load') || summary.includes('speed')) return 'Performance Testing';
  if (summary.includes('security') || summary.includes('vulnerability')) return 'Security Testing';
  if (summary.includes('integration') || summary.includes('api')) return 'Integration Testing';
  if (summary.includes('ui') || summary.includes('usability')) return 'UI Testing';
  if (issueType === 'bug') return 'Regression Testing';
  
  return 'Functional Testing';
}

function extractEnvironmentContext(ticket: any): string {
  const labels = ticket.fields?.labels?.join(' ').toLowerCase() || '';
  const summary = ticket.fields?.summary?.toLowerCase() || '';
  
  if (labels.includes('production') || summary.includes('prod')) return 'Production';
  if (labels.includes('staging') || summary.includes('staging')) return 'Staging';
  if (labels.includes('dev') || summary.includes('development')) return 'Development';
  
  return 'Multi-Environment';
}

function extractUserPersona(ticket: any): string {
  const summary = ticket.fields?.summary?.toLowerCase() || '';
  const description = ticket.fields?.description?.toLowerCase() || '';
  
  if (summary.includes('admin') || summary.includes('administrator')) return 'Admin Users';
  if (summary.includes('customer') || summary.includes('client')) return 'Customer Users';
  if (summary.includes('manager') || summary.includes('supervisor')) return 'Manager Users';
  if (summary.includes('guest') || summary.includes('anonymous')) return 'Guest Users';
  
  return 'General Users';
}

function extractComplianceFromTickets(tickets: any[]): string {
  const complianceItems = new Set<string>();
  
  tickets.forEach(ticket => {
    const text = `${ticket.fields?.summary || ''} ${ticket.fields?.description || ''}`.toLowerCase();
    
    if (text.includes('gdpr') || text.includes('data protection')) complianceItems.add('GDPR compliance');
    if (text.includes('security') || text.includes('encryption')) complianceItems.add('Security standards');
    if (text.includes('audit') || text.includes('logging')) complianceItems.add('Audit requirements');
    if (text.includes('access') || text.includes('permission')) complianceItems.add('Access control');
  });
  
  return Array.from(complianceItems).join(', ') || 'None explicitly identified';
}

function extractFeatureAreasFromTickets(tickets: any[]): string {
  const features = new Set<string>();
  
  tickets.forEach(ticket => {
    const summary = ticket.fields?.summary || '';
    features.add(summary.split(' ')[0]); // Take first word as feature indicator
  });
  
  return Array.from(features).slice(0, 10).join(', '); // Limit to 10 features
}

function extractKeyDocumentSections(content: string): string {
  if (!content) return 'No content available';
  
  // Extract headings or key phrases from document content
  const lines = content.split('\n').slice(0, 5); // First 5 lines
  return lines
    .filter(line => line.trim().length > 0)
    .map(line => line.substring(0, 50) + (line.length > 50 ? '...' : ''))
    .join(', ');
}

/**
 * Generate project-specific assistant responses based on user queries
 */
export async function generateAssistantResponse(
  project: Project,
  query: string,
  contextPath: string
): Promise<string> {
  try {
    // Determine project type based on name for enhanced context
    const projectType = getProjectTypeFromName(project.name);
    const projectContext = PROJECT_CONTEXTS[projectType] || null;
    
    // Determine page context based on path
    let pageContext = "";
    if (contextPath.includes("project-health")) {
      pageContext = "Project Health Dashboard - Viewing health metrics, indicators, and quality trends";
    } else if (contextPath.includes("assessments")) {
      pageContext = "Test Maturity Assessments - Evaluating testing maturity and planning improvements";
    } else if (contextPath.includes("test-management")) {
      pageContext = "Test Management - Managing test cases, suites, and execution";
    } else if (contextPath.includes("ai-insights")) {
      pageContext = "AI Insights - Analyzing testing data for patterns and recommendations";
    } else if (contextPath.includes("settings")) {
      pageContext = "Project Settings - Configuring project preferences and integrations";
    } else {
      pageContext = "General project overview and navigation";
    }
    
    // Get Jira and GitHub data if available
    let jiraContext = "";
    let githubContext = "";
    
    // Only attempt to fetch Jira data if project has Jira configured
    if (project.jiraUrl && project.jiraApiKey && project.jiraProjectId) {
      console.log(`Fetching Jira issues for project ${project.id} - ${project.name}`);
      try {
        const jiraIssues = await fetchJiraIssues(project);
        if (jiraIssues && jiraIssues.length > 0) {
          jiraContext = getJiraContextForAI(jiraIssues);
        } else {
          jiraContext = "Jira integration is configured, but no issues were found or available.";
        }
      } catch (error) {
        console.error("Error fetching Jira data for AI context:", error);
        jiraContext = "Error retrieving Jira data. Integration may need to be reconfigured.";
      }
    } else {
      jiraContext = "No Jira integration configured for this project.";
    }
    
    // Only attempt to fetch GitHub data if project has GitHub configured
    if (project.githubRepo && project.githubToken) {
      console.log(`Fetching GitHub data for project ${project.id} - ${project.name}`);
      try {
        const repoFiles = await fetchRepoFiles(project);
        const recentCommits = await fetchRecentCommits(project);
        
        // Get content of key files (e.g., README.md) if available
        const fileContents: Record<string, string> = {};
        // Skip file content fetching for now as we need to fix the function reference
        
        githubContext = getGitHubContextForAI(repoFiles || [], recentCommits, fileContents);
      } catch (error) {
        console.error("Error fetching GitHub data for AI context:", error);
        githubContext = "Error retrieving GitHub data. Integration may need to be reconfigured.";
      }
    } else {
      githubContext = "No GitHub integration configured for this project.";
    }
    
    // Construct prompt with enhanced context including Jira and GitHub data
    const prompt = `
      You are an AI testing assistant for the ATMosFera testing platform, helping with the "${project.name}" project.
      
      ${projectContext ? `Project Context:
      - Type: ${projectContext.type}
      - Focus: ${projectContext.focus}
      - Key Risks: ${projectContext.keyRisks.join(", ")}
      - Recommended Practices: ${projectContext.recommendedPractices.join(", ")}` : ""}
      
      Current Page Context: ${pageContext}
      
      ${jiraContext ? `\nJira Integration Data:\n${jiraContext}\n` : ""}
      
      ${githubContext ? `\nGitHub Integration Data:\n${githubContext}\n` : ""}
      
      User Query: ${query}
      
      Provide a helpful, concise response to assist the user with their testing needs.
      Focus on practical, actionable advice related to their query.
      If you reference integration data from Jira or GitHub, clearly indicate that in your response.
      If you don't have enough information, suggest what specific details would help you provide better guidance.
      Format your response using markdown for better readability. Use bullet points and bold formatting for key points.
    `;

    console.log(`Generating AI Assistant response for project ${project.id} - ${project.name}`);
    const response = await callOpenAI([
        { 
          role: "system", 
          content: "You are ATMosFera Assistant, an expert in test automation, quality engineering, and the Adaptive Testing Maturity Framework (ATMF). You provide concise, practical advice to help testing teams improve their processes and deliverables by leveraging their actual project data from integrations." 
        },
        { role: "user", content: prompt }
      ], {
      temperature: 0.7,
      max_tokens: 800
    });

    return response.choices[0].message.content || "I'm unable to provide a response at this time. Please try again.";
  } catch (error) {
    console.error("Error generating assistant response:", error);
    return "I apologize, but I'm currently experiencing difficulties. Please try again later.";
  }
}

/**
 * Generate contextual whisper mode suggestions based on user's current activity
 */
export async function generateWhisperSuggestions(
  project: Project,
  contextPath: string,
  contextData?: any
): Promise<{ suggestions: string[]; priority: "low" | "medium" | "high" }> {
  try {
    // Initialize promptContent variable that will be used throughout the function
    let promptContent: string = "";
    
    // Determine project type from the project name
    const projectType = getProjectTypeFromName(project.name);
    
    // Use the project context to enhance the suggestions
    const context = PROJECT_CONTEXTS[projectType] || PROJECT_CONTEXTS.general;
    
    // Format contextData if provided
    const contextDataStr = contextData 
      ? `\nContext data: ${JSON.stringify(contextData)}`
      : '';
    
    // Determine page context based on path
    let pageContext = "";
    let isTestExecutionPage = false;
    
    if (contextPath.includes("project-health")) {
      pageContext = "Project Health Dashboard - Viewing health metrics, indicators, and quality trends";
    } else if (contextPath.includes("assessments")) {
      pageContext = "Test Maturity Assessments - Evaluating testing maturity and planning improvements";
    } else if (contextPath.includes("test-execution")) {
      pageContext = "Test Execution - Executing test cases, recording results, and tracking test cycles";
      isTestExecutionPage = true;
    } else if (contextPath.includes("test-management")) {
      pageContext = "Test Management - Managing test cases, suites, and execution";
    } else if (contextPath.includes("ai-insights")) {
      pageContext = "AI Insights - Analyzing testing data for patterns and recommendations";
    } else if (contextPath.includes("settings")) {
      pageContext = "Project Settings - Configuring project preferences and integrations";
    } else {
      pageContext = "General project overview and navigation";
    }
    
    // Get Jira and GitHub data if available to enhance the whisper suggestions
    let jiraContext = "";
    let githubContext = "";
    
    // Track integration status for settings page and specialized suggestions
    let jiraConnectionStatus = "unknown";
    let githubConnectionStatus = "unknown";
    const isSettingsPage = contextPath.includes("settings");
    const isProjectsPage = contextPath.includes("projects");
    
    // Only attempt to fetch Jira data if project has Jira configured
    let jiraIssues = null;
    if (project.jiraUrl && project.jiraApiKey && project.jiraProjectId) {
      console.log(`Fetching Jira issues for whisper suggestions - project ${project.id} - ${project.name}`);
      try {
        jiraIssues = await fetchJiraIssues(project);
        if (jiraIssues && jiraIssues.length > 0) {
          // For whisper, we need a very condensed version of the Jira data
          const issueTypes = new Set(jiraIssues.map(issue => issue.fields.issuetype?.name || "Unknown"));
          const statuses = new Set(jiraIssues.map(issue => issue.fields.status?.name || "Unknown"));
          
          // For Whisper, we'll now provide much more detailed Jira data
          // We'll use the same formatting function we use for the assistant
          jiraContext = getJiraContextForAI(jiraIssues);
          jiraConnectionStatus = "working"; // Jira connection is working with data
          
          // Add summary information at the beginning
          jiraContext = `
          Jira Integration Summary:
          - ${jiraIssues.length} issues found
          - Issue types: ${Array.from(issueTypes).join(", ")}
          - Statuses: ${Array.from(statuses).join(", ")}
          
          ${jiraContext}`;
          
          // Extract feature types that might need test coverage
          if (jiraIssues.length > 0) {
            const featureTypes = Array.from(new Set(jiraIssues
              .filter(issue => issue.fields.issuetype?.name === 'Story' || issue.fields.issuetype?.name === 'Task')
              .map(issue => issue.key)))
              .slice(0, 5);
            
            if (featureTypes.length > 0) {
              const uncoveredFeatures = featureTypes.join(", ");
              jiraContext += `\n\nFeatures that may need test coverage: ${uncoveredFeatures}`;
            }
          }
        } else {
          jiraContext = "Jira integration configured, but no issues available.";
          jiraConnectionStatus = "no_data"; // Jira connection works but no data available
        }
      } catch (error) {
        console.error("Error fetching Jira data for whisper suggestions:", error);
        jiraContext = "Error retrieving Jira data.";
        jiraConnectionStatus = "error"; // Jira connection failed
      }
    } else {
      jiraConnectionStatus = "not_configured"; // Jira not configured
    }
    
    // Only attempt to fetch GitHub data if project has GitHub configured
    if (project.githubRepo && project.githubToken) {
      console.log(`Fetching GitHub data for whisper suggestions - project ${project.id} - ${project.name}`);
      try {
        const recentCommits = await fetchRecentCommits(project, 5);
        
        if (recentCommits && recentCommits.length > 0) {
          // For whisper, we just need a summary of recent activity
          githubContext = `
          GitHub Integration Summary:
          - ${recentCommits.length} recent commits
          - Latest commit: ${recentCommits[0].commit.message.substring(0, 50)}...
          - Most active files may need test coverage`;
          githubConnectionStatus = "working"; // GitHub connection is working with data
        } else {
          githubContext = "GitHub integration configured, but no recent commits found.";
          githubConnectionStatus = "no_data"; // GitHub connection works but no data available
        }
      } catch (error) {
        console.error("Error fetching GitHub data for whisper suggestions:", error);
        githubContext = "Error retrieving GitHub data.";
        githubConnectionStatus = "error"; // GitHub connection failed
      }
    } else {
      githubConnectionStatus = "not_configured"; // GitHub not configured
    }
    
    // Determine if we're on a page where integration data should influence suggestions
    const isIntegrationRelevant = contextPath.includes("test-management") || 
                                 contextPath.includes("test-execution") || 
                                 contextPath.includes("ai-insights") || 
                                 contextPath === "/";
    
    // For test execution page, add specific data-driven analysis based on the contextData
    let testExecutionContext = "";
    if (isTestExecutionPage && contextData) {
      // Extract test execution metrics from contextData
      try {
        // Cast contextData to proper type 
        const testExecutionData = contextData as {
          activeCycle?: { id: number; name: string; status: string } | null;
          statusCounts?: { passed: number; failed: number; blocked: number; skipped: number; 'not-run': number };
          completionPercentage?: number;
          totalTests?: number;
          completedTests?: number;
          highPriorityNotRun?: Array<{ id: number; title: string; priority: string }>;
          failedTests?: number;
        };
        
        // Construct detailed context with actual data for analysis
        if (testExecutionData && testExecutionData.statusCounts && testExecutionData.activeCycle) {
          const { statusCounts, completionPercentage, totalTests, highPriorityNotRun, failedTests } = testExecutionData;
          const cycle = testExecutionData.activeCycle;
          
          testExecutionContext = `
          Analyze the following ACTUAL TEST EXECUTION DATA for cycle "${cycle.name}" (status: ${cycle.status}):
          
          Current metrics:
          - Total tests: ${totalTests || 0}
          - Completion: ${completionPercentage || 0}% (${statusCounts.passed || 0} passed, ${statusCounts.failed || 0} failed, ${statusCounts.blocked || 0} blocked, ${statusCounts.skipped || 0} skipped, ${statusCounts['not-run'] || 0} not run)
          - Failed tests: ${failedTests || 0}
          
          High priority test cases not yet executed:
          ${highPriorityNotRun && highPriorityNotRun.length > 0 
            ? highPriorityNotRun.map(tc => `- ${tc.title} (ID: ${tc.id})`).join('\n') 
            : '- None'}
          
          Based on this ACTUAL DATA, provide specific, actionable suggestions:
          
          1. SPECIFICALLY identify which tests should be executed next (by name if available) based on priority and status
          2. Provide PRECISE analysis of the current pass/fail ratio (${statusCounts.passed || 0}/${statusCounts.failed || 0}) and what it indicates
          3. Comment on the test cycle progress (${completionPercentage || 0}%) and estimate remaining work
          4. If there are failed tests, suggest concrete next steps
          
          Your suggestions must be SPECIFIC to this data, with actual percentages, test names, and metrics.
          Don't just suggest users to analyze - YOU should provide the analysis based on real numbers.
          `;
        } else {
          testExecutionContext = `
          For the Test Execution page, analyze the available test data and provide specific insights.
          Since detailed metrics are not available, focus on general best practices for test execution
          but try to be as specific as possible with whatever data is available.
          Don't just suggest users to analyze - YOU should provide the analysis.
          `;
        }
      } catch (error) {
        console.error("Error processing test execution data:", error);
        testExecutionContext = `
        For the Test Execution page, analyze the available test data and provide specific insights.
        Focus on general best practices for test execution but try to be as specific as possible.
        Don't just suggest users to analyze - YOU should provide the analysis.
        `;
      }
    }
    
    // For Settings page, check integration status instead of using AI
    if (isSettingsPage) {
      // Generate specific suggestions based on integration status
      const suggestions: string[] = [];
      let priority: "low" | "medium" | "high" = "low";
      
      // Check Jira integration status
      if (jiraConnectionStatus === "working") {
        suggestions.push("Jira integration is working correctly.");
      } else if (jiraConnectionStatus === "error") {
        suggestions.push("Jira integration is failing. Check your credentials.");
        priority = "high";
      } else if (jiraConnectionStatus === "no_data") {
        suggestions.push("Jira integration is configured but not returning data.");
        priority = "medium";
      } else if (jiraConnectionStatus === "not_configured") {
        suggestions.push("Consider setting up Jira integration for better test tracking.");
      }
      
      // Check GitHub integration status
      if (githubConnectionStatus === "working") {
        suggestions.push("GitHub integration is working correctly.");
      } else if (githubConnectionStatus === "error") {
        suggestions.push("GitHub integration is failing. Check your access token.");
        priority = "high";
      } else if (githubConnectionStatus === "no_data") {
        suggestions.push("GitHub integration is configured but not returning data.");
        priority = "medium";
      } else if (githubConnectionStatus === "not_configured") {
        suggestions.push("Consider setting up GitHub integration for code analysis.");
      }
      
      // If both integrations are working, use a positive message with low priority
      if (jiraConnectionStatus === "working" && githubConnectionStatus === "working") {
        return {
          suggestions: ["All integrations are working correctly!"],
          priority: "low"
        };
      }
      
      return {
        suggestions,
        priority
      };
    }
    
    // For Projects page, add specialized logic about project organization
    else if (isProjectsPage) {
      // Generate project-specific suggestions
      const suggestions: string[] = [];
      let priority: "low" | "medium" | "high" = "medium";
      
      // Build a context-aware prompt for projects page
      promptContent = `
        You are providing whisper suggestions for someone on the Projects page of a test management platform.
        
        Current project count:
        - Active projects: ${contextData?.activeProjectsCount || 1}
        - Archived projects: ${contextData?.archivedProjectsCount || 0}
        - Inactive projects (not updated in 20+ days): ${contextData?.inactiveProjectsCount || 0}
        - Total projects: ${contextData?.totalProjects || 1}
        
        ${contextData?.inactiveProjectsCount > 0 ? `Inactive project names: ${JSON.stringify(contextData?.inactiveProjectNames || [])}` : ''}
        
        Generate 1-3 specific suggestions about project organization based on these guidelines:
        1. If there are more than 5 active projects, suggest archiving some
        2. If there are projects that haven't been updated in 20+ days, suggest archiving them specifically by name
        3. If there are 0-1 archived projects but several active ones, suggest using the archive feature for better organization
        4. Provide a positive message if project organization looks good (e.g., few active projects, all recently updated)
        
        Keep each suggestion under 80 characters.
        Format your response as JSON with "suggestions" array and "priority" field.
        Set "priority" to:
        - "low" for positive observations or minor suggestions
        - "medium" for useful suggestions that would improve organization
        - "high" for situations that need immediate attention (e.g., too many inactive projects)
      `;
      
      console.log(`Generating whisper suggestions for projects page`);
      const response = await callOpenAI([
          { 
            role: "system", 
            content: "You are ATMosFera WhisperMode, a non-intrusive assistant that provides short, timely contextual suggestions for project organization." 
          },
          { role: "user", content: promptContent as string }
        ], {
        temperature: 0.7,
        max_tokens: 200
      });
      
      // Process the response
      const responseContent = response.choices[0].message.content || '{"suggestions": ["Consider reviewing your project organization strategy."], "priority": "medium"}';
      
      try {
        const parsedResponse = JSON.parse(responseContent);
        return {
          suggestions: Array.isArray(parsedResponse.suggestions) ? parsedResponse.suggestions : ["Consider reviewing your project organization."],
          priority: ["low", "medium", "high"].includes(parsedResponse.priority) ? parsedResponse.priority : "medium"
        };
      } catch (parseError) {
        console.error("Error parsing projects whisper response:", parseError);
        return {
          suggestions: ["Consider reviewing your project organization strategy."],
          priority: "medium"
        };
      }
    }
    
    // For all other pages, use the standard prompt
    else {
      // Build a context-aware prompt
      promptContent = `
        You are providing quiet whisper suggestions for someone working on a "${project.name}" project (${context.type}) focused on ${context.focus}.
        
        Key risks in this type of project include: ${context.keyRisks.join(", ")}.
        Recommended practices include: ${context.recommendedPractices.join(", ")}.
        
        Current page context: ${pageContext}
        ${contextDataStr}
        ${testExecutionContext}
        
        ${isIntegrationRelevant && jiraContext ? `\n${jiraContext}\n` : ""}
        ${isIntegrationRelevant && githubContext ? `\n${githubContext}\n` : ""}
        
        Based on this context ${isIntegrationRelevant ? "and integration data" : ""}, provide 1-3 brief, helpful whisper suggestions that would be valuable for someone working on this page.
        These should be non-intrusive tips that appear in a small floating card.
        ${isIntegrationRelevant && jiraIssues && jiraIssues.length > 0 ? "Include a suggestion related to test coverage based on Jira issues." : ""}
        ${isTestExecutionPage ? "At least one suggestion should specifically relate to test execution priorities, progress analysis, or failed test follow-up." : ""}
        Keep each suggestion under 80 characters.
        Format your response as JSON with "suggestions" array and "priority" field (low, medium, high).
      `;
    }
    
    console.log(`Generating whisper suggestions for project ${project.id} - ${project.name}`);
    
    // Get OpenAI client and model from settings
    const openaiClient = await getOpenAIClient();
    const model = await getOpenAIModel();
    
    const response = await openaiClient.chat.completions.create({
      model,
      messages: [
        { 
          role: "system", 
          content: "You are ATMosFera WhisperMode, a non-intrusive assistant that provides short, timely, contextual suggestions for software testing activities based on real project data." 
        },
        { role: "user", content: promptContent as string }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" as const }
    });

    const responseContent = response.choices[0].message.content || '{"suggestions": ["Unable to generate suggestions"], "priority": "low"}';
    
    try {
      const parsedResponse = JSON.parse(responseContent);
      return {
        suggestions: Array.isArray(parsedResponse.suggestions) ? parsedResponse.suggestions : ["Unable to parse suggestions"],
        priority: ["low", "medium", "high"].includes(parsedResponse.priority) ? parsedResponse.priority : "low"
      };
    } catch (parseError) {
      console.error("Error parsing whisper response:", parseError);
      return {
        suggestions: ["Unable to parse suggestion response"],
        priority: "low"
      };
    }
  } catch (error) {
    console.error("Error generating whisper suggestions:", error);
    return {
      suggestions: ["Currently unable to provide suggestions"],
      priority: "low"
    };
  }
}

/**
 * Helper function to determine project type from name
 */
/**
 * Analyze document content and suggest tags and description
 */
export async function analyzeDocumentContent(
  content: string,
  fileName: string,
  fileType: string,
  projectType: string
): Promise<{
  suggestedTags: Array<{id: string, name: string, category: string}>,
  description: string
}> {
  try {
    // Prepare system prompt
    const systemPrompt = `
You are an AI assistant specialized in analyzing project documentation.
Based on the document content, extract key information and suggest relevant tags and a brief description.

The document is from a ${projectType || "software"} project.
File name: ${fileName}
File type: ${fileType}

Available tag categories and examples:
1. document_type: Requirements, Design, Architecture, API Specification, User Guide, System Requirements Spec
2. content_type: Workflows, Functions, System Elements, Data Model, UI Components, Algorithm
3. purpose: Usage, Implementation, Reference, Test Input, Specification, Guidelines

Your task is to:
1. Generate 3-7 relevant tags from the provided categories that best match the document's content
2. Write a concise description (2-3 sentences) summarizing what the document contains

Respond in this JSON format:
{
  "tags": [
    {"name": "tag name", "category": "document_type|content_type|purpose"},
    ...
  ],
  "description": "Document description here"
}
`;

    const response = await callOpenAI([
        { role: "system", content: systemPrompt },
        { role: "user", content: content.substring(0, 8000) } // Limit content to prevent token overflow
      ], {
      temperature: 0.3
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Format the response
    const suggestedTags = (result.tags || []).map((tag: { name: string; category: string }) => ({
      id: tag.name.toLowerCase().replace(/\s+/g, '_'),
      name: tag.name,
      category: tag.category
    }));
    
    return {
      suggestedTags,
      description: result.description || "No description generated."
    };
  } catch (error) {
    console.error("Error analyzing document content:", error);
    
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error("OpenAI API error message:", error.message);
      console.error("OpenAI API error stack:", error.stack);
    }
    
    return {
      suggestedTags: [],
      description: "Failed to analyze document content."
    };
  }
}

function getProjectTypeFromName(projectName: string): string {
  const name = projectName.toLowerCase();
  
  if (name.includes("iot") || name.includes("device") || name.includes("embedded")) {
    return "iot";
  } else if (name.includes("e-commerce") || name.includes("ecommerce") || name.includes("retail") || name.includes("shop")) {
    return "ecommerce";
  } else if (name.includes("bank") || name.includes("finance") || name.includes("payment")) {
    return "banking";
  } else if (name.includes("health") || name.includes("medical") || name.includes("care")) {
    return "healthcare";
  } else if (name.includes("cloud") || name.includes("infrastructure") || name.includes("platform")) {
    return "cloud";
  }
  
  return "general";
}

/**
 * Generate document based on project data, Jira issues, and GitHub repo
 * The function intelligently filters data sources based on document type
 * - For PRD and SRS: Prioritizes Jira issues for high-level requirements
 * - For SDDS and technical docs: Prioritizes GitHub code for technical details
 */
export async function generateDocument(
  project: Project,
  documentType: string,
  customPrompt?: string
): Promise<{
  title: string;
  content: string;
  description: string;
}> {
  try {
    // Fetch data intelligently based on document type
    let jiraIssues: any[] = [];
    let githubData: any = null;
    let testCasesData: any[] = [];
    
    // Determine which data sources to prioritize based on document type
    const needsJiraData = ['PRD', 'SRS', 'Trace Matrix', 'Test Plan'].includes(documentType);
    const needsGitHubData = ['SDDS', 'Trace Matrix'].includes(documentType);
    const needsTestData = ['Test Plan', 'Test Report', 'Trace Matrix'].includes(documentType);
    
    // Fetch Jira data for high-level requirements when needed
    if (needsJiraData && project.jiraUrl && project.jiraProjectId && project.jiraApiKey) {
      console.log(`Fetching Jira data for ${documentType} generation...`);
      const issues = await fetchJiraIssues(project);
      if (issues) {
        jiraIssues = issues;
        console.log(`Retrieved ${jiraIssues.length} issues from Jira for document generation`);
      }
    }
    
    // Fetch GitHub data for technical details when needed
    if (needsGitHubData && project.githubRepo && project.githubToken) {
      console.log(`Fetching GitHub data for ${documentType} generation...`);
      try {
        const [owner, repo] = project.githubRepo.split('/');
        
        if (owner && repo) {
          const files = await fetchRepoFiles(project);
          const commits = await fetchRecentCommits(project);
          
          githubData = {
            files: files || [],
            commits: commits || [],
            repoName: `${owner}/${repo}`
          };
          
          // For technical design documents, try to fetch some key file contents
          if (documentType === 'SDDS') {
            console.log("Fetching key file contents for SDDS document...");
            const fileContentPromises: Promise<string | null>[] = [];
            
            // Look for key technical files to include in SDDS
            const keyFiles = (files || []).filter((file: any) => (
              file.name?.includes('README') || 
              file.name?.endsWith('.md') ||
              file.name?.includes('config') ||
              file.name?.includes('schema') ||
              file.name?.includes('architecture')
            ));
            
            // Fetch content for up to 3 key files
            for (let i = 0; i < Math.min(3, keyFiles.length); i++) {
              fileContentPromises.push(fetchFileContent(project, keyFiles[i].path));
            }
            
            const fileContents = await Promise.all(fileContentPromises);
            githubData.fileContents = fileContents.filter(Boolean);
          }
        }
      } catch (err) {
        const error = err as Error;
        console.error("Error fetching GitHub data for document generation:", error.message);
      }
    }
    
    // Generate title and description based on document type
    let title = "";
    let description = "";
    let prompt = customPrompt || "";
    
    // If no custom prompt, generate appropriate prompt based on document type
    if (!prompt) {
      switch (documentType) {
        case "PRD":
          title = `Product Requirements Document - ${project.name}`;
          description = `Comprehensive product requirements document for ${project.name}`;
          prompt = `Create a comprehensive Product Requirements Document (PRD) for the project "${project.name}".
          ${project.description ? `Project description: ${project.description}` : ''}
          ${project.projectType ? `Project type: ${project.projectType}` : ''}
          ${project.industryArea ? `Industry: ${project.industryArea}` : ''}
          ${project.regulations ? `Applicable regulations: ${project.regulations}` : ''}
          ${project.additionalContext ? `Additional context: ${project.additionalContext}` : ''}
          ${project.testStrategy ? `Testing strategy: ${project.testStrategy}` : ''}
          
          ${jiraIssues.length > 0 ? `Please analyze these Jira issues to extract requirements: 
          ${jiraIssues.slice(0, 20).map(i => `* ${i.key}: ${i.fields.summary}`).join('\n')}` : ''}
          
          The PRD should include:
          1. Introduction and project overview
          2. Target audience/users
          3. User stories and use cases
          4. Functional requirements (extracted from Jira issues where available)
          5. Non-functional requirements
          6. Technical requirements
          7. Dependencies
          8. Success metrics
          
          Format the document in markdown for readability.`;
          break;
          
        case "SRS":
          title = `Software Requirements Specification - ${project.name}`;
          description = `Technical software requirements specification for ${project.name}`;
          prompt = `Create a detailed Software Requirements Specification (SRS) for the project "${project.name}".
          ${project.description ? `Project description: ${project.description}` : ''}
          ${project.projectType ? `Project type: ${project.projectType}` : ''}
          ${project.industryArea ? `Industry: ${project.industryArea}` : ''}
          ${project.qualityFocus ? `Quality focus: ${project.qualityFocus}` : ''}
          ${project.testStrategy ? `Testing strategy: ${project.testStrategy}` : ''}
          
          ${jiraIssues.length > 0 ? `Please analyze these Jira issues as a basis for requirements: 
          ${jiraIssues.slice(0, 20).map(i => `* ${i.key}: ${i.fields.summary}${i.fields.description ? ' - ' + i.fields.description.substring(0, 100) + '...' : ''}`).join('\n')}` : ''}
          
          The SRS should include:
          1. Introduction
          2. Overall description
          3. System features
          4. External interface requirements
          5. Detailed requirements (functional, non-functional, constraints)
          6. Database requirements
          7. Security requirements
          
          Format the document in markdown for readability.`;
          break;
          
        case "SDDS":
          title = `Software Design Document - ${project.name}`;
          description = `Software architecture and design document for ${project.name}`;
          prompt = `Create a comprehensive Software Design Document (SDDS) for the project "${project.name}".
          ${project.description ? `Project description: ${project.description}` : ''}
          ${project.projectType ? `Project type: ${project.projectType}` : ''}
          ${project.testStrategy ? `Testing strategy: ${project.testStrategy}` : ''}
          
          ${githubData ? `Based on the GitHub repository ${githubData.repoName}, please analyze:
          - Repository structure: ${JSON.stringify(githubData.files?.slice(0, 15).map((f: { name: string; type: string; path: string }) => ({ name: f.name, type: f.type, path: f.path })) || [])}
          - Recent commits: ${JSON.stringify(githubData.commits?.slice(0, 5).map((c: { commit: { message: string } }) => ({ message: c.commit.message })) || [])}
          ${githubData.fileContents?.length ? `
          - Key file contents:\n${githubData.fileContents.map((content: string | undefined, i: number) => `File ${i+1}:\n${content?.substring(0, 500)}...\n`).join('\n')}` : ''}
          ` : ''}
          
          The SDDS should include:
          1. Introduction and system overview
          2. Architecture description
          3. Component design (based on GitHub repository structure)
          4. Data models
          5. Interface specifications
          6. Dependencies and external systems
          7. Technology stack (inferred from repository)
          8. Security design considerations
          
          Format the document in markdown for readability.`;
          break;
          
        case "Trace Matrix":
          title = `Traceability Matrix - ${project.name}`;
          description = `Requirements to test cases traceability matrix for ${project.name}`;
          prompt = `Create a traceability matrix document for the project "${project.name}".
          ${project.description ? `Project description: ${project.description}` : ''}
          
          ${jiraIssues.length > 0 ? `Requirements from Jira: 
          ${jiraIssues.slice(0, 15).map(i => `* ${i.key}: ${i.fields.summary}`).join('\n')}` : ''}
          
          ${testCasesData.length > 0 ? `Test cases: 
          ${testCasesData.slice(0, 15).map(tc => `* TC-${tc.id}: ${tc.title}`).join('\n')}` : ''}
          
          The traceability matrix document should include:
          1. Introduction
          2. Requirements overview
          3. Test case overview
          4. Traceability matrix (mapping requirements to test cases)
          5. Coverage analysis
          6. Gaps and recommendations
          
          Format the document in markdown with tables for readability.`;
          break;
          
        case "Test Plan":
          title = `Test Plan - ${project.name}`;
          description = `Comprehensive test plan for ${project.name}`;
          prompt = `Create a detailed Test Plan for the project "${project.name}".
          ${project.description ? `Project description: ${project.description}` : ''}
          ${project.projectType ? `Project type: ${project.projectType}` : ''}
          ${project.qualityFocus ? `Quality focus: ${project.qualityFocus}` : ''}
          ${project.testStrategy ? `Testing strategy: ${project.testStrategy}` : ''}
          
          ${jiraIssues.length > 0 ? `Key features to test (from Jira): 
          ${jiraIssues.slice(0, 10).map(i => `* ${i.key}: ${i.fields.summary}`).join('\n')}` : ''}
          
          The test plan should include:
          1. Introduction
          2. Test strategy
          3. Test scope
          4. Test environment
          5. Test schedule
          6. Test deliverables
          7. Testing tools
          8. Risks and mitigation
          
          Format the document in markdown for readability.`;
          break;
          
        case "Test Report":
          title = `Test Execution Report - ${project.name}`;
          description = `Test execution results and metrics for ${project.name}`;
          prompt = `Create a detailed Test Execution Report for the project "${project.name}".
          ${project.description ? `Project description: ${project.description}` : ''}
          
          ${testCasesData.length > 0 ? `Test execution summary:
          - Total test cases: ${testCasesData.length}
          - Status breakdown: ${JSON.stringify(
            testCasesData.reduce((acc, tc) => {
              acc[tc.status] = (acc[tc.status] || 0) + 1;
              return acc;
            }, {})
          )}` : ''}
          
          The test report should include:
          1. Executive summary
          2. Test scope
          3. Test execution summary
          4. Test results
          5. Defect analysis
          6. Recommendations
          7. Conclusions
          
          Format the document in markdown with tables for readability.`;
          break;
          
        default:
          title = `${documentType} - ${project.name}`;
          description = `${documentType} for ${project.name}`;
          prompt = `Create a detailed ${documentType} for the project "${project.name}".
          ${project.description ? `Project description: ${project.description}` : ''}`;
      }
    }
    
    // Call Anthropic to generate document content (using Claude for better document generation)
    console.log(`Generating ${documentType} document using Anthropic Claude...`);
    
    const systemPrompt = `You are an expert documentation generator specializing in software development documentation. 
    Generate content in markdown format that is detailed, professional, and ready for use in a software project.
    Focus on producing high-quality, actionable content that provides real value.`;
    
    const response = await callAnthropic([
      {
        role: "user",
        content: prompt
      }
    ], systemPrompt, { max_tokens: 4000, temperature: 0.7 });
    
    let content = "Error generating document content.";
    
    // Extract content from Anthropic response
    if (response && response.content && response.content.length > 0) {
      // The content field is an array of content blocks
      // Each block has a type field that could be 'text' or other types
      const textBlock = response.content.find(block => block.type === 'text');
      if (textBlock && 'text' in textBlock) {
        content = textBlock.text;
      }
    }
    
    return {
      title,
      content,
      description
    };
  } catch (error: unknown) {
    console.error("Error generating document:", error);
    throw new Error(
      error instanceof Error 
        ? `Failed to generate document: ${error.message}` 
        : "Failed to generate document due to an unknown error"
    );
  }
}