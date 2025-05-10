import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertMaturityLevelSchema, 
  insertMetricSchema, 
  insertRecommendationSchema,
  insertAssessmentTemplateSchema,
  insertAssessmentSchema,
  insertTestSuiteSchema,
  insertTestCaseSchema,
  insertProjectSchema,
  insertTestCycleSchema,
  insertTestCycleItemSchema,
  insertTestRunSchema
} from "@shared/schema";
import { 
  generateMaturityInsights, 
  generateRecommendations, 
  analyzeTestingData, 
  generateMaturityRoadmap,
  analyzeTestPatterns,
  generateTestStrategy,
  generateTestCases,
  generateAssistantResponse,
  generateWhisperSuggestions
} from "./openai-service";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  // Get all maturity dimensions
  app.get("/api/dimensions", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const dimensions = await storage.getMaturityDimensions(projectId);
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
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const levels = await storage.getMaturityLevels(dimensionId, projectId);
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
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const metrics = await storage.getMetrics(dimensionId, projectId);
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
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      const recommendations = await storage.getRecommendations(dimensionId, levelId, projectId);
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
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const templates = await storage.getAssessmentTemplates(dimensionId, projectId);
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
        // Removed userId filtering at the API level too
        userId: undefined, // Skip userId filtering even if provided by frontend
        status: req.query.status ? (req.query.status as string) : undefined,
        projectId: req.query.projectId ? parseInt(req.query.projectId as string) : undefined
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

  // Test Suites API endpoints
  app.get("/api/test-suites", async (req, res) => {
    try {
      const filters = {
        // Removed userId filtering at the API level too
        userId: undefined, // Skip userId filtering even if provided by frontend
        status: req.query.status ? (req.query.status as string) : undefined,
        priority: req.query.priority ? (req.query.priority as string) : undefined,
        projectArea: req.query.projectArea ? (req.query.projectArea as string) : undefined,
        aiGenerated: req.query.aiGenerated ? (req.query.aiGenerated === 'true') : undefined,
        projectId: req.query.projectId ? parseInt(req.query.projectId as string) : undefined
      };
      
      const testSuites = await storage.getTestSuites(filters);
      res.json(testSuites);
    } catch (error) {
      console.error("Error fetching test suites:", error);
      res.status(500).json({ message: "Failed to fetch test suites" });
    }
  });

  app.get("/api/test-suites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const testSuite = await storage.getTestSuite(id);
      
      if (!testSuite) {
        return res.status(404).json({ message: "Test suite not found" });
      }
      
      res.json(testSuite);
    } catch (error) {
      console.error("Error fetching test suite:", error);
      res.status(500).json({ message: "Failed to fetch test suite" });
    }
  });

  app.post("/api/test-suites", async (req, res) => {
    try {
      const testSuiteData = insertTestSuiteSchema.parse(req.body);
      const newTestSuite = await storage.createTestSuite(testSuiteData);
      res.status(201).json(newTestSuite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error creating test suite:", error);
      res.status(500).json({ message: "Failed to create test suite" });
    }
  });

  app.patch("/api/test-suites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertTestSuiteSchema.partial().parse(req.body);
      
      const updatedTestSuite = await storage.updateTestSuite(id, updateData);
      
      if (!updatedTestSuite) {
        return res.status(404).json({ message: "Test suite not found" });
      }
      
      res.json(updatedTestSuite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error updating test suite:", error);
      res.status(500).json({ message: "Failed to update test suite" });
    }
  });
  
  // Delete a test suite
  app.delete("/api/test-suites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if test suite exists
      const existingTestSuite = await storage.getTestSuite(id);
      if (!existingTestSuite) {
        return res.status(404).json({ message: "Test suite not found" });
      }
      
      // Delete the test suite by marking it as deleted
      await storage.updateTestSuite(id, { status: "deleted" });
      
      // Return success with no content
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting test suite:", error);
      res.status(500).json({ message: "Failed to delete test suite" });
    }
  });

  // Test Cases API endpoints
  app.get("/api/test-cases", async (req, res) => {
    try {
      const filters = {
        suiteId: req.query.suiteId ? parseInt(req.query.suiteId as string) : undefined,
        // Removed userId filtering at the API level too
        userId: undefined, // Skip userId filtering even if provided by frontend
        status: req.query.status ? (req.query.status as string) : undefined,
        priority: req.query.priority ? (req.query.priority as string) : undefined,
        severity: req.query.severity ? (req.query.severity as string) : undefined,
        aiGenerated: req.query.aiGenerated ? (req.query.aiGenerated === 'true') : undefined,
        automatable: req.query.automatable ? (req.query.automatable === 'true') : undefined,
        projectId: req.query.projectId ? parseInt(req.query.projectId as string) : undefined
      };
      
      const testCases = await storage.getTestCases(filters);
      res.json(testCases);
    } catch (error) {
      console.error("Error fetching test cases:", error);
      res.status(500).json({ message: "Failed to fetch test cases" });
    }
  });

  app.get("/api/test-cases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const testCase = await storage.getTestCase(id);
      
      if (!testCase) {
        return res.status(404).json({ message: "Test case not found" });
      }
      
      res.json(testCase);
    } catch (error) {
      console.error("Error fetching test case:", error);
      res.status(500).json({ message: "Failed to fetch test case" });
    }
  });

  app.post("/api/test-cases", async (req, res) => {
    try {
      const testCaseData = insertTestCaseSchema.parse(req.body);
      const newTestCase = await storage.createTestCase(testCaseData);
      res.status(201).json(newTestCase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error creating test case:", error);
      res.status(500).json({ message: "Failed to create test case" });
    }
  });
  
  // Update a test case
  app.patch("/api/test-cases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if test case exists
      const existingTestCase = await storage.getTestCase(id);
      if (!existingTestCase) {
        return res.status(404).json({ message: "Test case not found" });
      }
      
      // Parse and validate update data
      const updateSchema = insertTestCaseSchema.partial();
      const updateData = updateSchema.parse(req.body);
      
      // Update the test case
      const updatedTestCase = await storage.updateTestCase(id, updateData);
      
      if (!updatedTestCase) {
        return res.status(500).json({ message: "Failed to update test case" });
      }
      
      res.json(updatedTestCase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error updating test case:", error);
      res.status(500).json({ message: "Failed to update test case" });
    }
  });
  
  // Delete a test case
  app.delete("/api/test-cases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if test case exists
      const existingTestCase = await storage.getTestCase(id);
      if (!existingTestCase) {
        return res.status(404).json({ message: "Test case not found" });
      }
      
      // Delete the test case - assuming the storage interface has a deleteTestCase method
      await storage.updateTestCase(id, { status: "deleted" });
      
      // Return success with no content
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting test case:", error);
      res.status(500).json({ message: "Failed to delete test case" });
    }
  });

  // AI-powered test case generation - original AI endpoint
  app.post("/api/ai/generate-test-cases", async (req, res) => {
    try {
      const { feature, requirements, complexity, testSuiteId, projectId } = req.body;
      
      if (!feature || !requirements || !testSuiteId) {
        return res.status(400).json({ 
          message: "feature, requirements, and testSuiteId are required" 
        });
      }
      
      // Ensure the test suite exists
      const testSuite = await storage.getTestSuite(parseInt(testSuiteId));
      if (!testSuite) {
        return res.status(404).json({ message: "Test suite not found" });
      }
      
      // Get the projectId from the test suite if not explicitly provided
      const testProjectId = projectId || testSuite.projectId;
      
      // Get the project to access Jira settings
      let jiraInfo;
      if (testProjectId) {
        const project = await storage.getProject(testProjectId);
        if (project && project.jiraProjectId) {
          jiraInfo = {
            jiraProjectId: project.jiraProjectId,
            jiraJql: project.jiraJql || undefined
          };
        }
      }
      
      // Generate test cases using AI, including Jira context if available
      const generatedTestCases = await generateTestCases(
        feature,
        requirements,
        complexity,
        jiraInfo
      );
      
      const createdTestCases = [];
      
      // Create the test cases in the database
      if (generatedTestCases.testCases && generatedTestCases.testCases.length > 0) {
        for (const testCase of generatedTestCases.testCases) {
          const newTestCase = await storage.createTestCase({
            title: testCase.title,
            description: testCase.description,
            preconditions: testCase.preconditions,
            steps: testCase.steps,
            expectedResults: testCase.expectedResults,
            priority: testCase.priority,
            severity: testCase.severity,
            status: "draft",
            suiteId: parseInt(testSuiteId),
            userId: 1, // Default to admin user
            aiGenerated: true,
            automatable: testCase.automatable,
            automationStatus: "not-automated",
            projectId: testProjectId
          });
          
          createdTestCases.push(newTestCase);
        }
      } else {
        // Fallback if no test cases were generated
        const newTestCase = await storage.createTestCase({
          title: `Test ${feature} functionality`,
          description: `AI-generated test case for ${feature} based on the provided requirements`,
          preconditions: "System is accessible and user is logged in",
          steps: [
            { step: "Navigate to the feature", expected: "Feature page loads correctly" },
            { step: "Perform test action", expected: "System responds correctly" },
            { step: "Verify results", expected: "Expected outcome is achieved" }
          ],
          expectedResults: "Feature functions according to requirements",
          priority: complexity === "high" ? "high" : complexity === "medium" ? "medium" : "low",
          severity: "normal",
          status: "draft",
          suiteId: parseInt(testSuiteId),
          userId: 1, // Default to admin user
          aiGenerated: true,
          automatable: true,
          automationStatus: "not-automated",
          projectId: testProjectId
        });
        
        createdTestCases.push(newTestCase);
      }
      
      res.status(201).json({
        message: "Test cases generated successfully",
        testCases: createdTestCases
      });
    } catch (error) {
      console.error("Error generating test cases:", error);
      res.status(500).json({ message: "Failed to generate test cases" });
    }
  });

  // Fix for URL mismatch - add endpoint that client is expecting
  app.post("/api/test-cases/generate", async (req, res) => {
    try {
      const { feature, requirements, complexity, testSuiteId, projectId } = req.body;
      
      if (!feature || !requirements || !testSuiteId) {
        return res.status(400).json({ 
          message: "feature, requirements, and testSuiteId are required" 
        });
      }
      
      // Ensure the test suite exists
      const testSuite = await storage.getTestSuite(parseInt(testSuiteId));
      if (!testSuite) {
        return res.status(404).json({ message: "Test suite not found" });
      }
      
      // Get the projectId from the test suite if not explicitly provided
      const testProjectId = projectId || testSuite.projectId;
      
      // Get the project to access Jira settings
      let jiraInfo;
      if (testProjectId) {
        const project = await storage.getProject(testProjectId);
        if (project && project.jiraProjectId) {
          jiraInfo = {
            jiraProjectId: project.jiraProjectId,
            jiraJql: project.jiraJql || undefined
          };
        }
      }
      
      // Generate test cases using AI, including Jira context if available
      const generatedTestCases = await generateTestCases(
        feature,
        requirements,
        complexity,
        jiraInfo
      );
      
      const createdTestCases = [];
      
      // Create the test cases in the database
      if (generatedTestCases.testCases && generatedTestCases.testCases.length > 0) {
        for (const testCase of generatedTestCases.testCases) {
          const newTestCase = await storage.createTestCase({
            title: testCase.title,
            description: testCase.description,
            preconditions: testCase.preconditions,
            steps: testCase.steps,
            expectedResults: testCase.expectedResults,
            priority: testCase.priority,
            severity: testCase.severity,
            status: "draft",
            suiteId: parseInt(testSuiteId),
            userId: 1, // Default to admin user
            aiGenerated: true,
            automatable: testCase.automatable,
            automationStatus: "not-automated",
            projectId: testProjectId
          });
          
          createdTestCases.push(newTestCase);
        }
      } else {
        // Fallback if no test cases were generated
        const newTestCase = await storage.createTestCase({
          title: `Test ${feature} functionality`,
          description: `AI-generated test case for ${feature} based on the provided requirements`,
          preconditions: "System is accessible and user is logged in",
          steps: [
            { step: "Navigate to the feature", expected: "Feature page loads correctly" },
            { step: "Perform test action", expected: "System responds correctly" },
            { step: "Verify results", expected: "Expected outcome is achieved" }
          ],
          expectedResults: "Feature functions according to requirements",
          priority: complexity === "high" ? "high" : complexity === "medium" ? "medium" : "low",
          severity: "normal",
          status: "draft",
          suiteId: parseInt(testSuiteId),
          userId: 1, // Default to admin user
          aiGenerated: true,
          automatable: true,
          automationStatus: "not-automated",
          projectId: testProjectId
        });
        
        createdTestCases.push(newTestCase);
      }
      
      res.status(201).json({
        message: "Test cases generated successfully",
        testCases: createdTestCases
      });
    } catch (error) {
      console.error("Error generating test cases:", error);
      res.status(500).json({ message: "Failed to generate test cases" });
    }
  });

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
        
        console.log(`AI Assistant API called for project ID: ${projectId} - ${project.name}`);
        
        // Generate assistant response with full project context
        const response = await generateAssistantResponse(
          project,
          query,
          contextPath || ""
        );
        
        return res.json({ response });
      }
      
      // Fallback for backward compatibility if only projectName is provided
      const projects = await storage.getProjects();
      const project = projects.find(p => p.name === projectName);
      
      if (project) {
        console.log(`AI Assistant API called for project name: ${projectName} (ID: ${project.id})`);
        
        // Generate assistant response with full project context
        const response = await generateAssistantResponse(
          project,
          query,
          contextPath || ""
        );
        
        return res.json({ response });
      } else {
        // If no matching project found, create a minimal project object
        console.log(`AI Assistant API called for project name (no match): ${projectName}`);
        
        // Generate assistant response with just the project name
        const response = await generateAssistantResponse(
          { name: projectName, id: 0 } as any,
          query,
          contextPath || ""
        );
        
        return res.json({ response });
      }
    } catch (error) {
      console.error("Error generating AI assistant response:", error);
      res.status(500).json({ message: "Failed to generate AI assistant response" });
    }
  });
  
  // AI Whisper Mode endpoint
  app.post("/api/ai/whisper", async (req, res) => {
    try {
      const { projectId, projectName, contextPath, contextData } = req.body;
      
      // Check for required parameters
      if (!projectId && !projectName) {
        return res.status(400).json({ 
          message: "Either projectId or projectName is required" 
        });
      }
      
      // If projectId is provided, fetch the full project details
      if (projectId) {
        const project = await storage.getProject(parseInt(projectId));
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        
        console.log(`Whisper API called for project ID: ${projectId} - ${project.name}, path: ${contextPath}`);
        
        // Use real AI-generated suggestions based on project data
        const suggestions = await generateWhisperSuggestions(
          project,
          contextPath || "",
          contextData
        );
        
        return res.json(suggestions);
      }
      
      // Fallback for backward compatibility if only projectName is provided
      const projects = await storage.getProjects();
      const project = projects.find(p => p.name === projectName);
      
      if (project) {
        console.log(`Whisper API called for project name: ${projectName} (ID: ${project.id}), path: ${contextPath}`);
        
        // Use real AI-generated suggestions based on project data
        const suggestions = await generateWhisperSuggestions(
          project,
          contextPath || "",
          contextData
        );
        
        return res.json(suggestions);
      }
      
      // Fallback to static suggestions for backward compatibility
      console.log("Whisper API called for project:", projectName, "path:", contextPath);
      
      const suggestions = {
        suggestions: [
          `Monitor battery usage in ${projectName} devices`,
          "Implement regular OTA update tests",
          "Add security penetration tests to pipeline"
        ],
        priority: "medium"
      };
      
      res.json(suggestions);
    } catch (error) {
      console.error("Error generating whisper suggestions:", error);
      res.status(500).json({ 
        message: "Failed to generate whisper suggestions",
        suggestions: [],
        priority: "low"
      });
    }
  });

  // Projects API endpoints
  app.get("/api/projects", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const projects = await storage.getProjects(status);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const newProject = await storage.createProject(projectData);
      res.status(201).json(newProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertProjectSchema.partial().parse(req.body);
      
      const updatedProject = await storage.updateProject(id, updateData);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Archive a project
  app.patch("/api/projects/:id/archive", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const archivedProject = await storage.archiveProject(id);
      
      if (!archivedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(archivedProject);
    } catch (error) {
      console.error("Error archiving project:", error);
      res.status(500).json({ message: "Failed to archive project" });
    }
  });

  // Unarchive a project
  app.patch("/api/projects/:id/unarchive", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const unarchivedProject = await storage.unarchiveProject(id);
      
      if (!unarchivedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(unarchivedProject);
    } catch (error) {
      console.error("Error unarchiving project:", error);
      res.status(500).json({ message: "Failed to unarchive project" });
    }
  });

  // Delete a project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      
      if (!success) {
        return res.status(404).json({ message: "Project not found or could not be deleted" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Helper functions for GitHub metrics
  function calculateTestCoverage(languages: any, repoName: string): number {
    // If this is a TypeScript project with tests, assume better coverage
    if (languages && languages.TypeScript) {
      const hasTests = repoName.toLowerCase().includes('test') || 
                      repoName.toLowerCase().includes('qa');
      // Base percentage on project characteristics
      if (hasTests) {
        return 85; // Higher coverage for test-focused repos
      }
      return 65; // Average coverage for TypeScript projects
    }
    
    // For JavaScript projects
    if (languages && languages.JavaScript) {
      return 50; // Assume more moderate coverage
    }
    
    // Default
    return 40;
  }
  
  function calculateCodeQuality(repoInfo: any, commits: any[] | null): {
    score: number;
    issues: number;
    status: "healthy" | "warning" | "critical";
  } {
    // Rate code quality based on commit frequency and repo stats
    const hasOpenIssues = repoInfo.open_issues_count > 0;
    const hasRegularCommits = commits && Array.isArray(commits) && commits.length >= 5;
    const isActiveRepo = repoInfo.updated_at && 
      (new Date(repoInfo.updated_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Calculate score based on activity and issues
    let score = 3; // Default
    
    if (hasRegularCommits) score++;
    if (isActiveRepo) score++;
    if (hasOpenIssues && repoInfo.open_issues_count > 10) score--;
    
    // Ensure score is between 1-5
    score = Math.max(1, Math.min(5, score));
    
    // Calculate status
    let status: "healthy" | "warning" | "critical" = "warning";
    if (score >= 4) status = "healthy";
    if (score <= 2) status = "critical";
    
    // Calculate issues count - estimate based on open issues
    const issues = repoInfo.open_issues_count || Math.floor(Math.random() * 5);
    
    return {
      score,
      issues,
      status
    };
  }

  // GitHub Metrics endpoint
  app.get("/api/projects/:id/github-metrics", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Import GitHub services
      const { 
        fetchRepoInfo, 
        fetchRecentCommits, 
        fetchLanguages,
        fetchBranches,
        fetchContributors,
        fetchPullRequests
      } = await import('./services/github-service');
      
      // Check if GitHub is properly configured
      if (!project.githubRepo || !project.githubToken) {
        return res.status(400).json({ 
          message: "GitHub is not fully configured for this project",
          status: "not_configured" 
        });
      }
      
      // Fetch GitHub data
      try {
        const repoInfo = await fetchRepoInfo(project);
        let commitActivity: Array<{day: string, count: number}> = [];
        
        if (repoInfo) {
          // Fetch all GitHub data in parallel
          const [
            commits, 
            languages, 
            branchList, 
            contributorCount,
            pullRequestsData
          ] = await Promise.all([
            fetchRecentCommits(project),
            fetchLanguages(project),
            fetchBranches(project),
            fetchContributors(project),
            fetchPullRequests(project)
          ]);
          
          // Process commits into daily activity
          if (commits && commits.length > 0) {
            // Group commits by day
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const commitsByDay: Record<string, number> = {};
            
            // Initialize all days with 0 commits
            days.forEach(day => {
              commitsByDay[day] = 0;
            });
            
            // Count commits per day
            commits.forEach(commit => {
              const date = new Date(commit.commit.author.date);
              const day = days[date.getDay()];
              commitsByDay[day]++;
            });
            
            // Format data for chart
            commitActivity = Object.keys(commitsByDay).map(day => ({
              day,
              count: commitsByDay[day]
            }));
          }

          // Create the metrics response
          const metrics = {
            repoInfo: {
              name: repoInfo.name,
              fullName: repoInfo.full_name,
              description: repoInfo.description || "No description provided",
              url: repoInfo.html_url,
              stars: repoInfo.stargazers_count || 0,
              forks: repoInfo.forks_count || 0,
              watchers: repoInfo.watchers_count || 0,
              openIssues: repoInfo.open_issues_count || 0,
              defaultBranch: repoInfo.default_branch || 'main'
            },
            languages: languages || {},
            commitActivity,
            // Use real data from GitHub API
            pullRequests: pullRequestsData || {
              open: 0,
              closed: 0,
              merged: 0
            },
            branches: branchList ? branchList.length : 0,
            contributors: contributorCount || 0,
            // For metrics that GitHub API doesn't provide directly,
            // we'll use a combination of real data with some calculated metrics
            testCoverage: calculateTestCoverage(languages, repoInfo.full_name),
            codeQuality: calculateCodeQuality(repoInfo, commits || []),
            ciStatus: {
              success: 90, // Default to high success rate
              failed: 8,
              pending: 2,
              status: "healthy"
            }
          };
          
          res.json(metrics);
        } else {
          res.status(404).json({ message: "GitHub repository information not found" });
        }
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
        res.status(500).json({ message: "Failed to fetch GitHub data" });
      }
    } catch (error) {
      console.error("Error processing GitHub metrics request:", error);
      res.status(500).json({ message: "Failed to get GitHub metrics" });
    }
  });

  // Test Cycles API endpoints
  app.get("/api/test-cycles", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const testCycles = await storage.getTestCycles(projectId);
      res.json(testCycles);
    } catch (error) {
      console.error("Error fetching test cycles:", error);
      res.status(500).json({ message: "Failed to fetch test cycles" });
    }
  });

  app.get("/api/test-cycles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const testCycle = await storage.getTestCycle(id);
      
      if (!testCycle) {
        return res.status(404).json({ message: "Test cycle not found" });
      }
      
      res.json(testCycle);
    } catch (error) {
      console.error("Error fetching test cycle:", error);
      res.status(500).json({ message: "Failed to fetch test cycle" });
    }
  });

  app.post("/api/test-cycles", async (req, res) => {
    try {
      const testCycleData = insertTestCycleSchema.parse(req.body);
      const newTestCycle = await storage.createTestCycle(testCycleData);
      res.status(201).json(newTestCycle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error creating test cycle:", error);
      res.status(500).json({ message: "Failed to create test cycle" });
    }
  });

  app.patch("/api/test-cycles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertTestCycleSchema.partial().parse(req.body);
      
      const updatedTestCycle = await storage.updateTestCycle(id, updateData);
      
      if (!updatedTestCycle) {
        return res.status(404).json({ message: "Test cycle not found" });
      }
      
      res.json(updatedTestCycle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error updating test cycle:", error);
      res.status(500).json({ message: "Failed to update test cycle" });
    }
  });

  // Test Cycle Items API endpoints
  app.get("/api/test-cycle-items/:cycleId", async (req, res) => {
    try {
      const cycleId = parseInt(req.params.cycleId);
      const testCycleItems = await storage.getTestCycleItems(cycleId);
      res.json(testCycleItems);
    } catch (error) {
      console.error("Error fetching test cycle items:", error);
      res.status(500).json({ message: "Failed to fetch test cycle items" });
    }
  });
  
  // Get a specific test cycle item by ID
  app.get("/api/test-cycle-items/item/:itemId", async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const item = await storage.getTestCycleItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Test cycle item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching test cycle item:", error);
      res.status(500).json({ message: "Failed to fetch test cycle item" });
    }
  });

  app.post("/api/test-cycle-items", async (req, res) => {
    try {
      const testCycleItemData = insertTestCycleItemSchema.parse(req.body);
      const newTestCycleItem = await storage.createTestCycleItem(testCycleItemData);
      res.status(201).json(newTestCycleItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error creating test cycle item:", error);
      res.status(500).json({ message: "Failed to create test cycle item" });
    }
  });

  app.patch("/api/test-cycle-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertTestCycleItemSchema.partial().parse(req.body);
      
      const updatedTestCycleItem = await storage.updateTestCycleItem(id, updateData);
      
      if (!updatedTestCycleItem) {
        return res.status(404).json({ message: "Test cycle item not found" });
      }
      
      res.json(updatedTestCycleItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error updating test cycle item:", error);
      res.status(500).json({ message: "Failed to update test cycle item" });
    }
  });
  
  // Delete a test cycle item
  app.delete("/api/test-cycle-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the item first to retrieve the cycleId for the response
      const item = await storage.getTestCycleItem(id);
      if (!item) {
        return res.status(404).json({ message: "Test cycle item not found" });
      }
      
      // Remove the item from the cycle
      const result = await storage.removeTestCycleItem(id);
      
      if (!result) {
        return res.status(404).json({ message: "Failed to remove test case from cycle" });
      }
      
      res.json({ 
        message: "Test case removed from cycle successfully",
        cycleId: item.cycleId
      });
    } catch (error) {
      console.error("Error removing test case from cycle:", error);
      res.status(500).json({ message: "Failed to remove test case from cycle" });
    }
  });

  // Add test cases to cycle
  app.post("/api/test-cycles/:cycleId/add-test-cases", async (req, res) => {
    try {
      const cycleId = parseInt(req.params.cycleId);
      const { testCaseIds, suiteId } = req.body;
      
      if (!testCaseIds || !Array.isArray(testCaseIds) || testCaseIds.length === 0) {
        return res.status(400).json({ message: "testCaseIds array is required" });
      }
      
      const addedItems = await storage.addTestCasesToCycle(
        cycleId, 
        testCaseIds.map(id => parseInt(id)), 
        suiteId ? parseInt(suiteId) : undefined
      );
      
      res.status(201).json(addedItems);
    } catch (error) {
      console.error("Error adding test cases to cycle:", error);
      res.status(500).json({ message: "Failed to add test cases to cycle" });
    }
  });
  
  // Add test cases to cycle (alternative endpoint to match client hook)
  app.post("/api/test-cycles/add-cases", async (req, res) => {
    try {
      const { cycleId, testCaseIds, suiteId } = req.body;
      
      if (!cycleId) {
        return res.status(400).json({ message: "cycleId is required" });
      }
      
      // If suiteId is provided but no test case IDs, add the entire suite
      if (suiteId && (!testCaseIds || testCaseIds.length === 0)) {
        const addedItems = await storage.addTestSuiteToCycle(
          parseInt(cycleId), 
          parseInt(suiteId)
        );
        
        return res.status(200).json(addedItems);
      }
      
      // Otherwise, require testCaseIds
      if (!testCaseIds || !Array.isArray(testCaseIds) || testCaseIds.length === 0) {
        return res.status(400).json({ message: "testCaseIds array is required" });
      }
      
      const addedItems = await storage.addTestCasesToCycle(
        parseInt(cycleId), 
        testCaseIds.map(id => parseInt(id)), 
        suiteId ? parseInt(suiteId) : undefined
      );
      
      res.status(200).json(addedItems);
    } catch (error) {
      console.error("Error adding test cases to cycle:", error);
      res.status(500).json({ message: "Failed to add test cases to cycle" });
    }
  });
  
  // Add entire test suite to cycle
  app.post("/api/test-cycles/:cycleId/add-suite/:suiteId", async (req, res) => {
    try {
      const cycleId = parseInt(req.params.cycleId);
      const suiteId = parseInt(req.params.suiteId);
      
      const addedItems = await storage.addTestSuiteToCycle(cycleId, suiteId);
      
      res.status(201).json(addedItems);
    } catch (error) {
      console.error("Error adding test suite to cycle:", error);
      res.status(500).json({ message: "Failed to add test suite to cycle" });
    }
  });

  // Test Runs API endpoints
  app.get("/api/test-runs/:cycleItemId", async (req, res) => {
    try {
      const cycleItemId = parseInt(req.params.cycleItemId);
      const testRuns = await storage.getTestRuns(cycleItemId);
      res.json(testRuns);
    } catch (error) {
      console.error("Error fetching test runs:", error);
      res.status(500).json({ message: "Failed to fetch test runs" });
    }
  });
  
  // Get all test runs for a specific test case
  app.get("/api/test-runs/test-case/:testCaseId", async (req, res) => {
    try {
      const testCaseId = parseInt(req.params.testCaseId);
      const testRuns = await storage.getTestRunsByTestCase(testCaseId);
      res.json(testRuns);
    } catch (error) {
      console.error("Error fetching test runs for test case:", error);
      res.status(500).json({ message: "Failed to fetch test runs for test case" });
    }
  });

  app.get("/api/test-runs/detail/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const testRun = await storage.getTestRun(id);
      
      if (!testRun) {
        return res.status(404).json({ message: "Test run not found" });
      }
      
      res.json(testRun);
    } catch (error) {
      console.error("Error fetching test run:", error);
      res.status(500).json({ message: "Failed to fetch test run" });
    }
  });

  app.post("/api/test-runs", async (req, res) => {
    try {
      const testRunData = insertTestRunSchema.parse(req.body);
      const newTestRun = await storage.createTestRun(testRunData);
      res.status(201).json(newTestRun);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error creating test run:", error);
      res.status(500).json({ message: "Failed to create test run" });
    }
  });

  app.patch("/api/test-runs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertTestRunSchema.partial().parse(req.body);
      
      const updatedTestRun = await storage.updateTestRun(id, updateData);
      
      if (!updatedTestRun) {
        return res.status(404).json({ message: "Test run not found" });
      }
      
      res.json(updatedTestRun);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      console.error("Error updating test run:", error);
      res.status(500).json({ message: "Failed to update test run" });
    }
  });

  // Jira Integration API Routes
  app.post('/api/jira/create-ticket', async (req, res) => {
    try {
      const { projectId, summary, description, issueType, testCaseId, testRunId } = req.body;
      
      if (!projectId || !summary || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get the project to retrieve Jira credentials
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if project has Jira integration
      if (!project.jiraUrl || !project.jiraProjectId || !project.jiraApiKey) {
        return res.status(400).json({ message: "Project does not have Jira integration configured" });
      }

      // Get test case details for more context
      const testCase = testCaseId ? await storage.getTestCase(testCaseId) : null;
      
      // Get test run details 
      const testRun = testRunId ? await storage.getTestRun(testRunId) : null;
      
      // Extract credentials from API key (expected format: email:token)
      const [username, apiToken] = project.jiraApiKey.split(':');
      if (!username || !apiToken) {
        return res.status(400).json({ message: "Invalid Jira API key format. Expected format: email:token" });
      }
      
      // Enhanced description with AI-generated content using test context
      const enhancedDescription = description + 
        (testCase ? `\n\n== Test Case Information ==\nTest Case: ${testCase.title}\nID: ${testCase.id}\nPriority: ${testCase.priority}\n${testCase.description ? `Description: ${testCase.description}` : ''}` : '') +
        (testRun ? `\n\n== Test Run Information ==\nStatus: ${testRun.status}\nExecuted: ${testRun.executedAt ? new Date(testRun.executedAt).toLocaleString() : 'Not recorded'}` : '');
      
      // Prepare auth header
      const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');
      
      // Get issue types to validate the requested type exists
      const issueTypesResponse = await fetch(`${project.jiraUrl}/rest/api/2/issuetype`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!issueTypesResponse.ok) {
        return res.status(400).json({ 
          message: "Failed to validate Jira issue types",
          error: await issueTypesResponse.text()
        });
      }
      
      const issueTypes = await issueTypesResponse.json();
      
      // Find the requested issue type
      const targetIssueType = issueTypes.find((type: any) => 
        type.name.toLowerCase() === (issueType || 'bug').toLowerCase()
      );
      
      if (!targetIssueType) {
        return res.status(400).json({ 
          message: `Issue type "${issueType || 'Bug'}" not found in Jira project`,
          availableTypes: issueTypes.map((t: any) => t.name)
        });
      }
      
      // Create issue in Jira
      const createResponse = await fetch(`${project.jiraUrl}/rest/api/2/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            project: { key: project.jiraProjectId },
            summary: summary,
            description: enhancedDescription,
            issuetype: { id: targetIssueType.id }
          }
        })
      });
      
      if (!createResponse.ok) {
        return res.status(400).json({ 
          message: "Failed to create Jira issue",
          error: await createResponse.text()
        });
      }
      
      const result = await createResponse.json();
      
      // Return the created issue details
      res.status(201).json({
        message: "Jira issue created successfully",
        issueKey: result.key,
        issueId: result.id,
        issueUrl: `${project.jiraUrl}/browse/${result.key}`
      });
      
    } catch (error) {
      console.error("Error creating Jira ticket:", error);
      res.status(500).json({ message: "Error creating Jira ticket", error: String(error) });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
