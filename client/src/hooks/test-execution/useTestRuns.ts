import { useQuery } from "@tanstack/react-query";
import type { TestRun } from "./types";

/**
 * Hook to fetch test runs for a specific cycle item
 * @param cycleItemId The ID of the test cycle item to fetch runs for
 * @returns Query result with test runs
 */
export function useTestRuns(cycleItemId?: number) {
  return useQuery<TestRun[]>({
    queryKey: cycleItemId ? [`/api/test-runs/by-cycle-item/${cycleItemId}`] : undefined,
    enabled: !!cycleItemId,
  });
}