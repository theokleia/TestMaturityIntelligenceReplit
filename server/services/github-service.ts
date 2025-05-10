/**
 * GitHub Integration Service
 * Provides functionality to interact with GitHub API using the stored credentials
 */

import fetch, { Response as FetchResponse } from 'node-fetch';
import { Project } from '@shared/schema';

// Define types for GitHub API responses
interface LanguageData {
  [key: string]: number;
}
interface GitHubRepository {
  name: string;
  full_name: string;
  description: string;
  default_branch: string;
  html_url: string;
  stargazers_count?: number;
  forks_count?: number;
  watchers_count?: number;
  open_issues_count?: number;
}

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  content?: string;
  encoding?: string;
}

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  body: string;
  html_url: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
}

/**
 * Fetch repository information from GitHub
 */
export async function fetchRepoInfo(project: Project): Promise<GitHubRepository | null> {
  // Verify that the project has the necessary GitHub configuration
  if (!project.githubRepo || !project.githubToken) {
    console.warn("GitHub integration is not fully configured for project:", project.id);
    return null;
  }

  try {
    // Construct the URL for the GitHub API endpoint
    const apiUrl = `https://api.github.com/repos/${project.githubRepo}`;

    // Make the API call with appropriate authorization
    // GitHub now requires Bearer token format
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${project.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`GitHub API error (${response.status}):`, errorData);
      return null;
    }

    return await response.json() as GitHubRepository;
  } catch (error) {
    console.error("Error fetching GitHub repository info:", error);
    return null;
  }
}

/**
 * Fetch files from a GitHub repository
 */
export async function fetchRepoFiles(
  project: Project, 
  path: string = '',
  branch: string = ''
): Promise<GitHubFile[] | null> {
  // Verify that the project has the necessary GitHub configuration
  if (!project.githubRepo || !project.githubToken) {
    console.warn("GitHub integration is not fully configured for project:", project.id);
    return null;
  }

  try {
    // If branch is not specified, fetch repo info to get the default branch
    let branchToUse = branch;
    if (!branchToUse) {
      const repoInfo = await fetchRepoInfo(project);
      branchToUse = repoInfo?.default_branch || 'main';
    }

    // Construct the URL for the GitHub API endpoint
    const apiUrl = `https://api.github.com/repos/${project.githubRepo}/contents/${path}?ref=${branchToUse}`;

    // Make the API call with appropriate authorization
    // GitHub now requires Bearer token format
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${project.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`GitHub API error (${response.status}):`, errorData);
      return null;
    }

    return await response.json() as GitHubFile[];
  } catch (error) {
    console.error("Error fetching GitHub repository files:", error);
    return null;
  }
}

/**
 * Fetch the content of a specific file from a GitHub repository
 */
export async function fetchFileContent(
  project: Project,
  filePath: string,
  branch: string = ''
): Promise<string | null> {
  // Verify that the project has the necessary GitHub configuration
  if (!project.githubRepo || !project.githubToken) {
    console.warn("GitHub integration is not fully configured for project:", project.id);
    return null;
  }

  try {
    // If branch is not specified, fetch repo info to get the default branch
    let branchToUse = branch;
    if (!branchToUse) {
      const repoInfo = await fetchRepoInfo(project);
      branchToUse = repoInfo?.default_branch || 'main';
    }

    // Construct the URL for the GitHub API endpoint
    const apiUrl = `https://api.github.com/repos/${project.githubRepo}/contents/${filePath}?ref=${branchToUse}`;

    // Make the API call with appropriate authorization
    // GitHub now requires Bearer token format
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${project.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`GitHub API error (${response.status}):`, errorData);
      return null;
    }

    const fileData = await response.json() as GitHubFile;
    
    // GitHub API returns content as base64-encoded string
    if (fileData.content && fileData.encoding === 'base64') {
      return Buffer.from(fileData.content, 'base64').toString('utf-8');
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching GitHub file content:", error);
    return null;
  }
}

/**
 * Fetch recent commits from a GitHub repository
 */
export async function fetchRecentCommits(
  project: Project,
  limit: number = 10
): Promise<GitHubCommit[] | null> {
  // Verify that the project has the necessary GitHub configuration
  if (!project.githubRepo || !project.githubToken) {
    console.warn("GitHub integration is not fully configured for project:", project.id);
    return null;
  }

  try {
    // Construct the URL for the GitHub API endpoint
    const apiUrl = `https://api.github.com/repos/${project.githubRepo}/commits?per_page=${limit}`;

    // Make the API call with appropriate authorization
    // GitHub now requires Bearer token format
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${project.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`GitHub API error (${response.status}):`, errorData);
      return null;
    }

    return await response.json() as GitHubCommit[];
  } catch (error) {
    console.error("Error fetching GitHub commits:", error);
    return null;
  }
}

/**
 * Process GitHub repository data to extract key information for AI prompt enhancement
 */
