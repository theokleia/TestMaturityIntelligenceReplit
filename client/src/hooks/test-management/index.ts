// Re-export all hooks from test management module
import { useTestSuites, useTestSuite } from './useTestSuites';
import { useTestCases, useTestCase } from './useTestCases';
import { useTestCaseForm } from './useTestCaseForm';
import { useTestSuiteForm } from './useTestSuiteForm';
import { useGenerateTestCasesForm } from './useGenerateTestCasesForm';

// Export the hooks
export { 
  useTestSuites, 
  useTestSuite,
  useTestCases,
  useTestCase,
  useTestCaseForm,
  useTestSuiteForm,
  useGenerateTestCasesForm
};

// Create aliases for backwards compatibility
export const useCreateTestSuite = useTestSuites;
export const useUpdateTestSuite = useTestSuite;
export const useDeleteTestSuite = useTestSuite;
export const useCreateTestCase = useTestCases;
export const useUpdateTestCase = useTestCase;
export const useDeleteTestCase = useTestCase;
export const useGenerateTestCases = useTestCases;

// Define types
export interface TestSuite {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  projectArea: string;
  type: string;  // Added type property
  userId: number;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  projectId?: number;
}

export interface TestStep {
  step: string;
  expected: string;
}

export interface TestCase {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  severity: string;
  automatable: boolean;
  automationStatus?: string;  // Added property
  preconditions: string | null;
  expectedResults: string;
  steps: TestStep[] | null;
  userId: number;
  suiteId: number;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  projectId?: number;
  jiraTicketIds?: string[];  // Add Jira ticket IDs array
}