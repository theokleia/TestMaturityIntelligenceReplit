import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

/**
 * Hook to remove a test case from a test cycle
 * @returns Mutation for removing a test case from a cycle
 */
export function useRemoveTestCaseFromCycle() {
  return useMutation<boolean, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      const result = await apiRequest<boolean>(`/api/test-cycle-items/${id}`, {
        method: 'DELETE',
      });
      return result;
    },
    onSuccess: () => {
      // We don't know which cycle this item belonged to, so invalidate all test cycle items
      queryClient.invalidateQueries({ queryKey: ['/api/test-cycle-items'] });
    },
  });
}