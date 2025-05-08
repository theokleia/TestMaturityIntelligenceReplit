import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTestSuiteRequest } from "./types";
import { apiRequest } from "@/lib/queryClient";

/**
 * Hook for creating a new test suite
 */
export function useCreateTestSuite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testSuite: CreateTestSuiteRequest) => {
      const response = await apiRequest('/api/test-suites', {
        method: 'POST',
        body: JSON.stringify(testSuite),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-suites'] });
    },
  });
}