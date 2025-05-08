import { TestCase, TestSuite } from "@/hooks/test-management";
import { findTestSuiteById, formatDate, getPriorityColor, getStatusColor, getSeverityColor } from "@/utils/test-management";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Trash2 } from "lucide-react";

interface TestCaseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testCase: TestCase | null;
  suites: TestSuite[];
  onEdit: () => void;
  onDelete: () => void;
}

export function TestCaseDetailsDialog({
  open,
  onOpenChange,
  testCase,
  suites,
  onEdit,
  onDelete,
}: TestCaseDetailsDialogProps) {
  if (!testCase) return null;

  const suite = findTestSuiteById(suites, testCase.suiteId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold mb-2">{testCase.title}</DialogTitle>
              <DialogDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className={getStatusColor(testCase.status)}>
                    {testCase.status}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(testCase.priority)}>
                    {testCase.priority} priority
                  </Badge>
                  <Badge variant="outline" className={getSeverityColor(testCase.severity)}>
                    {testCase.severity} severity
                  </Badge>
                  {testCase.automatable && (
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-500">
                      Automatable
                    </Badge>
                  )}
                  {testCase.aiGenerated && (
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-500">
                      AI Generated
                    </Badge>
                  )}
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] mt-4 pr-4">
          <ErrorBoundary name="Test Case Details">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Suite</h3>
                <p className="text-muted-foreground">{suite?.name || "Unknown Suite"}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">{testCase.description}</p>
              </div>

              {testCase.preconditions && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Preconditions</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{testCase.preconditions}</p>
                </div>
              )}

              {testCase.steps && testCase.steps.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Test Steps</h3>
                  <div className="border rounded-md">
                    <Accordion type="multiple" className="w-full">
                      {testCase.steps.map((step, index) => (
                        <AccordionItem value={`step-${index}`} key={index}>
                          <AccordionTrigger className="px-4">
                            <span className="font-medium">Step {index + 1}</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Action</h4>
                                <p className="text-muted-foreground whitespace-pre-line">{step.step}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Expected Result</h4>
                                <p className="text-muted-foreground whitespace-pre-line">{step.expected}</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Expected Results</h3>
                <p className="text-muted-foreground whitespace-pre-line">{testCase.expectedResults}</p>
              </div>

              <div className="pt-2 border-t">
                <div className="flex flex-col sm:flex-row sm:items-center text-xs text-muted-foreground">
                  <span className="mr-4">Created: {formatDate(testCase.createdAt)}</span>
                  <span>Updated: {formatDate(testCase.updatedAt)}</span>
                </div>
              </div>
            </div>
          </ErrorBoundary>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}