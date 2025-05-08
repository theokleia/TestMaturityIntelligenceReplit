import { 
  useMutation, 
  useQuery, 
  useQueryClient,
  UseMutateFunction
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TestSuite } from "@/hooks/test-management"; 
import { TestSuiteFormValues } from "@/schemas/test-management";

interface TestSuitesFilters {
  userId?: number;
  status?: string;
  priority?: string;
  projectArea?: string;
  aiGenerated?: boolean;
  projectId?: number;
}

export function useTestSuites(filters: TestSuitesFilters = {}) {
  const queryClient = useQueryClient();
  
  // Construct query key with filters
  const queryKey = Object.entries(filters).length > 0
    ? ["/api/test-suites", filters]
    : ["/api/test-suites"];
  
  // Fetch all test suites with optional filters
  const { data: testSuites = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const url = `/api/test-suites${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return apiRequest<TestSuite[]>(url);
    },
  });

  // Create a new test suite
  const createTestSuiteMutation = useMutation({
    mutationFn: async (data: Omit<TestSuite, "id" | "createdAt" | "updatedAt" | "userId" | "aiGenerated">) => {
      const response = await apiRequest<TestSuite>("/api/test-suites", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate test suites query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/test-suites"] });
    },
  });

  // Update an existing test suite
  const updateTestSuiteMutation = useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: number; 
      data: Partial<Omit<TestSuite, "id" | "createdAt" | "updatedAt" | "userId">>
    }) => {
      const response = await apiRequest<TestSuite>(`/api/test-suites/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate test suites query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/test-suites"] });
      
      // Also invalidate the single test suite query if it exists
      queryClient.invalidateQueries({ queryKey: ["/api/test-suites", variables.id] });
    },
  });

  // Delete a test suite
  const deleteTestSuiteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest<boolean>(`/api/test-suites/${id}`, {
        method: "DELETE",
      });
      return response;
    },
    onSuccess: (_, id) => {
      // Invalidate test suites query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/test-suites"] });
      
      // Also invalidate the single test suite query if it exists
      queryClient.invalidateQueries({ queryKey: ["/api/test-suites", id] });
      
      // Invalidate any test cases associated with this suite
      queryClient.invalidateQueries({ queryKey: ["/api/test-cases"] });
    },
  });

  return {
    testSuites,
    isLoading,
    error,
    createSuite: createTestSuiteMutation.mutate,
    updateSuite: updateTestSuiteMutation.mutate,
    deleteSuite: deleteTestSuiteMutation.mutate,
    createSuiteIsPending: createTestSuiteMutation.isPending,
    updateSuiteIsPending: updateTestSuiteMutation.isPending,
    deleteSuiteIsPending: deleteTestSuiteMutation.isPending,
  };
}

export function useTestSuite(id: number) {
  const queryClient = useQueryClient();
  
  const { data: testSuite, isLoading, error } = useQuery({
    queryKey: ["/api/test-suites", id],
    queryFn: async () => {
      const response = await apiRequest<TestSuite>(`/api/test-suites/${id}`);
      return response;
    },
    enabled: !!id, // Only run query if id is provided
  });

  // Update an existing test suite
  const updateTestSuiteMutation = useMutation({
    mutationFn: async (data: Partial<TestSuiteFormValues>) => {
      const response = await apiRequest<TestSuite>(`/api/test-suites/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate the single test suite query
      queryClient.invalidateQueries({ queryKey: ["/api/test-suites", id] });
      
      // Also invalidate the test suites list
      queryClient.invalidateQueries({ queryKey: ["/api/test-suites"] });
    },
  });

  // Delete a test suite
  const deleteTestSuiteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest<boolean>(`/api/test-suites/${id}`, {
        method: "DELETE",
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate the test suites list
      queryClient.invalidateQueries({ queryKey: ["/api/test-suites"] });
      
      // Invalidate any test cases associated with this suite
      queryClient.invalidateQueries({ queryKey: ["/api/test-cases"] });
    },
  });

  return {
    testSuite,
    isLoading,
    error,
    updateSuite: updateTestSuiteMutation.mutate,
    deleteSuite: deleteTestSuiteMutation.mutate,
    updateSuiteIsPending: updateTestSuiteMutation.isPending,
    deleteSuiteIsPending: deleteTestSuiteMutation.isPending,
  };
}