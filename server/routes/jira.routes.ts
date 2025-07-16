import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { createJiraServiceFromProject } from "../jira-service";
import { requireAuth } from "./auth.routes";

export function registerJiraRoutes(app: Express) {
  // Jira tickets routes
  app.get("/api/jira-tickets", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const status = req.query.status as string | undefined;
      const issueType = req.query.issueType as string | undefined;
      const searchTerm = req.query.search as string | undefined;
      
      if (!projectId) {
        return res.status(400).json({ message: "projectId is required" });
      }
      
      const tickets = await storage.getJiraTickets(projectId, {
        status,
        issueType,
        searchTerm
      });
      
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching Jira tickets:", error);
      res.status(500).json({ message: "Failed to fetch Jira tickets" });
    }
  });

  app.get("/api/jira-tickets/:ticketKey", async (req, res) => {
    try {
      const ticketKey = req.params.ticketKey;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      if (!projectId) {
        return res.status(400).json({ message: "projectId is required" });
      }
      
      const ticket = await storage.getJiraTicketByKey(ticketKey, projectId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Jira ticket not found" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching Jira ticket:", error);
      res.status(500).json({ message: "Failed to fetch Jira ticket" });
    }
  });

  app.post("/api/jira-tickets/sync", requireAuth, async (req, res) => {
    try {
      const { projectId, syncType = "incremental" } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ message: "projectId is required" });
      }
      
      // Get project details
      const project = await storage.getProject(parseInt(projectId));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Create Jira service for this project
      const jiraService = createJiraServiceFromProject(project);
      if (!jiraService) {
        return res.status(400).json({ 
          message: "Jira configuration not found for this project" 
        });
      }
      
      // Test connection first
      const connectionTest = await jiraService.testConnection();
      if (!connectionTest) {
        return res.status(400).json({ 
          message: "Unable to connect to Jira. Please check your configuration." 
        });
      }
      
      // Perform sync
      const syncResult = await jiraService.syncTickets(project, syncType);
      
      res.json({
        message: "Jira sync completed successfully",
        result: syncResult
      });
    } catch (error) {
      console.error("Error syncing Jira tickets:", error);
      res.status(500).json({ message: "Failed to sync Jira tickets" });
    }
  });

  app.post("/api/jira-tickets/test-connection", requireAuth, async (req, res) => {
    try {
      const { projectId } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ message: "projectId is required" });
      }
      
      // Get project details
      const project = await storage.getProject(parseInt(projectId));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Create Jira service for this project
      const jiraService = createJiraServiceFromProject(project);
      if (!jiraService) {
        return res.status(400).json({ 
          message: "Jira configuration not found for this project" 
        });
      }
      
      // Test connection
      const isConnected = await jiraService.testConnection();
      
      res.json({
        connected: isConnected,
        message: isConnected 
          ? "Successfully connected to Jira" 
          : "Unable to connect to Jira. Please check your configuration."
      });
    } catch (error) {
      console.error("Error testing Jira connection:", error);
      res.status(500).json({ 
        message: "Failed to test Jira connection",
        connected: false 
      });
    }
  });

  app.get("/api/jira-sync-logs", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      if (!projectId) {
        return res.status(400).json({ message: "projectId is required" });
      }
      
      const logs = await storage.getJiraSyncLogs(projectId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching Jira sync logs:", error);
      res.status(500).json({ message: "Failed to fetch Jira sync logs" });
    }
  });

  // Test case Jira links
  app.get("/api/test-case-jira-links", async (req, res) => {
    try {
      const testCaseId = req.query.testCaseId ? parseInt(req.query.testCaseId as string) : undefined;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      const links = await storage.getTestCaseJiraLinks({ testCaseId, projectId });
      res.json(links);
    } catch (error) {
      console.error("Error fetching test case Jira links:", error);
      res.status(500).json({ message: "Failed to fetch test case Jira links" });
    }
  });

  app.post("/api/test-case-jira-links", requireAuth, async (req, res) => {
    try {
      const { testCaseId, jiraTicketKey, projectId, linkType = "covers" } = req.body;
      
      if (!testCaseId || !jiraTicketKey || !projectId) {
        return res.status(400).json({ 
          message: "testCaseId, jiraTicketKey, and projectId are required" 
        });
      }
      
      const link = await storage.createTestCaseJiraLinkByKey(
        testCaseId,
        jiraTicketKey,
        projectId,
        linkType
      );
      
      if (!link) {
        return res.status(404).json({ 
          message: "Jira ticket not found in database. Please sync Jira tickets first." 
        });
      }
      
      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating test case Jira link:", error);
      res.status(500).json({ message: "Failed to create test case Jira link" });
    }
  });

  app.delete("/api/test-case-jira-links/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteTestCaseJiraLink(id);
      
      if (!result) {
        return res.status(404).json({ message: "Test case Jira link not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting test case Jira link:", error);
      res.status(500).json({ message: "Failed to delete test case Jira link" });
    }
  });
}