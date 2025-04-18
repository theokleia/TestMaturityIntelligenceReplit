import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useProjectResource } from "../useProjectResource";
import { invalidateResource } from "@/lib/queryUtils";
import {
  TestSuite,
  CreateTestSuiteRequest,
  UpdateTestSuiteRequest,
  TestSuiteFilters
} from "./types";

const TEST_SUITES_ENDPOINT = "/api/test-suites";

/**
 * Hook to fetch all test suites with optional filtering
 */
export function useTestSuites(filters?: TestSuiteFilters) {
  return useProjectResource<TestSuite[]>(TEST_SUITES_ENDPOINT, filters);
}

/**
 * Hook to fetch a single test suite by ID
 */
export function useTestSuite(id: number) {
  return useProjectResource<TestSuite>(
    `${TEST_SUITES_ENDPOINT}/${id}`,
    undefined,
    { enabled: !!id }
  );
}

/**
 * Hook to create a new test suite
 */
export function useCreateTestSuite() {
  return useMutation({
    mutationFn: async (request: CreateTestSuiteRequest) => {
      const res = await apiRequest('POST', TEST_SUITES_ENDPOINT, request);
      return res.json() as Promise<TestSuite>;
    },
    onSuccess: () => {
      invalidateResource(TEST_SUITES_ENDPOINT);
    },
  });
}

/**
 * Hook to update an existing test suite
 */
export function useUpdateTestSuite(id: number) {
  return useMutation({
    mutationFn: async (request: UpdateTestSuiteRequest) => {
      const res = await apiRequest('PATCH', `${TEST_SUITES_ENDPOINT}/${id}`, request);
      return res.json() as Promise<TestSuite>;
    },
    onSuccess: () => {
      invalidateResource(TEST_SUITES_ENDPOINT);
    },
  });
}