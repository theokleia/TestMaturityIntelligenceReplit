import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Bot,
  Trash2,
  Eye,
  X,
  ClipboardList,
  Check,
  CheckCircle,
  Pencil
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  useTestSuites, 
  useCreateTestSuite, 
  useUpdateTestSuite,
  useDeleteTestSuite,
  useTestCases, 
  useCreateTestCase,
  useUpdateTestCase,
  useDeleteTestCase,
  useGenerateTestCases,
  TestSuite,
  TestCase
} from "@/hooks/test-management";
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
  const [selectedSuiteTestCaseCount, setSelectedSuiteTestCaseCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
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
  
  // AI Test Suite Generation state
  const [aiSuiteGenerateDialogOpen, setAiSuiteGenerateDialogOpen] = useState(false);
  const [aiSuiteProposalsOpen, setAiSuiteProposalsOpen] = useState(false);
  const [organizationType, setOrganizationType] = useState<string>("");
  const [proposedSuites, setProposedSuites] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // AI Test Coverage state
  const [aiCoverageDialogOpen, setAiCoverageDialogOpen] = useState(false);
  const [proposedTestCases, setProposedTestCases] = useState<any[]>([]);
  const [coverageAnalysis, setCoverageAnalysis] = useState<any>(null);
  const [isGeneratingCoverage, setIsGeneratingCoverage] = useState(false);
  
  // Debug selected project
  console.log("TestManagement - selectedProject:", selectedProject);
  console.log("TestManagement - projectId:", projectId);
  
  // Fetch test suites
  const { testSuites: testSuitesData, isLoading: isLoadingTestSuites } = useTestSuites({
    projectId
  });
  
  // Log what we receive from the hook
  console.log("TestManagement - testSuitesData:", testSuitesData);
  
  // Fetch test cases for the selected suite
  const { testCases, isLoading: isLoadingTestCases } = useTestCases({
    suiteId: selectedSuite?.id,
    projectId
  });
  
  // Get test suite operations from hook
  const { 
    createSuite, 
    updateSuite, 
    deleteSuite
  } = useTestSuites({
    projectId
  });
  
  // Create test case operations from hook
  const { 
    createTestCase, 
    updateTestCase, 
    deleteTestCase,
    generateTestCases
  } = useTestCases({
    suiteId: selectedSuite?.id,
    projectId
  });
  
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
  
  // Filter test suites based on search term
  const filteredTestSuites = testSuitesData?.filter((suite) => 
    suite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suite.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suite.projectArea.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle creating a new test suite
  function onCreateSuite(data: z.infer<typeof createTestSuiteSchema>) {
    createSuite({
      ...data,
      projectId
    });
    
    // Handle success actions
    toast({
      title: "Success",
      description: "Test suite created successfully",
    });
    setNewSuiteDialogOpen(false);
    newSuiteForm.reset();
    
    // We'll need to fetch the latest test suites to get the new one
    setTimeout(() => {
      const latestSuites = testSuitesData.filter(suite => suite.projectId === projectId);
      if (latestSuites.length > 0) {
        // Select the latest suite (assuming it's our newly created one)
        const newSuite = latestSuites.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        setSelectedSuite(newSuite);
      }
    }, 500); // Small delay to allow the server to process and the query to refetch
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
    
    // Call the create test case function
    createTestCase(testCaseData);
    
    // Handle success
    toast({
      title: "Success",
      description: "Test case created successfully",
    });
    setNewCaseDialogOpen(false);
    newCaseForm.reset();
    if (selectedSuite) {
      newCaseForm.setValue("suiteId", selectedSuite.id);
    }
  }
  
  // Handle generating AI test cases
  function onGenerateAiTestCases(data: z.infer<typeof generateTestCasesSchema>) {
    // Ensure complexity is properly typed
    generateTestCases({
      ...data,
      complexity: data.complexity as "high" | "medium" | "low"
    });
    
    // Handle success actions
    toast({
      title: "Success",
      description: "Generated test cases successfully",
    });
    setAiGenerateDialogOpen(false);
    generateAiCasesForm.reset();
    if (selectedSuite) {
      generateAiCasesForm.setValue("testSuiteId", selectedSuite.id);
    }
  }
  
  // Handle updating a test case
  function onUpdateTestCase(data: z.infer<typeof createTestCaseSchema>) {
    if (!selectedTestCase) return;
    
    // Add steps array based on test case format
    const testCaseData = {
      ...data,
      // Use structured steps if the format is structured, otherwise use a default step
      steps: selectedProject?.testCaseFormat === "structured" 
        ? data.steps || []
        : [{ step: "Initialize test", expected: "Test is ready to run" }],
    };
    
    updateTestCase({
      id: selectedTestCase.id, 
      data: testCaseData
    });
    
    // Handle success
    toast({
      title: "Success",
      description: "Test case updated successfully",
    });
    setEditCaseDialogOpen(false);
    setSelectedTestCase(null);
  }
  
  // Handle deleting a test case
  function onDeleteTestCase() {
    if (!selectedTestCase) return;
    
    deleteTestCase(selectedTestCase.id);
    
    // Handle success
    toast({
      title: "Success",
      description: "Test case deleted successfully",
    });
    setDeleteConfirmOpen(false);
    setSelectedTestCase(null);
  }
  
  // Handle updating a test suite
  function onUpdateTestSuite(data: z.infer<typeof createTestSuiteSchema>) {
    if (!selectedSuite) return;
    
    updateSuite({
      id: selectedSuite.id,
      data: {
        ...data,
        projectId
      }
    });
    
    // Handle success
    toast({
      title: "Success",
      description: "Test suite updated successfully",
    });
    setEditSuiteDialogOpen(false);
    
    // We'll refresh the test suite data and select the updated suite
    setTimeout(() => {
      const updatedSuites = testSuitesData.filter(suite => suite.id === selectedSuite.id);
      if (updatedSuites.length > 0) {
        setSelectedSuite(updatedSuites[0]);
      }
    }, 500);
  }
  
  // Handle deleting a test suite
  async function onDeleteTestSuite() {
    if (!selectedSuite) return;
    
    try {
      const response = await fetch(`/api/test-suites/${selectedSuite.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Show success message with deletion details
        toast({
          title: "Success",
          description: `Test suite deleted successfully. ${result.deletedTestCases} test cases were also deleted.`,
        });
        
        // Refresh the page to show updated list
        window.location.reload();
        
        setDeleteSuiteConfirmOpen(false);
        setSelectedSuite(null);
        setSelectedSuiteTestCaseCount(0);
      } else {
        throw new Error('Failed to delete test suite');
      }
    } catch (error) {
      console.error('Error deleting test suite:', error);
      toast({
        title: "Error",
        description: "Failed to delete test suite",
        variant: "destructive",
      });
    }
  }

  // Handle AI test suite generation
  async function handleGenerateAiSuites() {
    if (!selectedProject || !organizationType) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-test-suites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          organizationType
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setProposedSuites(data.proposedSuites);
        setAiSuiteGenerateDialogOpen(false);
        setAiSuiteProposalsOpen(true);
        
        toast({
          title: "AI Analysis Complete",
          description: `Generated ${data.proposedSuites.length} test suite proposals`,
        });
      } else {
        toast({
          title: "Generation Failed",
          description: data.message || "Failed to generate test suites",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error generating AI test suites:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate test suites",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }

  // Handle accepting proposed test suites
  async function handleAcceptProposedSuites() {
    if (!selectedProject || proposedSuites.length === 0) return;
    
    try {
      const promises = proposedSuites.map(async (suite) => {
        const response = await fetch('/api/test-suites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: suite.name,
            description: suite.description,
            projectArea: suite.projectArea,
            priority: suite.priority,
            type: suite.type,
            status: 'active',
            aiGenerated: true,
            projectId: selectedProject.id
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create suite: ${suite.name}`);
        }
        
        return response.json();
      });
      
      await Promise.all(promises);
      
      toast({
        title: "Success",
        description: `Created ${proposedSuites.length} test suites successfully`,
      });
      
      setAiSuiteProposalsOpen(false);
      setProposedSuites([]);
      setOrganizationType("");
      
      // Refresh test suites data
      window.location.reload();
    } catch (error) {
      console.error("Error creating test suites:", error);
      toast({
        title: "Creation Failed",
        description: "Failed to create some test suites",
        variant: "destructive"
      });
    }
  }

  // Handle declining proposed test suites
  function handleDeclineProposedSuites() {
    setAiSuiteProposalsOpen(false);
    setProposedSuites([]);
    setOrganizationType("");
    
    toast({
      title: "Proposals Declined",
      description: "Test suite proposals have been discarded",
    });
  }

  // Handle AI test coverage generation
  async function handleGenerateTestCoverage() {
    if (!selectedProject || !selectedSuite) {
      toast({
        title: "Error",
        description: "Please select a test suite",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingCoverage(true);
    
    try {
      const response = await fetch(`/api/test-suites/${selectedSuite.id}/generate-coverage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProposedTestCases(data.proposedTestCases || []);
        setCoverageAnalysis(data.analysis || null);
        setAiCoverageDialogOpen(false);
        
        // Show different messages based on whether new test cases were proposed
        if (data.proposedTestCases?.length > 0) {
          toast({
            title: "Coverage Analysis Complete",
            description: `Found ${data.proposedTestCases.length} recommended test cases to improve coverage`,
          });
        } else {
          toast({
            title: "Coverage Analysis Complete", 
            description: data.analysis?.recommendation || "Coverage analysis completed - review recommendations",
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate test coverage");
      }
    } catch (error) {
      console.error("Error generating AI test coverage:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate test coverage",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCoverage(false);
    }
  }

  // Handle accepting proposed test cases
  async function handleAcceptTestCases() {
    if (!selectedSuite || !proposedTestCases.length) {
      return;
    }

    try {
      const response = await fetch(`/api/test-suites/${selectedSuite.id}/accept-coverage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedTestCases,
          projectId: selectedProject?.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: "Success",
          description: `Created ${data.count} test cases from AI coverage analysis`,
        });
        
        // Reset state and refresh
        setProposedTestCases([]);
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create test cases");
      }
    } catch (error) {
      console.error("Error accepting test coverage:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test cases",
        variant: "destructive",
      });
    }
  }

  // Handle declining proposed test cases
  function handleDeclineTestCases() {
    setProposedTestCases([]);
    setCoverageAnalysis(null);
    
    toast({
      title: "Proposals Declined",
      description: "Test case proposals have been discarded",
    });
  }
  
  // Reset edit form when selected test case changes
  useEffect(() => {
    if (selectedTestCase) {
      editCaseForm.reset({
        title: selectedTestCase.title,
        description: selectedTestCase.description,
        preconditions: selectedTestCase.preconditions || '', // Convert null to empty string
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
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                className="flex items-center space-x-2" 
                onClick={() => setAiSuiteGenerateDialogOpen(true)}
              >
                <Brain className="w-4 h-4" />
                <span>AI Test Suites</span>
              </Button>
              <Button className="flex items-center space-x-2" onClick={() => setNewSuiteDialogOpen(true)}>
                <FolderPlus className="w-4 h-4" />
                <span>New Test Suite</span>
              </Button>
            </div>
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
                                <div className="flex items-center gap-1">
                                  <StatusBadge status={suite.status} variant="test" />
                                  {selectedSuite?.id === suite.id && (
                                    <div className="flex items-center ml-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditSuiteDialogOpen(true);
                                        }}
                                        title="Edit test suite"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-destructive hover:text-destructive"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          // Fetch test case count before showing dialog
                                          try {
                                            const response = await fetch(`/api/test-suites/${suite.id}/test-cases/count`);
                                            if (response.ok) {
                                              const data = await response.json();
                                              setSelectedSuiteTestCaseCount(data.count);
                                            } else {
                                              setSelectedSuiteTestCaseCount(0);
                                            }
                                          } catch (error) {
                                            console.error('Error fetching test case count:', error);
                                            setSelectedSuiteTestCaseCount(0);
                                          }
                                          setDeleteSuiteConfirmOpen(true);
                                        }}
                                        title="Delete test suite"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
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
                          onClick={handleGenerateTestCoverage}
                          disabled={isGeneratingCoverage}
                          className="flex items-center gap-1"
                        >
                          <Brain className="h-3.5 w-3.5" />
                          <span>{isGeneratingCoverage ? "Analyzing..." : "AI Test Coverage"}</span>
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
                            <TableHead className="w-[80px]">Auto</TableHead>
                            <TableHead>Jira</TableHead>
                            <TableHead>Source</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {testCases.map((testCase) => (
                            <TableRow 
                              key={testCase.id}
                              className="cursor-pointer hover:bg-primary/5"
                              onClick={() => {
                                setSelectedTestCase(testCase);
                                setTestCaseDetailOpen(true);
                              }}
                            >
                              <TableCell className="font-medium">{testCase.title}</TableCell>
                              <TableCell>
                                <StatusBadge status={testCase.status} variant="test" />
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={testCase.priority} variant="priority" />
                              </TableCell>
                              <TableCell className="text-center">
                                <IconWrapper 
                                  color={testCase.automatable ? "green" : "muted"} 
                                  size="xs"
                                >
                                  {testCase.automatable ? (
                                    <Bot className="h-4 w-4" />
                                  ) : (
                                    <FileText className="h-4 w-4" />
                                  )}
                                </IconWrapper>
                              </TableCell>
                              <TableCell>
                                {testCase.jiraTicketIds && testCase.jiraTicketIds.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {testCase.jiraTicketIds.slice(0, 2).map((ticketId: string) => (
                                      <Badge key={ticketId} variant="outline" className="text-xs">
                                        {ticketId}
                                      </Badge>
                                    ))}
                                    {testCase.jiraTicketIds.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{testCase.jiraTicketIds.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-text-muted text-xs">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {testCase.aiGenerated ? (
                                    <IconWrapper color="blue" size="xs">
                                      <Bot className="h-3 w-3" />
                                    </IconWrapper>
                                  ) : (
                                    <IconWrapper color="primary" size="xs">
                                      <FileText className="h-3 w-3" />
                                    </IconWrapper>
                                  )}
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-7 w-7 ml-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTestCase(testCase);
                                      setTestCaseDetailOpen(true);
                                    }}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
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
                            onClick={handleGenerateTestCoverage}
                            disabled={isGeneratingCoverage}
                            className="flex items-center gap-2"
                          >
                            <Brain className="h-4 w-4" />
                            <span>{isGeneratingCoverage ? "Analyzing..." : "AI Test Coverage"}</span>
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
                >
                  Create Test Suite
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Test Case Dialog */}
      <Dialog open={newCaseDialogOpen} onOpenChange={setNewCaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Test Case</DialogTitle>
            <DialogDescription>
              Add a new test case to your test suite
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
                      <Input placeholder="User can log in with valid credentials" {...field} />
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
                        placeholder="Verify that users can successfully log in with valid credentials" 
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
                        placeholder="1. User account exists in the system\n2. User is on the login page" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Steps field shown only for structured test case format */}
              {selectedProject?.testCaseFormat === "structured" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Test Steps</FormLabel>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const currentSteps = newCaseForm.getValues("steps") || [];
                        newCaseForm.setValue("steps", [
                          ...currentSteps,
                          { step: "", expected: "" }
                        ]);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Step</span>
                    </Button>
                  </div>
                  
                  {newCaseForm.watch("steps")?.map((_, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-1 flex items-center justify-center mt-2">
                        <Badge variant="outline">{index + 1}</Badge>
                      </div>
                      <div className="col-span-5">
                        <FormField
                          control={newCaseForm.control}
                          name={`steps.${index}.step`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter test step action" 
                                  className="min-h-[80px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-5">
                        <FormField
                          control={newCaseForm.control}
                          name={`steps.${index}.expected`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter expected result" 
                                  className="min-h-[80px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center mt-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            const currentSteps = newCaseForm.getValues("steps") || [];
                            if (currentSteps.length > 1) {
                              newCaseForm.setValue(
                                "steps",
                                currentSteps.filter((_, i) => i !== index)
                              );
                            }
                          }}
                          disabled={newCaseForm.watch("steps")?.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <FormField
                control={newCaseForm.control}
                name="expectedResults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Results</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="1. User is authenticated\n2. User is redirected to the dashboard\n3. Welcome message is displayed" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={newCaseForm.control}
                  name="automatable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Automatable
                        </FormLabel>
                        <FormDescription>
                          Can this test be automated?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit"
                >
                  Create Test Case
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Generate AI Test Cases Dialog */}
      <Dialog open={aiGenerateDialogOpen} onOpenChange={setAiGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Test Cases with AI</DialogTitle>
            <DialogDescription>
              Provide feature details to automatically generate test cases
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
                      <Input placeholder="User Authentication" {...field} />
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
                        placeholder="1. Users must be able to log in with email/password\n2. System should validate input\n3. Failed attempts should be logged" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="complex">Complex</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="flex items-center gap-2"
                >
                  <Bot className="h-4 w-4" />
                  <span>Generate Test Cases</span>
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Test Case Detail Dialog */}
      <Dialog open={testCaseDetailOpen} onOpenChange={setTestCaseDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Test Case: {selectedTestCase?.title}</span>
              {selectedTestCase?.aiGenerated && (
                <IconWrapper color="blue" size="sm">
                  <Bot className="h-4 w-4" />
                </IconWrapper>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedSuite?.name} • Created: {new Date(selectedTestCase?.createdAt || '').toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-6">
            {/* Status Information */}
            <div className="flex flex-wrap gap-2 md:gap-4">
              <div className="bg-atmf-main p-2 rounded-md border border-white/5 flex items-center gap-2">
                <span className="text-sm text-atmf-muted">Status:</span>
                <StatusBadge status={selectedTestCase?.status || "draft"} variant="test" />
              </div>
              
              <div className="bg-atmf-main p-2 rounded-md border border-white/5 flex items-center gap-2">
                <span className="text-sm text-atmf-muted">Priority:</span>
                <StatusBadge status={selectedTestCase?.priority || "medium"} variant="priority" />
              </div>
              
              <div className="bg-atmf-main p-2 rounded-md border border-white/5 flex items-center gap-2">
                <span className="text-sm text-atmf-muted">Severity:</span>
                <StatusBadge status={selectedTestCase?.severity || "normal"} variant="severity" />
              </div>
              
              <div className="bg-atmf-main p-2 rounded-md border border-white/5 flex items-center gap-2">
                <span className="text-sm text-atmf-muted">Automation:</span>
                <StatusBadge status={selectedTestCase?.automationStatus || "not-automated"} variant="automation" />
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-atmf-muted flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </h3>
              <div className="bg-atmf-main p-3 rounded-md border border-white/5">
                <p>{selectedTestCase?.description}</p>
              </div>
            </div>
            
            {/* Preconditions */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-atmf-muted flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Preconditions
              </h3>
              <div className="bg-atmf-main p-3 rounded-md border border-white/5">
                <p>{selectedTestCase?.preconditions}</p>
              </div>
            </div>
            
            {/* Test Steps - Only for structured format */}
            {selectedProject?.testCaseFormat === "structured" && selectedTestCase?.steps && selectedTestCase?.steps.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-atmf-muted flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Test Steps
                </h3>
                <div className="rounded-md border border-white/5 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-atmf-main border-b border-white/5">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium w-16">#</th>
                        <th className="px-4 py-2 text-left font-medium">Action</th>
                        <th className="px-4 py-2 text-left font-medium">Expected Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedTestCase?.steps.map((step, index) => (
                        <tr key={index} className="bg-atmf-main/50">
                          <td className="px-4 py-3 text-atmf-muted">{index + 1}</td>
                          <td className="px-4 py-3">{step.step}</td>
                          <td className="px-4 py-3">{step.expected}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Expected Results */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-atmf-muted flex items-center gap-2">
                <Check className="h-4 w-4" />
                Expected Results
              </h3>
              <div className="bg-atmf-main p-3 rounded-md border border-white/5">
                <p>{selectedTestCase?.expectedResults}</p>
              </div>
            </div>
            
            {/* Automation Potential */}
            <div className="flex items-center space-x-2 p-3 bg-atmf-main rounded-md border border-white/5">
              <span className="text-sm font-medium">Automatable:</span>
              <span className={selectedTestCase?.automatable ? "text-green-400" : "text-red-400"}>
                {selectedTestCase?.automatable ? "Yes" : "No"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-atmf-main/50">
              <Button 
                variant="outline" 
                onClick={() => {
                  setTestCaseDetailOpen(false);
                  setEditCaseDialogOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit Test Case</span>
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={() => {
                  setTestCaseDetailOpen(false);
                  setDeleteConfirmOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Test Case Dialog */}
      <Dialog open={editCaseDialogOpen} onOpenChange={setEditCaseDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Edit Test Case</span>
              {selectedTestCase?.aiGenerated && (
                <IconWrapper color="blue" size="sm">
                  <Bot className="h-4 w-4" />
                </IconWrapper>
              )}
            </DialogTitle>
            <DialogDescription>
              Update test case details and steps
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editCaseForm}>
            <form onSubmit={editCaseForm.handleSubmit(onUpdateTestCase)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editCaseForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter test case title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editCaseForm.control}
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
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="deprecated">Deprecated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={editCaseForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  control={editCaseForm.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  control={editCaseForm.control}
                  name="automatable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-2 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Automatable
                        </FormLabel>
                        <FormDescription>
                          Can this test be automated?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editCaseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the test case" {...field} className="min-h-24" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editCaseForm.control}
                name="preconditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preconditions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List any preconditions" {...field} className="min-h-20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedProject?.testCaseFormat === "structured" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Test Steps</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentSteps = editCaseForm.getValues("steps") || [];
                        editCaseForm.setValue("steps", [
                          ...currentSteps,
                          { step: "", expected: "" }
                        ]);
                      }}
                      className="h-8 flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Step</span>
                    </Button>
                  </div>
                  
                  {editCaseForm.watch("steps") && editCaseForm.watch("steps")?.map((_, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-5">
                        <FormField
                          control={editCaseForm.control}
                          name={`steps.${index}.step`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="sr-only">Step {index + 1}</FormLabel>
                              <FormControl>
                                <Input placeholder={`Step ${index + 1}`} {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-5">
                        <FormField
                          control={editCaseForm.control}
                          name={`steps.${index}.expected`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="sr-only">Expected Result</FormLabel>
                              <FormControl>
                                <Input placeholder="Expected result" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-2 flex justify-end pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentSteps = editCaseForm.getValues("steps") || [];
                            if (currentSteps.length > 1) {
                              editCaseForm.setValue(
                                "steps",
                                currentSteps.filter((_, i) => i !== index)
                              );
                            }
                          }}
                          disabled={(editCaseForm.watch("steps") || []).length <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <FormField
                control={editCaseForm.control}
                name="expectedResults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Results</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the expected results" {...field} className="min-h-20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setEditCaseDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Delete Test Case
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this test case? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-atmf-main p-3 rounded-md border border-white/5">
              <p className="font-medium">{selectedTestCase?.title}</p>
              <p className="text-sm text-atmf-muted mt-1">{selectedTestCase?.description}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="secondary" 
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDeleteTestCase}
            >
              Delete Test Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Test Suite Dialog */}
      <Dialog open={editSuiteDialogOpen} onOpenChange={setEditSuiteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Test Suite</DialogTitle>
            <DialogDescription>
              Update the details of this test suite
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editSuiteForm}>
            <form onSubmit={editSuiteForm.handleSubmit(onUpdateTestSuite)} className="space-y-4 pt-4">
              <FormField
                control={editSuiteForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Authentication Tests" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editSuiteForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Test cases for user authentication flows"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editSuiteForm.control}
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
                  control={editSuiteForm.control}
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
                  control={editSuiteForm.control}
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
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                          <SelectItem value="deprecated">Deprecated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editSuiteForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="functional">Functional</SelectItem>
                        <SelectItem value="integration">Integration</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="usability">Usability</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setEditSuiteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Test Suite Confirmation */}
      <AlertDialog open={deleteSuiteConfirmOpen} onOpenChange={setDeleteSuiteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test Suite</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test suite? This action cannot be undone and will permanently delete the test suite and all {selectedSuiteTestCaseCount} related test cases.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedSuite && (
            <div className="py-4">
              <div className="bg-destructive/10 p-4 rounded-md border border-destructive/30">
                <p className="font-medium">{selectedSuite.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedSuite.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{selectedSuite.projectArea}</Badge>
                  <StatusBadge status={selectedSuite.priority} variant="priority" />
                  <StatusBadge status={selectedSuite.status} variant="test" />
                </div>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDeleteTestSuite}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </div>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Test Suite Generation Dialog */}
      <Dialog open={aiSuiteGenerateDialogOpen} onOpenChange={setAiSuiteGenerateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Generate AI Test Suites
            </DialogTitle>
            <DialogDescription>
              Select how you'd like to organize your test suites, and AI will analyze your project to create comprehensive test coverage.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Organization Type</label>
              <Select value={organizationType} onValueChange={setOrganizationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose organization method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="functions">Business Functions</SelectItem>
                  <SelectItem value="components">System Components</SelectItem>
                  <SelectItem value="modules">Technical Modules</SelectItem>
                  <SelectItem value="test-types">Test Types</SelectItem>
                  <SelectItem value="environments">Environments</SelectItem>
                  <SelectItem value="user-personas">User Personas</SelectItem>
                  <SelectItem value="risk-areas">Risk Areas</SelectItem>
                  <SelectItem value="workflows">User Workflows</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {organizationType && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800 font-medium mb-1">AI Analysis will include:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Project details and test strategy</li>
                  <li>• Documentation and knowledge base</li>
                  <li>• Jira tickets and requirements</li>
                  <li>• Industry compliance needs</li>
                </ul>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setAiSuiteGenerateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateAiSuites}
              disabled={!organizationType || isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  <span>Generate Test Suites</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Test Suite Proposals Dialog */}
      <Dialog open={aiSuiteProposalsOpen} onOpenChange={setAiSuiteProposalsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Test Suite Proposals
            </DialogTitle>
            <DialogDescription>
              Review the AI-generated test suites organized by {organizationType}. You can accept all proposals or decline to return to the main view.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid gap-4">
              {proposedSuites.map((suite, index) => (
                <ATMFCard key={index} className="p-4" neonEffect="blue">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{suite.name}</h3>
                        <p className="text-sm text-text-muted mt-1">{suite.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <StatusBadge status={suite.priority} variant="priority" />
                        <Badge variant="outline">{suite.type}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{suite.projectArea}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bot className="h-3 w-3" />
                        <span>AI Generated</span>
                      </div>
                    </div>
                  </div>
                </ATMFCard>
              ))}
            </div>
          </div>
          
          <DialogFooter className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDeclineProposedSuites}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              <span>Decline All</span>
            </Button>
            <Button 
              onClick={handleAcceptProposedSuites}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>Accept All ({proposedSuites.length} suites)</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Test Coverage Proposals Dialog */}
      <Dialog open={proposedTestCases.length > 0 || coverageAnalysis} onOpenChange={() => {
        setProposedTestCases([]);
        setCoverageAnalysis(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Test Coverage Analysis</DialogTitle>
            <DialogDescription>
              Coverage analysis for "{selectedSuite?.name}" based on existing test cases, project context, documentation, and Jira tickets.
            </DialogDescription>
          </DialogHeader>
          
          {/* Coverage Analysis Summary */}
          {coverageAnalysis && (
            <div className="mb-6">
              <ATMFCard neonEffect="green">
                <div className="p-4">
                  <h4 className="font-medium text-lg mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Coverage Analysis Summary
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm text-text-muted mb-1">Existing Coverage</h5>
                      <p className="text-sm">{coverageAnalysis.existingCoverage}</p>
                    </div>
                    
                    {coverageAnalysis.gaps && coverageAnalysis.gaps.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm text-text-muted mb-1">Coverage Gaps Identified</h5>
                        <ul className="text-sm space-y-1">
                          {coverageAnalysis.gaps.map((gap: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-yellow-500 mt-1">•</span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <h5 className="font-medium text-sm text-text-muted mb-1">Recommendation</h5>
                      <p className="text-sm">{coverageAnalysis.recommendation}</p>
                    </div>
                  </div>
                </div>
              </ATMFCard>
            </div>
          )}
          
          {/* Show proposed test cases or no additional coverage needed message */}
          {proposedTestCases.length > 0 ? (
            <div>
              <h4 className="font-medium text-lg mb-3">Proposed Additional Test Cases</h4>
              <div className="space-y-4">
                {proposedTestCases.map((testCase, index) => (
                  <ATMFCard key={index} neonEffect="blue">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{testCase.title}</h4>
                          <p className="text-text-muted mt-1">{testCase.description}</p>
                        </div>
                        <StatusBadge status={testCase.priority} variant="priority" />
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Brain className="h-3 w-3 text-primary" />
                          <span className="text-text-muted">{testCase.reasoning}</span>
                        </div>
                      </div>
                      
                      {testCase.jiraTicketIds && testCase.jiraTicketIds.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {testCase.jiraTicketIds.map((ticketId: string) => (
                            <Badge key={ticketId} variant="outline" className="text-xs">
                              {ticketId}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </ATMFCard>
                ))}
              </div>
              
              <DialogFooter className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDeclineTestCases}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  <span>Decline All</span>
                </Button>
                <Button 
                  onClick={handleAcceptTestCases}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Accept All ({proposedTestCases.length} test cases)</span>
                </Button>
              </DialogFooter>
            </div>
          ) : coverageAnalysis ? (
            <div className="text-center py-8">
              <IconWrapper color="green" size="lg" className="mb-4 mx-auto">
                <CheckCircle className="h-6 w-6" />
              </IconWrapper>
              <h4 className="font-medium text-lg mb-2">Coverage Analysis Complete</h4>
              <p className="text-text-muted">
                {coverageAnalysis.recommendation || "Review the analysis above for detailed coverage insights."}
              </p>
              
              <DialogFooter className="flex justify-center mt-6">
                <Button 
                  onClick={() => {
                    setProposedTestCases([]);
                    setCoverageAnalysis(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Close Analysis</span>
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}