import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  PageContainer, 
  PageHeader, 
  PageContent 
} from "@/components/design-system/page-container";
import { ATMFCard, ATMFCardHeader } from "@/components/design-system/atmf-card";
import { FolderPlus, Plus, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/context/ProjectContext";

import {
  TestSuiteList,
  TestCaseTable,
  TestSuiteFormDialog,
  TestCaseFormDialog,
  DeleteConfirmDialog
} from "@/components/test-management";

import {
  useTestSuites,
  useCreateTestSuite,
  useUpdateTestSuite,
  useDeleteTestSuite,
  useCreateTestCase,
  useUpdateTestCase,
  useDeleteTestCase,
  useGenerateTestCases,
  TestSuite,
  TestCase
} from "@/hooks/test-management";

// Schema for creating a test suite
const createTestSuiteSchema = z.object({
  name: z.string().min(1, "Test suite name is required"),
  description: z.string().min(1, "Description is required"),
  projectArea: z.string().min(1, "Project area is required"),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
  type: z.string().default("functional"),
});

// Schema for creating a test case
const createTestCaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  preconditions: z.string().min(1, "Preconditions are required"),
  steps: z.array(
    z.object({ 
      step: z.string(), 
      expected: z.string() 
    })
  ).optional(),
  expectedResults: z.string().min(1, "Expected results are required"),
  priority: z.string().min(1, "Priority is required"),
  severity: z.string().min(1, "Severity is required"),
  status: z.string().min(1, "Status is required"),
  suiteId: z.coerce.number().min(1, "Test suite is required"),
  automatable: z.boolean().default(false),
});

// Schema for generating AI test cases
const generateTestCasesSchema = z.object({
  feature: z.string().min(1, "Feature name is required"),
  requirements: z.string().min(1, "Requirements are required"),
  complexity: z.string().min(1, "Complexity is required"),
  testSuiteId: z.coerce.number().min(1, "Test suite is required"),
});

