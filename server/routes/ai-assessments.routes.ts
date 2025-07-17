/**
 * AI Assessments Routes
 * Handles AI readiness assessment endpoints
 */

import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { aiAssessmentService } from "../services/ai/ai-assessment-service";
import { requireAuth } from "./auth.routes";

const assessmentRequestSchema = z.object({
  projectId: z.number(),
  assessmentType: z.enum(['project_definition', 'ai_coverage', 'ai_execution', 'ai_automation', 'documentation']),
  runBy: z.number().optional()
});

const actionItemUpdateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']).optional(),
  assignedTo: z.number().optional(),
  completedBy: z.number().optional()
});

export function registerAIAssessmentRoutes(app: Express) {
  // Get all assessments for a project
  app.get("/api/ai-assessments/:projectId", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const assessmentType = req.query.type as string;
      
      const assessments = await storage.getAiAssessments({
        projectId,
        assessmentType: assessmentType || undefined
      });
      
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching AI assessments:", error);
      res.status(500).json({ message: "Failed to fetch AI assessments" });
    }
  });

  // Get a specific assessment
  app.get("/api/ai-assessments/assessment/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.getAiAssessment(id);
      
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching AI assessment:", error);
      res.status(500).json({ message: "Failed to fetch AI assessment" });
    }
  });

  // Run a new AI assessment
  app.post("/api/ai-assessments/run", async (req: Request, res: Response) => {
    try {
      const validatedData = assessmentRequestSchema.parse(req.body);
      
      // Check if project exists
      const project = await storage.getProject(validatedData.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      console.log(`Running ${validatedData.assessmentType} assessment for project ${validatedData.projectId}`);
      
      // Run the assessment
      const assessment = await aiAssessmentService.runAssessment(validatedData);
      
      res.json(assessment);
    } catch (error) {
      console.error("Error running AI assessment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: error.errors
        });
      }
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to run AI assessment"
      });
    }
  });

  // Get action items for a project
  app.get("/api/ai-assessments/:projectId/action-items", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const status = req.query.status as string;
      const assignedTo = req.query.assignedTo ? parseInt(req.query.assignedTo as string) : undefined;
      
      const actionItems = await storage.getAiAssessmentActionItems({
        projectId,
        status: status || undefined,
        assignedTo
      });
      
      res.json(actionItems);
    } catch (error) {
      console.error("Error fetching action items:", error);
      res.status(500).json({ message: "Failed to fetch action items" });
    }
  });

  // Update an action item
  app.patch("/api/ai-assessments/action-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = actionItemUpdateSchema.parse(req.body);
      
      // If marking as completed, set completion timestamp
      if (validatedData.status === 'completed' && !validatedData.completedBy) {
        validatedData.completedBy = req.user?.id; // Assuming user is available from auth middleware
      }
      
      const updates: any = { ...validatedData };
      if (validatedData.status === 'completed') {
        updates.completedAt = new Date().toISOString();
      }
      
      const updatedActionItem = await storage.updateAiAssessmentActionItem(id, updates);
      
      if (!updatedActionItem) {
        return res.status(404).json({ message: "Action item not found" });
      }
      
      res.json(updatedActionItem);
    } catch (error) {
      console.error("Error updating action item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to update action item" });
    }
  });

  // Get assessment history for a project
  app.get("/api/ai-assessments/:projectId/history", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const assessmentType = req.query.type as string;
      
      const history = await storage.getAiAssessmentHistory({
        projectId,
        assessmentType: assessmentType || undefined
      });
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching assessment history:", error);
      res.status(500).json({ message: "Failed to fetch assessment history" });
    }
  });

  // Get summary statistics for a project
  app.get("/api/ai-assessments/:projectId/summary", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Get latest assessments for each type
      const assessmentTypes = ['project_definition', 'ai_coverage', 'ai_execution', 'ai_automation', 'documentation'];
      const latestAssessments = await Promise.all(
        assessmentTypes.map(async (type) => {
          const assessments = await storage.getAiAssessments({
            projectId,
            assessmentType: type
          });
          return assessments.length > 0 ? assessments[0] : null;
        })
      );

      // Get action item counts
      const allActionItems = await storage.getAiAssessmentActionItems({ projectId });
      const openItems = allActionItems.filter(item => item.status === 'open' || item.status === 'in_progress');
      const completedItems = allActionItems.filter(item => item.status === 'completed');

      // Calculate overall readiness score
      const validAssessments = latestAssessments.filter(a => a !== null);
      const overallScore = validAssessments.length > 0 
        ? Math.round(validAssessments.reduce((sum, a) => sum + (a!.readinessScore || 0), 0) / validAssessments.length)
        : 0;

      const summary = {
        overallReadinessScore: overallScore,
        assessmentScores: {
          project_definition: latestAssessments[0]?.readinessScore || 0,
          ai_coverage: latestAssessments[1]?.readinessScore || 0,
          ai_execution: latestAssessments[2]?.readinessScore || 0,
          ai_automation: latestAssessments[3]?.readinessScore || 0,
          documentation: latestAssessments[4]?.readinessScore || 0
        },
        recentAssessments: validAssessments.slice(0, 3),
        actionItems: {
          total: allActionItems.length,
          open: openItems.length,
          completed: completedItems.length,
          completionRate: allActionItems.length > 0 
            ? Math.round((completedItems.length / allActionItems.length) * 100) 
            : 0
        }
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching assessment summary:", error);
      res.status(500).json({ message: "Failed to fetch assessment summary" });
    }
  });
}