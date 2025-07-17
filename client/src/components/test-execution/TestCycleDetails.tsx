import { TestCycle } from "@/hooks/test-execution";
import { ATMFCard, ATMFCardHeader } from "@/components/design-system/atmf-card";
import { Button } from "@/components/ui/button";
import { StatusBadge, StatusBadgeVariant } from "@/components/design-system/status-badge";
import { ListChecks, Plus } from "lucide-react";

interface TestCycleDetailsProps {
  selectedCycle: TestCycle;
  onEditCycle: () => void;
  onAddTestSuite: () => void;
  onAddTestCases: () => void;
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

export default function TestCycleDetails({
  selectedCycle,
  onEditCycle,
  onAddTestSuite,
  onAddTestCases
}: TestCycleDetailsProps) {
  return (
    <ATMFCard>
      <ATMFCardHeader 
        title={selectedCycle.name}
        description={selectedCycle.description || "Test cycle execution details"}
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onEditCycle}
            >
              Edit Cycle
            </Button>
            <Button
              variant="outline"
              onClick={onAddTestSuite}
            >
              <ListChecks size={16} className="mr-2" />
              Add Test Suite
            </Button>
            <Button
              variant="outline"
              onClick={onAddTestCases}
            >
              <Plus size={16} className="mr-2" />
              Add Test Cases
            </Button>
          </div>
        }
      />
      
      <div className="p-6 grid grid-cols-4 gap-6 bg-atmf-card/30">
        <div className="p-4 bg-atmf-card rounded-lg">
          <span className="text-sm text-muted-foreground">Status</span>
          <div className="mt-1">{renderStatusBadge(selectedCycle.status)}</div>
        </div>
        
        <div className="p-4 bg-atmf-card rounded-lg">
          <span className="text-sm text-muted-foreground">Testing Mode</span>
          <div className="mt-1 capitalize">
            {selectedCycle.testingMode?.replace('-', ' ') || 'Manual'}
          </div>
        </div>
        
        <div className="p-4 bg-atmf-card rounded-lg">
          <span className="text-sm text-muted-foreground">Start Date</span>
          <div className="mt-1">
            {selectedCycle.startDate ? new Date(selectedCycle.startDate).toLocaleDateString() : "Not set"}
          </div>
        </div>
        
        <div className="p-4 bg-atmf-card rounded-lg">
          <span className="text-sm text-muted-foreground">End Date</span>
          <div className="mt-1">
            {selectedCycle.endDate ? new Date(selectedCycle.endDate).toLocaleDateString() : "Not set"}
          </div>
        </div>
      </div>
      
      {selectedCycle.testDeploymentUrl && (
        <div className="p-6 border-t bg-atmf-card/20">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">Test Environment:</span>
            <a 
              href={selectedCycle.testDeploymentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {selectedCycle.testDeploymentUrl}
            </a>
          </div>
        </div>
      )}
      
      {selectedCycle.testData && Array.isArray(selectedCycle.testData) && selectedCycle.testData.length > 0 && (
        <div className="p-6 border-t bg-atmf-card/20">
          <h4 className="text-sm font-medium mb-3">Test Data</h4>
          <div className="grid grid-cols-2 gap-3">
            {selectedCycle.testData.map((item: any, index: number) => (
              <div key={index} className="p-3 bg-white rounded border">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-muted-foreground">{item.title}</span>
                </div>
                <div className="text-sm font-mono mt-1">{item.value}</div>
                {item.description && (
                  <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </ATMFCard>
  );
}