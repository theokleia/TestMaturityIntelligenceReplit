import { useMutation } from "@tanstack/react-query";
import { CreateTestSuiteRequest, TestSuite } from "./types";
import { apiRequest } from "@/lib/queryClient";
import { invalidateResource } from "@/lib/queryUtils";

const TEST_SUITES_ENDPOINT = "/api/test-suites";

/**
 * Hook for creating a new test suite
 */
export function useCreateTestSuite() {
  return useMutation({
    mutationFn: async (testSuite: CreateTestSuiteRequest): Promise<TestSuite> => {
      const response = await apiRequest('POST', TEST_SUITES_ENDPOINT, testSuite);
      return response.json();
    },
    onSuccess: () => {
      invalidateResource(TEST_SUITES_ENDPOINT);
    },
  });
}