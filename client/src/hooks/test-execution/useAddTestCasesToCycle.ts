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
      console.log(`Attempting to add test cases to cycle: ${cycleId}`, testCaseIds);
      
      try {
        const result = await apiRequest<TestCycleItem[]>(`/api/test-cycles/${cycleId}/add-cases`, {
          method: 'POST',
          body: JSON.stringify({ testCaseIds }),
        });
        console.log('Add test cases API response:', result);
        return result;
      } catch (error) {
        console.error('Error adding test cases to cycle:', error);
        throw error;
      }
    },
    onSuccess: (data, { cycleId }) => {
      console.log(`Successfully added test cases to cycle ${cycleId}`, data);
      // Invalidate the test cycle items query to refetch the data
      queryClient.invalidateQueries({ queryKey: [`/api/test-cycle-items/${cycleId}`] });
    },
    onError: (error) => {
      console.error('Error in add test cases mutation:', error);
    }
  });
}