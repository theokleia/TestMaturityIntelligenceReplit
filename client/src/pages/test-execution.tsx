import { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { 
  useTestCycles, 
  useCreateTestCycle, 
  useTestCycleItems,
  useAddTestCasesToCycle,
  useAddTestSuiteToCycle,
  useUpdateTestCycleItem,
  useCreateTestRun,
  TestCycle,
  TestCycleItem
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PlayCircle,
  Calendar,
  Plus,
  Check,
  X,
  SkipForward,
  AlertCircle,
  Clock,
  ListChecks
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StatusBadge, type StatusBadgeVariant } from "@/components/design-system/status-badge";

// Schema for creating a test cycle
const testCycleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.string().default("created"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Test Execution Page
export default function TestExecution() {
  const { toast } = useToast();
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id;
  
  // State
  const [selectedCycle, setSelectedCycle] = useState<TestCycle | null>(null);
  const [activeTab, setActiveTab] = useState("cycles");
  const [newCycleDialogOpen, setNewCycleDialogOpen] = useState(false);
  const [selectCasesDialogOpen, setSelectCasesDialogOpen] = useState(false);
  const [selectSuiteDialogOpen, setSelectSuiteDialogOpen] = useState(false);
  const [testRunDialogOpen, setTestRunDialogOpen] = useState(false);
  const [selectedCases, setSelectedCases] = useState<number[]>([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | null>(null);
  const [selectedCycleItem, setSelectedCycleItem] = useState<TestCycleItem | null>(null);
  
  // Forms
  const newCycleForm = useForm<z.infer<typeof testCycleSchema>>({
    resolver: zodResolver(testCycleSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "created"
    },
  });
  
  // Queries
  const { data: testCycles, isLoading: isLoadingCycles } = useTestCycles(projectId);
  const { data: cycleItems, isLoading: isLoadingItems } = useTestCycleItems(selectedCycle?.id || 0);
  const { testCases, isLoading: isLoadingCases } = useTestCases({
    projectId,
  });
  const { testSuites, isLoading: isLoadingSuites } = useTestSuites({
    projectId,
  });
  
  // Mutations
  const createCycleMutation = useCreateTestCycle();
  const addCasesMutation = useAddTestCasesToCycle();
  const addSuiteMutation = useAddTestSuiteToCycle();
  const updateItemMutation = useUpdateTestCycleItem(selectedCycleItem?.id || 0);
  const createRunMutation = useCreateTestRun();
  
  // Handlers
  const handleCreateCycle = (data: z.infer<typeof testCycleSchema>) => {
    if (!projectId) return;
    
    // Convert string dates to Date objects
    const payload = {
      ...data,
      projectId,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined
    };
    
    createCycleMutation.mutate(payload, {
      onSuccess: (newCycle) => {
        toast({
          title: "Test Cycle Created",
          description: `"${newCycle.name}" has been created successfully.`,
        });
        setNewCycleDialogOpen(false);
        newCycleForm.reset();
        setSelectedCycle(newCycle);
        setActiveTab("execution");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to create test cycle. Please try again.",
          variant: "destructive",
        });
      }
    });
  };
  
  const handleAddCases = () => {
    if (!selectedCycle || selectedCases.length === 0) return;
    
    addCasesMutation.mutate({
      cycleId: selectedCycle.id,
      testCaseIds: selectedCases
    }, {
      onSuccess: () => {
        toast({
          title: "Test Cases Added",
          description: `${selectedCases.length} test cases added to cycle.`,
        });
        setSelectCasesDialogOpen(false);
        setSelectedCases([]);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to add test cases. Please try again.",
          variant: "destructive",
        });
      }
    });
  };
  
  const handleAddSuite = () => {
    if (!selectedCycle || !selectedSuiteId) return;
    
    addSuiteMutation.mutate({
      cycleId: selectedCycle.id,
      suiteId: selectedSuiteId
    }, {
      onSuccess: (result) => {
        toast({
          title: "Test Suite Added",
          description: `Test suite with ${result.length} test cases added to cycle.`,
        });
        setSelectSuiteDialogOpen(false);
        setSelectedSuiteId(null);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to add test suite. Please try again.",
          variant: "destructive",
        });
      }
    });
  };
  
  const handleRunTest = (status: string) => {
    if (!selectedCycleItem) return;
    
    createRunMutation.mutate({
      cycleItemId: selectedCycleItem.id,
      status,
      notes: "Executed manually",
      executedAt: new Date().toISOString(),
    }, {
      onSuccess: () => {
        toast({
          title: "Test Executed",
          description: `Test status updated to ${status}.`,
        });
        setTestRunDialogOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to execute test. Please try again.",
          variant: "destructive",
        });
      }
    });
  };
  
  // Effect to auto-select first cycle if none selected
  useEffect(() => {
    if (testCycles && testCycles.length > 0 && !selectedCycle) {
      setSelectedCycle(testCycles[0]);
    }
  }, [testCycles, selectedCycle]);
  
  // Render status badge
  const renderStatusBadge = (status: string | null) => {
    if (!status) return <StatusBadge variant="muted">Unknown</StatusBadge>;
    
    const statusMap: Record<string, { variant: StatusBadgeVariant, label: string }> = {
      "not-run": { variant: "muted", label: "Not Run" },
      "pass": { variant: "success", label: "Pass" },
      "fail": { variant: "danger", label: "Fail" },
      "skip": { variant: "warning", label: "Skipped" },
      "blocked": { variant: "danger", label: "Blocked" },
      "in-progress": { variant: "blue", label: "In Progress" },
      "created": { variant: "blue", label: "Created" },
      "completed": { variant: "success", label: "Completed" },
    };
    
    const statusInfo = statusMap[status] || { variant: "muted", label: status };
    
    return (
      <StatusBadge variant={statusInfo.variant}>
        {statusInfo.label}
      </StatusBadge>
    );
  };
  
  // Get associated test case details
  const getTestCaseDetails = (testCaseId: number): TestCase | undefined => {
    return testCases?.find(tc => tc.id === testCaseId);
  };

  return (
    <PageContainer withPadding className="py-8">
      <PageHeader
        title="Test Execution"
        description="Execute test cases and manage test cycles"
        actions={
          <Button className="flex items-center gap-2" onClick={() => setNewCycleDialogOpen(true)}>
            <Plus size={16} />
            <span>New Test Cycle</span>
          </Button>
        }
      />
      
      <PageContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="cycles">Test Cycles</TabsTrigger>
            <TabsTrigger value="execution" disabled={!selectedCycle}>Test Execution</TabsTrigger>
          </TabsList>
          
          {/* Test Cycles Tab */}
          <TabsContent value="cycles" className="space-y-6">
            <ATMFCard>
              <ATMFCardHeader title="All Test Cycles" />
              
              <div className="p-6">
                {isLoadingCycles ? (
                  <div className="text-center py-8">Loading test cycles...</div>
                ) : testCycles && testCycles.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testCycles.map((cycle) => (
                        <TableRow 
                          key={cycle.id}
                          className={selectedCycle?.id === cycle.id ? "bg-primary/5" : ""}
                          onClick={() => setSelectedCycle(cycle)}
                        >
                          <TableCell className="font-medium">{cycle.name}</TableCell>
                          <TableCell>{renderStatusBadge(cycle.status)}</TableCell>
                          <TableCell>{cycle.startDate ? new Date(cycle.startDate).toLocaleDateString() : "Not started"}</TableCell>
                          <TableCell>{cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : "No end date"}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCycle(cycle);
                                setActiveTab("execution");
                              }}
                            >
                              <PlayCircle size={16} className="mr-2" />
                              Execute
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No test cycles found. Create a new test cycle to get started.
                  </div>
                )}
              </div>
            </ATMFCard>
          </TabsContent>
          
          {/* Test Execution Tab */}
          <TabsContent value="execution" className="space-y-6">
            {selectedCycle && (
              <>
                <ATMFCard>
                  <ATMFCardHeader 
                    title={selectedCycle.name} 
                    description={selectedCycle.description || "No description"} 
                    action={
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
                      <span className="text-sm text-muted-foreground">Created</span>
                      <div className="mt-1">
                        {selectedCycle.createdAt ? new Date(selectedCycle.createdAt).toLocaleDateString() : "Unknown"}
                      </div>
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
                            <TableHead>Last Executed</TableHead>
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
                                <TableCell>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "Never"}</TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCycleItem(item);
                                      setTestRunDialogOpen(true);
                                    }}
                                  >
                                    <PlayCircle size={16} className="mr-2" />
                                    Execute
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
              </>
            )}
          </TabsContent>
        </Tabs>
      </PageContent>
      
      {/* Create New Test Cycle Dialog */}
      <Dialog open={newCycleDialogOpen} onOpenChange={setNewCycleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Test Cycle</DialogTitle>
            <DialogDescription>
              Create a new test cycle to organize and execute your test cases.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...newCycleForm}>
            <form onSubmit={newCycleForm.handleSubmit(handleCreateCycle)} className="space-y-4">
              <FormField
                control={newCycleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Sprint 23 Regression" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newCycleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Test cycle description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={newCycleForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={newCycleForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={newCycleForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="created">Created</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={createCycleMutation.isPending}>
                  {createCycleMutation.isPending ? "Creating..." : "Create Test Cycle"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Select Test Cases Dialog */}
      <Dialog open={selectCasesDialogOpen} onOpenChange={setSelectCasesDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Test Cases to Cycle</DialogTitle>
            <DialogDescription>
              Select test cases to add to the current test cycle.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto">
            {isLoadingCases ? (
              <div className="text-center py-8">Loading test cases...</div>
            ) : testCases && testCases.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <span className="sr-only">Select</span>
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testCases.map((testCase) => (
                    <TableRow key={testCase.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          checked={selectedCases.includes(testCase.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCases([...selectedCases, testCase.id]);
                            } else {
                              setSelectedCases(selectedCases.filter(id => id !== testCase.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-mono">{testCase.id}</TableCell>
                      <TableCell>{testCase.title}</TableCell>
                      <TableCell>
                        <StatusBadge variant={
                          testCase.priority === "high" ? "danger" :
                          testCase.priority === "medium" ? "warning" : "muted"
                        }>
                          {testCase.priority.charAt(0).toUpperCase() + testCase.priority.slice(1)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant={
                          testCase.status === "passed" ? "success" :
                          testCase.status === "failed" ? "danger" : "muted"
                        }>
                          {testCase.status.charAt(0).toUpperCase() + testCase.status.slice(1)}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No test cases available to add.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectCasesDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCases}
              disabled={selectedCases.length === 0 || addCasesMutation.isPending}
            >
              {addCasesMutation.isPending 
                ? "Adding Cases..." 
                : `Add ${selectedCases.length} Cases`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Select Test Suite Dialog */}
      <Dialog open={selectSuiteDialogOpen} onOpenChange={setSelectSuiteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Test Suite to Cycle</DialogTitle>
            <DialogDescription>
              Select a test suite to add all its test cases to the current cycle.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto">
            {isLoadingSuites ? (
              <div className="text-center py-8">Loading test suites...</div>
            ) : testSuites && testSuites.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <span className="sr-only">Select</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testSuites.map((suite) => (
                    <TableRow key={suite.id}>
                      <TableCell>
                        <input
                          type="radio"
                          className="w-4 h-4"
                          checked={selectedSuiteId === suite.id}
                          onChange={() => setSelectedSuiteId(suite.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{suite.name}</TableCell>
                      <TableCell>{suite.description}</TableCell>
                      <TableCell>
                        <StatusBadge variant={
                          suite.status === "active" ? "success" :
                          suite.status === "draft" ? "muted" : "warning"
                        }>
                          {suite.status.charAt(0).toUpperCase() + suite.status.slice(1)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant={
                          suite.priority === "high" ? "danger" :
                          suite.priority === "medium" ? "warning" : "muted"
                        }>
                          {suite.priority.charAt(0).toUpperCase() + suite.priority.slice(1)}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No test suites available to add.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectSuiteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSuite}
              disabled={!selectedSuiteId || addSuiteMutation.isPending}
            >
              {addSuiteMutation.isPending 
                ? "Adding Suite..." 
                : "Add Test Suite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Execute Test Dialog */}
      <Dialog open={testRunDialogOpen} onOpenChange={setTestRunDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Execute Test</DialogTitle>
            <DialogDescription>
              {selectedCycleItem && getTestCaseDetails(selectedCycleItem.testCaseId)?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="text-center">Update test status:</div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button
                variant="outline"
                className="flex-col h-auto py-4 border-green-500/20 hover:bg-green-500/10"
                onClick={() => handleRunTest("pass")}
              >
                <Check className="h-8 w-8 mb-2 text-green-500" />
                <span>Pass</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex-col h-auto py-4 border-red-500/20 hover:bg-red-500/10"
                onClick={() => handleRunTest("fail")}
              >
                <X className="h-8 w-8 mb-2 text-red-500" />
                <span>Fail</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex-col h-auto py-4 border-yellow-500/20 hover:bg-yellow-500/10"
                onClick={() => handleRunTest("skip")}
              >
                <SkipForward className="h-8 w-8 mb-2 text-yellow-500" />
                <span>Skip</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex-col h-auto py-4 border-orange-500/20 hover:bg-orange-500/10"
                onClick={() => handleRunTest("blocked")}
              >
                <AlertCircle className="h-8 w-8 mb-2 text-orange-500" />
                <span>Blocked</span>
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTestRunDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}