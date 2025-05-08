import { z } from "zod";

// Schema for creating/editing a test suite
export const testSuiteSchema = z.object({
  name: z.string().min(1, "Test suite name is required"),
  description: z.string().min(1, "Description is required"),
  projectArea: z.string().min(1, "Project area is required"),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
  type: z.string().default("functional"),
});

export type TestSuiteFormValues = z.infer<typeof testSuiteSchema>;

// Schema for creating/editing a test case
export const testCaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  preconditions: z.string().min(1, "Preconditions are required"),
  steps: z.array(
    z.object({ 
      step: z.string(), 
      expected: z.string() 
    })
  ).optional(),
  expectedResults: z.string().min(1, "Expected results are required"),
  priority: z.string().min(1, "Priority is required"),
  severity: z.string().min(1, "Severity is required"),
  status: z.string().min(1, "Status is required"),
  suiteId: z.coerce.number().min(1, "Test suite is required"),
  automatable: z.boolean().default(false),
});

export type TestCaseFormValues = z.infer<typeof testCaseSchema>;

// Schema for generating AI test cases
export const generateTestCasesSchema = z.object({
  feature: z.string().min(1, "Feature name is required"),
  requirements: z.string().min(1, "Requirements are required"),
  complexity: z.string().min(1, "Complexity is required"),
  testSuiteId: z.coerce.number().min(1, "Test suite is required"),
});

export type GenerateTestCasesFormValues = z.infer<typeof generateTestCasesSchema>;