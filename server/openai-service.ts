import OpenAI from "openai";
import { Project } from "@shared/schema";
import { fetchJiraIssues, getJiraContextForAI } from "./services/jira-service";
import { fetchRepoFiles, fetchRecentCommits, getGitHubContextForAI } from "./services/github-service";

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

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

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an expert testing consultant specializing in the Adaptive Testing Maturity Framework (ATMF)." },
        { role: "user", content: prompt }
      ],
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

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an expert testing consultant specializing in the Adaptive Testing Maturity Framework (ATMF)." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: "json_object" }
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

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an expert testing consultant specializing in the Adaptive Testing Maturity Framework (ATMF)." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
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

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an expert testing consultant specializing in the Adaptive Testing Maturity Framework (ATMF)." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
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

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an expert testing consultant specializing in test automation optimization." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
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

    const prompt = `
      Generate detailed test cases for the following feature:
      
      Feature: ${feature}
      Requirements: ${requirements}
      Complexity: ${complexity}${jiraContext}
      
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
      ${jiraInfo?.jiraJql ? 'Incorporate specific details from Jira issues matching the JQL query to make the test cases more relevant and aligned with actual project requirements.' : ''}
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an expert test engineer specializing in test case design and automation." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
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

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an expert testing consultant specializing in test strategy development." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: "json_object" }
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
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are ATMosFera Assistant, an expert in test automation, quality engineering, and the Adaptive Testing Maturity Framework (ATMF). You provide concise, practical advice to help testing teams improve their processes and deliverables by leveraging their actual project data from integrations." 
        },
        { role: "user", content: prompt }
      ],
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
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { 
            role: "system", 
            content: "You are ATMosFera WhisperMode, a non-intrusive assistant that provides short, timely contextual suggestions for project organization." 
          },
          { role: "user", content: promptContent as string }
        ],
        temperature: 0.7,
        max_tokens: 200,
        response_format: { type: "json_object" }
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
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are ATMosFera WhisperMode, a non-intrusive assistant that provides short, timely, contextual suggestions for software testing activities based on real project data." 
        },
        { role: "user", content: promptContent as string }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
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

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content.substring(0, 8000) } // Limit content to prevent token overflow
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Format the response
    const suggestedTags = (result.tags || []).map((tag: any) => ({
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