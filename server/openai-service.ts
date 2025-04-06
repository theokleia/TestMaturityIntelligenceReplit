import OpenAI from "openai";

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
  complexity: string
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
    const prompt = `
      Generate detailed test cases for the following feature:
      
      Feature: ${feature}
      Requirements: ${requirements}
      Complexity: ${complexity}
      
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
  projectName: string,
  query: string,
  contextPath: string
): Promise<string> {
  try {
    // Determine project type based on name for enhanced context
    const projectType = getProjectTypeFromName(projectName);
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
    } else {
      pageContext = "General project overview and navigation";
    }
    
    // Construct prompt with enhanced context
    const prompt = `
      You are an AI testing assistant for the ATMosFera testing platform, helping with the "${projectName}" project.
      
      ${projectContext ? `Project Context:
      - Type: ${projectContext.type}
      - Focus: ${projectContext.focus}
      - Key Risks: ${projectContext.keyRisks.join(", ")}
      - Recommended Practices: ${projectContext.recommendedPractices.join(", ")}` : ""}
      
      Current Page Context: ${pageContext}
      
      User Query: ${query}
      
      Provide a helpful, concise response to assist the user with their testing needs.
      Focus on practical, actionable advice related to their query.
      If you don't have enough information, suggest what specific details would help you provide better guidance.
      Format your response using markdown for better readability. Use bullet points and bold formatting for key points.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are ATMosFera Assistant, an expert in test automation, quality engineering, and the Adaptive Testing Maturity Framework (ATMF). You provide concise, practical advice to help testing teams improve their processes and deliverables." 
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
 * Helper function to determine project type from name
 */
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