import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { invalidateResource } from "@/lib/queryUtils";

const TEST_SUITES_ENDPOINT = "/api/test-suites";

export function useDeleteTestSuite() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `${TEST_SUITES_ENDPOINT}/${id}`);
    },
    onSuccess: () => {
      // Invalidate test suites
      invalidateResource(TEST_SUITES_ENDPOINT);
    },
  });
}