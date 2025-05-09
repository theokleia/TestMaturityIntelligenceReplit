import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TestCycleItem } from "./types";

interface AddTestCasesParams {
  cycleId: number;
  testCaseIds: number[];
}

/**
 * Hook to add test cases to a test cycle
 * @returns Mutation for adding test cases to a cycle
 */
export function useAddTestCasesToCycle() {
  return useMutation<TestCycleItem[], Error, AddTestCasesParams>({
    mutationFn: async ({ cycleId, testCaseIds }) => {
      const result = await apiRequest<TestCycleItem[]>(`/api/test-cycles/${cycleId}/add-cases`, {
        method: 'POST',
        body: JSON.stringify({ testCaseIds }),
      });
      return result;
    },
    onSuccess: (_, { cycleId }) => {
      // Invalidate the test cycle items query to refetch the data
      queryClient.invalidateQueries({ queryKey: [`/api/test-cycle-items/${cycleId}`] });
    },
  });
}