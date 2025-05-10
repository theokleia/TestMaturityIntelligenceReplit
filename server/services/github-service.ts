/**
 * GitHub Integration Service
 * Provides functionality to interact with GitHub API using the stored credentials
 */

import fetch from 'node-fetch';
import { Project } from '@shared/schema';

// Define types for GitHub API responses
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