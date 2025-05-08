import { ReactNode } from "react";
import { TestSuite, TestCase } from "@/hooks/test-management";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { ClipboardList, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/design-system/status-badge";
import { Badge } from "@/components/ui/badge";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isDeleting?: boolean;
  type: "testSuite" | "testCase";
  item: TestSuite | TestCase | null;
  useAlertDialog?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onDelete,
  isDeleting = false,
  type,
  item,
  useAlertDialog = true,
}: DeleteConfirmDialogProps) {
  // Check the type of item
  const isTestSuite = type === "testSuite";
  const title = isTestSuite ? (item as TestSuite)?.name : (item as TestCase)?.title;
  const description = isTestSuite 
    ? (item as TestSuite)?.description 
    : (item as TestCase)?.description;

  // Different content for test suite vs test case
  const renderItemDetails = () => {
    if (!item) return null;

    if (isTestSuite) {
      const testSuite = item as TestSuite;
      return (
        <div className="bg-destructive/10 p-4 rounded-md border border-destructive/30">
          <p className="font-medium">{testSuite.name}</p>
          <p className="text-sm text-muted-foreground mt-1">{testSuite.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{testSuite.projectArea}</Badge>
            <StatusBadge status={testSuite.priority} variant="priority" />
            <StatusBadge status={testSuite.status} variant="test" />
          </div>
        </div>
      );
    } else {
      const testCase = item as TestCase;
      return (
        <div className="bg-atmf-main p-3 rounded-md border border-white/5">
          <p className="font-medium">{testCase.title}</p>
          <p className="text-sm text-atmf-muted mt-1">{testCase.description}</p>
        </div>
      );
    }
  };

  // Generic dialog content
  const DialogContents = () => (
    <>
      <div className="py-4">{renderItemDetails()}</div>

      <DialogFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <div className="flex items-center gap-2">
              <IconWrapper className="animate-spin">
                <ClipboardList className="h-4 w-4" />
              </IconWrapper>
              <span>Deleting...</span>
            </div>
          ) : (
            `Delete ${isTestSuite ? "Test Suite" : "Test Case"}`
          )}
        </Button>
      </DialogFooter>
    </>
  );

  // Use either AlertDialog or regular Dialog based on prop
  return useAlertDialog ? (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {isTestSuite ? "Test Suite" : "Test Case"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this {isTestSuite ? "test suite" : "test case"}? 
            This action cannot be undone
            {isTestSuite && " and will make all test cases within this suite unavailable"}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">{renderItemDetails()}</div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <IconWrapper className="animate-spin">
                  <ClipboardList className="h-4 w-4" />
                </IconWrapper>
                <span>Deleting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Delete {isTestSuite ? "Test Suite" : "Test Case"}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {isTestSuite ? "test suite" : "test case"}? 
            This action cannot be undone
            {isTestSuite && " and will make all test cases within this suite unavailable"}.
          </DialogDescription>
        </DialogHeader>

        <DialogContents />
      </DialogContent>
    </Dialog>
  );
}