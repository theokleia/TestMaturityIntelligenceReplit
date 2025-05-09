/**
 * Jira Integration Service
 * Provides functionality to interact with Jira API using the stored credentials
 */

import fetch from 'node-fetch';
import { Project } from '@shared/schema';

// Define types for Jira API responses
interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: string;
    issuetype: {
      name: string;
    };
    status: {
      name: string;
    };
    priority?: {
      name: string;
    };
    [key: string]: any; // Allow for flexible fields
  };
}

interface JiraResponse {
  issues: JiraIssue[];
  total: number;
  maxResults: number;
  startAt: number;
}

/**
 * Fetch issues from Jira based on JQL query
 */
export async function fetchJiraIssues(project: Project): Promise<JiraIssue[] | null> {
  // Verify that the project has the necessary Jira configuration
  if (!project.jiraUrl || !project.jiraProjectId || !project.jiraApiKey) {
    console.warn("Jira integration is not fully configured for project:", project.id);
    return null;
  }

  try {
    // Use the configured JQL or create a default one
    const jql = project.jiraJql || `project = ${project.jiraProjectId}`;
    
    // Ensure the URL has the right format and includes the API endpoint
    const baseUrl = project.jiraUrl.endsWith('/') ? project.jiraUrl : `${project.jiraUrl}/`;
    const apiUrl = `${baseUrl}rest/api/3/search`;

    // Create the request URL with query parameters
    const url = new URL(apiUrl);
    url.searchParams.append('jql', jql);
    url.searchParams.append('maxResults', '50'); // Adjust as needed
    url.searchParams.append('fields', 'summary,description,issuetype,status,priority,components,labels');

    // Make the API call with appropriate authentication
    // For Jira Cloud API v3, we need to use Basic authentication with an API token
    
    // Try different authentication methods to be flexible with user input
    let authHeader = '';
    let email = '';
    let apiToken = '';
    
    console.log("Attempting to connect to Jira with API key...");
    
    if (project.jiraApiKey.includes(':')) {
      // Parse email:token format
      [email, apiToken] = project.jiraApiKey.split(':');
      console.log(`Using Basic auth with email: ${email}`);
      authHeader = 'Basic ' + Buffer.from(`${email}:${apiToken}`).toString('base64');
    } else if (project.jiraApiKey.includes('@')) {
      // Looks like just an email was provided
      console.error('API key appears to be just an email. Format should be email:token');
      // Fall back to Bearer as a last resort
      authHeader = `Bearer ${project.jiraApiKey}`;
    } else {
      // Assume it's just a token with no email
      console.log('API key format does not include email. Attempting with token only.');
      // For Jira, when only token is provided, try Bearer auth first
      authHeader = `Bearer ${project.jiraApiKey}`;
    }
    
    console.log(`Using auth method: ${authHeader.startsWith('Basic') ? 'Basic' : 'Bearer'}`);
    
    const headers: Record<string, string> = {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Sometimes Jira requires these additional headers
    if (email) {
      headers['X-Atlassian-Token'] = 'no-check';
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Jira API error (${response.status}):`, errorData);
      return null;
    }

    const data = await response.json() as JiraResponse;
    return data.issues;
  } catch (error) {
    console.error("Error fetching Jira issues:", error);
    return null;
  }
}

/**
 * Extract project coverage metrics based on Jira issues
 */
export function analyzeJiraCoverage(issues: JiraIssue[]): {
  totalIssues: number;
  coveredFeatures: string[];
  uncoveredFeatures: string[];
  coverageByType: Record<string, { total: number; covered: number }>;
} {
  // This is a simplified implementation
  // In a real scenario, you would compare issues against existing test cases
  
  const result = {
    totalIssues: issues.length,
    coveredFeatures: [] as string[],
    uncoveredFeatures: [] as string[],
    coverageByType: {} as Record<string, { total: number; covered: number }>
  };

  // For demo purposes, consider 30% of features as covered, 70% as uncovered
  // In a real implementation, this would check against actual test case coverage
  issues.forEach((issue, index) => {
    const issueType = issue.fields.issuetype?.name || 'Unknown';
    
    // Initialize type coverage if not exists
    if (!result.coverageByType[issueType]) {
      result.coverageByType[issueType] = { 
        total: 0, 
        covered: 0 
      };
    }
    
    result.coverageByType[issueType].total++;
    
    // Mock coverage status (in a real app, would check against test cases)
    const featureKey = `${issue.key}: ${issue.fields.summary}`;
    if (index % 3 === 0) { // Simulating 1/3 coverage
      result.coveredFeatures.push(featureKey);
      result.coverageByType[issueType].covered++;
    } else {
      result.uncoveredFeatures.push(featureKey);
    }
  });

  return result;
}

/**
 * Process Jira issues to extract key information for AI prompt enhancement
 */
 
// Helper function to safely extract description text from Jira issues
// Jira Cloud API v3 can return descriptions as objects with content structure instead of strings
function safelyExtractDescription(description: any): string {
  if (!description) {
    return 'No description';
  }
  
  // Handle string descriptions (older API or simple cases)
  if (typeof description === 'string') {
    return description.substring(0, 300) + (description.length > 300 ? '...' : '');
  }
  
  // Handle Atlassian Document Format (ADF) - common in Cloud API v3
  try {
    // If it has content array (Atlassian Document Format)
    if (description.content && Array.isArray(description.content)) {
      // Try to extract paragraphs 
      const textParts: string[] = [];
      
      description.content.forEach((block: any) => {
        if (block.content && Array.isArray(block.content)) {
          block.content.forEach((textBlock: any) => {
            if (textBlock.text) {
              textParts.push(textBlock.text);
            }
          });
        } else if (block.text) {
          textParts.push(block.text);
        }
      });
      
      const extractedText = textParts.join(' ');
      if (extractedText) {
        return extractedText.substring(0, 300) + (extractedText.length > 300 ? '...' : '');
      }
    }
    
    // Fallback for other formats: just indicate there's content
    return 'Rich text description available (unable to display in this format)';
  } catch (error) {
    console.error('Error extracting Jira description:', error);
    return 'Description available but in unknown format';
  }
}

export function getJiraContextForAI(issues: JiraIssue[]): string {
  if (!issues || issues.length === 0) {
    return "No Jira issues available.";
  }

  // Extract key details from issues to enhance AI prompt
  const issuesSummary = issues.map(issue => {
    try {
      return `
Issue: ${issue.key}
Type: ${issue.fields.issuetype?.name || 'Unknown'}
Summary: ${issue.fields.summary || 'No summary'}
Status: ${issue.fields.status?.name || 'Unknown'}
Priority: ${issue.fields.priority?.name || 'Not set'}
Description: ${safelyExtractDescription(issue.fields.description)}
---`;
    } catch (error) {
      console.error(`Error formatting issue ${issue.key}:`, error);
      return `
Issue: ${issue.key}
Error: Could not process this issue's data
---`;
    }
  }).join("\n");

  return `Available Jira Issues:\n${issuesSummary}`;
}