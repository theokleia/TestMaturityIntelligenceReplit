import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/design-system/status-badge";
import { Play, X, History } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TestCycleItem, TestRun } from "@/hooks/test-execution";
import { TestCase } from "@/hooks/test-management";

interface TestCaseListForCycleProps {
  cycleItems: TestCycleItem[];
  testCases: Record<number, TestCase>;
  latestRuns: Record<number, TestRun>;
  isLoading: boolean;
  onExecute: (cycleItemId: number, testCaseId: number) => void;
  onRemove: (cycleItemId: number) => void;
  onViewHistory: (testCaseId: number) => void;
}

export function TestCaseListForCycle({
  cycleItems,
  testCases,
  latestRuns,
  isLoading,
  onExecute,
  onRemove,
  onViewHistory
}: TestCaseListForCycleProps) {
  if (isLoading) {
    return <div className="text-center py-8">Loading test cases...</div>;
  }

  if (!cycleItems || cycleItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No test cases have been added to this cycle yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Executions</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cycleItems.map((item) => {
          const testCase = testCases[item.testCaseId];
          const latestRun = latestRuns[item.id];
          
          if (!testCase) {
            return null; // Skip if test case not found
          }
          
          return (
            <TableRow key={item.id}>
              <TableCell>TC-{testCase.id}</TableCell>
              <TableCell className="font-medium">{testCase.title}</TableCell>
              <TableCell>
                <StatusBadge variant="priority" status={testCase.priority} />
              </TableCell>
              <TableCell>
                <StatusBadge 
                  variant="test" 
                  status={item.status || "not-run"} 
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-xs font-medium">
                    {latestRun ? 1 : 0}
                  </span>
                  <span className="ml-2 text-muted-foreground text-xs">
                    {latestRun ? "execution" : "executions"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => onViewHistory(testCase.id)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
                    onClick={() => onExecute(item.id, testCase.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 dark:hover:text-red-300"
                    onClick={() => onRemove(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}