import crypto from 'crypto';
import fetch from 'node-fetch';
import { storage } from './storage';
import { JiraTicket, InsertJiraTicket, InsertJiraSyncLog, Project } from '@shared/schema';

interface JiraIssue {
  key: string;
  fields: {
    issuetype: { name: string };
    summary: string;
    description?: string;
    priority?: { name: string };
    status: { name: string };
    assignee?: { displayName: string };
    reporter?: { displayName: string };
    labels?: string[];
    components?: Array<{ name: string }>;
    created: string;
    updated: string;
  };
}

interface JiraSearchResponse {
  issues: JiraIssue[];
  total: number;
}

export class JiraService {
  private baseUrl: string;
  private auth: string;

  constructor(jiraUrl: string, apiKey: string) {
    this.baseUrl = jiraUrl.endsWith('/') ? jiraUrl.slice(0, -1) : jiraUrl;
    this.auth = Buffer.from(apiKey).toString('base64');
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}/rest/api/3${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/myself');
      return true;
    } catch (error) {
      console.error('Jira connection test failed:', error);
      return false;
    }
  }

  async fetchIssues(jql: string, maxResults: number = 100): Promise<JiraIssue[]> {
    try {
      const encodedJql = encodeURIComponent(jql);
      const response: JiraSearchResponse = await this.makeRequest(
        `/search?jql=${encodedJql}&maxResults=${maxResults}&fields=issuetype,summary,description,priority,status,assignee,reporter,labels,components,created,updated`
      );
      return response.issues;
    } catch (error) {
      console.error('Error fetching Jira issues:', error);
      throw error;
    }
  }

  private generateContentHash(issue: JiraIssue): string {
    const content = `${issue.fields.summary}${issue.fields.description || ''}${issue.fields.issuetype.name}${issue.fields.status.name}${issue.fields.priority?.name || ''}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private convertToDbFormat(issue: JiraIssue, projectId: number): InsertJiraTicket {
    return {
      jiraKey: issue.key,
      projectId,
      issueType: issue.fields.issuetype.name,
      summary: issue.fields.summary,
      description: issue.fields.description || null,
      priority: issue.fields.priority?.name || null,
      status: issue.fields.status.name,
      assignee: issue.fields.assignee?.displayName || null,
      reporter: issue.fields.reporter?.displayName || null,
      labels: issue.fields.labels || [],
      components: issue.fields.components?.map(c => c.name) || [],
      jiraCreatedAt: issue.fields.created,
      jiraUpdatedAt: issue.fields.updated,
      lastSyncedAt: new Date().toISOString(),
      contentHash: this.generateContentHash(issue),
      syncStatus: 'synced'
    };
  }

  async syncTickets(project: Project, syncType: 'full' | 'incremental' | 'manual'): Promise<{
    success: boolean;
    processed: number;
    created: number;
    updated: number;
    deleted: number;
    error?: string;
  }> {
    const startTime = Date.now();
    let processed = 0, created = 0, updated = 0, deleted = 0;
    let errorMessage: string | null = null;

    // Log sync start
    const syncLogId = await storage.createJiraSyncLog({
      projectId: project.id,
      syncType,
      status: 'in_progress',
      startedAt: new Date().toISOString()
    });

    try {
      if (!project.jiraUrl || !project.jiraApiKey) {
        throw new Error('Jira configuration missing for project');
      }

      const jiraService = new JiraService(project.jiraUrl, project.jiraApiKey);
      
      // Test connection first
      const connectionValid = await jiraService.testConnection();
      if (!connectionValid) {
        throw new Error('Unable to connect to Jira with provided credentials');
      }

      // Build JQL query
      let jql = project.jiraJql || `project = ${project.jiraProjectId}`;
      
      // For incremental sync, only fetch recently updated tickets
      if (syncType === 'incremental') {
        const lastSync = await storage.getLastSuccessfulSync(project.id);
        if (lastSync) {
          const lastSyncDate = new Date(lastSync.completedAt!);
          const formattedDate = lastSyncDate.toISOString().split('T')[0] + ' ' + 
                               lastSyncDate.toTimeString().split(' ')[0];
          jql += ` AND updated >= "${formattedDate}"`;
        }
      }

      // Fetch issues from Jira
      const issues = await jiraService.fetchIssues(jql, 1000);
      processed = issues.length;

      // Get existing tickets for comparison
      const existingTickets = await storage.getJiraTicketsByProject(project.id);
      const existingTicketMap = new Map(existingTickets.map(t => [t.jiraKey, t]));

      // Process each issue
      for (const issue of issues) {
        const dbTicket = jiraService.convertToDbFormat(issue, project.id);
        const existing = existingTicketMap.get(issue.key);

        if (existing) {
          // Update if content has changed
          if (existing.contentHash !== dbTicket.contentHash) {
            await storage.updateJiraTicket(existing.id, dbTicket);
            updated++;
          }
          existingTicketMap.delete(issue.key); // Remove from map to track deletions
        } else {
          // Create new ticket
          await storage.createJiraTicket(dbTicket);
          created++;
        }
      }

      // Handle deletions (tickets that exist in DB but not in Jira response)
      if (syncType === 'full') {
        for (const [jiraKey, ticket] of existingTicketMap) {
          if (!ticket.isDeleted) {
            await storage.softDeleteJiraTicket(ticket.id);
            deleted++;
          }
        }
      }

      // Update sync log with success
      const duration = Date.now() - startTime;
      await storage.updateJiraSyncLog(syncLogId, {
        status: 'success',
        ticketsProcessed: processed,
        ticketsCreated: created,
        ticketsUpdated: updated,
        ticketsDeleted: deleted,
        completedAt: new Date().toISOString(),
        duration
      });

      return {
        success: true,
        processed,
        created,
        updated,
        deleted
      };

    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Jira sync error:', error);

      // Update sync log with error
      const duration = Date.now() - startTime;
      await storage.updateJiraSyncLog(syncLogId, {
        status: 'error',
        errorMessage,
        completedAt: new Date().toISOString(),
        duration
      });

      return {
        success: false,
        processed,
        created,
        updated,
        deleted,
        error: errorMessage
      };
    }
  }
}

// Helper function to create JiraService instance from project
export function createJiraServiceFromProject(project: Project): JiraService | null {
  if (!project.jiraUrl || !project.jiraApiKey) {
    return null;
  }
  return new JiraService(project.jiraUrl, project.jiraApiKey);
}