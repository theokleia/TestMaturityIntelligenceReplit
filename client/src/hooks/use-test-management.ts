import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TestCase, TestCaseStep } from "./use-ai-recommendations";

export interface TestSuite {
  id: number;
  name: string;
  description: string;
  projectArea: string;
  priority: string;
  status: string;
  userId: number;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestSuiteRequest {
  name: string;
  description: string;
  projectArea: string;
  priority: string;
  status: string;
  aiGenerated?: boolean;
}

export interface UpdateTestSuiteRequest {
  name?: string;
  description?: string;
  projectArea?: string;
  priority?: string;
  status?: string;
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
}

// Hook to fetch all test suites with optional filtering
export function useTestSuites(filters?: {
  userId?: number;
  status?: string;
  priority?: string;
  projectArea?: string;
  aiGenerated?: boolean;
}) {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    if (filters.userId) queryParams.append('userId', filters.userId.toString());
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.projectArea) queryParams.append('projectArea', filters.projectArea);
    if (filters.aiGenerated !== undefined) queryParams.append('aiGenerated', filters.aiGenerated.toString());
  }
  
  const url = `/api/test-suites${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return useQuery<TestSuite[]>({
    queryKey: ['/api/test-suites', filters],
    refetchOnWindowFocus: false,
  });
}

// Hook to fetch a single test suite by ID
export function useTestSuite(id: number) {
  return useQuery<TestSuite>({
    queryKey: ['/api/test-suites', id],
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}

// Hook to create a new test suite
export function useCreateTestSuite() {
  return useMutation({
    mutationFn: async (request: CreateTestSuiteRequest) => {
      const res = await apiRequest('POST', '/api/test-suites', request);
      return res.json() as Promise<TestSuite>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-suites'] });
    },
  });
}

// Hook to update an existing test suite
export function useUpdateTestSuite(id: number) {
  return useMutation({
    mutationFn: async (request: UpdateTestSuiteRequest) => {
      const res = await apiRequest('PATCH', `/api/test-suites/${id}`, request);
      return res.json() as Promise<TestSuite>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-suites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/test-suites', id] });
    },
  });
}

// Hook to fetch all test cases with optional filtering
export function useTestCases(filters?: {
  suiteId?: number;
  userId?: number;
  status?: string;
  priority?: string;
  severity?: string;
  aiGenerated?: boolean;
  automatable?: boolean;
}) {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    if (filters.suiteId) queryParams.append('suiteId', filters.suiteId.toString());
    if (filters.userId) queryParams.append('userId', filters.userId.toString());
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.severity) queryParams.append('severity', filters.severity);
    if (filters.aiGenerated !== undefined) queryParams.append('aiGenerated', filters.aiGenerated.toString());
    if (filters.automatable !== undefined) queryParams.append('automatable', filters.automatable.toString());
  }
  
  const url = `/api/test-cases${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return useQuery<TestCase[]>({
    queryKey: ['/api/test-cases', filters],
    refetchOnWindowFocus: false,
  });
}

// Hook to fetch a single test case by ID
export function useTestCase(id: number) {
  return useQuery<TestCase>({
    queryKey: ['/api/test-cases', id],
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}

// Hook to create a new test case
export function useCreateTestCase() {
  return useMutation({
    mutationFn: async (request: CreateTestCaseRequest) => {
      const res = await apiRequest('POST', '/api/test-cases', request);
      return res.json() as Promise<TestCase>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-cases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/test-suites', variables.suiteId] });
    },
  });
}

// Hook to update an existing test case
export function useUpdateTestCase(id: number, suiteId?: number) {
  return useMutation({
    mutationFn: async (request: UpdateTestCaseRequest) => {
      const res = await apiRequest('PATCH', `/api/test-cases/${id}`, request);
      return res.json() as Promise<TestCase>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-cases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/test-cases', id] });
      if (suiteId) {
        queryClient.invalidateQueries({ queryKey: ['/api/test-suites', suiteId] });
      }
    },
  });
}