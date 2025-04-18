import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useProjectResource } from "../useProjectResource";
import { invalidateResource } from "@/lib/queryUtils";
import {
  TestCase,
  CreateTestCaseRequest,
  UpdateTestCaseRequest,
  TestCaseFilters
} from "./types";

const TEST_CASES_ENDPOINT = "/api/test-cases";
const TEST_SUITES_ENDPOINT = "/api/test-suites";

/**
 * Hook to fetch all test cases with optional filtering
 */
export function useTestCases(filters?: TestCaseFilters) {
  return useProjectResource<TestCase[]>(TEST_CASES_ENDPOINT, filters);
}

/**
 * Hook to fetch a single test case by ID
 */
export function useTestCase(id: number) {
  return useProjectResource<TestCase>(
    `${TEST_CASES_ENDPOINT}/${id}`,
    undefined,
    { enabled: !!id }
  );
}

/**
 * Hook to create a new test case
 */
export function useCreateTestCase() {
  return useMutation({
    mutationFn: async (request: CreateTestCaseRequest) => {
      const res = await apiRequest('POST', TEST_CASES_ENDPOINT, request);
      return res.json() as Promise<TestCase>;
    },
    onSuccess: () => {
      // Invalidate both test cases and test suites since they're related
      invalidateResource(TEST_CASES_ENDPOINT);
      invalidateResource(TEST_SUITES_ENDPOINT);
    },
  });
}

/**
 * Hook to update an existing test case
 */
export function useUpdateTestCase(id: number) {
  return useMutation({
    mutationFn: async (request: UpdateTestCaseRequest) => {
      const res = await apiRequest('PATCH', `${TEST_CASES_ENDPOINT}/${id}`, request);
      return res.json() as Promise<TestCase>;
    },
    onSuccess: () => {
      // Invalidate both test cases and test suites since they're related
      invalidateResource(TEST_CASES_ENDPOINT);
      invalidateResource(TEST_SUITES_ENDPOINT);
    },
  });
}