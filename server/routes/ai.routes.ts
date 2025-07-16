import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { 
  generateMaturityInsights, 
  generateRecommendations, 
  analyzeTestingData, 
  generateMaturityRoadmap,
  analyzeTestPatterns,
  generateTestStrategy,
  generateTestCases,
  generateTestSuites,
  generateAssistantResponse,
  generateWhisperSuggestions,
  generateDocument,
  analyzeDocumentContent
} from "../openai-service";
import { handleWhisperSuggestions } from "../api/handle-whisper-suggestions";
import { handleDocumentAnalysis } from "../api/handle-document-analysis";
import { requireAuth } from "./auth.routes";

export function registerAIRoutes(app: Express) {
  // AI Assistant endpoint
  app.post("/api/ai/assistant", async (req, res) => {
    try {
      const { projectId, projectName, query, contextPath } = req.body;
      
      // Check for required parameters
      if ((!projectId && !projectName) || !query) {
        return res.status(400).json({ 
          message: "Either projectId or projectName, and query are required" 
        });
      }
      
      // If projectId is provided, fetch the full project details
      if (projectId) {
        const project = await storage.getProject(parseInt(projectId));
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        
        const response = await generateAssistantResponse(project, query, contextPath);
        res.json({ response });
      } else {
        // Handle projectName-based lookup
        const projects = await storage.getProjects();
        const project = projects.find(p => p.name === projectName);
        
        if (!project) {
          return res.status(404).json({ message: `Project '${projectName}' not found` });
        }
        
        const response = await generateAssistantResponse(project, query, contextPath);
        res.json({ response });
      }
    } catch (error) {
      console.error("Error generating assistant response:", error);
      res.status(500).json({ message: "Failed to generate response" });
    }
  });

  // AI Whisper suggestions endpoint
  app.post("/api/ai/whisper", async (req, res) => {
    try {
      await handleWhisperSuggestions(req, res);
    } catch (error) {
      console.error("Error generating whisper suggestions:", error);
      res.status(500).json({ message: "Failed to generate whisper suggestions" });
    }
  });

  // AI Test Suite Generation
  app.post("/api/ai/generate-test-suites", async (req, res) => {
    try {
      const { projectId, organizationType } = req.body;
      
      if (!projectId || !organizationType) {
        return res.status(400).json({ 
          message: "projectId and organizationType are required" 
        });
      }
      
      // Get project details
      const project = await storage.getProject(parseInt(projectId));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get project context
      const documents = await storage.getDocuments({ projectId: parseInt(projectId) });
      const jiraTickets = await storage.getJiraTickets(parseInt(projectId));
      
      // Generate AI test suites based on organization type
      const testSuites = await generateTestSuites(
        project, 
        organizationType, 
        documents, 
        jiraTickets
      );
      
      res.json({
        message: "Test suites generated successfully",
        testSuites,
        organizationType,
        context: {
          documentsCount: documents.length,
          jiraTicketsCount: jiraTickets.length
        }
      });
    } catch (error) {
      console.error("Error generating AI test suites:", error);
      res.status(500).json({ message: "Failed to generate test suites" });
    }
  });

  // AI Maturity Assessment Routes
  app.post("/api/ai/maturity-insights", async (req, res) => {
    try {
      const { assessmentData, projectContext } = req.body;
      
      if (!assessmentData) {
        return res.status(400).json({ message: "assessmentData is required" });
      }
      
      const insights = await generateMaturityInsights(assessmentData, projectContext);
      res.json({ insights });
    } catch (error) {
      console.error("Error generating maturity insights:", error);
      res.status(500).json({ message: "Failed to generate maturity insights" });
    }
  });

  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { testingData, projectContext, focusAreas } = req.body;
      
      if (!testingData) {
        return res.status(400).json({ message: "testingData is required" });
      }
      
      const recommendations = await generateRecommendations(testingData, projectContext, focusAreas);
      res.json({ recommendations });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  app.post("/api/ai/analyze-testing", async (req, res) => {
    try {
      const { testingData, projectContext } = req.body;
      
      if (!testingData) {
        return res.status(400).json({ message: "testingData is required" });
      }
      
      const analysis = await analyzeTestingData(testingData, projectContext);
      res.json({ analysis });
    } catch (error) {
      console.error("Error analyzing testing data:", error);
      res.status(500).json({ message: "Failed to analyze testing data" });
    }
  });

  app.get("/api/ai/roadmap", async (req, res) => {
    try {
      const dimension = req.query.dimension as string;
      const currentLevel = req.query.currentLevel ? parseInt(req.query.currentLevel as string) : 1;
      const targetLevel = req.query.targetLevel ? parseInt(req.query.targetLevel as string) : 5;
      const projectContext = req.query.projectContext as string;
      
      if (!dimension) {
        return res.status(400).json({ message: "dimension is required" });
      }
      
      const roadmap = await generateMaturityRoadmap(dimension, currentLevel, targetLevel, projectContext);
      res.json({ roadmap });
    } catch (error) {
      console.error("Error generating maturity roadmap:", error);
      res.status(500).json({ message: "Failed to generate maturity roadmap" });
    }
  });

  app.post("/api/ai/analyze-patterns", async (req, res) => {
    try {
      const { testData, projectContext } = req.body;
      
      if (!testData) {
        return res.status(400).json({ message: "testData is required" });
      }
      
      const patterns = await analyzeTestPatterns(testData, projectContext);
      res.json({ patterns });
    } catch (error) {
      console.error("Error analyzing test patterns:", error);
      res.status(500).json({ message: "Failed to analyze test patterns" });
    }
  });

  // AI Document Analysis
  app.post("/api/ai/analyze-document", async (req, res) => {
    try {
      await handleDocumentAnalysis(req, res);
    } catch (error) {
      console.error("Error analyzing document:", error);
      res.status(500).json({ message: "Failed to analyze document" });
    }
  });

  app.post("/api/ai/generate-document", async (req, res) => {
    try {
      const { projectId, documentType, title, description } = req.body;
      
      if (!projectId || !documentType) {
        return res.status(400).json({ 
          message: "projectId and documentType are required" 
        });
      }
      
      // Get project details
      const project = await storage.getProject(parseInt(projectId));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get project context for document generation
      const documents = await storage.getDocuments({ projectId: parseInt(projectId) });
      const jiraTickets = await storage.getJiraTickets(parseInt(projectId));
      
      // Generate document content
      const content = await generateDocument(
        project,
        documentType,
        title || `${documentType.toUpperCase()} for ${project.name}`,
        description || `Generated ${documentType} document for project ${project.name}`,
        documents,
        jiraTickets
      );
      
      res.json({
        content,
        documentType,
        title: title || `${documentType.toUpperCase()} for ${project.name}`,
        description: description || `Generated ${documentType} document for project ${project.name}`
      });
    } catch (error) {
      console.error("Error generating document:", error);
      res.status(500).json({ message: "Failed to generate document" });
    }
  });
}

