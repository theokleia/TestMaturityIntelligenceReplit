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
  type: string;
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
  type: string;
  aiGenerated?: boolean;
  projectId?: number;
}

export interface UpdateTestSuiteRequest {
  name?: string;
  description?: string;
  projectArea?: string;
  priority?: string;
  status?: string;
  type?: string;
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
  projectId?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    if (filters.userId) queryParams.append('userId', filters.userId.toString());
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.projectArea) queryParams.append('projectArea', filters.projectArea);
    if (filters.aiGenerated !== undefined) queryParams.append('aiGenerated', filters.aiGenerated.toString());
    if (filters.projectId) queryParams.append('projectId', filters.projectId.toString());
  }
  
  const url = `/api/test-suites${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return useQuery<TestSuite[]>({
    queryKey: [url, filters],
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
      // Invalidate all test suite queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey[0] as string;
          return queryKey.startsWith('/api/test-suites');
        }
      });
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
      // Invalidate all test suite queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey[0] as string;
          return queryKey.startsWith('/api/test-suites');
        }
      });
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
  projectId?: number;
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
    if (filters.projectId) queryParams.append('projectId', filters.projectId.toString());
  }
  
  const url = `/api/test-cases${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return useQuery<TestCase[]>({
    queryKey: [url, filters],
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
      // Invalidate all test case queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey[0] as string;
          return queryKey.startsWith('/api/test-cases');
        }
      });
      
      // Invalidate all test suite queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey[0] as string;
          return queryKey.startsWith('/api/test-suites');
        }
      });
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
      // Invalidate all test case queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey[0] as string;
          return queryKey.startsWith('/api/test-cases');
        }
      });
      
      // Invalidate all test suite queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey[0] as string;
          return queryKey.startsWith('/api/test-suites');
        }
      });
    },
  });
}