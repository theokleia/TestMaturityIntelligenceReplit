import { useMutation } from "@tanstack/react-query";
import { UpdateTestSuiteRequest, TestSuite } from "./types";
import { apiRequest } from "@/lib/queryClient";
import { invalidateResource } from "@/lib/queryUtils";

const TEST_SUITES_ENDPOINT = "/api/test-suites";

/**
 * Hook for updating an existing test suite
 */
export function useUpdateTestSuite(id: number) {
  return useMutation({
    mutationFn: async (testSuite: UpdateTestSuiteRequest): Promise<TestSuite> => {
      const response = await apiRequest('PATCH', `${TEST_SUITES_ENDPOINT}/${id}`, testSuite);
      return response.json();
    },
    onSuccess: () => {
      invalidateResource(TEST_SUITES_ENDPOINT);
    },
  });
}