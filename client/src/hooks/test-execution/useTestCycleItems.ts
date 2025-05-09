import { useQuery } from "@tanstack/react-query";
import type { TestCycleItem } from "./types";

/**
 * Hook to fetch test cycle items for a specific cycle
 * @param cycleId The ID of the test cycle to fetch items for
 * @returns Query result with test cycle items
 */
export function useTestCycleItems(cycleId?: number) {
  return useQuery<TestCycleItem[]>({
    queryKey: cycleId ? [`/api/test-cycle-items/${cycleId}`] : undefined,
    // Only run the query if a cycleId is provided
    enabled: !!cycleId,
  });
}