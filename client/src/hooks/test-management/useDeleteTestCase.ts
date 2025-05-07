import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { invalidateResource } from "@/lib/queryUtils";

const TEST_CASES_ENDPOINT = "/api/test-cases";
const TEST_SUITES_ENDPOINT = "/api/test-suites";

export function useDeleteTestCase() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `${TEST_CASES_ENDPOINT}/${id}`);
    },
    onSuccess: () => {
      // Invalidate both test cases and test suites since they're related
      invalidateResource(TEST_CASES_ENDPOINT);
      invalidateResource(TEST_SUITES_ENDPOINT);
    },
  });
}