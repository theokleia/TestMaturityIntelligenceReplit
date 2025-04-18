// Include TestCaseStep type directly to avoid circular dependencies
export interface TestCaseStep {
  step: string;
  expected: string;
}

export interface TestSuite {
  id: number;
  name: string;
  description: string;
  projectArea: string;
  priority: string;
  status: string;
  type: string;
  userId: number;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  projectId?: number;
  tags?: string[];
}

export interface CreateTestSuiteRequest {
  name: string;
  description: string;
  projectArea: string;
  priority: string;
  status: string;
  type: string;
  aiGenerated?: boolean;
  projectId?: number;
  tags?: string[];
}

export interface UpdateTestSuiteRequest {
  name?: string;
  description?: string;
  projectArea?: string;
  priority?: string;
  status?: string;
  type?: string;
  tags?: string[];
}

export interface TestCase {
  id: number;
  title: string;
  description: string;
  preconditions: string;
  steps: TestCaseStep[];
  expectedResults: string;
  priority: string;
  severity: string;
  status: string;
  suiteId: number;
  userId: number;
  aiGenerated: boolean;
  automatable: boolean;
  automationStatus: string;
  projectId?: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface CreateTestCaseRequest {
  title: string;
  description: string;
  preconditions: string;
  steps: TestCaseStep[];
  expectedResults: string;
  priority: string;
  severity: string;
  status: string;
  suiteId: number;
  aiGenerated?: boolean;
  automatable?: boolean;
  automationStatus?: string;
  projectId?: number;
  tags?: string[];
}

export interface UpdateTestCaseRequest {
  title?: string;
  description?: string;
  preconditions?: string;
  steps?: TestCaseStep[];
  expectedResults?: string;
  priority?: string;
  severity?: string;
  status?: string;
  automatable?: boolean;
  automationStatus?: string;
  tags?: string[];
}

export interface TestSuiteFilters {
  userId?: number;
  status?: string;
  priority?: string;
  projectArea?: string;
  aiGenerated?: boolean;
  projectId?: number;
}

export interface TestCaseFilters {
  suiteId?: number;
  userId?: number;
  status?: string;
  priority?: string;
  severity?: string;
  aiGenerated?: boolean;
  automatable?: boolean;
  projectId?: number;
}