import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageContainer, PageHeader, PageContent } from "@/components/design-system/page-container";
import { useProject } from "@/context/ProjectContext";
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

// Import new modular components
import { TestSuiteHeader } from "@/components/test-management/TestSuiteHeader";
import { TestSuiteGrid } from "@/components/test-management/TestSuiteGrid";
import { AITestCoverageDialog } from "@/components/test-management/AITestCoverageDialog";
import { AITestSuiteDialog } from "@/components/test-management/AITestSuiteDialog";
import { AITestSuiteProposalsDialog } from "@/components/test-management/AITestSuiteProposalsDialog";
import { TestCaseTable } from "@/components/test-management/TestCaseTable";

// Import existing form components and dialogs
import { CreateTestSuiteDialog } from "@/components/test-management/CreateTestSuiteDialog";
import { CreateTestCaseDialog } from "@/components/test-management/CreateTestCaseDialog";
import { TestCaseDetailsDialog } from "@/components/test-management/TestCaseDetailsDialog";

// AI Loading components
import { AILoadingAnimation } from "@/components/ui/loading-animations";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Import API helpers
import { apiRequest } from "@/lib/queryClient";

export default function TestManagement() {
  const { selectedProject } = useProject();
  const { toast } = useToast();

  // State for filters and UI
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  
  // Dialog states
  const [createSuiteDialogOpen, setCreateSuiteDialogOpen] = useState(false);
  const [createTestCaseDialogOpen, setCreateTestCaseDialogOpen] = useState(false);
  const [testCaseDetailsDialogOpen, setTestCaseDetailsDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  
  // AI Dialog states
  const [aiSuiteGenerateDialogOpen, setAiSuiteGenerateDialogOpen] = useState(false);
  const [aiSuiteProposalsOpen, setAiSuiteProposalsOpen] = useState(false);
  const [aiCoverageDialogOpen, setAiCoverageDialogOpen] = useState(false);
  
  // AI states
  const [organizationType, setOrganizationType] = useState("");
  const [proposedSuites, setProposedSuites] = useState<any[]>([]);
  const [proposedTestCases, setProposedTestCases] = useState<any[]>([]);
  const [coverageAnalysis, setCoverageAnalysis] = useState<any>(null);
  
  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCoverage, setIsGeneratingCoverage] = useState(false);
  const [testCaseGenerationLoading, setTestCaseGenerationLoading] = useState(false);
  
  // Loading animation stages
  const [suiteGenerationStage, setSuiteGenerationStage] = useState(0);
  const [coverageLoadingStage, setCoverageLoadingStage] = useState(0);
  const [aiGenerationStage, setAiGenerationStage] = useState(0);

  // Project context
  const projectId = selectedProject?.id;
  console.log("TestManagement - selectedProject:", selectedProject);
  console.log("TestManagement - projectId:", projectId);

  // Fetch data
  const { data: testSuitesData = [], isLoading: suitesLoading, refetch: refetchSuites } = useTestSuites({ 
    projectId: projectId ? parseInt(String(projectId)) : undefined 
  });
  console.log("TestManagement - testSuitesData:", testSuitesData);

  const { data: testCasesData = [], isLoading: casesLoading, refetch: refetchCases } = useTestCases({ 
    suiteId: selectedSuite?.id,
    projectId: projectId ? parseInt(String(projectId)) : undefined
  });

  // Mutations
  const createSuiteMutation = useCreateTestSuite();
  const updateSuiteMutation = useUpdateTestSuite();
  const deleteSuiteMutation = useDeleteTestSuite();
  const createCaseMutation = useCreateTestCase();
  const updateCaseMutation = useUpdateTestCase();
  const deleteCaseMutation = useDeleteTestCase();
  const generateTestCasesMutation = useGenerateTestCases();

  // Filter test suites
  const filteredTestSuites = testSuitesData.filter((suite) => {
    const matchesSearch = suite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suite.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || suite.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper function to get test cases count for a suite
  const getTestCasesCount = (suiteId: number) => {
    // This would need to be implemented with a proper API call
    // For now, return 0 as placeholder
    return 0;
  };

  // Handler functions
  const handleCreateSuite = () => {
    setCreateSuiteDialogOpen(true);
  };

  const handleAIGenerate = () => {
    setAiSuiteGenerateDialogOpen(true);
  };

  const handleViewSuite = (suite: TestSuite) => {
    setSelectedSuite(suite);
  };

  const handleDeleteSuite = async (suite: TestSuite) => {
    if (window.confirm(`Are you sure you want to delete "${suite.name}"?`)) {
      try {
        await deleteSuiteMutation.mutateAsync(suite.id);
        toast({
          title: "Success",
          description: "Test suite deleted successfully",
        });
        refetchSuites();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete test suite",
          variant: "destructive",
        });
      }
    }
  };

  const handleGenerateTestCases = (suite: TestSuite) => {
    setSelectedSuite(suite);
    setCreateTestCaseDialogOpen(true);
  };

  const handleGenerateCoverage = async (suite: TestSuite) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Please select a project first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingCoverage(true);
    setCoverageLoadingStage(0);

    const stages = [
      "Analyzing project context...",
      "Reviewing documentation...",
      "Scanning Jira tickets...",
      "Evaluating existing test cases...",
      "Identifying coverage gaps...",
      "Generating recommendations..."
    ];

    // Simulate progress through stages
    const stageInterval = setInterval(() => {
      setCoverageLoadingStage(prev => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        clearInterval(stageInterval);
        return prev;
      });
    }, 1500);

    try {
      const response = await apiRequest(`/api/test-suites/${suite.id}/generate-coverage`, {
        method: "POST",
        body: JSON.stringify({ projectId }),
      });

      clearInterval(stageInterval);
      setIsGeneratingCoverage(false);

      if (response.proposedTestCases && response.proposedTestCases.length > 0) {
        setProposedTestCases(response.proposedTestCases);
        setCoverageAnalysis(response.analysis);
        setAiCoverageDialogOpen(true);
      } else {
        setCoverageAnalysis(response.analysis);
        setAiCoverageDialogOpen(true);
      }

      toast({
        title: "AI Analysis Complete",
        description: "Test coverage analysis has been generated",
      });
    } catch (error) {
      clearInterval(stageInterval);
      setIsGeneratingCoverage(false);
      console.error("Error generating coverage:", error);
      toast({
        title: "Error",
        description: "Failed to generate test coverage analysis",
        variant: "destructive",
      });
    }
  };

  const handleAcceptTestCases = async () => {
    if (!selectedSuite || !proposedTestCases.length) return;

    try {
      await apiRequest(`/api/test-suites/${selectedSuite.id}/accept-coverage`, {
        method: "POST",
        body: JSON.stringify({ 
          proposedTestCases,
          projectId 
        }),
      });

      setProposedTestCases([]);
      setCoverageAnalysis(null);
      setAiCoverageDialogOpen(false);
      refetchCases();

      toast({
        title: "Success",
        description: `${proposedTestCases.length} test cases created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test cases",
        variant: "destructive",
      });
    }
  };

  const handleDeclineTestCases = () => {
    setProposedTestCases([]);
    setCoverageAnalysis(null);
    setAiCoverageDialogOpen(false);
  };

  const handleExportSuite = (suite: TestSuite) => {
    // Implement export functionality
    toast({
      title: "Export",
      description: "Export functionality will be implemented",
    });
  };

  const handleImportToSuite = (suite: TestSuite) => {
    // Implement import functionality
    toast({
      title: "Import",
      description: "Import functionality will be implemented",
    });
  };

  // AI Test Suite Generation handlers
  const handleGenerateAiSuites = async () => {
    if (!projectId || !organizationType) return;

    setIsGenerating(true);
    setSuiteGenerationStage(0);

    const stages = [
      "Analyzing project requirements...",
      "Reviewing documentation...",
      "Processing Jira tickets...",
      "Evaluating test strategy...",
      "Organizing by " + organizationType + "...",
      "Finalizing test suite proposals..."
    ];

    const stageInterval = setInterval(() => {
      setSuiteGenerationStage(prev => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        clearInterval(stageInterval);
        return prev;
      });
    }, 2000);

    try {
      const response = await apiRequest("/api/ai/generate-test-suites", {
        method: "POST",
        body: JSON.stringify({ 
          projectId, 
          organizationType 
        }),
      });

      clearInterval(stageInterval);
      setIsGenerating(false);
      setAiSuiteGenerateDialogOpen(false);

      if (response.testSuites && response.testSuites.length > 0) {
        setProposedSuites(response.testSuites);
        setAiSuiteProposalsOpen(true);
      }

      toast({
        title: "AI Generation Complete",
        description: `Generated ${response.testSuites?.length || 0} test suite proposals`,
      });
    } catch (error) {
      clearInterval(stageInterval);
      setIsGenerating(false);
      console.error("Error generating test suites:", error);
      toast({
        title: "Error",
        description: "Failed to generate test suites",
        variant: "destructive",
      });
    }
  };

  const handleAcceptProposedSuites = async () => {
    if (!proposedSuites.length || !projectId) return;

    try {
      await apiRequest("/api/test-suites/bulk-create", {
        method: "POST",
        body: JSON.stringify({ 
          testSuites: proposedSuites,
          projectId 
        }),
      });

      setProposedSuites([]);
      setAiSuiteProposalsOpen(false);
      refetchSuites();

      toast({
        title: "Success",
        description: `${proposedSuites.length} test suites created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test suites",
        variant: "destructive",
      });
    }
  };

  const handleDeclineProposedSuites = () => {
    setProposedSuites([]);
    setAiSuiteProposalsOpen(false);
  };

  if (!selectedProject) {
    return (
      <AppLayout>
        <PageContainer>
          <PageHeader 
            title="Test Management" 
            subtitle="Manage test suites, cases, and AI-powered testing workflows"
          />
          <PageContent>
            <div className="text-center py-12">
              <div className="text-text-muted mb-4">Please select a project to manage test cases</div>
            </div>
          </PageContent>
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageContainer>
        <PageHeader 
          title="Test Management" 
          subtitle="Manage test suites, cases, and AI-powered testing workflows"
        />
        <PageContent>
          <div className="space-y-6">
            {/* Test Suites Section */}
            <div className="space-y-4">
              <TestSuiteHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onCreateSuite={handleCreateSuite}
                onAIGenerate={handleAIGenerate}
              />

              {suitesLoading ? (
                <div className="text-center py-8">Loading test suites...</div>
              ) : (
                <TestSuiteGrid
                  testSuites={filteredTestSuites}
                  getTestCasesCount={getTestCasesCount}
                  onViewSuite={handleViewSuite}
                  onDeleteSuite={handleDeleteSuite}
                  onGenerateTestCases={handleGenerateTestCases}
                  onGenerateCoverage={handleGenerateCoverage}
                  onExportSuite={handleExportSuite}
                  onImportToSuite={handleImportToSuite}
                />
              )}
            </div>

            {/* Test Cases Section */}
            {selectedSuite && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Test Cases - {selectedSuite.name}
                  </h2>
                </div>

                <TestCaseTable
                  testCases={testCasesData}
                  isLoading={casesLoading}
                  onViewTestCase={(testCase) => {
                    setSelectedTestCase(testCase);
                    setTestCaseDetailsDialogOpen(true);
                  }}
                  onDeleteTestCase={async (testCase) => {
                    if (window.confirm(`Are you sure you want to delete "${testCase.title}"?`)) {
                      try {
                        await deleteCaseMutation.mutateAsync(testCase.id);
                        toast({
                          title: "Success",
                          description: "Test case deleted successfully",
                        });
                        refetchCases();
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to delete test case",
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
        </PageContent>
      </PageContainer>

      {/* Dialogs */}
      <CreateTestSuiteDialog
        isOpen={createSuiteDialogOpen}
        onOpenChange={setCreateSuiteDialogOpen}
        onSuccess={() => {
          refetchSuites();
          setCreateSuiteDialogOpen(false);
        }}
      />

      <CreateTestCaseDialog
        isOpen={createTestCaseDialogOpen}
        onOpenChange={setCreateTestCaseDialogOpen}
        suiteId={selectedSuite?.id}
        projectId={projectId}
        onSuccess={() => {
          refetchCases();
          setCreateTestCaseDialogOpen(false);
        }}
      />

      <TestCaseDetailsDialog
        isOpen={testCaseDetailsDialogOpen}
        onOpenChange={setTestCaseDetailsDialogOpen}
        testCase={selectedTestCase}
        onUpdate={() => refetchCases()}
      />

      {/* AI Dialogs */}
      <AITestSuiteDialog
        isOpen={aiSuiteGenerateDialogOpen}
        onOpenChange={setAiSuiteGenerateDialogOpen}
        organizationType={organizationType}
        onOrganizationTypeChange={setOrganizationType}
        onGenerate={handleGenerateAiSuites}
        isGenerating={isGenerating}
      />

      <AITestSuiteProposalsDialog
        isOpen={aiSuiteProposalsOpen}
        onOpenChange={setAiSuiteProposalsOpen}
        proposedSuites={proposedSuites}
        organizationType={organizationType}
        onAcceptAll={handleAcceptProposedSuites}
        onDeclineAll={handleDeclineProposedSuites}
      />

      <AITestCoverageDialog
        isOpen={aiCoverageDialogOpen}
        onOpenChange={setAiCoverageDialogOpen}
        proposedTestCases={proposedTestCases}
        coverageAnalysis={coverageAnalysis}
        onAcceptTestCases={handleAcceptTestCases}
        onDeclineTestCases={handleDeclineTestCases}
      />

      {/* AI Loading Dialogs */}
      <Dialog open={isGeneratingCoverage} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg">
          <AILoadingAnimation 
            type="coverage-analysis"
            stage={coverageLoadingStage}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={testCaseGenerationLoading} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg">
          <AILoadingAnimation 
            type="test-generation"
            stage={aiGenerationStage}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isGenerating} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg">
          <AILoadingAnimation 
            type="test-suites"
            stage={suiteGenerationStage}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}