import React from "react";
import { TestCase } from "@/hooks/test-management";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";

export interface TestCaseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testCase: TestCase | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TestCaseDetailsDialog({
  open,
  onOpenChange,
  testCase,
  onEdit,
  onDelete,
}: TestCaseDetailsDialogProps) {
  if (!testCase) return null;

  // Map status to badge variant
  const getStatusVariant = (status: string): "secondary" | "outline" | "default" | "destructive" => {
    switch (status) {
      case "draft":
        return "secondary";
      case "ready":
        return "outline";
      case "in-progress":
        return "default";
      case "completed":
        return "default"; // Changed from "success" to fit available variants
      case "blocked":
        return "destructive";
      default:
        return "outline";
    }
  };
  
  // Map priority to badge variant
  const getPriorityVariant = (priority: string): "secondary" | "outline" | "default" | "destructive" => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };
  
  // Map severity to badge variant
  const getSeverityVariant = (severity: string): "secondary" | "outline" | "default" | "destructive" => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "normal":
        return "default";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <DialogTitle className="text-xl">{testCase.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {testCase.aiGenerated && (
                  <Badge variant="secondary" className="mr-2">AI Generated</Badge>
                )}
                <Badge variant={getStatusVariant(testCase.status)}>
                  {testCase.status.charAt(0).toUpperCase() + testCase.status.slice(1)}
                </Badge>
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <ErrorBoundary name="Test Case Details">
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Priority</p>
                <Badge variant={getPriorityVariant(testCase.priority)}>
                  {testCase.priority.charAt(0).toUpperCase() + testCase.priority.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Severity</p>
                <Badge variant={getSeverityVariant(testCase.severity)}>
                  {testCase.severity.charAt(0).toUpperCase() + testCase.severity.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Automatable</p>
                <Badge variant={testCase.automatable ? "secondary" : "outline"}>
                  {testCase.automatable ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
              <p className="text-sm leading-relaxed">{testCase.description}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Preconditions</p>
              <p className="text-sm leading-relaxed">{testCase.preconditions || "No preconditions specified"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Test Steps</p>
              {testCase.steps && testCase.steps.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {testCase.steps.map((step, index) => (
                    <AccordionItem key={index} value={`step-${index}`}>
                      <AccordionTrigger className="px-4 py-2 bg-muted/20 rounded-t-lg text-sm">
                        Step {index + 1}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 py-3 border border-muted rounded-b-lg mb-2">
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Action</p>
                            <p className="text-sm">{step.step}</p>
                          </div>
                          <Separator />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Expected Result</p>
                            <p className="text-sm">{step.expected}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-sm text-muted-foreground">No steps defined for this test case</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Overall Expected Results</p>
              <p className="text-sm leading-relaxed">{testCase.expectedResults}</p>
            </div>

            <div className="text-xs text-muted-foreground flex justify-between">
              <div>Created: {formatDate(testCase.createdAt)}</div>
              <div>Last updated: {formatDate(testCase.updatedAt)}</div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}