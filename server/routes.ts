import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertMaturityLevelSchema, 
  insertMetricSchema, 
  insertRecommendationSchema,
  insertAssessmentTemplateSchema,
  insertAssessmentSchema
} from "@shared/schema";
import { 
  generateMaturityInsights, 
  generateRecommendations, 
  analyzeTestingData, 
  generateMaturityRoadmap,
  analyzeTestPatterns,
  generateTestStrategy
} from "./openai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all maturity dimensions
  app.get("/api/dimensions", async (req, res) => {
    try {
      const dimensions = await storage.getMaturityDimensions();
      res.json(dimensions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maturity dimensions" });
    }
  });

  // Get single maturity dimension
  app.get("/api/dimensions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dimension = await storage.getMaturityDimension(id);
      
      if (!dimension) {
        return res.status(404).json({ message: "Dimension not found" });
      }
      
      res.json(dimension);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maturity dimension" });
    }
  });

  // Get maturity levels by dimension
  app.get("/api/levels", async (req, res) => {
    try {
      const dimensionId = req.query.dimensionId ? parseInt(req.query.dimensionId as string) : undefined;
      const levels = await storage.getMaturityLevels(dimensionId);
      res.json(levels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maturity levels" });
    }
  });

  // Update maturity level status
  app.patch("/api/levels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertMaturityLevelSchema.partial().parse(req.body);
      
      const updatedLevel = await storage.updateMaturityLevel(id, updateData);
      
      if (!updatedLevel) {
        return res.status(404).json({ message: "Level not found" });
      }
      
      res.json(updatedLevel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update maturity level" });
    }
  });

  // Get metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const dimensionId = req.query.dimensionId ? parseInt(req.query.dimensionId as string) : undefined;
      const metrics = await storage.getMetrics(dimensionId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Update metric
  app.patch("/api/metrics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertMetricSchema.partial().parse(req.body);
      
      const updatedMetric = await storage.updateMetric(id, updateData);
      
      if (!updatedMetric) {
        return res.status(404).json({ message: "Metric not found" });
      }
      
      res.json(updatedMetric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update metric" });
    }
  });

  // Get recommendations
  app.get("/api/recommendations", async (req, res) => {
    try {
      const dimensionId = req.query.dimensionId ? parseInt(req.query.dimensionId as string) : undefined;
      const levelId = req.query.levelId ? parseInt(req.query.levelId as string) : undefined;
      
      const recommendations = await storage.getRecommendations(dimensionId, levelId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Update recommendation status
  app.patch("/api/recommendations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertRecommendationSchema.partial().parse(req.body);
      
      const updatedRecommendation = await storage.updateRecommendation(id, updateData);
      
      if (!updatedRecommendation) {
        return res.status(404).json({ message: "Recommendation not found" });
      }
      
      res.json(updatedRecommendation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recommendation" });
    }
  });

  // Get current user profile
  app.get("/api/user/profile", async (req, res) => {
    try {
      // For demo purposes, always return the admin user
      const user = await storage.getUserByUsername("admin");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send the password
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // AI-powered recommendations endpoints
  // Generate insights for a specific maturity dimension
  app.get("/api/ai/insights/:dimensionId", async (req, res) => {
    try {
      const dimensionId = parseInt(req.params.dimensionId);
      
      // Get dimension details
      const dimension = await storage.getMaturityDimension(dimensionId);
      if (!dimension) {
        return res.status(404).json({ message: "Dimension not found" });
      }

      // Get maturity levels for this dimension
      const levels = await storage.getMaturityLevels(dimensionId);
      if (!levels || levels.length === 0) {
        return res.status(404).json({ message: "No maturity levels found for this dimension" });
      }

      // Get current level (highest level marked as in_progress)
      const currentLevel = levels.find(level => level.status === "in_progress") || levels[0];
      
      // Get metrics for this dimension
      const metrics = await storage.getMetrics(dimensionId);
      
      // Generate AI insights
      const insights = await generateMaturityInsights(
        dimension.name,
        currentLevel,
        metrics
      );
      
      res.json({ 
        insights,
        dimension,
        currentLevel
      });
    } catch (error) {
      console.error("Error generating AI insights:", error);
      res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });

  // Generate specific recommendations for a dimension and level
  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { dimensionId, levelId } = req.body;
      
      if (!dimensionId) {
        return res.status(400).json({ message: "dimensionId is required" });
      }
      
      // Get dimension details
      const dimension = await storage.getMaturityDimension(dimensionId);
      if (!dimension) {
        return res.status(404).json({ message: "Dimension not found" });
      }
      
      // Get level details if provided
      let level = null;
      if (levelId) {
        level = await storage.getMaturityLevel(levelId);
        if (!level) {
          return res.status(404).json({ message: "Level not found" });
        }
      } else {
        // If no level provided, get the current level (in_progress)
        const levels = await storage.getMaturityLevels(dimensionId);
        level = levels.find(l => l.status === "in_progress") || levels[0];
      }
      
      // Get metrics for this dimension
      const metrics = await storage.getMetrics(dimensionId);
      
      // Generate AI recommendation
      const aiRecommendation = await generateRecommendations(
        dimension.name,
        level.level,
        metrics
      );
      
      // Create and save the recommendation
      const newRecommendation = await storage.createRecommendation({
        title: aiRecommendation.title,
        description: aiRecommendation.description,
        type: "recommendation",
        priority: aiRecommendation.priority,
        dimensionId,
        levelId: level.id,
        actions: aiRecommendation.actions,
        status: "active"
      });
      
      res.json(newRecommendation);
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      res.status(500).json({ message: "Failed to generate AI recommendations" });
    }
  });

  // Analyze testing data and provide insights
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { testData } = req.body;
      
      if (!testData) {
        return res.status(400).json({ message: "testData is required" });
      }
      
      // Analyze testing data
      const analysis = await analyzeTestingData(testData);
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing testing data:", error);
      res.status(500).json({ message: "Failed to analyze testing data" });
    }
  });

  // Generate maturity roadmap for a dimension
  app.get("/api/ai/roadmap/:dimensionId", async (req, res) => {
    try {
      const dimensionId = parseInt(req.params.dimensionId);
      const currentLevel = req.query.currentLevel ? parseInt(req.query.currentLevel as string) : 1;
      
      // Validate dimension exists
      const dimension = await storage.getMaturityDimension(dimensionId);
      if (!dimension) {
        return res.status(404).json({ message: "Dimension not found" });
      }
      
      // Generate roadmap
      const roadmap = await generateMaturityRoadmap(dimensionId, currentLevel);
      
      res.json(roadmap);
    } catch (error) {
      console.error("Error generating maturity roadmap:", error);
      res.status(500).json({ message: "Failed to generate maturity roadmap" });
    }
  });

  // Analyze test patterns
  app.post("/api/ai/test-patterns", async (req, res) => {
    try {
      const { patterns, coverage, executionTimes } = req.body;
      
      if (!patterns || !coverage || !executionTimes) {
        return res.status(400).json({ message: "patterns, coverage, and executionTimes are required" });
      }
      
      // Analyze test patterns
      const analysis = await analyzeTestPatterns({ patterns, coverage, executionTimes });
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing test patterns:", error);
      res.status(500).json({ message: "Failed to analyze test patterns" });
    }
  });

  // Generate test strategy
  app.post("/api/ai/test-strategy", async (req, res) => {
    try {
      const { type, technologies, teamSize, releaseFrequency, qualityGoals } = req.body;
      
      if (!type || !technologies || !teamSize || !releaseFrequency || !qualityGoals) {
        return res.status(400).json({ 
          message: "type, technologies, teamSize, releaseFrequency, and qualityGoals are required" 
        });
      }
      
      // Generate test strategy
      const strategy = await generateTestStrategy({
        type,
        technologies,
        teamSize,
        releaseFrequency,
        qualityGoals
      });
      
      res.json(strategy);
    } catch (error) {
      console.error("Error generating test strategy:", error);
      res.status(500).json({ message: "Failed to generate test strategy" });
    }
  });

  // Assessment Templates API endpoints
  app.get("/api/assessment-templates", async (req, res) => {
    try {
      const dimensionId = req.query.dimensionId ? parseInt(req.query.dimensionId as string) : undefined;
      const templates = await storage.getAssessmentTemplates(dimensionId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching assessment templates:", error);
      res.status(500).json({ message: "Failed to fetch assessment templates" });
    }
  });

  app.get("/api/assessment-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getAssessmentTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "Assessment template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error fetching assessment template:", error);
      res.status(500).json({ message: "Failed to fetch assessment template" });
    }
  });

  app.post("/api/assessment-templates", async (req, res) => {
    try {
      const templateData = insertAssessmentTemplateSchema.parse(req.body);
      const newTemplate = await storage.createAssessmentTemplate(templateData);
      res.status(201).json(newTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error creating assessment template:", error);
      res.status(500).json({ message: "Failed to create assessment template" });
    }
  });

  app.patch("/api/assessment-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertAssessmentTemplateSchema.partial().parse(req.body);
      
      const updatedTemplate = await storage.updateAssessmentTemplate(id, updateData);
      
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Assessment template not found" });
      }
      
      res.json(updatedTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error updating assessment template:", error);
      res.status(500).json({ message: "Failed to update assessment template" });
    }
  });

  // Assessments API endpoints
  app.get("/api/assessments", async (req, res) => {
    try {
      const filters = {
        dimensionId: req.query.dimensionId ? parseInt(req.query.dimensionId as string) : undefined,
        templateId: req.query.templateId ? parseInt(req.query.templateId as string) : undefined,
        userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
        status: req.query.status ? (req.query.status as string) : undefined
      };
      
      const assessments = await storage.getAssessments(filters);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.getAssessment(id);
      
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  app.post("/api/assessments", async (req, res) => {
    try {
      const assessmentData = insertAssessmentSchema.parse(req.body);
      const newAssessment = await storage.createAssessment(assessmentData);
      res.status(201).json(newAssessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error creating assessment:", error);
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  app.patch("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertAssessmentSchema.partial().parse(req.body);
      
      const updatedAssessment = await storage.updateAssessment(id, updateData);
      
      if (!updatedAssessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(updatedAssessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error updating assessment:", error);
      res.status(500).json({ message: "Failed to update assessment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
