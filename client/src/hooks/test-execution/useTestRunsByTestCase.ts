import { useQuery } from "@tanstack/react-query";
import type { TestRun } from "./types";

/**
 * Hook to fetch all test runs for a specific test case across all cycles
 * @param testCaseId The ID of the test case to fetch runs for
 * @returns Query result with test runs
 */
export function useTestRunsByTestCase(testCaseId?: number) {
  return useQuery<TestRun[]>({
    queryKey: [`/api/test-runs/test-case/${testCaseId || 0}`],
    enabled: !!testCaseId,
  });
}