// Test Management page component
export default function TestManagement() {
  const { toast } = useToast();
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id;
  
  // Dialogs state
  const [newSuiteDialogOpen, setNewSuiteDialogOpen] = useState(false);
  const [editSuiteDialogOpen, setEditSuiteDialogOpen] = useState(false);
  const [deleteSuiteConfirmOpen, setDeleteSuiteConfirmOpen] = useState(false);
  const [newCaseDialogOpen, setNewCaseDialogOpen] = useState(false);
  const [aiGenerateDialogOpen, setAiGenerateDialogOpen] = useState(false);
  const [testCaseDetailOpen, setTestCaseDetailOpen] = useState(false);
  const [editCaseDialogOpen, setEditCaseDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  
  // Create test suite mutation
  const createTestSuiteMutation = useCreateTestSuite();
  
  // Update test suite mutation
  const updateTestSuiteMutation = useUpdateTestSuite(selectedSuite?.id || 0);
  
  // Delete test suite mutation
  const deleteTestSuiteMutation = useDeleteTestSuite();
  
  // Create test case mutation
  const createTestCaseMutation = useCreateTestCase();
  
  // Update test case mutation
  const updateTestCaseMutation = useUpdateTestCase(selectedTestCase?.id || 0);
  
  // Delete test case mutation
  const deleteTestCaseMutation = useDeleteTestCase();
  
  // Generate AI test cases mutation
  const generateTestCasesMutation = useGenerateTestCases();
  
  // Form for creating a new test suite
  const newSuiteForm = useForm<z.infer<typeof createTestSuiteSchema>>({
    resolver: zodResolver(createTestSuiteSchema),
    defaultValues: {
      name: "",
      description: "",
      projectArea: "",
      priority: "medium",
      status: "active",
      type: "functional",
    },
  });
  
  // Form for editing a test suite
  const editSuiteForm = useForm<z.infer<typeof createTestSuiteSchema>>({
    resolver: zodResolver(createTestSuiteSchema),
    defaultValues: {
      name: selectedSuite?.name || "",
      description: selectedSuite?.description || "",
      projectArea: selectedSuite?.projectArea || "",
      priority: selectedSuite?.priority || "medium",
      status: selectedSuite?.status || "active",
      type: selectedSuite?.type || "functional",
    },
  });
  
  // Form for creating a new test case
  const newCaseForm = useForm<z.infer<typeof createTestCaseSchema>>({
    resolver: zodResolver(createTestCaseSchema),
    defaultValues: {
      title: "",
      description: "",
      preconditions: "",
      steps: selectedProject?.testCaseFormat === "structured" ? [{ step: "", expected: "" }] : undefined,
      expectedResults: "",
      priority: "medium",
      severity: "normal",
      status: "draft",
      suiteId: selectedSuite?.id || 0,
      automatable: false,
    },
  });
  
  // Form for editing a test case
  const editCaseForm = useForm<z.infer<typeof createTestCaseSchema>>({
    resolver: zodResolver(createTestCaseSchema),
    defaultValues: {
      title: selectedTestCase?.title || "",
      description: selectedTestCase?.description || "",
      preconditions: selectedTestCase?.preconditions || "",
      steps: selectedTestCase?.steps || [],
      expectedResults: selectedTestCase?.expectedResults || "",
      priority: selectedTestCase?.priority || "medium",
      severity: selectedTestCase?.severity || "normal",
      status: selectedTestCase?.status || "draft",
      suiteId: selectedTestCase?.suiteId || selectedSuite?.id || 0,
      automatable: selectedTestCase?.automatable || false,
    },
  });
  
  // Form for generating AI test cases
  const generateAiCasesForm = useForm<z.infer<typeof generateTestCasesSchema>>({
    resolver: zodResolver(generateTestCasesSchema),
    defaultValues: {
      feature: "",
      requirements: "",
      complexity: "medium",
      testSuiteId: selectedSuite?.id || 0,
    },
  });
  
  // Update the suite ID when the selected suite changes
  if (selectedSuite?.id && newCaseForm.getValues("suiteId") !== selectedSuite.id) {
    newCaseForm.setValue("suiteId", selectedSuite.id);
  }
  
  if (selectedSuite?.id && generateAiCasesForm.getValues("testSuiteId") !== selectedSuite.id) {
    generateAiCasesForm.setValue("testSuiteId", selectedSuite.id);
  }
  
  // Handle creating a new test suite
  function onCreateSuite(data: z.infer<typeof createTestSuiteSchema>) {
    createTestSuiteMutation.mutate({
      ...data,
      projectId
    }, {
      onSuccess: (newSuite) => {
        toast({
          title: "Success",
          description: "Test suite created successfully",
        });
        setNewSuiteDialogOpen(false);
        newSuiteForm.reset();
        setSelectedSuite(newSuite);
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to create test suite",
          variant: "destructive",
        });
      },
    });
  }
  
  // Handle creating a new test case
  function onCreateTestCase(data: z.infer<typeof createTestCaseSchema>) {
    // Add steps array based on test case format
    const testCaseData = {
      ...data,
      // Use structured steps if the format is structured, otherwise use a default step
      steps: selectedProject?.testCaseFormat === "structured" 
        ? data.steps || []
        : [{ step: "Initialize test", expected: "Test is ready to run" }],
      aiGenerated: false,
      automationStatus: "not-automated",
      projectId
    };
    
    createTestCaseMutation.mutate(testCaseData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Test case created successfully",
        });
        setNewCaseDialogOpen(false);
        newCaseForm.reset();
        if (selectedSuite) {
          newCaseForm.setValue("suiteId", selectedSuite.id);
        }
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to create test case",
          variant: "destructive",
        });
      },
    });
  }
  
  // Handle generating AI test cases
  function onGenerateAiTestCases(data: z.infer<typeof generateTestCasesSchema>) {
    generateTestCasesMutation.mutate({
      ...data,
      projectId
    }, {
      onSuccess: (result) => {
        toast({
          title: "Success",
          description: `Generated ${result.testCases.length} test cases successfully`,
        });
        setAiGenerateDialogOpen(false);
        generateAiCasesForm.reset();
        if (selectedSuite) {
          generateAiCasesForm.setValue("testSuiteId", selectedSuite.id);
        }
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to generate test cases",
          variant: "destructive",
        });
      },
    });
  }
  
  // Handle updating a test case
  function onUpdateTestCase(data: z.infer<typeof createTestCaseSchema>) {
    if (!selectedTestCase) return;
    
    // Add steps array based on test case format
    const testCaseData = {
      ...data,
      // Preserve structure based on test case format
      steps: selectedProject?.testCaseFormat === "structured" 
        ? data.steps 
        : selectedTestCase.steps,
    };
    
    updateTestCaseMutation.mutate(testCaseData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Test case updated successfully",
        });
        setEditCaseDialogOpen(false);
        setSelectedTestCase(null);
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to update test case",
          variant: "destructive",
        });
      },
    });
  }
  
  // Handle deleting a test case
  function onDeleteTestCase() {
    if (!selectedTestCase) return;
    
    deleteTestCaseMutation.mutate(selectedTestCase.id, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Test case deleted successfully",
        });
        setDeleteConfirmOpen(false);
        setSelectedTestCase(null);
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to delete test case",
          variant: "destructive",
        });
      },
    });
  }
  
  // Handle updating a test suite
  function onUpdateTestSuite(data: z.infer<typeof createTestSuiteSchema>) {
    if (!selectedSuite) return;
    
    updateTestSuiteMutation.mutate({
      ...data,
      projectId
    }, {
      onSuccess: (updatedSuite) => {
        toast({
          title: "Success",
          description: "Test suite updated successfully",
        });
        setEditSuiteDialogOpen(false);
        setSelectedSuite(updatedSuite);
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to update test suite",
          variant: "destructive",
        });
      },
    });
  }
  
  // Handle deleting a test suite
  function onDeleteTestSuite() {
    if (!selectedSuite) return;
    
    deleteTestSuiteMutation.mutate(selectedSuite.id, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Test suite deleted successfully",
        });
        setDeleteSuiteConfirmOpen(false);
        setSelectedSuite(null);
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to delete test suite",
          variant: "destructive",
        });
      },
    });
  }
  
  // Reset edit form when selected test case changes
  useEffect(() => {
    if (selectedTestCase) {
      editCaseForm.reset({
        title: selectedTestCase.title,
        description: selectedTestCase.description,
        preconditions: selectedTestCase.preconditions,
        steps: selectedTestCase.steps || [],
        expectedResults: selectedTestCase.expectedResults,
        priority: selectedTestCase.priority,
        severity: selectedTestCase.severity,
        status: selectedTestCase.status,
        suiteId: selectedTestCase.suiteId,
        automatable: selectedTestCase.automatable,
      });
    }
  }, [selectedTestCase, editCaseForm]);
  
  // Reset edit form when selected test suite changes
  useEffect(() => {
    if (selectedSuite) {
      editSuiteForm.reset({
        name: selectedSuite.name,
        description: selectedSuite.description,
        projectArea: selectedSuite.projectArea,
        priority: selectedSuite.priority,
        status: selectedSuite.status,
        type: selectedSuite.type,
      });
    }
  }, [selectedSuite, editSuiteForm]);
  
  return (
    <AppLayout>
      <PageContainer withPadding className="py-8">
        <PageHeader 
          title="Test Management"
          description="Create, organize, and manage test suites and test cases"
          actions={
            <Button className="flex items-center space-x-2" onClick={() => setNewSuiteDialogOpen(true)}>
              <FolderPlus className="w-4 h-4" />
              <span>New Test Suite</span>
            </Button>
          }
        />
        
        <PageContent>
          <div className="grid grid-cols-12 gap-6">
            {/* Test Suites Column */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col space-y-4">
              <TestSuiteList
                selectedSuite={selectedSuite}
                onSelectSuite={setSelectedSuite}
                onCreateSuite={() => setNewSuiteDialogOpen(true)}
                onEditSuite={(suite) => {
                  setSelectedSuite(suite);
                  setEditSuiteDialogOpen(true);
                }}
                onDeleteSuite={(suite) => {
                  setSelectedSuite(suite);
                  setDeleteSuiteConfirmOpen(true);
                }}
              />
            </div>

            {/* Test Cases Column */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9">
              <ATMFCard neonEffect="blue">
                <ATMFCardHeader
                  title={selectedSuite ? selectedSuite.name : "Select a Test Suite"}
                  description={selectedSuite ? selectedSuite.description : "Choose a test suite from the left panel to view and manage its test cases"}
                  action={
                    selectedSuite && (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setNewCaseDialogOpen(true)}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Test Case</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setAiGenerateDialogOpen(true)}
                          className="flex items-center gap-1"
                        >
                          <Brain className="h-3.5 w-3.5" />
                          <span>Generate with AI</span>
                        </Button>
                      </div>
                    )
                  }
                />
                <div className="p-4">
                  <TestCaseTable
                    selectedSuite={selectedSuite}
                    onCreateTestCase={() => setNewCaseDialogOpen(true)}
                    onGenerateAI={() => setAiGenerateDialogOpen(true)}
                    onViewTestCase={(testCase) => {
                      setSelectedTestCase(testCase);
                      setTestCaseDetailOpen(true);
                    }}
                    projectId={projectId}
                  />
                </div>
              </ATMFCard>
            </div>
          </div>
        </PageContent>
      </PageContainer>
      
      {/* Create New Test Suite Dialog */}
      <TestSuiteFormDialog
        open={newSuiteDialogOpen}
        onOpenChange={setNewSuiteDialogOpen}
        onSubmit={onCreateSuite}
        isSubmitting={createTestSuiteMutation.isPending}
        mode="create"
      />
      
      {/* Edit Test Suite Dialog */}
      <TestSuiteFormDialog
        open={editSuiteDialogOpen}
        onOpenChange={setEditSuiteDialogOpen}
        onSubmit={onUpdateTestSuite}
        testSuite={selectedSuite}
        isSubmitting={updateTestSuiteMutation.isPending}
        mode="edit"
      />
      
      {/* Delete Test Suite Confirmation */}
      <DeleteConfirmDialog
        open={deleteSuiteConfirmOpen}
        onOpenChange={setDeleteSuiteConfirmOpen}
        onDelete={onDeleteTestSuite}
        isDeleting={deleteTestSuiteMutation.isPending}
        type="testSuite"
        item={selectedSuite}
        useAlertDialog={true}
      />
      
      {/* Create New Test Case Dialog */}
      <TestCaseFormDialog
        open={newCaseDialogOpen}
        onOpenChange={setNewCaseDialogOpen}
        onSubmit={onCreateTestCase}
        selectedSuite={selectedSuite}
        suites={selectedSuite ? [selectedSuite] : []}
        isSubmitting={createTestCaseMutation.isPending}
        mode="create"
      />
      
      {/* Generate AI Test Cases Dialog */}
      {/* TODO: Replace with GenerateAITestCasesDialog component */}
      
      {/* View Test Case Details Dialog */}
      {/* TODO: Replace with TestCaseDetailsDialog component */}
      
      {/* Edit Test Case Dialog */}
      <TestCaseFormDialog
        open={editCaseDialogOpen}
        onOpenChange={setEditCaseDialogOpen}
        onSubmit={onUpdateTestCase}
        testCase={selectedTestCase}
        suites={selectedSuite ? [selectedSuite] : []}
        selectedSuite={selectedSuite}
        isSubmitting={updateTestCaseMutation.isPending}
        mode="edit"
      />
      
      {/* Delete Test Case Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onDelete={onDeleteTestCase}
        isDeleting={deleteTestCaseMutation.isPending}
        type="testCase"
        item={selectedTestCase}
        useAlertDialog={false}
      />
    </AppLayout>
  );
}