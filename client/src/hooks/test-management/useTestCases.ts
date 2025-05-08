import { 
  useMutation, 
  useQuery, 
  useQueryClient,
  UseMutateFunction
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TestCase } from "@/hooks/test-management";
import { TestCaseFormValues, GenerateTestCasesFormValues } from "@/schemas/test-management";

interface TestCasesFilters {
  suiteId?: number;
  userId?: number;
  status?: string;
  priority?: string;
  severity?: string;
  aiGenerated?: boolean;
  automatable?: boolean;
  projectId?: number;
}

interface GenerateTestCasesResponse {
  success: boolean;
  message: string;
  testCases: TestCase[];
}

export function useTestCases(filters: TestCasesFilters = {}) {
  const queryClient = useQueryClient();
  
  // Construct query key with filters
  const queryKey = Object.entries(filters).length > 0
    ? ["/api/test-cases", filters]
    : ["/api/test-cases"];
  
  // Fetch all test cases with optional filters
  const { data: testCases = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const url = `/api/test-cases${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return apiRequest<TestCase[]>(url);
    },
  });

  // Create a new test case
  const createTestCaseMutation = useMutation({
    mutationFn: async (data: Omit<TestCase, "id" | "createdAt" | "updatedAt" | "userId" | "aiGenerated">) => {
      const response = await apiRequest<TestCase>("/api/test-cases", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate test cases query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/test-cases"] });
      
      // Also invalidate test cases for specific suite if applicable
      if (variables.suiteId) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/test-cases", { suiteId: variables.suiteId }]
        });
      }
    },
  });

  // Update an existing test case
  const updateTestCaseMutation = useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: number; 
      data: Partial<Omit<TestCase, "id" | "createdAt" | "updatedAt" | "userId">>
    }) => {
      const response = await apiRequest<TestCase>(`/api/test-cases/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate test cases query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/test-cases"] });
      
      // Also invalidate the single test case query if it exists
      queryClient.invalidateQueries({ queryKey: ["/api/test-cases", variables.id] });
      
      // If the test case's suite ID has changed, invalidate the old suite's test cases
      if (variables.data.suiteId) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/test-cases", { suiteId: variables.data.suiteId }]
        });
      }
    },
  });

  // Delete a test case
  const deleteTestCaseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest<boolean>(`/api/test-cases/${id}`, {
        method: "DELETE",
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate test cases query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/test-cases"] });
    },
  });

  // Generate test cases with AI
  const generateTestCasesMutation = useMutation({
    mutationFn: async (data: GenerateTestCasesFormValues) => {
      const response = await apiRequest<GenerateTestCasesResponse>("/api/test-cases/generate", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate test cases query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/test-cases"] });
      
      // Also invalidate test cases for the specific suite
      if (variables.testSuiteId) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/test-cases", { suiteId: variables.testSuiteId }]
        });
      }
    },
  });

  return {
    testCases,
    isLoading,
    error,
    createTestCase: createTestCaseMutation.mutate,
    updateTestCase: updateTestCaseMutation.mutate,
    deleteTestCase: deleteTestCaseMutation.mutate,
    generateTestCases: generateTestCasesMutation.mutate,
    createTestCaseIsPending: createTestCaseMutation.isPending,
    updateTestCaseIsPending: updateTestCaseMutation.isPending,
    deleteTestCaseIsPending: deleteTestCaseMutation.isPending,
    generateTestCasesIsPending: generateTestCasesMutation.isPending,
  };
}

export function useTestCase(id: number) {
  const queryClient = useQueryClient();
  
  const { data: testCase, isLoading, error } = useQuery({
    queryKey: ["/api/test-cases", id],
    queryFn: async () => {
      const response = await apiRequest<TestCase>(`/api/test-cases/${id}`);
      return response;
    },
    enabled: !!id, // Only run query if id is provided
  });

  // Update an existing test case
  const updateTestCaseMutation = useMutation({
    mutationFn: async (data: Partial<TestCaseFormValues>) => {
      const response = await apiRequest<TestCase>(`/api/test-cases/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate the single test case query
      queryClient.invalidateQueries({ queryKey: ["/api/test-cases", id] });
      
      // Also invalidate the test cases list
      queryClient.invalidateQueries({ queryKey: ["/api/test-cases"] });
      
      // If the test case's suite ID has changed, invalidate the suite's test cases
      if (variables.suiteId) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/test-cases", { suiteId: variables.suiteId }]
        });
      }
    },
  });

  // Delete a test case
  const deleteTestCaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest<boolean>(`/api/test-cases/${id}`, {
        method: "DELETE",
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate the test cases list
      queryClient.invalidateQueries({ queryKey: ["/api/test-cases"] });
      
      // If we know the suite ID from the fetched test case, invalidate its test cases too
      if (testCase && testCase.suiteId) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/test-cases", { suiteId: testCase.suiteId }]
        });
      }
    },
  });

  return {
    testCase,
    isLoading,
    error,
    updateTestCase: updateTestCaseMutation.mutate,
    deleteTestCase: deleteTestCaseMutation.mutate,
    updateTestCaseIsPending: updateTestCaseMutation.isPending,
    deleteTestCaseIsPending: deleteTestCaseMutation.isPending,
  };
}