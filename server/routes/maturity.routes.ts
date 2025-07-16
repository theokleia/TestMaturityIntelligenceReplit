import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { 
  insertMaturityLevelSchema, 
  insertMetricSchema, 
  insertRecommendationSchema,
  insertAssessmentTemplateSchema,
  insertAssessmentSchema
} from "@shared/schema";
import { requireAuth } from "./auth.routes";

export function registerMaturityRoutes(app: Express) {
  // Maturity Framework CRUD
  app.get("/api/dimensions", async (req, res) => {
    try {
      const dimensions = await storage.getDimensions();
      res.json(dimensions);
    } catch (error) {
      console.error("Error fetching dimensions:", error);
      res.status(500).json({ message: "Failed to fetch dimensions" });
    }
  });

  app.get("/api/levels", async (req, res) => {
    try {
      const dimensionId = req.query.dimensionId ? parseInt(req.query.dimensionId as string) : undefined;
      const levels = await storage.getLevels(dimensionId);
      res.json(levels);
    } catch (error) {
      console.error("Error fetching levels:", error);
      res.status(500).json({ message: "Failed to fetch levels" });
    }
  });

  app.post("/api/levels", requireAuth, async (req, res) => {
    try {
      const levelData = insertMaturityLevelSchema.parse(req.body);
      const level = await storage.createLevel(levelData);
      res.status(201).json(level);
    } catch (error) {
      console.error("Error creating level:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid level data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create level" });
      }
    }
  });

  app.put("/api/levels/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const levelData = insertMaturityLevelSchema.partial().parse(req.body);
      const level = await storage.updateLevel(id, levelData);
      
      if (!level) {
        return res.status(404).json({ message: "Level not found" });
      }
      
      res.json(level);
    } catch (error) {
      console.error("Error updating level:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid level data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to update level" });
      }
    }
  });

  app.delete("/api/levels/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteLevel(id);
      
      if (!result) {
        return res.status(404).json({ message: "Level not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting level:", error);
      res.status(500).json({ message: "Failed to delete level" });
    }
  });

  // Metrics CRUD
  app.get("/api/metrics", async (req, res) => {
    try {
      const dimensionId = req.query.dimensionId ? parseInt(req.query.dimensionId as string) : undefined;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const metrics = await storage.getMetrics({ dimensionId, projectId });
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.post("/api/metrics", requireAuth, async (req, res) => {
    try {
      const metricData = insertMetricSchema.parse(req.body);
      const metric = await storage.createMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      console.error("Error creating metric:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid metric data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create metric" });
      }
    }
  });

  app.put("/api/metrics/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const metricData = insertMetricSchema.partial().parse(req.body);
      const metric = await storage.updateMetric(id, metricData);
      
      if (!metric) {
        return res.status(404).json({ message: "Metric not found" });
      }
      
      res.json(metric);
    } catch (error) {
      console.error("Error updating metric:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid metric data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to update metric" });
      }
    }
  });

  app.delete("/api/metrics/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteMetric(id);
      
      if (!result) {
        return res.status(404).json({ message: "Metric not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting metric:", error);
      res.status(500).json({ message: "Failed to delete metric" });
    }
  });

  // Recommendations CRUD
  app.get("/api/recommendations", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const dimensionId = req.query.dimensionId ? parseInt(req.query.dimensionId as string) : undefined;
      const recommendations = await storage.getRecommendations({ projectId, dimensionId });
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.post("/api/recommendations", requireAuth, async (req, res) => {
    try {
      const recommendationData = insertRecommendationSchema.parse(req.body);
      const recommendation = await storage.createRecommendation(recommendationData);
      res.status(201).json(recommendation);
    } catch (error) {
      console.error("Error creating recommendation:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid recommendation data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create recommendation" });
      }
    }
  });

  app.put("/api/recommendations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recommendationData = insertRecommendationSchema.partial().parse(req.body);
      const recommendation = await storage.updateRecommendation(id, recommendationData);
      
      if (!recommendation) {
        return res.status(404).json({ message: "Recommendation not found" });
      }
      
      res.json(recommendation);
    } catch (error) {
      console.error("Error updating recommendation:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid recommendation data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to update recommendation" });
      }
    }
  });

  app.delete("/api/recommendations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteRecommendation(id);
      
      if (!result) {
        return res.status(404).json({ message: "Recommendation not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting recommendation:", error);
      res.status(500).json({ message: "Failed to delete recommendation" });
    }
  });

  // Assessment Templates CRUD
  app.get("/api/assessment-templates", async (req, res) => {
    try {
      const templates = await storage.getAssessmentTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching assessment templates:", error);
      res.status(500).json({ message: "Failed to fetch assessment templates" });
    }
  });

  app.post("/api/assessment-templates", requireAuth, async (req, res) => {
    try {
      const templateData = insertAssessmentTemplateSchema.parse(req.body);
      const template = await storage.createAssessmentTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating assessment template:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid template data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create assessment template" });
      }
    }
  });

  // Assessments CRUD
  app.get("/api/assessments", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const templateId = req.query.templateId ? parseInt(req.query.templateId as string) : undefined;
      const assessments = await storage.getAssessments({ projectId, templateId });
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.post("/api/assessments", requireAuth, async (req, res) => {
    try {
      const assessmentData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(assessmentData);
      res.status(201).json(assessment);
    } catch (error) {
      console.error("Error creating assessment:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid assessment data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create assessment" });
      }
    }
  });

  app.put("/api/assessments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessmentData = insertAssessmentSchema.partial().parse(req.body);
      const assessment = await storage.updateAssessment(id, assessmentData);
      
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(assessment);
    } catch (error) {
      console.error("Error updating assessment:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid assessment data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to update assessment" });
      }
    }
  });

  app.delete("/api/assessments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteAssessment(id);
      
      if (!result) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assessment:", error);
      res.status(500).json({ message: "Failed to delete assessment" });
    }
  });
}