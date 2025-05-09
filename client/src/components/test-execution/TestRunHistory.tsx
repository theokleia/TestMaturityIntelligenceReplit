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
  // Sort runs by execution date, newest first
  const sortedRuns = [...runs].sort((a, b) => 
    new Date(b.executedAt || 0).getTime() - new Date(a.executedAt || 0).getTime()
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
                <span>Run on {formatDate(run.executedAt || '')}</span>
                <span className="mx-2">•</span>
                <StatusBadge variant="test" status={run.status || 'unknown'} />
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {run.cycleName ? `Cycle: ${run.cycleName}` : ""}
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