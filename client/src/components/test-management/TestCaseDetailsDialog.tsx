import { useState } from "react";
import { TestCase, TestSuite } from "@/hooks/test-management";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, X } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TestCaseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testCase: TestCase | null;
  testSuite?: TestSuite | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function TestCaseDetailsDialog({
  open,
  onOpenChange,
  testCase,
  testSuite,
  onEdit,
  onDelete,
}: TestCaseDetailsDialogProps) {
  const { selectedProject } = useProject();
  const isStructured = selectedProject?.testCaseFormat === "structured";

  if (!testCase) {
    return null;
  }

  // Helper function to get color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-orange-500/20 text-orange-500 border-orange-500/20";
      case "ready":
        return "bg-blue-500/20 text-blue-500 border-blue-500/20";
      case "in-progress":
        return "bg-purple-500/20 text-purple-500 border-purple-500/20";
      case "blocked":
        return "bg-red-500/20 text-red-500 border-red-500/20";
      case "completed":
        return "bg-green-500/20 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/20";
    }
  };

  // Helper function to get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-500 border-red-500/20";
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-green-500/20 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/20";
    }
  };

  // Helper function to get color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-500 border-red-500/20";
      case "high":
        return "bg-orange-500/20 text-orange-500 border-orange-500/20";
      case "normal":
        return "bg-blue-500/20 text-blue-500 border-blue-500/20";
      case "low":
        return "bg-green-500/20 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl font-bold">{testCase.title}</DialogTitle>
            <DialogClose className="h-6 w-6 opacity-70 hover:opacity-100" asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Metadata section */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getStatusColor(testCase.status)}>
              {testCase.status.charAt(0).toUpperCase() + testCase.status.slice(1)}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(testCase.priority)}>
              {testCase.priority.charAt(0).toUpperCase() + testCase.priority.slice(1)} Priority
            </Badge>
            <Badge variant="outline" className={getSeverityColor(testCase.severity)}>
              {testCase.severity.charAt(0).toUpperCase() + testCase.severity.slice(1)} Severity
            </Badge>
            {testCase.automatable && (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/20">
                Automatable
              </Badge>
            )}
            {testCase.aiGenerated && (
              <Badge variant="outline" className="bg-purple-500/20 text-purple-500 border-purple-500/20">
                AI Generated
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Description</h3>
            <p className="text-sm bg-secondary/40 rounded-md p-3">{testCase.description}</p>
          </div>

          {/* Suite Info */}
          {testSuite && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Test Suite</h3>
              <p className="text-sm bg-secondary/40 rounded-md p-3">{testSuite.name}</p>
            </div>
          )}

          {/* Preconditions */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Preconditions</h3>
            <p className="text-sm bg-secondary/40 rounded-md p-3">{testCase.preconditions}</p>
          </div>

          {/* Steps */}
          {isStructured && testCase.steps && testCase.steps.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Test Steps</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-sm w-16">#</th>
                      <th className="px-4 py-2 text-left font-medium text-sm">Action</th>
                      <th className="px-4 py-2 text-left font-medium text-sm">Expected Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testCase.steps.map((step, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                        <td className="px-4 py-3 text-sm">{step.step}</td>
                        <td className="px-4 py-3 text-sm">{step.expected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Expected Results */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">
              {isStructured ? "Overall Expected Results" : "Expected Results"}
            </h3>
            <p className="text-sm bg-secondary/40 rounded-md p-3">{testCase.expectedResults}</p>
          </div>
        </div>

        <Separator />

        <DialogFooter className="pt-2">
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onDelete}
              className="flex items-center gap-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
            <Button
              onClick={onEdit}
              className="flex items-center gap-1"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}