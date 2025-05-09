import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { InsertTestCycle, TestCycle } from "./types";

/**
 * Hook to create a new test cycle
 * @returns Mutation for creating a test cycle
 */
export function useCreateTestCycle() {
  return useMutation<TestCycle, Error, InsertTestCycle>({
    mutationFn: async (data) => {
      const result = await apiRequest<TestCycle>('/api/test-cycles', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result;
    },
    onSuccess: () => {
      // Invalidate the test cycles query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/test-cycles'] });
    },
  });
}