/**
 * Jira Integration Service
 * Provides functionality to interact with Jira API using the stored credentials
 */

import fetch from 'node-fetch';
import { Project } from '@shared/schema';

// Define types for Jira API responses
interface JiraField {
  id?: string;
  key?: string;
  name?: string;
  summary?: string;
  fields?: any;
  [key: string]: any;
}

interface JiraIssueLink {
  id?: string;
  type?: {
    id?: string;
    name?: string;
    inward?: string;
    outward?: string;
  };
  inwardIssue?: JiraField;
  outwardIssue?: JiraField;
}

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: any; // Can be string or rich object
    issuetype: {
      name: string;
    };
    status: {
      name: string;
    };
    priority?: {
      name: string;
    };
    parent?: JiraField;
    subtasks?: JiraField[];
    issuelinks?: JiraIssueLink[];
    components?: Array<{ name: string }>;
    labels?: string[];
    [key: string]: any; // Allow for other flexible fields
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
    url.searchParams.append('fields', 'summary,description,issuetype,status,priority,components,labels,parent,subtasks,issuelinks');

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
    return description;
  }
  
  // Handle Atlassian Document Format (ADF) - common in Cloud API v3
  try {
    // If it has content array (Atlassian Document Format)
    if (description.content && Array.isArray(description.content)) {
      // Try to extract paragraphs with improved structure
      const extractedParts: string[] = [];
      
      // Process each top-level block
      description.content.forEach((block: any) => {
        // Handle headings with appropriate formatting
        if (block.type === 'heading') {
          const level = block.attrs?.level || 1;
          const headingText = extractTextFromContentArray(block.content);
          if (headingText) {
            extractedParts.push(`${'#'.repeat(level)} ${headingText}`);
          }
        }
        // Handle paragraphs
        else if (block.type === 'paragraph') {
          const paragraphText = extractTextFromContentArray(block.content);
          if (paragraphText) {
            extractedParts.push(paragraphText);
          }
        }
        // Handle bullet lists
        else if (block.type === 'bulletList' && block.content) {
          block.content.forEach((listItem: any) => {
            if (listItem.type === 'listItem' && listItem.content) {
              listItem.content.forEach((itemContent: any) => {
                const bulletText = extractTextFromContentArray(itemContent.content);
                if (bulletText) {
                  extractedParts.push(`- ${bulletText}`);
                }
              });
            }
          });
        }
        // Handle code blocks
        else if (block.type === 'codeBlock') {
          const codeText = extractTextFromContentArray(block.content);
          if (codeText) {
            extractedParts.push(`\`\`\`\n${codeText}\n\`\`\``);
          }
        }
        // Fallback for other block types
        else {
          const text = extractTextFromContentArray(block.content);
          if (text) {
            extractedParts.push(text);
          }
        }
      });
      
      return extractedParts.join('\n\n');
    }
    
    // Fallback for other formats: just indicate there's content
    return 'Rich text description available (unable to display in this format)';
  } catch (error) {
    console.error('Error extracting Jira description:', error);
    return 'Description available but in unknown format';
  }
}

// Helper function to extract text from content arrays
function extractTextFromContentArray(contentArray: any[]): string {
  if (!contentArray || !Array.isArray(contentArray)) {
    return '';
  }
  
  const textParts: string[] = [];
  
  contentArray.forEach((item: any) => {
    // Direct text nodes
    if (item.text) {
      // Apply formatting if available
      let formattedText = item.text;
      
      // Handle basic formatting marks
      if (item.marks && Array.isArray(item.marks)) {
        item.marks.forEach((mark: any) => {
          if (mark.type === 'strong') {
            formattedText = `**${formattedText}**`;
          } else if (mark.type === 'em') {
            formattedText = `*${formattedText}*`;
          } else if (mark.type === 'code') {
            formattedText = `\`${formattedText}\``;
          }
        });
      }
      
      textParts.push(formattedText);
    }
    // Nested content
    else if (item.content && Array.isArray(item.content)) {
      textParts.push(extractTextFromContentArray(item.content));
    }
  });
  
  return textParts.join(' ');
}

// Function to get parent information if available
function getParentInfo(issue: JiraIssue): string {
  if (!issue.fields.parent) {
    return '';
  }
  
  try {
    return `Parent: ${issue.fields.parent.key || ''} - ${issue.fields.parent.fields?.summary || 'No summary'}\n`;
  } catch (error) {
    console.error(`Error extracting parent info for ${issue.key}:`, error);
    return '';
  }
}

// Function to get subtasks if available
function getSubtasksInfo(issue: JiraIssue): string {
  if (!issue.fields.subtasks || issue.fields.subtasks.length === 0) {
    return '';
  }
  
  try {
    const subtasks = issue.fields.subtasks.map((subtask: JiraField) => 
      `  - ${subtask.key || ''} - ${subtask.fields?.summary || 'No summary'}`
    ).join('\n');
    
    return `Subtasks:\n${subtasks}\n`;
  } catch (error) {
    console.error(`Error extracting subtasks info for ${issue.key}:`, error);
    return '';
  }
}

// Function to get linked issues if available
function getLinkedIssuesInfo(issue: JiraIssue): string {
  if (!issue.fields.issuelinks || issue.fields.issuelinks.length === 0) {
    return '';
  }
  
  try {
    const links = issue.fields.issuelinks.map((link: JiraIssueLink) => {
      // Linked issues can be inward or outward
      const linkedIssue = link.inwardIssue || link.outwardIssue;
      const linkType = link.type?.name || 'Link';
      const direction = link.inwardIssue ? 'inward' : 'outward';
      
      if (linkedIssue) {
        return `  - ${linkType} (${direction}): ${linkedIssue.key} - ${linkedIssue.fields?.summary || 'No summary'}`;
      }
      return null;
    })
    .filter(Boolean) // Remove nulls
    .join('\n');
    
    return links ? `Linked Issues:\n${links}\n` : '';
  } catch (error) {
    console.error(`Error extracting linked issues info for ${issue.key}:`, error);
    return '';
  }
}

export function getJiraContextForAI(issues: JiraIssue[]): string {
  if (!issues || issues.length === 0) {
    return "No Jira issues available.";
  }

  // Extract key details from issues to enhance AI prompt
  const issuesSummary = issues.map(issue => {
    try {
      // Check if issue and required fields exist
      if (!issue || !issue.key || !issue.fields) {
        console.error(`Invalid issue data:`, issue);
        return `
Issue: Unknown
Error: Invalid issue data structure
---`;
      }
      
      // Get all the issue information including relationships
      return `
Issue: ${issue.key}
Type: ${issue.fields.issuetype?.name || 'Unknown'}
Summary: ${issue.fields.summary || 'No summary'}
Status: ${issue.fields.status?.name || 'Unknown'}
Priority: ${issue.fields.priority?.name || 'Not set'}
${getParentInfo(issue)}Description: ${safelyExtractDescription(issue.fields.description)}
${getSubtasksInfo(issue)}${getLinkedIssuesInfo(issue)}---`;
    } catch (error) {
      console.error(`Error formatting issue ${issue?.key || 'undefined'}:`, error);
      return `
Issue: ${issue?.key || 'Unknown'}
Error: Could not process this issue's data
---`;
    }
  }).join("\n");

  return `Available Jira Issues:\n${issuesSummary}`;
}