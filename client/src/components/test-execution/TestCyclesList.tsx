import { TestCycle } from "@/hooks/test-execution";
import { ATMFCard, ATMFCardHeader } from "@/components/design-system/atmf-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, StatusBadgeVariant } from "@/components/design-system/status-badge";
import { formatDate } from "@/lib/utils";
import { PlayCircle, Clock, Check, AlertCircle } from "lucide-react";

interface TestCyclesListProps {
  testCycles: TestCycle[] | undefined;
  isLoading: boolean;
  onSelectCycle: (cycle: TestCycle) => void;
  onEditCycle: (cycle: TestCycle) => void;
  selectedCycle?: TestCycle | null;
}

// Helper function to render status badge with appropriate color
function renderStatusBadge(status: string): JSX.Element {
  const statusMap: Record<string, { variant: StatusBadgeVariant, label: string }> = {
    "planned": { variant: "muted", label: "Planned" },
    "in_progress": { variant: "warning", label: "In Progress" },
    "completed": { variant: "status", label: "Completed" },
    "blocked": { variant: "danger", label: "Blocked" },
    "created": { variant: "muted", label: "Created" },
    "archived": { variant: "muted", label: "Archived" },
  };
  
  const config = statusMap[status] || { variant: "muted", label: status };
  
  return <StatusBadge variant={config.variant}>{config.label}</StatusBadge>;
}

export default function TestCyclesList({
  testCycles,
  isLoading,
  onSelectCycle,
  onEditCycle,
  selectedCycle
}: TestCyclesListProps) {
  if (isLoading) {
    return (
      <ATMFCard>
        <ATMFCardHeader title="Test Cycles" description="Manage your test execution cycles" />
        <div className="p-6 text-center">Loading test cycles...</div>
      </ATMFCard>
    );
  }

  if (!testCycles || testCycles.length === 0) {
    return (
      <ATMFCard>
        <ATMFCardHeader title="Test Cycles" description="Manage your test execution cycles" />
        <div className="p-6 text-center">
          <div className="py-8">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No test cycles yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first test cycle to start organizing test execution.
            </p>
          </div>
        </div>
      </ATMFCard>
    );
  }

  return (
    <ATMFCard>
      <ATMFCardHeader title="Test Cycles" description="Manage your test execution cycles" />
      <div className="p-6">
        <div className="space-y-4">
          {testCycles.map((cycle) => (
            <div
              key={cycle.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedCycle?.id === cycle.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectCycle(cycle)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{cycle.name}</h4>
                    {renderStatusBadge(cycle.status)}
                    {cycle.testingMode && (
                      <Badge variant="outline" className="text-xs">
                        {cycle.testingMode.replace('-', ' ')}
                      </Badge>
                    )}
                  </div>
                  
                  {cycle.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {cycle.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    {cycle.startDate && (
                      <span>Start: {formatDate(cycle.startDate)}</span>
                    )}
                    {cycle.endDate && (
                      <span>End: {formatDate(cycle.endDate)}</span>
                    )}
                    {cycle.testDeploymentUrl && (
                      <span>Environment: Available</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCycle(cycle);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCycle(cycle);
                    }}
                  >
                    <PlayCircle size={16} className="mr-1" />
                    Execute
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ATMFCard>
  );
}