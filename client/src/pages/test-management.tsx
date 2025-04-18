import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ListFilter, 
  FolderPlus, 
  FileText, 
  Calendar, 
  Clock, 
  FileOutput, 
  FileUp, 
  Search, 
  Plus, 
  Brain, 
  Bot
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  useTestSuites, 
  useCreateTestSuite, 
  useTestCases, 
  useCreateTestCase,
  TestSuite,
  TestCase
} from "@/hooks/test-management";
import { useGenerateTestCases } from "@/hooks/use-ai-recommendations";
import { ATMFCard, ATMFCardHeader } from "@/components/design-system/atmf-card";
import { StatusBadge } from "@/components/design-system/status-badge";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { PageContainer, PageHeader, PageContent } from "@/components/design-system/page-container";
import { useProject } from "@/context/ProjectContext";

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
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id;
  
  // Dialogs state
  const [newSuiteDialogOpen, setNewSuiteDialogOpen] = useState(false);
  const [newCaseDialogOpen, setNewCaseDialogOpen] = useState(false);
  const [aiGenerateDialogOpen, setAiGenerateDialogOpen] = useState(false);
  
  // Fetch test suites
  const { data: testSuites, isLoading: isLoadingTestSuites } = useTestSuites({
    projectId
  });
  
  // Fetch test cases for the selected suite
  const { data: testCases, isLoading: isLoadingTestCases } = useTestCases({
    suiteId: selectedSuite?.id,
    projectId
  });
  
  // Create test suite mutation
  const createTestSuiteMutation = useCreateTestSuite();
  
  // Create test case mutation
  const createTestCaseMutation = useCreateTestCase();
  
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
  
  // Form for creating a new test case
  const newCaseForm = useForm<z.infer<typeof createTestCaseSchema>>({
    resolver: zodResolver(createTestCaseSchema),
    defaultValues: {
      title: "",
      description: "",
      preconditions: "",
      expectedResults: "",
      priority: "medium",
      severity: "normal",
      status: "draft",
      suiteId: selectedSuite?.id || 0,
      automatable: false,
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
  
  // Filter test suites based on search term
  const filteredTestSuites = testSuites?.filter((suite) => 
    suite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suite.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suite.projectArea.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
    // Add empty steps array since this is a manual case
    const testCaseData = {
      ...data,
      steps: [{ step: "Initialize test", expected: "Test is ready to run" }],
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
              <ATMFCard>
                <ATMFCardHeader
                  title="Test Suites"
                  action={
                    <Badge variant="outline" className="text-xs font-normal">
                      {filteredTestSuites?.length || 0} suites
                    </Badge>
                  }
                />
                <div className="p-4 pt-0">
                  <div className="relative w-full mb-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-text-muted" />
                    <Input
                      placeholder="Search test suites..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
                    {isLoadingTestSuites ? (
                      <div className="flex justify-center items-center h-24">
                        <p>Loading test suites...</p>
                      </div>
                    ) : filteredTestSuites && filteredTestSuites.length > 0 ? (
                      <div className="space-y-2">
                        {filteredTestSuites.map((suite) => (
                          <ATMFCard 
                            key={suite.id} 
                            className={`cursor-pointer transition-colors ${selectedSuite?.id === suite.id ? 'bg-primary/10 border-primary/50' : ''}`}
                            neonEffect={selectedSuite?.id === suite.id ? "blue" : "none"}
                            onClick={() => setSelectedSuite(suite)}
                          >
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-1">
                                <div className="truncate font-medium" title={suite.name}>
                                  {suite.name}
                                </div>
                                <StatusBadge status={suite.status} variant="test" />
                              </div>
                              <p className="text-sm text-text-muted line-clamp-2" title={suite.description}>
                                {suite.description}
                              </p>
                              <div className="flex justify-between items-center mt-2 text-xs text-text-muted">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  <span>{suite.projectArea}</span>
                                </div>
                                <StatusBadge status={suite.priority} variant="priority" />
                              </div>
                            </div>
                          </ATMFCard>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 text-center">
                        <p className="text-text-muted">No test suites found</p>
                        <Button 
                          variant="link" 
                          onClick={() => setNewSuiteDialogOpen(true)}
                          className="mt-2"
                        >
                          Create your first test suite
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </ATMFCard>
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
                  {selectedSuite ? (
                    isLoadingTestCases ? (
                      <div className="flex justify-center items-center h-24">
                        <p>Loading test cases...</p>
                      </div>
                    ) : testCases && testCases.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Automation</TableHead>
                            <TableHead>Source</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {testCases.map((testCase) => (
                            <TableRow key={testCase.id}>
                              <TableCell className="font-medium">{testCase.title}</TableCell>
                              <TableCell>
                                <StatusBadge status={testCase.status} variant="test" />
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={testCase.priority} variant="priority" />
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={testCase.severity} variant="severity" />
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={testCase.automationStatus} variant="automation" />
                              </TableCell>
                              <TableCell>
                                {testCase.aiGenerated ? (
                                  <IconWrapper color="blue" size="xs">
                                    <Bot className="h-3 w-3" />
                                  </IconWrapper>
                                ) : (
                                  <IconWrapper color="primary" size="xs">
                                    <FileText className="h-3 w-3" />
                                  </IconWrapper>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-center">
                        <IconWrapper color="muted" size="lg" className="mb-4">
                          <FileText className="h-6 w-6" />
                        </IconWrapper>
                        <p className="text-text-muted mb-4">No test cases in this suite yet</p>
                        <div className="flex space-x-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setNewCaseDialogOpen(true)}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Test Case</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setAiGenerateDialogOpen(true)}
                            className="flex items-center gap-2"
                          >
                            <Brain className="h-4 w-4" />
                            <span>Generate with AI</span>
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <IconWrapper color="muted" size="lg" className="mb-4">
                        <FolderPlus className="h-6 w-6" />
                      </IconWrapper>
                      <p className="text-text-muted mb-4">Select a test suite from the left panel or create a new one</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setNewSuiteDialogOpen(true)}
                      >
                        Create Test Suite
                      </Button>
                    </div>
                  )}
                </div>
              </ATMFCard>
            </div>
          </div>
        </PageContent>
      </PageContainer>
      
      {/* Create Test Suite Dialog */}
      <Dialog open={newSuiteDialogOpen} onOpenChange={setNewSuiteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Test Suite</DialogTitle>
            <DialogDescription>
              Add a new test suite to organize your test cases
            </DialogDescription>
          </DialogHeader>
          
          <Form {...newSuiteForm}>
            <form onSubmit={newSuiteForm.handleSubmit(onCreateSuite)} className="space-y-4 pt-4">
              <FormField
                control={newSuiteForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="API Authentication Tests" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newSuiteForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tests for user authentication and authorization flows" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newSuiteForm.control}
                name="projectArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Area</FormLabel>
                    <FormControl>
                      <Input placeholder="Authentication" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={newSuiteForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={newSuiteForm.control}
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
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="deprecated">Deprecated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createTestSuiteMutation.isPending}
                >
                  {createTestSuiteMutation.isPending ? "Creating..." : "Create Test Suite"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}