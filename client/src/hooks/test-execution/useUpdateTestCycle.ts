import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TestCycle } from "./types";

interface UpdateTestCycleParams {
  id: number;
  data: Partial<Omit<TestCycle, 'id'>>;
}

/**
 * Hook to update an existing test cycle
 * @returns Mutation for updating a test cycle
 */
export function useUpdateTestCycle() {
  return useMutation<TestCycle, Error, UpdateTestCycleParams>({
    mutationFn: async ({ id, data }) => {
      const result = await apiRequest<TestCycle>(`/api/test-cycles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return result;
    },
    onSuccess: (_, { id }) => {
      // Invalidate both the collection and the individual test cycle queries
      queryClient.invalidateQueries({ queryKey: ['/api/test-cycles'] });
      queryClient.invalidateQueries({ queryKey: [`/api/test-cycles/${id}`] });
    },
  });
}