import { z } from "zod";

// Test Suite schema
export const testSuiteSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  projectArea: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["draft", "ready", "in-progress", "completed"]),
  projectId: z.number().min(1, "Project ID is required"),
});

export type TestSuiteFormValues = z.infer<typeof testSuiteSchema>;

// Test Case schema
export const testCaseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  preconditions: z.string().optional(),
  steps: z.array(
    z.object({
      step: z.string().min(1, "Step cannot be empty"),
      expected: z.string().min(1, "Expected result cannot be empty"),
    })
  ).optional(),
  expectedResults: z.string().min(5, "Expected results must be at least 5 characters"),
  priority: z.enum(["high", "medium", "low"]),
  severity: z.enum(["critical", "high", "normal", "low"]),
  status: z.enum(["draft", "ready", "in-progress", "blocked", "completed"]),
  suiteId: z.number().min(1, "A test suite must be selected"),
  automatable: z.boolean().default(false),
});

export type TestCaseFormValues = z.infer<typeof testCaseSchema>;

// AI Test case generation schema
export const generateTestCasesSchema = z.object({
  feature: z.string().min(5, "Feature description is required"),
  requirements: z.string().min(5, "Requirements are required"),
  complexity: z.enum(["simple", "moderate", "complex"]).default("moderate"),
  testSuiteId: z.number().min(1, "A test suite must be selected"),
});

export type GenerateTestCasesFormValues = z.infer<typeof generateTestCasesSchema>;