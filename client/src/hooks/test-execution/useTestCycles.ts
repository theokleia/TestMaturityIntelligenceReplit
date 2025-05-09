import { useQuery } from "@tanstack/react-query";
import type { TestCycle } from "./types";

/**
 * Hook to fetch test cycles
 * @param projectId Optional project ID to filter cycles by project
 * @returns Query result with test cycles
 */
export function useTestCycles(projectId?: number) {
  // If projectId is provided, use it in the query parameter
  const url = projectId ? `/api/test-cycles?projectId=${projectId}` : '/api/test-cycles';
  
  return useQuery<TestCycle[]>({
    queryKey: [url],
  });
}