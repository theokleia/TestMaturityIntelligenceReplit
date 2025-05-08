import * as z from "zod";

export const testSuiteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["draft", "ready", "in-progress", "completed", "archived"]),
  priority: z.enum(["high", "medium", "low"]),
  projectArea: z.string().min(1, "Project area is required"),
});

export type TestSuiteFormValues = z.infer<typeof testSuiteSchema>;

export const testStepSchema = z.object({
  step: z.string().min(1, "Step description is required"),
  expected: z.string().min(1, "Expected result is required"),
});

export const testCaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["draft", "ready", "in-progress", "completed", "blocked"]),
  priority: z.enum(["high", "medium", "low"]),
  suiteId: z.number(),
  severity: z.enum(["critical", "high", "normal", "low"]),
  automatable: z.boolean(),
  preconditions: z.string().optional(),
  expectedResults: z.string().min(1, "Expected results are required"),
  steps: z.array(testStepSchema).optional(),
});

export type TestCaseFormValues = z.infer<typeof testCaseSchema>;

export const generateTestCasesSchema = z.object({
  feature: z.string().min(1, "Feature name is required"),
  requirements: z.string().min(1, "Requirements are required"),
  complexity: z.enum(["low", "medium", "high"]),
  testSuiteId: z.number(),
});

export type GenerateTestCasesFormValues = z.infer<typeof generateTestCasesSchema>;