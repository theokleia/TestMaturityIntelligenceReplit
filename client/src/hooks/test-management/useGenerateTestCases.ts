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
const GENERATE_TEST_CASES_ENDPOINT = "/api/ai/generate-test-cases";

/**
 * Hook to generate test cases using AI
 */
export function useGenerateTestCases() {
  return useMutation({
    mutationFn: async (request: GenerateTestCasesRequest) => {
      const res = await apiRequest('POST', GENERATE_TEST_CASES_ENDPOINT, request);
      return res.json() as Promise<GenerateTestCasesResponse>;
    },
    onSuccess: () => {
      // Invalidate test cases to refresh the list after generating new ones
      invalidateResource(TEST_CASES_ENDPOINT);
    },
  });
}