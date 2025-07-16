import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { 
  insertTestSuiteSchema,
  insertTestCaseSchema,
  insertTestCycleSchema,
  insertTestCycleItemSchema,
  insertTestRunSchema
} from "@shared/schema";
import { 
  generateTestCases,
  generateTestCoverage,
  generateTestSteps
} from "../openai-service";
import { requireAuth } from "./auth.routes";

export function registerTestManagementRoutes(app: Express) {
  // Test Suites CRUD
  app.get("/api/test-suites", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const testSuites = await storage.getTestSuites({ projectId });
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

  app.post("/api/test-suites", requireAuth, async (req, res) => {
    try {
      const testSuiteData = insertTestSuiteSchema.parse(req.body);
      const testSuite = await storage.createTestSuite(testSuiteData);
      res.status(201).json(testSuite);
    } catch (error) {
      console.error("Error creating test suite:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid test suite data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create test suite" });
      }
    }
  });

  app.put("/api/test-suites/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const testSuiteData = insertTestSuiteSchema.partial().parse(req.body);
      const testSuite = await storage.updateTestSuite(id, testSuiteData);
      
      if (!testSuite) {
        return res.status(404).json({ message: "Test suite not found" });
      }
      
      res.json(testSuite);
    } catch (error) {
      console.error("Error updating test suite:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid test suite data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to update test suite" });
      }
    }
  });

  app.delete("/api/test-suites/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteTestSuite(id);
      
      if (!result.deletedSuite) {
        return res.status(404).json({ message: "Test suite not found" });
      }
      
      res.json({
        message: "Test suite deleted successfully",
        deletedSuite: true,
        deletedTestCases: result.deletedTestCases
      });
    } catch (error) {
      console.error("Error deleting test suite:", error);
      res.status(500).json({ message: "Failed to delete test suite" });
    }
  });

  // Test Cases CRUD
  app.get("/api/test-cases", async (req, res) => {
    try {
      const suiteId = req.query.suiteId ? parseInt(req.query.suiteId as string) : undefined;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const testCases = await storage.getTestCases({ suiteId, projectId });
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

  app.post("/api/test-cases", requireAuth, async (req, res) => {
    try {
      const testCaseData = insertTestCaseSchema.parse(req.body);
      const testCase = await storage.createTestCase(testCaseData);
      res.status(201).json(testCase);
    } catch (error) {
      console.error("Error creating test case:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid test case data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create test case" });
      }
    }
  });

  app.put("/api/test-cases/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const testCaseData = insertTestCaseSchema.partial().parse(req.body);
      const testCase = await storage.updateTestCase(id, testCaseData);
      
      if (!testCase) {
        return res.status(404).json({ message: "Test case not found" });
      }
      
      res.json(testCase);
    } catch (error) {
      console.error("Error updating test case:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid test case data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to update test case" });
      }
    }
  });

  app.patch("/api/test-cases/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const testCaseData = insertTestCaseSchema.partial().parse(req.body);
      const testCase = await storage.updateTestCase(id, testCaseData);
      
      if (!testCase) {
        return res.status(404).json({ message: "Test case not found" });
      }
      
      res.json(testCase);
    } catch (error) {
      console.error("Error updating test case:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid test case data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to update test case" });
      }
    }
  });

  app.delete("/api/test-cases/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteTestCase(id);
      
      if (!result) {
        return res.status(404).json({ message: "Test case not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting test case:", error);
      res.status(500).json({ message: "Failed to delete test case" });
    }
  });

  // Test suite test cases count endpoint
  app.get("/api/test-suites/:id/test-cases/count", async (req, res) => {
    try {
      const suiteId = parseInt(req.params.id);
      const testCases = await storage.getTestCases({ suiteId });
      res.json({ count: testCases.length });
    } catch (error) {
      console.error("Error fetching test cases count:", error);
      res.status(500).json({ message: "Failed to fetch test cases count" });
    }
  });

  // AI Test Generation Routes
  app.post("/api/test-suites/:suiteId/generate-coverage", async (req, res) => {
    try {
      const suiteId = parseInt(req.params.suiteId);
      const { projectId } = req.body;
      
      // Get the test suite
      const testSuite = await storage.getTestSuite(suiteId);
      if (!testSuite) {
        return res.status(404).json({ message: "Test suite not found" });
      }
      
      // Get project details
      const testProjectId = projectId || testSuite.projectId;
      const project = await storage.getProject(testProjectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Fetch project context for AI analysis
      const documents = await storage.getDocuments({ projectId: testProjectId });
      const jiraTickets = await storage.getJiraTicketsByProject(testProjectId);
      const existingTestCases = await storage.getTestCases({ projectId: testProjectId });
      
      // Generate test coverage analysis
      const coverageResult = await generateTestCoverage(
        project,
        testSuite,
        documents,
        jiraTickets,
        existingTestCases
      );
      
      res.json({
        message: "Test coverage analysis completed",
        proposedTestCases: coverageResult.proposedTestCases,
        analysis: coverageResult.analysis,
        context: {
          documentsCount: documents.length,
          jiraTicketsCount: jiraTickets.length,
          existingTestCasesCount: existingTestCases.length
        }
      });
    } catch (error) {
      console.error("Error generating test coverage:", error);
      res.status(500).json({ message: "Failed to generate test coverage" });
    }
  });

  // Accept proposed test cases from AI coverage generation
  app.post("/api/test-suites/:suiteId/accept-coverage", async (req, res) => {
    try {
      const suiteId = parseInt(req.params.suiteId);
      const { proposedTestCases, projectId } = req.body;
      
      if (!proposedTestCases || !Array.isArray(proposedTestCases)) {
        return res.status(400).json({ message: "proposedTestCases array is required" });
      }
      
      // Get the test suite
      const testSuite = await storage.getTestSuite(suiteId);
      if (!testSuite) {
        return res.status(404).json({ message: "Test suite not found" });
      }
      
      const testProjectId = projectId || testSuite.projectId;
      const createdTestCases = [];
      
      // First, create all test cases
      for (const proposal of proposedTestCases) {
        const newTestCase = await storage.createTestCase({
          title: proposal.title,
          description: proposal.description,
          preconditions: "System is accessible and preconditions are met",
          steps: [],
          expectedResults: "Test validates the specified functionality",
          priority: proposal.priority,
          severity: "normal",
          status: "draft",
          suiteId: suiteId,
          userId: null, // AI-generated test cases don't have a specific user  
          aiGenerated: true,
          automatable: false,
          automationStatus: "not-automated",
          projectId: testProjectId
        });
        
        createdTestCases.push(newTestCase);
      }
      
      // Then, create Jira links for the created test cases
      for (let i = 0; i < proposedTestCases.length; i++) {
        const proposal = proposedTestCases[i];
        const testCase = createdTestCases[i];
        
        // Get ticket keys from proposal (support both jiraTickets and jiraTicketIds)
        const ticketKeys = [];
        
        // Prefer jiraTickets array with summaries
        if (proposal.jiraTickets && proposal.jiraTickets.length > 0) {
          ticketKeys.push(...proposal.jiraTickets.map(ticket => ticket.key));
        } 
        // Fallback to jiraTicketIds for backwards compatibility
        else if (proposal.jiraTicketIds && proposal.jiraTicketIds.length > 0) {
          ticketKeys.push(...proposal.jiraTicketIds);
        }
        
        // Create Jira links for all ticket keys (only for tickets that exist in database)
        if (ticketKeys.length > 0) {
          for (const ticketKey of ticketKeys) {
            try {
              const link = await storage.createTestCaseJiraLinkByKey(
                testCase.id,
                ticketKey,
                testProjectId,
                "covers"
              );
              if (link) {
                console.log(`Created Jira link for test case "${testCase.title}" to existing ticket ${ticketKey}`);
              } else {
                console.log(`Skipped creating link for test case "${testCase.title}" to non-existent ticket ${ticketKey}`);
              }
            } catch (error) {
              console.error(`Error creating Jira link for test case "${testCase.title}" to ticket ${ticketKey}:`, error);
            }
          }
        }
      }
      
      res.status(201).json({
        message: "Test cases created successfully from AI coverage",
        testCases: createdTestCases,
        count: createdTestCases.length
      });
    } catch (error) {
      console.error("Error accepting test coverage:", error);
      res.status(500).json({ message: "Failed to create test cases from coverage" });
    }
  });

  // Bulk create test suites (for AI generation)
  app.post("/api/test-suites/bulk-create", requireAuth, async (req, res) => {
    try {
      const { testSuites, projectId } = req.body;
      
      if (!testSuites || !Array.isArray(testSuites)) {
        return res.status(400).json({ message: "testSuites array is required" });
      }
      
      if (!projectId) {
        return res.status(400).json({ message: "projectId is required" });
      }
      
      const createdSuites = [];
      
      for (const suiteData of testSuites) {
        const newSuite = await storage.createTestSuite({
          name: suiteData.name,
          description: suiteData.description,
          type: suiteData.type || "functional",
          status: "active",
          priority: suiteData.priority || "medium",
          projectArea: suiteData.projectArea || "General",
          userId: null, // AI-generated
          aiGenerated: true,
          tags: suiteData.tags || [],
          projectId: projectId
        });
        
        createdSuites.push(newSuite);
      }
      
      res.status(201).json({
        message: "Test suites created successfully",
        testSuites: createdSuites,
        count: createdSuites.length
      });
    } catch (error) {
      console.error("Error creating test suites:", error);
      res.status(500).json({ message: "Failed to create test suites" });
    }
  });

  // Test Cycles Routes (basic CRUD to prevent 404 errors)
  app.get("/api/test-cycles", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      if (projectId && isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid projectId parameter" });
      }
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

  app.post("/api/test-cycles", requireAuth, async (req, res) => {
    try {
      const testCycleData = insertTestCycleSchema.parse(req.body);
      const testCycle = await storage.createTestCycle(testCycleData);
      res.status(201).json(testCycle);
    } catch (error) {
      console.error("Error creating test cycle:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid test cycle data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create test cycle" });
      }
    }
  });

  // AI Test Steps Generation
  app.post("/api/ai/generate-test-steps", async (req, res) => {
    try {
      const { projectId, testCase, includeDocuments = true, includeJira = true } = req.body;
      
      if (!projectId || !testCase) {
        return res.status(400).json({ 
          message: "projectId and testCase are required" 
        });
      }

      // Get project details
      const project = await storage.getProject(parseInt(projectId));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Generate test steps
      const result = await generateTestSteps(project, testCase, includeDocuments, includeJira);
      
      res.json({
        message: "Test steps generated successfully",
        ...result
      });
    } catch (error) {
      console.error("Error generating test steps:", error);
      res.status(500).json({ message: "Failed to generate test steps" });
    }
  });
}