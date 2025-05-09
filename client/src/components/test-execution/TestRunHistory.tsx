import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { StatusBadge } from "@/components/design-system/status-badge";
import { formatDate } from "@/lib/utils";
import { TestRun } from "@/hooks/test-execution";

interface TestRunHistoryProps {
  runs: TestRun[];
}

export function TestRunHistory({ runs }: TestRunHistoryProps) {
  // Sort runs by date, newest first
  const sortedRuns = [...runs].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sortedRuns.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No previous test runs found for this test case.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedRuns.map((run) => (
        <Card key={run.id} className="border border-border">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center">
                <span>Run on {formatDate(run.createdAt)}</span>
                <span className="mx-2">•</span>
                <StatusBadge variant="run" status={run.status} />
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {run.cycleId ? `Cycle ID: ${run.cycleId}` : ""}
              </div>
            </div>
          </CardHeader>
          {run.notes && (
            <CardContent className="py-3 px-4">
              <div className="text-sm whitespace-pre-wrap">{run.notes}</div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}