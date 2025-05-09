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
      console.log(`Attempting to add test suite ${suiteId} to cycle ${cycleId}`);
      
      try {
        // Use the correct API endpoint that matches server route
        const result = await apiRequest<TestCycleItem[]>(`/api/test-cycles/${cycleId}/add-suite/${suiteId}`, {
          method: 'POST',
        });
        console.log('Add test suite API response:', result);
        return result;
      } catch (error) {
        console.error('Error adding test suite to cycle:', error);
        throw error;
      }
    },
    onSuccess: (data, { cycleId }) => {
      console.log(`Successfully added test suite to cycle ${cycleId}`, data);
      // Invalidate the test cycle items query to refetch the data
      queryClient.invalidateQueries({ queryKey: [`/api/test-cycle-items/${cycleId}`] });
    },
    onError: (error) => {
      console.error('Error in add test suite mutation:', error);
    }
  });
}