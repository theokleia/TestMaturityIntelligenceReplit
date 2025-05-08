import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateTestSuiteRequest } from "./types";
import { apiRequest } from "@/lib/queryClient";

/**
 * Hook for updating an existing test suite
 */
export function useUpdateTestSuite(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testSuite: UpdateTestSuiteRequest) => {
      const response = await apiRequest(`/api/test-suites/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(testSuite),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-suites'] });
    },
  });
}