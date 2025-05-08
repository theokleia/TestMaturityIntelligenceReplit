import { useMutation } from "@tanstack/react-query";
import { UpdateTestCaseRequest, TestCase } from "./types";
import { apiRequest } from "@/lib/queryClient";
import { invalidateResource } from "@/lib/queryUtils";

const TEST_CASES_ENDPOINT = "/api/test-cases";

/**
 * Hook for updating an existing test case
 */
export function useUpdateTestCase(id: number) {
  return useMutation({
    mutationFn: async (testCase: UpdateTestCaseRequest): Promise<TestCase> => {
      const response = await apiRequest('PATCH', `${TEST_CASES_ENDPOINT}/${id}`, testCase);
      return response.json();
    },
    onSuccess: () => {
      invalidateResource(TEST_CASES_ENDPOINT);
    },
  });
}