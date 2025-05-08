import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { invalidateResource } from "@/lib/queryUtils";
import { TestCase } from "./types";

// Interface for AI test case generation request
export interface GenerateTestCasesRequest {
  feature: string;
  requirements: string;
  complexity: string;
  testSuiteId: number;
  projectId?: number;
}

// Interface for AI test case generation response
export interface GenerateTestCasesResponse {
  message: string;
  testCases: TestCase[];
}

const TEST_CASES_ENDPOINT = "/api/test-cases";
const GENERATE_TEST_CASES_ENDPOINT = "/api/test-cases/generate";

/**
 * Hook to generate test cases using AI
 */
export function useGenerateTestCases() {
  return useMutation({
    mutationFn: async (request: GenerateTestCasesRequest) => {
      return apiRequest<GenerateTestCasesResponse>(GENERATE_TEST_CASES_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(request)
      });
    },
    onSuccess: () => {
      // Invalidate test cases to refresh the list after generating new ones
      invalidateResource(TEST_CASES_ENDPOINT);
    },
  });
}