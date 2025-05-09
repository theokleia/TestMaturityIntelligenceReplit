import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TestCycleItem } from "./types";

interface UpdateTestCycleItemParams {
  id: number;
  data: Partial<TestCycleItem>;
}

/**
 * Hook to update a test cycle item
 * @returns Mutation for updating a test cycle item
 */
export function useUpdateTestCycleItem() {
  return useMutation<TestCycleItem, Error, UpdateTestCycleItemParams>({
    mutationFn: async ({ id, data }) => {
      const result = await apiRequest<TestCycleItem>(`/api/test-cycle-items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return result;
    },
    onSuccess: (_, { id }) => {
      // Invalidate specific test cycle item and all items (since we don't know which cycle this belongs to)
      queryClient.invalidateQueries({ queryKey: [`/api/test-cycle-items/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/test-cycle-items'] });
    },
  });
}