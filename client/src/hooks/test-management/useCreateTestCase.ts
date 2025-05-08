import { useMutation } from "@tanstack/react-query";
import { CreateTestCaseRequest, TestCase } from "./types";
import { apiRequest } from "@/lib/queryClient";
import { invalidateResource } from "@/lib/queryUtils";

const TEST_CASES_ENDPOINT = "/api/test-cases";

/**
 * Hook for creating a new test case
 */
export function useCreateTestCase() {
  return useMutation({
    mutationFn: async (testCase: CreateTestCaseRequest): Promise<TestCase> => {
      const response = await apiRequest('POST', TEST_CASES_ENDPOINT, testCase);
      return response.json();
    },
    onSuccess: () => {
      invalidateResource(TEST_CASES_ENDPOINT);
    },
  });
}