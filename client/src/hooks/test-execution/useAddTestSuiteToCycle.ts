import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TestCycleItem } from "./types";

interface AddTestSuiteParams {
  cycleId: number;
  suiteId: number;
}

/**
 * Hook to add all test cases from a test suite to a test cycle
 * @returns Mutation for adding a test suite to a cycle
 */
export function useAddTestSuiteToCycle() {
  return useMutation<TestCycleItem[], Error, AddTestSuiteParams>({
    mutationFn: async ({ cycleId, suiteId }) => {
      const result = await apiRequest<TestCycleItem[]>(`/api/test-cycles/${cycleId}/add-suite`, {
        method: 'POST',
        body: JSON.stringify({ suiteId }),
      });
      return result;
    },
    onSuccess: (_, { cycleId }) => {
      // Invalidate the test cycle items query to refetch the data
      queryClient.invalidateQueries({ queryKey: [`/api/test-cycle-items/${cycleId}`] });
    },
  });
}