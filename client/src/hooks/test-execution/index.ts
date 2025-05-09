import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { 
  TestCycle, 
  TestCycleItem, 
  TestRun, 
  InsertTestCycle, 
  InsertTestCycleItem,
  InsertTestRun
} from "@shared/schema";

// Types
export type { 
  TestCycle, 
  TestCycleItem, 
  TestRun,
  InsertTestCycle,
  InsertTestCycleItem,
  InsertTestRun
};

// Test Cycles
export function useTestCycles(projectId?: number) {
  const queryKey = projectId ? ['/api/test-cycles', { projectId }] : ['/api/test-cycles'];
  
  return useQuery<TestCycle[]>({
    queryKey,
    enabled: !!projectId,
  });
}

export function useTestCycle(id: number) {
  return useQuery<TestCycle>({
    queryKey: ['/api/test-cycles', id],
    enabled: !!id,
  });
}

export function useCreateTestCycle() {
  return useMutation({
    mutationFn: (data: InsertTestCycle) => 
      apiRequest('/api/test-cycles', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-cycles'] });
    }
  });
}

export function useUpdateTestCycle(id: number) {
  return useMutation({
    mutationFn: (data: Partial<InsertTestCycle>) => 
      apiRequest(`/api/test-cycles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-cycles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/test-cycles', id] });
    }
  });
}

// Test Cycle Items
export function useTestCycleItems(cycleId: number) {
  return useQuery<TestCycleItem[]>({
    queryKey: [`/api/test-cycle-items/${cycleId}`],
    enabled: !!cycleId,
  });
}

export function useAddTestCasesToCycle() {
  return useMutation({
    mutationFn: ({ cycleId, testCaseIds, suiteId }: { cycleId: number, testCaseIds: number[], suiteId?: number }) => 
      apiRequest('/api/test-cycles/add-cases', { 
        method: 'POST', 
        body: JSON.stringify({ cycleId, testCaseIds, suiteId })
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/test-cycle-items/${variables.cycleId}`] });
    }
  });
}

export function useAddTestSuiteToCycle() {
  return useMutation({
    mutationFn: ({ cycleId, suiteId }: { cycleId: number, suiteId: number }) => 
      apiRequest('/api/test-cycles/add-cases', { 
        method: 'POST', 
        body: JSON.stringify({ cycleId, suiteId })
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/test-cycle-items/${variables.cycleId}`] });
    }
  });
}

export function useUpdateTestCycleItem(id: number) {
  return useMutation({
    mutationFn: (data: Partial<InsertTestCycleItem>) => 
      apiRequest(`/api/test-cycle-items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (response) => {
      // Get the cycleId from the response
      const cycleId = (response as TestCycleItem)?.cycleId;
      if (cycleId) {
        queryClient.invalidateQueries({ queryKey: [`/api/test-cycle-items/${cycleId}`] });
      } else {
        // Fallback to invalidate all test cycle items if cycleId isn't available
        queryClient.invalidateQueries({ queryKey: ['/api/test-cycle-items'] });
      }
    }
  });
}

// Test Runs
export function useTestRuns(cycleItemId: number) {
  return useQuery<TestRun[]>({
    queryKey: ['/api/test-runs', cycleItemId],
    enabled: !!cycleItemId,
  });
}

export function useCreateTestRun() {
  return useMutation({
    mutationFn: (data: InsertTestRun) => 
      apiRequest('/api/test-runs', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-runs', variables.cycleItemId] });
      
      // Get the cycle item to find its cycleId
      const getItem = async () => {
        try {
          const itemResponse = await fetch(`/api/test-cycle-items/item/${variables.cycleItemId}`);
          const item = await itemResponse.json();
          if (item && item.cycleId) {
            queryClient.invalidateQueries({ queryKey: [`/api/test-cycle-items/${item.cycleId}`] });
          } else {
            // Fallback to invalidate all test cycle items
            queryClient.invalidateQueries({ queryKey: ['/api/test-cycle-items'] });
          }
        } catch (error) {
          console.error("Failed to get cycle item for invalidation:", error);
          queryClient.invalidateQueries({ queryKey: ['/api/test-cycle-items'] });
        }
      };
      getItem();
    }
  });
}

export function useUpdateTestRun(id: number) {
  return useMutation({
    mutationFn: (data: Partial<InsertTestRun>) => 
      apiRequest(`/api/test-runs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (response, variables) => {
      // Get the run data to find its cycleItemId
      const getRun = async () => {
        try {
          const runResponse = await fetch(`/api/test-runs/detail/${id}`);
          const run = await runResponse.json();
          
          if (run && run.cycleItemId) {
            // Invalidate this specific run
            queryClient.invalidateQueries({ queryKey: ['/api/test-runs', run.cycleItemId] });
            
            // Get the cycle item to find its cycleId
            const itemResponse = await fetch(`/api/test-cycle-items/item/${run.cycleItemId}`);
            const item = await itemResponse.json();
            
            if (item && item.cycleId) {
              queryClient.invalidateQueries({ queryKey: [`/api/test-cycle-items/${item.cycleId}`] });
            } else {
              // Fallback to invalidate all test cycle items
              queryClient.invalidateQueries({ queryKey: ['/api/test-cycle-items'] });
            }
          } else {
            // Fallback invalidations if we can't get the specific IDs
            queryClient.invalidateQueries({ queryKey: ['/api/test-runs'] });
            queryClient.invalidateQueries({ queryKey: ['/api/test-cycle-items'] });
          }
        } catch (error) {
          console.error("Failed to get run/item data for invalidation:", error);
          // Fallback invalidations
          queryClient.invalidateQueries({ queryKey: ['/api/test-runs'] });
          queryClient.invalidateQueries({ queryKey: ['/api/test-cycle-items'] });
        }
      };
      getRun();
    }
  });
}