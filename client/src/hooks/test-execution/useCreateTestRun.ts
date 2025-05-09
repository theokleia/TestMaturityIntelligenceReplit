import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TestRun, TestRunFormValues } from "./types";

interface CreateTestRunParams {
  cycleItemId: number;
  testCaseId: number;
  status: string;
  notes: string;
  steps: any;
}

/**
 * Hook to create a new test run
 * @returns Mutation for creating a test run
 */
export function useCreateTestRun() {
  return useMutation<TestRun, Error, CreateTestRunParams>({
    mutationFn: async (data) => {
      const result = await apiRequest<TestRun>('/api/test-runs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result;
    },
    onSuccess: (_, { cycleItemId, testCaseId }) => {
      // Invalidate test runs for both the cycle item and test case
      queryClient.invalidateQueries({ queryKey: [`/api/test-runs/by-cycle-item/${cycleItemId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/test-runs/by-test-case/${testCaseId}`] });
    },
  });
}