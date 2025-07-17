import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/context/ProjectContext";
import { 
  useCreateTestCycle, 
  useUpdateTestCycle,
  TestCycle
} from "@/hooks/test-execution";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TestCycleForm, { TestCycleFormValues } from "./TestCycleForm";

interface TestCycleModalsProps {
  // New cycle dialog
  newCycleDialogOpen: boolean;
  setNewCycleDialogOpen: (open: boolean) => void;
  
  // Edit cycle dialog
  editCycleDialogOpen: boolean;
  setEditCycleDialogOpen: (open: boolean) => void;
  selectedCycle: TestCycle | null;
  
  // Callbacks
  onCycleCreated?: (cycle: TestCycle) => void;
  onCycleUpdated?: (cycle: TestCycle) => void;
  onRefetchCycles?: () => void;
}

export default function TestCycleModals({
  newCycleDialogOpen,
  setNewCycleDialogOpen,
  editCycleDialogOpen,
  setEditCycleDialogOpen,
  selectedCycle,
  onCycleCreated,
  onCycleUpdated,
  onRefetchCycles
}: TestCycleModalsProps) {
  const { toast } = useToast();
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id;
  
  const createCycleMutation = useCreateTestCycle();
  const updateCycleMutation = useUpdateTestCycle();

  // Debug logging
  console.log("TestCycleModals - newCycleDialogOpen:", newCycleDialogOpen);
  console.log("TestCycleModals - editCycleDialogOpen:", editCycleDialogOpen);
  console.log("TestCycleModals - selectedCycle:", selectedCycle);
  console.log("TestCycleModals - projectId:", projectId);

  const handleCreateCycle = (data: TestCycleFormValues) => {
    if (!projectId) return;
    
    console.log("Creating cycle with data:", data);
    
    // Convert Date objects to ISO strings for API
    const apiData = {
      ...data,
      projectId,
      startDate: data.startDate?.toISOString() || null,
      endDate: data.endDate?.toISOString() || null,
    };
    
    console.log("API data being sent:", apiData);
    
    createCycleMutation.mutate(
      apiData,
      {
        onSuccess: (newCycle) => {
          console.log("Created cycle:", newCycle);
          toast({
            title: "Success",
            description: "Test cycle created successfully",
          });
          
          setNewCycleDialogOpen(false);
          onRefetchCycles?.();
          onCycleCreated?.(newCycle);
        },
        onError: (error) => {
          console.error("Error creating cycle:", error);
          toast({
            title: "Error",
            description: "Failed to create test cycle",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleUpdateCycle = (data: TestCycleFormValues) => {
    if (!selectedCycle) return;
    
    console.log("Updating cycle with data:", data);
    
    // Convert Date objects to ISO strings for API
    const apiData = {
      ...data,
      startDate: data.startDate?.toISOString() || null,
      endDate: data.endDate?.toISOString() || null,
    };
    
    console.log("API data being sent for update:", apiData);
    
    updateCycleMutation.mutate(
      { id: selectedCycle.id, data: apiData },
      {
        onSuccess: (updatedCycle) => {
          console.log("Updated cycle:", updatedCycle);
          toast({
            title: "Success",
            description: "Test cycle updated successfully",
          });
          
          setEditCycleDialogOpen(false);
          onRefetchCycles?.();
          onCycleUpdated?.(updatedCycle);
        },
        onError: (error) => {
          console.error("Error updating cycle:", error);
          toast({
            title: "Error",
            description: "Failed to update test cycle",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Prepare initial values for edit form
  const editInitialValues = selectedCycle ? {
    name: selectedCycle.name,
    description: selectedCycle.description || "",
    status: selectedCycle.status,
    startDate: selectedCycle.startDate ? new Date(selectedCycle.startDate) : null,
    endDate: selectedCycle.endDate ? new Date(selectedCycle.endDate) : null,
    testingMode: selectedCycle.testingMode || "manual",
    testDeploymentUrl: selectedCycle.testDeploymentUrl || "",
    testData: Array.isArray(selectedCycle.testData) ? selectedCycle.testData : [],
  } : {};

  return (
    <>
      {/* New Test Cycle Dialog */}
      <Dialog open={newCycleDialogOpen} onOpenChange={setNewCycleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Test Cycle</DialogTitle>
            <DialogDescription>
              Define a new test cycle to group and execute test cases.
            </DialogDescription>
          </DialogHeader>
          
          <TestCycleForm
            onSubmit={handleCreateCycle}
            isSubmitting={createCycleMutation.isPending}
            submitLabel="Create Test Cycle"
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Test Cycle Dialog */}
      <Dialog open={editCycleDialogOpen} onOpenChange={setEditCycleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Test Cycle</DialogTitle>
            <DialogDescription>
              Update test cycle details.
            </DialogDescription>
          </DialogHeader>
          
          <TestCycleForm
            initialValues={editInitialValues}
            onSubmit={handleUpdateCycle}
            isSubmitting={updateCycleMutation.isPending}
            submitLabel="Update Test Cycle"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}