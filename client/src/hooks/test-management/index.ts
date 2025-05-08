// Types
export interface TestStep {
  step: string;
  expected: string;
}

export interface TestCase {
  id: number;
  title: string;
  description: string;
  preconditions: string;
  steps?: TestStep[];
  expectedResults: string;
  priority: string;
  severity: string;
  status: string;
  suiteId: number;
  projectId: number;
  userId: number;
  automatable: boolean;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  automationStatus?: string; // Added to fix type error
}

export interface TestSuite {
  id: number;
  name: string;
  description: string;
  projectArea: string;
  priority: string;
  status: string;
  type?: string; // Added to fix type errors
  projectId: number;
  userId: number;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Hook interfaces
export interface UseTestSuitesResult {
  isLoading: boolean;
  error: any;
  data: TestSuite[];
  refetch: () => void;
}

export interface UseTestCasesResult {
  isLoading: boolean;
  error: any;
  data: TestCase[];
  refetch: () => void;
}

// Form Hook exports
export { useTestCaseForm } from './useTestCaseForm';
export { useTestSuiteForm } from './useTestSuiteForm';
export { useGenerateTestCasesForm } from './useGenerateTestCasesForm';

// API Hook exports
export {
  useTestSuites,
  useCreateTestSuite,
  useUpdateTestSuite,
  useDeleteTestSuite
} from './useTestSuites';

export {
  useTestCases,
  useCreateTestCase,
  useUpdateTestCase,
  useDeleteTestCase,
  useGenerateTestCases
} from './useTestCases';