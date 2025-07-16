import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { TestCase } from "@/hooks/test-management";

interface TestCaseDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  testCase: TestCase | null;
  onUpdate: () => void;
}

export function TestCaseDetailsDialog({
  isOpen,
  onOpenChange,
  testCase,
  onUpdate
}: TestCaseDetailsDialogProps) {
  if (!testCase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{testCase.title}</span>
            <div className="flex items-center gap-2">
              <StatusBadge status={testCase.status} variant="status" />
              <StatusBadge status={testCase.priority} variant="priority" />
            </div>
          </DialogTitle>
          <DialogDescription>
            Test case details and execution information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-text-muted">{testCase.description}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Preconditions</h4>
            <p className="text-sm text-text-muted">{testCase.preconditions}</p>
          </div>

          {testCase.steps && testCase.steps.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Test Steps</h4>
              <div className="space-y-2">
                {testCase.steps.map((step, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="font-medium text-sm mb-1">
                      Step {index + 1}: {step.step}
                    </div>
                    <div className="text-sm text-text-muted">
                      Expected: {step.expected}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Expected Results</h4>
            <p className="text-sm text-text-muted">{testCase.expectedResults}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Severity:</span>
                  <Badge variant="outline">{testCase.severity}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Automatable:</span>
                  <Badge variant={testCase.automatable ? "default" : "secondary"}>
                    {testCase.automatable ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Automation Status:</span>
                  <Badge variant="outline">{testCase.automationStatus}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Metadata</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">AI Generated:</span>
                  <Badge variant={testCase.aiGenerated ? "default" : "secondary"}>
                    {testCase.aiGenerated ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Created:</span>
                  <span>{new Date(testCase.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Updated:</span>
                  <span>{new Date(testCase.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}