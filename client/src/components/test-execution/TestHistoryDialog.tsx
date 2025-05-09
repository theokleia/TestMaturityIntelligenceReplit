import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/design-system/status-badge";
import { TestCase } from "@/hooks/test-management";
import { TestRun } from "@/hooks/test-execution";
import { TestRunHistory } from "./TestRunHistory";
import { Separator } from "@/components/ui/separator";

interface TestHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testCase?: TestCase;
  testRuns?: TestRun[];
}

export function TestHistoryDialog({
  open,
  onOpenChange,
  testCase,
  testRuns = []
}: TestHistoryDialogProps) {
  // Add debugging
  console.log("TestHistoryDialog - testCase:", testCase?.id);
  console.log("TestHistoryDialog - testRuns:", testRuns);
  
  if (!testCase) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <span className="mr-2">TC-{testCase.id}:</span> {testCase.title}
          </DialogTitle>
          <DialogDescription>
            Test execution history
          </DialogDescription>
          <div className="flex space-x-2 mt-2">
            <StatusBadge variant="priority" status={testCase.priority} />
            {testCase.severity && (
              <StatusBadge variant="severity" status={testCase.severity} />
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
            <div>
              <h4 className="font-semibold text-primary">Description</h4>
              <p className="mt-1">{testCase.description || "No description provided."}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Execution History</h3>
            <TestRunHistory runs={testRuns} />
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}