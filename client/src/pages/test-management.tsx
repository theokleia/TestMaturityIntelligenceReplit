import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Separator } from "@/components/ui/separator";
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
  Bot, 
  AlertTriangle,
  ToggleLeft,
  User,
  CheckCircle2
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
  TestSuite
} from "@/hooks/use-test-management";
import type { TestCase } from "@/hooks/use-ai-recommendations";
import { useGenerateTestCases } from "@/hooks/use-ai-recommendations";

// Schema for creating a test suite
const createTestSuiteSchema = z.object({
  name: z.string().min(1, "Test suite name is required"),
  description: z.string().min(1, "Description is required"),
  projectArea: z.string().min(1, "Project area is required"),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
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

// Statuses with colors
const statusColors = {
  draft: "bg-slate-500",
  active: "bg-green-500",
  inactive: "bg-yellow-500",
  deprecated: "bg-red-500",
  completed: "bg-blue-500",
  "in-review": "bg-purple-500",
};

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

const severityColors = {
  critical: "bg-red-700",
  high: "bg-red-500",
  normal: "bg-yellow-500",
  low: "bg-blue-500",
};

const automationStatusColors = {
  automated: "bg-green-500",
  "in-progress": "bg-yellow-500",
  "not-automated": "bg-slate-500",
};

// Test Management page component
export default function TestManagement() {
  const { toast } = useToast();
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialogs state
  const [newSuiteDialogOpen, setNewSuiteDialogOpen] = useState(false);
  const [newCaseDialogOpen, setNewCaseDialogOpen] = useState(false);
  const [aiGenerateDialogOpen, setAiGenerateDialogOpen] = useState(false);
  
  // Fetch test suites
  const { data: testSuites, isLoading: isLoadingTestSuites } = useTestSuites();
  
  // Fetch test cases for the selected suite
  const { data: testCases, isLoading: isLoadingTestCases } = useTestCases({
    suiteId: selectedSuite?.id,
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
    createTestSuiteMutation.mutate(data, {
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
    generateTestCasesMutation.mutate(data, {
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
      <div className="flex flex-col space-y-6 p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Test Management</h1>
            <p className="text-muted-foreground mt-1">Create, organize, and manage test suites and test cases</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={newSuiteDialogOpen} onOpenChange={setNewSuiteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <FolderPlus className="w-4 h-4" />
                  <span>New Test Suite</span>
                </Button>
              </DialogTrigger>
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
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Test Suites Column */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col space-y-4">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Test Suites</span>
                  <Badge variant="outline" className="text-xs font-normal">
                    {filteredTestSuites?.length || 0} suites
                  </Badge>
                </CardTitle>
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search test suites..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-350px)] overflow-y-auto">
                {isLoadingTestSuites ? (
                  <div className="flex justify-center items-center h-24">
                    <p>Loading test suites...</p>
                  </div>
                ) : filteredTestSuites && filteredTestSuites.length > 0 ? (
                  <div className="space-y-2">
                    {filteredTestSuites.map((suite) => (
                      <Card 
                        key={suite.id} 
                        className={`cursor-pointer transition-colors ${selectedSuite?.id === suite.id ? 'bg-primary/10 border-primary/50' : ''}`}
                        onClick={() => setSelectedSuite(suite)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base flex items-center justify-between">
                            <div className="truncate" title={suite.name}>
                              {suite.name}
                            </div>
                            <Badge className={`${statusColors[suite.status as keyof typeof statusColors]} text-white text-xs`}>
                              {suite.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="line-clamp-2" title={suite.description}>
                            {suite.description}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <FileText className="h-3 w-3" />
                            <span>{suite.projectArea}</span>
                          </div>
                          <Badge variant="outline" className={`text-xs border-${priorityColors[suite.priority as keyof typeof priorityColors].replace('bg-', '')} text-${priorityColors[suite.priority as keyof typeof priorityColors].replace('bg-', '')}`}>
                            {suite.priority} priority
                          </Badge>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-center">
                    <p className="text-muted-foreground">No test suites found</p>
                    <Button 
                      variant="link" 
                      onClick={() => setNewSuiteDialogOpen(true)}
                      className="mt-2"
                    >
                      Create your first test suite
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Test Cases Column */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-white/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedSuite ? selectedSuite.name : "Select a Test Suite"}</CardTitle>
                    <CardDescription>
                      {selectedSuite ? selectedSuite.description : "Choose a test suite from the left panel to view and manage its test cases"}
                    </CardDescription>
                  </div>
                  {selectedSuite && (
                    <div className="flex space-x-2">
                      <Dialog open={aiGenerateDialogOpen} onOpenChange={setAiGenerateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="flex items-center space-x-1" variant="secondary">
                            <Brain className="w-4 h-4" />
                            <span>AI Generate</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Generate Test Cases with AI</DialogTitle>
                            <DialogDescription>
                              Describe your feature and requirements to automatically generate test cases
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Form {...generateAiCasesForm}>
                            <form onSubmit={generateAiCasesForm.handleSubmit(onGenerateAiTestCases)} className="space-y-4 pt-4">
                              <FormField
                                control={generateAiCasesForm.control}
                                name="feature"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Feature Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="User Registration" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={generateAiCasesForm.control}
                                name="requirements"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Requirements</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Users should be able to register with email and password. Password must be at least 8 characters and contain a number. Email verification should be sent." 
                                        {...field} 
                                        rows={4}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Detailed requirements help generate better test cases
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={generateAiCasesForm.control}
                                  name="complexity"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Complexity</FormLabel>
                                      <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select complexity" />
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
                                  control={generateAiCasesForm.control}
                                  name="testSuiteId"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Test Suite</FormLabel>
                                      <FormControl>
                                        <Input type="hidden" {...field} />
                                      </FormControl>
                                      <div className="border rounded-md p-2 h-10 flex items-center text-sm">
                                        {selectedSuite?.name || "No suite selected"}
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <DialogFooter>
                                <Button 
                                  type="submit" 
                                  disabled={generateTestCasesMutation.isPending || !selectedSuite}
                                >
                                  {generateTestCasesMutation.isPending ? "Generating..." : "Generate Test Cases"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={newCaseDialogOpen} onOpenChange={setNewCaseDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="flex items-center space-x-1">
                            <Plus className="w-4 h-4" />
                            <span>Add Test Case</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Test Case</DialogTitle>
                            <DialogDescription>
                              Add a new test case to the selected test suite
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Form {...newCaseForm}>
                            <form onSubmit={newCaseForm.handleSubmit(onCreateTestCase)} className="space-y-4 pt-4">
                              <FormField
                                control={newCaseForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Verify user login with valid credentials" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={newCaseForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Test case to validate that users can successfully login with correct username and password" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={newCaseForm.control}
                                name="preconditions"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Preconditions</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="1. User account exists in the system\n2. User is not already logged in" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={newCaseForm.control}
                                name="expectedResults"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Expected Results</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="User is successfully logged in and redirected to the dashboard" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-3 gap-4">
                                <FormField
                                  control={newCaseForm.control}
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
                                  control={newCaseForm.control}
                                  name="severity"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Severity</FormLabel>
                                      <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select severity" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="critical">Critical</SelectItem>
                                          <SelectItem value="high">High</SelectItem>
                                          <SelectItem value="normal">Normal</SelectItem>
                                          <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={newCaseForm.control}
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
                                          <SelectItem value="completed">Completed</SelectItem>
                                          <SelectItem value="in-review">In Review</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <FormField
                                control={newCaseForm.control}
                                name="automatable"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between space-y-0 space-x-2 rounded-md border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel>Automatable</FormLabel>
                                      <FormDescription>
                                        Can this test case be automated?
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <div className="flex items-center space-x-2">
                                        <div 
                                          className={`cursor-pointer px-3 py-1 rounded-md ${field.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                          onClick={() => newCaseForm.setValue("automatable", true)}
                                        >
                                          Yes
                                        </div>
                                        <div 
                                          className={`cursor-pointer px-3 py-1 rounded-md ${!field.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                          onClick={() => newCaseForm.setValue("automatable", false)}
                                        >
                                          No
                                        </div>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={newCaseForm.control}
                                name="suiteId"
                                render={({ field }) => (
                                  <FormItem className="hidden">
                                    <FormLabel>Test Suite</FormLabel>
                                    <FormControl>
                                      <Input type="hidden" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <DialogFooter>
                                <Button 
                                  type="submit" 
                                  disabled={createTestCaseMutation.isPending || !selectedSuite}
                                >
                                  {createTestCaseMutation.isPending ? "Creating..." : "Create Test Case"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedSuite ? (
                  <Tabs defaultValue="all" className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="manual">Manual</TabsTrigger>
                        <TabsTrigger value="automated">Automated</TabsTrigger>
                        <TabsTrigger value="ai-generated">AI Generated</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="all" className="m-0">
                      {isLoadingTestCases ? (
                        <div className="flex justify-center items-center h-24">
                          <p>Loading test cases...</p>
                        </div>
                      ) : testCases && testCases.length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Automation</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="w-[100px]">Type</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {testCases.map((testCase) => (
                                <TableRow key={testCase.id}>
                                  <TableCell className="font-medium">{testCase.title}</TableCell>
                                  <TableCell>
                                    <Badge className={`${priorityColors[testCase.priority as keyof typeof priorityColors]} text-white`}>
                                      {testCase.priority}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`${severityColors[testCase.severity as keyof typeof severityColors]} text-white`}>
                                      {testCase.severity}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`${statusColors[testCase.status as keyof typeof statusColors]} text-white`}>
                                      {testCase.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {testCase.automatable ? (
                                      <Badge className={`${automationStatusColors[testCase.automationStatus as keyof typeof automationStatusColors]} text-white`}>
                                        {testCase.automationStatus}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline">Not automatable</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {new Date(testCase.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    {testCase.aiGenerated ? (
                                      <Badge variant="outline" className="flex items-center space-x-1">
                                        <Brain className="w-3 h-3" />
                                        <span>AI</span>
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="flex items-center space-x-1">
                                        <User className="w-3 h-3" />
                                        <span>Manual</span>
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-24 text-center">
                          <p className="text-muted-foreground">No test cases found for this test suite</p>
                          <div className="flex space-x-4 mt-4">
                            <Button 
                              variant="outline"
                              onClick={() => setNewCaseDialogOpen(true)}
                              className="flex items-center space-x-1"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add manually</span>
                            </Button>
                            <Button 
                              variant="default"
                              onClick={() => setAiGenerateDialogOpen(true)}
                              className="flex items-center space-x-1"
                            >
                              <Brain className="w-4 h-4" />
                              <span>Generate with AI</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="manual" className="m-0">
                      {isLoadingTestCases ? (
                        <div className="flex justify-center items-center h-24">
                          <p>Loading test cases...</p>
                        </div>
                      ) : testCases && testCases.filter(tc => !tc.aiGenerated).length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Automation</TableHead>
                                <TableHead>Created</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {testCases.filter(tc => !tc.aiGenerated).map((testCase) => (
                                <TableRow key={testCase.id}>
                                  <TableCell className="font-medium">{testCase.title}</TableCell>
                                  <TableCell>
                                    <Badge className={`${priorityColors[testCase.priority as keyof typeof priorityColors]} text-white`}>
                                      {testCase.priority}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`${severityColors[testCase.severity as keyof typeof severityColors]} text-white`}>
                                      {testCase.severity}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`${statusColors[testCase.status as keyof typeof statusColors]} text-white`}>
                                      {testCase.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {testCase.automatable ? (
                                      <Badge className={`${automationStatusColors[testCase.automationStatus as keyof typeof automationStatusColors]} text-white`}>
                                        {testCase.automationStatus}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline">Not automatable</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {new Date(testCase.createdAt).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-24 text-center">
                          <p className="text-muted-foreground">No manual test cases found</p>
                          <Button 
                            variant="outline"
                            onClick={() => setNewCaseDialogOpen(true)}
                            className="mt-4 flex items-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add manually</span>
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="automated" className="m-0">
                      {isLoadingTestCases ? (
                        <div className="flex justify-center items-center h-24">
                          <p>Loading test cases...</p>
                        </div>
                      ) : testCases && testCases.filter(tc => tc.automatable && tc.automationStatus === 'automated').length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Created</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {testCases.filter(tc => tc.automatable && tc.automationStatus === 'automated').map((testCase) => (
                                <TableRow key={testCase.id}>
                                  <TableCell className="font-medium">{testCase.title}</TableCell>
                                  <TableCell>
                                    <Badge className={`${priorityColors[testCase.priority as keyof typeof priorityColors]} text-white`}>
                                      {testCase.priority}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`${severityColors[testCase.severity as keyof typeof severityColors]} text-white`}>
                                      {testCase.severity}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`${statusColors[testCase.status as keyof typeof statusColors]} text-white`}>
                                      {testCase.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {testCase.aiGenerated ? (
                                      <Badge variant="outline" className="flex items-center space-x-1">
                                        <Brain className="w-3 h-3" />
                                        <span>AI</span>
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="flex items-center space-x-1">
                                        <User className="w-3 h-3" />
                                        <span>Manual</span>
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {new Date(testCase.createdAt).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-24 text-center">
                          <p className="text-muted-foreground">No automated test cases found</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="ai-generated" className="m-0">
                      {isLoadingTestCases ? (
                        <div className="flex justify-center items-center h-24">
                          <p>Loading test cases...</p>
                        </div>
                      ) : testCases && testCases.filter(tc => tc.aiGenerated).length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Automation</TableHead>
                                <TableHead>Created</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {testCases.filter(tc => tc.aiGenerated).map((testCase) => (
                                <TableRow key={testCase.id}>
                                  <TableCell className="font-medium">{testCase.title}</TableCell>
                                  <TableCell>
                                    <Badge className={`${priorityColors[testCase.priority as keyof typeof priorityColors]} text-white`}>
                                      {testCase.priority}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`${severityColors[testCase.severity as keyof typeof severityColors]} text-white`}>
                                      {testCase.severity}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`${statusColors[testCase.status as keyof typeof statusColors]} text-white`}>
                                      {testCase.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {testCase.automatable ? (
                                      <Badge className={`${automationStatusColors[testCase.automationStatus as keyof typeof automationStatusColors]} text-white`}>
                                        {testCase.automationStatus}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline">Not automatable</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {new Date(testCase.createdAt).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-24 text-center">
                          <p className="text-muted-foreground">No AI-generated test cases found</p>
                          <Button 
                            variant="outline"
                            onClick={() => setAiGenerateDialogOpen(true)}
                            className="mt-4 flex items-center space-x-1"
                          >
                            <Brain className="w-4 h-4" />
                            <span>Generate with AI</span>
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="p-6 bg-muted rounded-full mb-4">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No Test Suite Selected</h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                      Select a test suite from the left panel to view and manage its test cases, 
                      or create a new test suite to get started.
                    </p>
                    <Button onClick={() => setNewSuiteDialogOpen(true)}>
                      Create Test Suite
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}