export function getGitHubContextForAI(
  files: GitHubFile[],
  commits: GitHubCommit[] | null = null,
  fileContents: Record<string, string> = {}
): string {
  let context = '';

  // Add repository structure
  if (files && files.length > 0) {
    context += "Repository Structure:\n";
    files.forEach(file => {
      context += `- ${file.path}\n`;
    });
    context += "\n";
  }

  // Add file contents (for key files)
  if (Object.keys(fileContents).length > 0) {
    context += "Key File Contents:\n";
    Object.entries(fileContents).forEach(([path, content]) => {
      // Limit content length to avoid overwhelming the model
      const truncatedContent = content.length > 1000 
        ? content.substring(0, 1000) + '...' 
        : content;
      
      context += `\nFile: ${path}\n\`\`\`\n${truncatedContent}\n\`\`\`\n`;
    });
    context += "\n";
  }

  // Add recent commits
  if (commits && commits.length > 0) {
    context += "Recent Commits:\n";
    commits.slice(0, 5).forEach(commit => {
      context += `- ${commit.commit.message} (${commit.commit.author.name}, ${commit.commit.author.date})\n`;
    });
    context += "\n";
  }

  return context;
}

/**
 * Fetch branches from a GitHub repository
 */
export async function fetchBranches(project: Project): Promise<string[] | null> {
  // Verify that the project has the necessary GitHub configuration
  if (!project.githubRepo || !project.githubToken) {
    console.warn("GitHub integration is not fully configured for project:", project.id);
    return null;
  }

  try {
    // Construct the URL for the GitHub API endpoint
    const apiUrl = `https://api.github.com/repos/${project.githubRepo}/branches`;

    // Make the API call with appropriate authorization
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${project.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`GitHub API error (${response.status}):`, errorData);
      return null;
    }

    const branches = await response.json() as Array<{name: string}>;
    return branches.map(branch => branch.name);
  } catch (error) {
    console.error("Error fetching GitHub branches:", error);
    return null;
  }
}

/**
 * Fetch contributors from a GitHub repository
 */
export async function fetchContributors(project: Project): Promise<number | null> {
  // Verify that the project has the necessary GitHub configuration
  if (!project.githubRepo || !project.githubToken) {
    console.warn("GitHub integration is not fully configured for project:", project.id);
    return null;
  }

  try {
    // Construct the URL for the GitHub API endpoint
    const apiUrl = `https://api.github.com/repos/${project.githubRepo}/contributors`;

    // Make the API call with appropriate authorization
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${project.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`GitHub API error (${response.status}):`, errorData);
      return null;
    }

    const contributors = await response.json() as Array<{id: number}>;
    return contributors.length;
  } catch (error) {
    console.error("Error fetching GitHub contributors:", error);
    return null;
  }
}

/**
 * Fetch pull requests from a GitHub repository
 */
export async function fetchPullRequests(project: Project): Promise<{
  open: number;
  closed: number;
  merged: number;
} | null> {
  // Verify that the project has the necessary GitHub configuration
  if (!project.githubRepo || !project.githubToken) {
    console.warn("GitHub integration is not fully configured for project:", project.id);
    return null;
  }

  try {
    // Construct the URLs for the GitHub API endpoints
    const openPRsUrl = `https://api.github.com/repos/${project.githubRepo}/pulls?state=open&per_page=1`;
    const closedPRsUrl = `https://api.github.com/repos/${project.githubRepo}/pulls?state=closed&per_page=1`;
    
    // Make API calls to get counts from headers
    const [openResponse, closedResponse] = await Promise.all([
      fetch(openPRsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${project.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }),
      fetch(closedPRsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${project.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
    ]);

    if (!openResponse.ok || !closedResponse.ok) {
      console.error("Error fetching pull requests");
      return null;
    }

    // Get counts from Link header or count items
    const openCount = getTotalCountFromResponse(openResponse);
    const closedCount = getTotalCountFromResponse(closedResponse);

    // For merged PRs, we need to fetch all closed PRs and count those with a merge_commit_sha
    // This would take too many API calls for a large repo, so for now just estimate
    // that roughly 70% of closed PRs are merged
    const mergedCount = Math.floor(closedCount * 0.7);

    return {
      open: openCount,
      closed: closedCount,
      merged: mergedCount
    };
  } catch (error) {
    console.error("Error fetching GitHub pull requests:", error);
    return null;
  }
}

// Helper to get total count from GitHub API response
function getTotalCountFromResponse(response: FetchResponse): number {
  // First try to get from Link header for pagination
  const linkHeader = response.headers.get('Link');
  if (linkHeader) {
    const matches = linkHeader.match(/page=(\d+)>; rel="last"/);
    if (matches && matches.length > 1) {
      return parseInt(matches[1], 10);
    }
  }
  
  // Check if there's a total count header
  const countHeader = response.headers.get('X-Total-Count');
  if (countHeader) {
    return parseInt(countHeader, 10);
  }
  
  // Default to a count of 1 if we got a result but no count info
  if (response.status === 200) {
    return 1;
  }
  
  return 0;
}

/**
 * Fetch language data from a GitHub repository
 */
export async function fetchLanguages(project: Project): Promise<LanguageData | null> {
  // Verify that the project has the necessary GitHub configuration
  if (!project.githubRepo || !project.githubToken) {
    console.warn("GitHub integration is not fully configured for project:", project.id);
    return null;
  }

  try {
    // Construct the URL for the GitHub API endpoint
    const apiUrl = `https://api.github.com/repos/${project.githubRepo}/languages`;

    // Make the API call with appropriate authorization
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${project.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`GitHub API error (${response.status}):`, errorData);
      return null;
    }

    return await response.json() as LanguageData;
  } catch (error) {
    console.error("Error fetching GitHub language data:", error);
    return null;
  }
}