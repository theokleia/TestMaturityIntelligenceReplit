import { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { 
  useTestCycles, 
  useCreateTestCycle, 
  useUpdateTestCycle,
  useTestCycleItems,
  useAddTestCasesToCycle,
  useAddTestSuiteToCycle,
  useRemoveTestCaseFromCycle,
  useUpdateTestCycleItem,
  useCreateTestRun,
  useTestRuns,
  useTestRunsByTestCase,
  TestCycle,
  TestRun
} from "@/hooks/test-execution";
import { useTestCases, useTestSuites } from "@/hooks/test-management";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  PageContainer, 
  PageHeader, 
  PageContent 
} from "@/components/design-system/page-container";
import { ATMFCard, ATMFCardHeader } from "@/components/design-system/atmf-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ListChecks, Table as TableIcon } from "lucide-react";
import { TabView } from "@/components/design-system/tab-view";
import {
  TestCycleTable,
  TestCycleFormDialog,
  TestCaseListForCycle,
  TestExecutionDialog,
  TestHistoryDialog
} from "@/components/test-execution";

export default function TestExecutionPage() {
  const { toast } = useToast();
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id;
  
  // State
  const [activeTab, setActiveTab] = useState("cycles");
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [selectedCycleItem, setSelectedCycleItem] = useState<number | null>(null);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<number | null>(null);
  const [selectedCases, setSelectedCases] = useState<number[]>([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | null>(null);
  
  // Dialog states
  const [newCycleDialogOpen, setNewCycleDialogOpen] = useState(false);
  const [editCycleDialogOpen, setEditCycleDialogOpen] = useState(false);
  const [addCasesDialogOpen, setAddCasesDialogOpen] = useState(false);
  const [addSuiteDialogOpen, setAddSuiteDialogOpen] = useState(false);
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [cycleToEdit, setCycleToEdit] = useState<TestCycle | null>(null);
  
  // Queries
  const { 
    data: testCycles = [], 
    isLoading: isLoadingCycles,
    refetch: refetchCycles
  } = useTestCycles(projectId);
  
  const { 
    data: cycleItems = [], 
    isLoading: isLoadingItems,
    refetch: refetchItems
  } = useTestCycleItems(selectedCycleId || undefined);
  
  const { 
    testSuites = [], 
    isLoading: isLoadingSuites 
  } = useTestSuites({ projectId });
  
  const { 
    testCases = [], 
    isLoading: isLoadingCases 
  } = useTestCases({ 
    projectId: projectId || undefined 
  });
  
  // Debug logs
  console.log("Project ID:", projectId);
  console.log("Available test cases:", testCases);
  console.log("Cycle items:", cycleItems);
  
  const { 
    data: testRuns = [], 
    isLoading: isLoadingRuns,
    refetch: refetchRuns 
  } = useTestRuns(selectedCycleItem || undefined);
  
  const {
    data: allTestCaseRuns = [],
    isLoading: isLoadingCaseHistory,
    refetch: refetchCaseHistory
  } = useTestRunsByTestCase(selectedTestCaseId || undefined);
  
  // Add state for history test runs that will be managed separately
  // and shown in the history dialog
  const [historyTestRuns, setHistoryTestRuns] = useState<TestRun[]>([]);
  
  // Mutations
  const createCycleMutation = useCreateTestCycle();
  const updateCycleMutation = useUpdateTestCycle();
  const addCasesToCycleMutation = useAddTestCasesToCycle();
  const addSuiteToCycleMutation = useAddTestSuiteToCycle();
  const removeCaseFromCycleMutation = useRemoveTestCaseFromCycle();
  const updateCycleItemMutation = useUpdateTestCycleItem();
  const createRunMutation = useCreateTestRun();
  
  // Prepare test case lookup maps
  const testCasesMap = testCases.reduce((acc, testCase) => {
    acc[testCase.id] = testCase;
    return acc;
  }, {} as Record<number, typeof testCases[0]>);
  
  // Prepare latest run lookup map
  const latestRunsMap = cycleItems.reduce((acc, item) => {
    const itemRuns = testRuns.filter(run => run.cycleItemId === item.id);
    if (itemRuns.length > 0) {
      // Sort by createdAt desc
      itemRuns.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      acc[item.id] = itemRuns[0];
    }
    return acc;
  }, {} as Record<number, typeof testRuns[0]>);
  
  // Effect to initialize selected cycle from URL or first available
  useEffect(() => {
    if (testCycles.length > 0 && !selectedCycleId) {
      setSelectedCycleId(testCycles[0].id);
    }
  }, [testCycles, selectedCycleId]);
  
  // Handlers
  const handleCreateTestCycle = (data: any) => {
    if (!projectId) return;
    
    createCycleMutation.mutate(
      { 
        ...data,
        projectId
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Test cycle created successfully",
          });
          refetchCycles();
          setNewCycleDialogOpen(false);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create test cycle",
            variant: "destructive",
          });
        },
      }
    );
  };
  
  const handleUpdateTestCycle = (data: any) => {
    if (!cycleToEdit) return;
    
    updateCycleMutation.mutate(
      { 
        id: cycleToEdit.id,
        data: {
          ...data,
          projectId: cycleToEdit.projectId
        }
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Test cycle updated successfully",
          });
          refetchCycles();
          setEditCycleDialogOpen(false);
          setCycleToEdit(null);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update test cycle",
            variant: "destructive",
          });
        },
      }
    );
  };
  
  const handleDeleteTestCycle = (id: number) => {
    // TODO: Implement delete cycle functionality
    toast({
      title: "Not Implemented",
      description: "Delete test cycle functionality is not yet implemented",
    });
  };
  
  const handleAddTestCasesToCycle = (testCaseIds: number[]) => {
    if (!selectedCycleId) return;
    
    addCasesToCycleMutation.mutate(
      {
        cycleId: selectedCycleId,
        testCaseIds
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Test cases added to cycle successfully",
          });
          refetchItems();
          setAddCasesDialogOpen(false);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add test cases to cycle",
            variant: "destructive",
          });
        },
      }
    );
  };
  
  const handleAddTestSuiteToCycle = (suiteId: number) => {
    if (!selectedCycleId) return;
    
    addSuiteToCycleMutation.mutate(
      {
        cycleId: selectedCycleId,
        suiteId
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Test suite added to cycle successfully",
          });
          refetchItems();
          setAddSuiteDialogOpen(false);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add test suite to cycle",
            variant: "destructive",
          });
        },
      }
    );
  };
  
  const handleRemoveTestCaseFromCycle = (itemId: number) => {
    removeCaseFromCycleMutation.mutate(
      { id: itemId },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Test case removed from cycle successfully",
          });
          refetchItems();
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to remove test case from cycle",
            variant: "destructive",
          });
        },
      }
    );
  };
  
  // Handle clicking the execute button (play icon)
  const handleExecuteTestCase = (cycleItemId: number, testCaseId: number) => {
    setSelectedCycleItem(cycleItemId);
    setSelectedTestCaseId(testCaseId);
    setExecutionDialogOpen(true); // Opens execution dialog for running a test
  };
  
  // Handle clicking the history button (history icon)
  const handleViewTestCaseHistory = async (testCaseId: number) => {
    // First set the selected test case ID 
    setSelectedTestCaseId(testCaseId);
    
    try {
      // Make a direct fetch to get the most current data
      const response = await fetch(`/api/test-runs/test-case/${testCaseId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch test runs: ${response.statusText}`);
      }
      
      const testRunsData = await response.json();
      console.log("Direct fetch test history data:", testRunsData);
      
      // Only open the dialog if we have data
      if (testRunsData && testRunsData.length > 0) {
        // Force update the test runs data
        setHistoryTestRuns(testRunsData);
        setHistoryDialogOpen(true);
      } else {
        toast({
          title: "No history found",
          description: "No previous test runs found for this test case",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching test history:", error);
      toast({
        title: "Error",
        description: "Failed to load test history",
        variant: "destructive",
      });
    }
  };
  
  const handleCreateTestRun = async (data: any) => {
    if (!selectedCycleItem || !selectedTestCaseId) return;
    
    // Extract Jira ticket creation flag if present
    const { createJiraTicket, ...testRunData } = data;
    const testCase = testCasesMap[selectedTestCaseId];
    
    createRunMutation.mutate(
      {
        cycleItemId: selectedCycleItem,
        testCaseId: selectedTestCaseId,
        status: data.status,
        notes: data.notes || "",
        steps: null,
      },
      {
        onSuccess: async (createdRun) => {
          // First show success message for the test run
          toast({
            title: "Success",
            description: "Test run recorded successfully",
          });
          
          // If the test failed and user wants to create a Jira ticket
          if (data.status === "failed" && createJiraTicket && selectedProject) {
            try {
              // Create a Jira ticket with AI-generated content
              const response = await fetch('/api/jira/create-ticket', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  projectId: selectedProject.id,
                  summary: `Test Failure: ${testCase?.title || 'Untitled Test'}`,
                  description: data.notes,
                  issueType: selectedProject.jiraIssueType || 'Bug',
                  testCaseId: selectedTestCaseId,
                  testRunId: createdRun.id,
                }),
              });
              
              if (response.ok) {
                const result = await response.json();
                toast({
                  title: "Jira Ticket Created",
                  description: `Created ${selectedProject.jiraIssueType || 'Bug'} ${result.issueKey}`,
                  variant: "default",
                });
              } else {
                console.error("Failed to create Jira ticket:", await response.text());
                toast({
                  title: "Warning",
                  description: "Test run saved but Jira ticket creation failed",
                  variant: "warning",
                });
              }
            } catch (error) {
              console.error("Error creating Jira ticket:", error);
              toast({
                title: "Warning",
                description: "Test run saved but Jira ticket creation failed",
                variant: "warning",
              });
            }
          }
          
          // Update the cycle item status to match the test run
          updateCycleItemMutation.mutate(
            {
              id: selectedCycleItem,
              data: { status: data.status }
            },
            {
              onSuccess: () => {
                refetchItems();
                refetchRuns();
                refetchCaseHistory();
                setExecutionDialogOpen(false);
              }
            }
          );
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to record test run",
            variant: "destructive",
          });
        },
      }
    );
  };
  
  // Prepare test case selection options for dialog
  const availableTestCases = testCases.filter(testCase => {
    // Only show test cases that aren't already in the cycle
    const isInCycle = cycleItems.some(item => item.testCaseId === testCase.id);
    console.log(`Test case ${testCase.id} (${testCase.title}) in cycle: ${isInCycle}`);
    return !isInCycle;
  });
  
  console.log("Available test cases for dialog:", availableTestCases.length);
  
  // Define TabView content
  const tabItems = [
    {
      id: "cycles",
      label: "Test Cycles",
      content: (
        <div className="space-y-6">
          <ATMFCard>
            <ATMFCardHeader title="All Test Cycles" />
            
            <div className="p-6">
              <TestCycleTable
                testCycles={testCycles}
                isLoading={isLoadingCycles}
                onView={(cycleId) => {
                  setSelectedCycleId(cycleId);
                  setActiveTab("details");
                }}
                onEdit={(cycle) => {
                  setCycleToEdit(cycle);
                  setEditCycleDialogOpen(true);
                }}
                onDelete={handleDeleteTestCycle}
              />
            </div>
          </ATMFCard>
        </div>
      )
    },
    {
      id: "details",
      label: "Cycle Details",
      content: (
        <div className="space-y-6">
          {selectedCycleId ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {testCycles.find(c => c.id === selectedCycleId)?.name || "Test Cycle"}
                </h2>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setAddCasesDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Cases
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setAddSuiteDialogOpen(true)}
                  >
                    <ListChecks className="w-4 h-4 mr-2" />
                    Add Test Suite
                  </Button>
                </div>
              </div>
              
              <ATMFCard>
                <ATMFCardHeader 
                  title="Test Cases" 
                  description="Manage and execute test cases in this cycle"
                  icon={<TableIcon className="w-5 h-5" />}
                />
                
                <div className="p-6">
                  <TestCaseListForCycle
                    cycleItems={cycleItems}
                    testCases={testCasesMap}
                    latestRuns={latestRunsMap}
                    isLoading={isLoadingItems || isLoadingCases}
                    onExecute={handleExecuteTestCase}
                    onRemove={handleRemoveTestCaseFromCycle}
                    onViewHistory={handleViewTestCaseHistory}
                  />
                </div>
              </ATMFCard>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No test cycle selected. Please select a cycle from the Test Cycles tab.
            </div>
          )}
        </div>
      )
    }
  ];
  
  return (
    <AppLayout>
      <PageContainer withPadding className="py-8">
        <PageHeader
          title="Test Execution"
          description="Create and manage test cycles to track test case execution"
          actions={
            <Button onClick={() => setNewCycleDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Test Cycle
            </Button>
          }
        />
      
        <PageContent>
          {/* Using TabView component with underline variant for UI consistency */}
          <TabView 
            tabs={tabItems} 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            variant="underline"
          />
        </PageContent>
      
        {/* New Test Cycle Dialog */}
        <TestCycleFormDialog
          open={newCycleDialogOpen}
          onOpenChange={setNewCycleDialogOpen}
          onSubmit={handleCreateTestCycle}
          title="New Test Cycle"
        />
        
        {/* Edit Test Cycle Dialog */}
        <TestCycleFormDialog
          open={editCycleDialogOpen}
          onOpenChange={setEditCycleDialogOpen}
          onSubmit={handleUpdateTestCycle}
          editData={cycleToEdit || undefined}
          title="Edit Test Cycle"
        />
        
        {/* Add Test Cases Dialog */}
        <Dialog open={addCasesDialogOpen} onOpenChange={setAddCasesDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Add Test Cases to Cycle</DialogTitle>
              <DialogDescription>
                Select test cases to add to the current test cycle.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {isLoadingCases ? (
                <div className="text-center py-8">Loading test cases...</div>
              ) : availableTestCases.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableTestCases.map((testCase) => (
                        <TableRow key={testCase.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCases.includes(testCase.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCases(prev => [...prev, testCase.id]);
                                } else {
                                  setSelectedCases(prev => prev.filter(id => id !== testCase.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-mono">TC-{testCase.id}</TableCell>
                          <TableCell>{testCase.title}</TableCell>
                          <TableCell>{testCase.priority}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  All test cases have already been added to this cycle or no test cases exist for this project.
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddCasesDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                disabled={selectedCases.length === 0} 
                onClick={() => handleAddTestCasesToCycle(selectedCases)}
                variant="default"
                isPending={addCasesToCycleMutation.isPending}
              >
                Add {selectedCases.length} Test Case{selectedCases.length !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add Test Suite Dialog */}
        <Dialog open={addSuiteDialogOpen} onOpenChange={setAddSuiteDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add Test Suite</DialogTitle>
              <DialogDescription>
                Select a test suite to add all its test cases to this cycle.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {isLoadingSuites ? (
                <div className="text-center py-8">Loading test suites...</div>
              ) : testSuites.length > 0 ? (
                <Select 
                  onValueChange={(value) => setSelectedSuiteId(Number(value))}
                  value={selectedSuiteId?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a test suite" />
                  </SelectTrigger>
                  <SelectContent>
                    {testSuites.map((suite) => (
                      <SelectItem key={suite.id} value={suite.id.toString()}>
                        {suite.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No test suites found for this project.
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setAddSuiteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                disabled={!selectedSuiteId} 
                onClick={() => {
                  if (selectedSuiteId) {
                    handleAddTestSuiteToCycle(selectedSuiteId);
                  }
                }}
                variant="default"
                isPending={addSuiteToCycleMutation.isPending}
              >
                Add Suite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Test Execution Dialog */}
        <TestExecutionDialog
          open={executionDialogOpen}
          onOpenChange={setExecutionDialogOpen}
          onSubmit={handleCreateTestRun}
          testCase={selectedTestCaseId ? testCasesMap[selectedTestCaseId] : undefined}
          previousRuns={testRuns.filter(run => 
            run.testCaseId === selectedTestCaseId && 
            run.cycleItemId === selectedCycleItem
          )}
          showHistory={false}
          isPending={createRunMutation.isPending}
        />
        
        {/* Test Case History Dialog */}
        <TestHistoryDialog
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          testCase={selectedTestCaseId ? testCasesMap[selectedTestCaseId] : undefined}
          testRuns={historyTestRuns}
        />
      </PageContainer>
    </AppLayout>
  );
}