import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupWebSocketServer } from "../websocket-handler";

// Import all route modules
import { registerAuthRoutes } from "./auth.routes";
import { registerSettingsRoutes } from "./settings.routes";
import { registerProjectRoutes } from "./projects.routes";
import { registerTestManagementRoutes } from "./test-management.routes";
import { registerAIRoutes } from "./ai.routes";
import { registerJiraRoutes } from "./jira.routes";
import { registerMaturityRoutes } from "./maturity.routes";
import { registerDocumentRoutes } from "./documents.routes";
import { registerAIAssessmentRoutes } from "./ai-assessments.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register all route modules
  registerAuthRoutes(app);
  registerSettingsRoutes(app);
  registerProjectRoutes(app);
  registerTestManagementRoutes(app);
  registerAIRoutes(app);
  registerJiraRoutes(app);
  registerMaturityRoutes(app);
  registerDocumentRoutes(app);
  registerAIAssessmentRoutes(app);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ 
      message: "API endpoint not found",
      path: req.originalUrl
    });
  });

  const server = createServer(app);
  
  // Setup WebSocket server for AI execution
  setupWebSocketServer(server);
  
  return server;
}