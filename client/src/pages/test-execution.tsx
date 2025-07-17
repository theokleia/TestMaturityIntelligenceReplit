import { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { 
  useTestCycles, 
  useTestCycleItems,
  useAddTestCasesToCycle,
  useAddTestSuiteToCycle,
  useRemoveTestCaseFromCycle,
  useUpdateTestCycleItem,
  useCreateTestRun,
  useTestRuns,
  useTestRunsByTestCase,
  TestCycle,
  TestCycleItem,
  TestRun
} from "@/hooks/test-execution";
import { useTestCases, useTestSuites, TestCase, TestSuite } from "@/hooks/test-management";
import { useToast } from "@/hooks/use-toast";
import { 
  PageContainer, 
  PageHeader, 
  PageContent 
} from "@/components/design-system/page-container";
import { ATMFCard, ATMFCardHeader } from "@/components/design-system/atmf-card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { StatusBadgeVariant, StatusBadge } from "@/components/design-system/status-badge";
import { TabView } from "@/components/design-system/tab-view";
import {
  PlayCircle,
  Plus,
  Check,
  X,
  Clock,
  AlertCircle,
  ListChecks,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Removed test cycle CRUD components

// Test run form schema
const testRunSchema = z.object({
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional().nullable(),
});

type TestRunFormValues = z.infer<typeof testRunSchema>;

// Helper function to render status badge with appropriate color
function renderStatusBadge(status: string): JSX.Element {
  const statusMap: Record<string, { variant: StatusBadgeVariant, label: string }> = {
    "planned": { variant: "muted", label: "Planned" },
    "in_progress": { variant: "warning", label: "In Progress" },
    "completed": { variant: "status", label: "Completed" },
    "blocked": { variant: "danger", label: "Blocked" },
    "passed": { variant: "success", label: "Passed" },
    "failed": { variant: "danger", label: "Failed" },
    "skipped": { variant: "muted", label: "Skipped" },
    "not_executed": { variant: "muted", label: "Not Executed" },
  };
  
  const config = statusMap[status] || { variant: "muted", label: status };
  
  return <StatusBadge variant={config.variant}>{config.label}</StatusBadge>;
}

export default function TestExecution() {
  const { toast } = useToast();
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id;
  
  // State
  const [activeTab, setActiveTab] = useState("cycles");
  const [selectedCycle, setSelectedCycle] = useState<TestCycle | null>(null);
  const [selectCasesDialogOpen, setSelectCasesDialogOpen] = useState(false);
  const [selectSuiteDialogOpen, setSelectSuiteDialogOpen] = useState(false);
  const [testRunDialogOpen, setTestRunDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedCases, setSelectedCases] = useState<number[]>([]);
  const [selectedSuiteIds, setSelectedSuiteIds] = useState<number[]>([]);
  const [selectedCycleItem, setSelectedCycleItem] = useState<TestCycleItem | null>(null);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<number | null>(null);
  const [testRunNotes, setTestRunNotes] = useState("");

  // Queries
  const { 
    data: testCycles,
    isLoading: isLoadingCycles, 
    refetch: refetchCycles
  } = useTestCycles(projectId);
  
  const {
    data: cycleItems,
    isLoading: isLoadingItems,
    refetch: refetchItems
  } = useTestCycleItems(selectedCycle?.id);
  
  const {
    data: testSuites,
    isLoading: isLoadingSuites
  } = useTestSuites({ projectId });
  
  const {
    data: testCases,
    isLoading: isLoadingCases
  } = useTestCases({ projectId });
  
  const {
    data: testRuns,
    isLoading: isLoadingRuns,
    refetch: refetchRuns
  } = useTestRuns(selectedCycleItem?.id);
  
  const {
    data: testRunHistory,
    isLoading: isLoadingHistory
  } = useTestRunsByTestCase(selectedTestCaseId);
  
  // Mutations
  const addCasesMutation = useAddTestCasesToCycle();
  const addSuiteMutation = useAddTestSuiteToCycle();
  const removeCaseMutation = useRemoveTestCaseFromCycle();
  const updateCycleItemMutation = useUpdateTestCycleItem();
  const createRunMutation = useCreateTestRun();
  
  const runForm = useForm<TestRunFormValues>({
    resolver: zodResolver(testRunSchema),
    defaultValues: {
      status: "not_executed",
      notes: "",
    }
  });
  
  // Effects
  
  useEffect(() => {
    if (selectedCycleItem && testRunDialogOpen) {
      runForm.reset({
        status: selectedCycleItem.status || "not_executed",
        notes: "",
      });
    }
  }, [selectedCycleItem, testRunDialogOpen, runForm]);
  
  // Helper Functions
  const getTestCaseDetails = (id: number): TestCase | undefined => {
    return testCases?.find(tc => tc.id === id);
  };
  
  // Handlers (removed cycle creation/update handlers)
  
  const handleAddTestCases = () => {
    if (!selectedCycle || !selectedCases.length) return;
    
    console.log('Adding test cases to cycle:', { 
      cycleId: selectedCycle.id, 
      testCaseIds: selectedCases 
    });
    
    // Use the correct API endpoint path
    console.log(`Using endpoint: /api/test-cycles/${selectedCycle.id}/add-test-cases`);
    addCasesMutation.mutate(
      {
        cycleId: selectedCycle.id,
        testCaseIds: selectedCases,
      },
      {
        onSuccess: (data) => {
          console.log('Add test cases API response:', data);
          toast({
            title: "Success",
            description: `Added ${selectedCases.length} test case(s) to cycle`,
          });
          
          setSelectCasesDialogOpen(false);
          setSelectedCases([]);
          refetchItems();
        },
        onError: (error) => {
          console.error('Error adding test cases to cycle:', error);
          toast({
            title: "Error",
            description: "Failed to add test cases to cycle",
            variant: "destructive",
          });
        }
      }
    );
  };
  
  const handleAddTestSuites = () => {
    if (!selectedCycle || selectedSuiteIds.length === 0) return;
    
    console.log('Adding test suites to cycle:', {
      cycleId: selectedCycle.id,
      suiteIds: selectedSuiteIds
    });
    
    // Add each suite sequentially
    let completed = 0;
    selectedSuiteIds.forEach((suiteId) => {
      console.log(`Using endpoint: /api/test-cycles/${selectedCycle.id}/add-suite/${suiteId}`);
      addSuiteMutation.mutate(
        {
          cycleId: selectedCycle.id,
          suiteId: suiteId,
        },
        {
          onSuccess: (data) => {
            completed++;
            console.log(`Add test suite ${suiteId} API response:`, data);
            
            if (completed === selectedSuiteIds.length) {
              toast({
                title: "Success",
                description: `Added ${selectedSuiteIds.length} test suite${selectedSuiteIds.length !== 1 ? 's' : ''} to cycle`,
              });
              
              setSelectSuiteDialogOpen(false);
              setSelectedSuiteIds([]);
              refetchItems();
            }
          },
          onError: (error) => {
            console.error('Error adding test suite to cycle:', error);
            toast({
              title: "Error",
              description: "Failed to add test suite to cycle",
              variant: "destructive",
            });
          }
        }
      );
    });
  };
  
  const handleRemoveTestCase = (item: TestCycleItem) => {
    removeCaseMutation.mutate(
      {
        id: item.id,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Test case removed from cycle",
          });
          
          refetchItems();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to remove test case from cycle",
            variant: "destructive",
          });
        }
      }
    );
  };
  
  const handleCreateTestRun = (data: TestRunFormValues) => {
    if (!selectedCycleItem || !selectedTestCaseId) return;
    
    createRunMutation.mutate(
      {
        cycleItemId: selectedCycleItem.id,
        testCaseId: selectedTestCaseId,
        status: data.status,
        notes: data.notes || "",
        steps: null,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Test run recorded successfully",
          });
          
          // Update the cycle item status to match the test run
          updateCycleItemMutation.mutate(
            {
              id: selectedCycleItem.id,
              status: data.status,
            },
            {
              onSuccess: () => {
                refetchItems();
                refetchRuns();
                setTestRunDialogOpen(false);
                runForm.reset();
              }
            }
          );
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to record test run",
            variant: "destructive",
          });
        }
      }
    );
  };
  
  // Define TabView content
  const tabItems = [
    {
      id: "cycles",
      label: "Test Cycles",
      content: (
        <ATMFCard>
          <ATMFCardHeader title="Test Cycles" description="Manage your test execution cycles" />
          <div className="p-6">
            {isLoadingCycles ? (
              <div className="text-center py-8">Loading test cycles...</div>
            ) : testCycles && testCycles.length > 0 ? (
              <div className="space-y-4">
                {testCycles.map((cycle) => (
                  <div
                    key={cycle.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedCycle?.id === cycle.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedCycle(cycle);
                      setActiveTab("execution");
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{cycle.name}</h4>
                          {renderStatusBadge(cycle.status)}
                        </div>
                        
                        {cycle.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {cycle.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          {cycle.startDate && (
                            <span>Start: {formatDate(cycle.startDate)}</span>
                          )}
                          {cycle.endDate && (
                            <span>End: {formatDate(cycle.endDate)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCycle(cycle);
                            setActiveTab("execution");
                          }}
                        >
                          <PlayCircle size={16} className="mr-1" />
                          Execute
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="py-8">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No test cycles yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Test cycles will appear here once created.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ATMFCard>
      )
    },
    {
      id: "execution",
      label: "Test Execution",
      content: selectedCycle ? (
        <div className="space-y-6">
          <ATMFCard>
            <ATMFCardHeader 
              title={selectedCycle.name}
              description={selectedCycle.description || "Test cycle execution details"}
              actions={
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectSuiteDialogOpen(true)}
                  >
                    <ListChecks size={16} className="mr-2" />
                    Add Test Suite
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectCasesDialogOpen(true)}
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
              
              <div className="p-4 bg-atmf-card rounded-lg">
                <span className="text-sm text-muted-foreground">Progress</span>
                <div className="mt-1">-</div>
              </div>
            </div>
          </ATMFCard>
          
          <ATMFCard>
            <ATMFCardHeader title="Test Cases" description="Execute test cases in this cycle" />
            
            <div className="p-6">
              {isLoadingItems ? (
                <div className="text-center py-8">Loading test cases...</div>
              ) : cycleItems && cycleItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Test Case</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cycleItems.map((item) => {
                      const testCase = getTestCaseDetails(item.testCaseId);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono">{item.testCaseId}</TableCell>
                          <TableCell>{testCase?.title || `Test Case #${item.testCaseId}`}</TableCell>
                          <TableCell>{renderStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedCycleItem(item);
                                setSelectedTestCaseId(item.testCaseId);
                                setTestRunDialogOpen(true);
                              }}
                            >
                              <PlayCircle size={16} className="mr-2" />
                              Execute
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedTestCaseId(item.testCaseId);
                                setHistoryDialogOpen(true);
                              }}
                            >
                              <Clock size={16} className="mr-2" />
                              History
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-100/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTestCase(item);
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No test cases in this cycle. Add test cases to start execution.
                </div>
              )}
            </div>
          </ATMFCard>
        </div>
      ) : (
        <div className="flex items-center justify-center p-12 border border-dashed rounded-lg">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Test Cycle Selected</h3>
            <p className="text-muted-foreground mb-4">Please select a test cycle to view execution details.</p>
            <Button variant="outline" onClick={() => setActiveTab("cycles")}>View Test Cycles</Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Test Execution"
        description="Execute test cases and record results"
        action={null}
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
      

      
      {/* Select Test Cases Dialog */}
      <Dialog open={selectCasesDialogOpen} onOpenChange={setSelectCasesDialogOpen}>
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
            ) : testCases && testCases.length > 0 ? (
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
                    {testCases.map((testCase) => (
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
                        <TableCell className="font-mono">{testCase.id}</TableCell>
                        <TableCell>{testCase.title}</TableCell>
                        <TableCell>{testCase.priority}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No test cases found for this project.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectCasesDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              disabled={selectedCases.length === 0} 
              onClick={handleAddTestCases}
              isPending={addCasesMutation.isPending}
            >
              Add {selectedCases.length} Test Case{selectedCases.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Select Test Suite Dialog */}
      <Dialog open={selectSuiteDialogOpen} onOpenChange={setSelectSuiteDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Test Suites to Cycle</DialogTitle>
            <DialogDescription>
              Select one or more test suites to add all their test cases to the current cycle.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {isLoadingSuites ? (
              <div className="text-center py-8">Loading test suites...</div>
            ) : testSuites && testSuites.length > 0 ? (
              <ScrollArea className="max-h-64 w-full rounded-md border p-4">
                <div className="space-y-2">
                  {testSuites.map((suite) => (
                    <div key={suite.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`suite-${suite.id}`}
                        checked={selectedSuiteIds.includes(suite.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSuiteIds([...selectedSuiteIds, suite.id]);
                          } else {
                            setSelectedSuiteIds(selectedSuiteIds.filter(id => id !== suite.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={`suite-${suite.id}`}
                        className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{suite.name}</div>
                          {suite.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {suite.description}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {testCases?.filter(tc => tc.suiteId === suite.id).length || 0} test cases
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No test suites found for this project.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectSuiteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              disabled={selectedSuiteIds.length === 0} 
              onClick={handleAddTestSuites}
              isPending={addSuiteMutation.isPending}
            >
              Add {selectedSuiteIds.length} Suite{selectedSuiteIds.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Test Run Dialog */}
      <Dialog open={testRunDialogOpen} onOpenChange={setTestRunDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Execute Test Case</DialogTitle>
            <DialogDescription>
              Record test execution results.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCycleItem && selectedTestCaseId && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Test Case ID</h3>
                  <p className="font-mono">{selectedTestCaseId}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Current Status</h3>
                  <div>{renderStatusBadge(selectedCycleItem.status)}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Test Case</h3>
                <p className="font-medium">{getTestCaseDetails(selectedTestCaseId)?.title}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Description</h3>
                <p>{getTestCaseDetails(selectedTestCaseId)?.description || "No description available"}</p>
              </div>
              
              {getTestCaseDetails(selectedTestCaseId)?.steps && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Test Steps</h3>
                  <div className="space-y-2 mt-2">
                    {typeof getTestCaseDetails(selectedTestCaseId)?.steps === 'string' 
                      ? <p>{getTestCaseDetails(selectedTestCaseId)?.steps}</p>
                      : getTestCaseDetails(selectedTestCaseId)?.steps?.map((step, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 border rounded-md">
                          <div className="font-mono text-sm bg-muted w-6 h-6 flex items-center justify-center rounded">
                            {index + 1}
                          </div>
                          <div>
                            <p>{step.description}</p>
                            {step.expected && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Expected: {step.expected}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Previous Runs</h3>
                {isLoadingRuns ? (
                  <div className="text-center py-4">Loading previous runs...</div>
                ) : testRuns && testRuns.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testRuns.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell>{new Date(run.createdAt).toLocaleString()}</TableCell>
                          <TableCell>{renderStatusBadge(run.status)}</TableCell>
                          <TableCell className="truncate max-w-[200px]">{run.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No previous runs for this test case in this cycle.
                  </div>
                )}
              </div>
              
              <Separator />
              
              <Form {...runForm}>
                <form onSubmit={runForm.handleSubmit(handleCreateTestRun)} className="space-y-4">
                  <FormField
                    control={runForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select result" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="passed">Passed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                            <SelectItem value="skipped">Skipped</SelectItem>
                            <SelectItem value="not_executed">Not Executed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={runForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter test run notes, observations, or defect details"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setTestRunDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" isPending={createRunMutation.isPending}>
                      Save Test Run
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Test History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Test Case History</DialogTitle>
            <DialogDescription>
              View all execution history for this test case across all cycles.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTestCaseId && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Test Case ID</h3>
                <p className="font-mono">{selectedTestCaseId}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Test Case</h3>
                <p className="font-medium">{getTestCaseDetails(selectedTestCaseId)?.title}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Execution History</h3>
                {isLoadingHistory ? (
                  <div className="text-center py-4">Loading history...</div>
                ) : testRunHistory && testRunHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cycle</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testRunHistory.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell>{run.cycleName || "Unknown Cycle"}</TableCell>
                          <TableCell>{run.executedAt ? formatDate(run.executedAt) : formatDate(run.createdAt || '')}</TableCell>
                          <TableCell><StatusBadge variant="test" status={run.status || 'unknown'} /></TableCell>
                          <TableCell className="truncate max-w-[200px]">{run.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No execution history found for this test case.
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button onClick={() => setHistoryDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}