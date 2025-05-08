// Export test suite related hooks
export { useTestSuites, useTestSuite } from './useTestSuites';

// Export test case related hooks
export { useTestCases, useTestCase } from './useTestCases';

// Export form hooks
export { useTestCaseForm } from './useTestCaseForm';
export { useTestSuiteForm } from './useTestSuiteForm';
export { useGenerateTestCasesForm } from './useGenerateTestCasesForm';

// Define types
export interface TestSuite {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  projectArea: string;
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
  preconditions: string | null;
  expectedResults: string;
  steps: TestStep[] | null;
  userId: number;
  suiteId: number;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  projectId?: number;
}