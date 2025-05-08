import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { invalidateResource } from "@/lib/queryUtils";

const TEST_SUITES_ENDPOINT = "/api/test-suites";

export function useDeleteTestSuite() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest<boolean>(`${TEST_SUITES_ENDPOINT}/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      // Invalidate test suites
      invalidateResource(TEST_SUITES_ENDPOINT);
    },
  });
}