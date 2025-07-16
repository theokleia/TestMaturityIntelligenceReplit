import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, Search, ExternalLink, Clock, CheckCircle, AlertCircle, XCircle, FileText, Brain, Eye } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { TestCaseDetailsDialog } from "@/components/test-management/TestCaseDetailsDialog";
import { useTestCases, useTestSuites } from "@/hooks/test-management";

interface JiraTicket {
  id: number;
  jiraKey: string;
  issueType: string;
  summary: string;
  description: string;
  priority: string;
  status: string;
  assignee: string;
  reporter: string;
  labels: string[];
  components: string[];
  jiraCreatedAt: string;
  jiraUpdatedAt: string;
  lastSyncedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
  isDeleted: boolean;
}

interface JiraSyncLog {
  id: number;
  syncType: string;
  status: string;
  ticketsProcessed: number;
  ticketsCreated: number;
  ticketsUpdated: number;
  ticketsDeleted: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

interface SyncStats {
  total: number;
  synced: number;
  pending: number;
  failed: number;
  lastSync?: string;
}

interface TestCase {
  id: number;
  title: string;
  description: string;
  jiraTicketIds?: string[];
}

interface TestSuite {
  id: number;
  name: string;
  description: string;
}

interface AICoverageOption {
  type: 'existing' | 'new';
  suiteId?: number;
  suiteName: string;
  suiteDescription: string;
  reasoning: string;
}

interface AICoverageProposal {
  testCaseTitle: string;
  testCaseDescription: string;
  options: AICoverageOption[];
}

export default function JiraTickets() {
  const { selectedProject } = useProject();
  const { toast } = useToast();
  
  const [tickets, setTickets] = useState<JiraTicket[]>([]);
  const [syncLogs, setSyncLogs] = useState<JiraSyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  
  // Test case related state
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [testCaseDetailOpen, setTestCaseDetailOpen] = useState(false);
  const [aiCoverageDialogOpen, setAiCoverageDialogOpen] = useState(false);
  const [selectedTicketForCoverage, setSelectedTicketForCoverage] = useState<JiraTicket | null>(null);
  const [coverageProposal, setCoverageProposal] = useState<AICoverageProposal | null>(null);
  const [isGeneratingCoverage, setIsGeneratingCoverage] = useState(false);
  
  // Fetch test cases and suites
  const { testCases = [] } = useTestCases({ projectId: selectedProject?.id });
  const { testSuites = [] } = useTestSuites({ projectId: selectedProject?.id });

  // Calculate sync stats
  const syncStats: SyncStats = {
    total: tickets.length,
    synced: tickets.filter(t => t.syncStatus === 'synced').length,
    pending: tickets.filter(t => t.syncStatus === 'pending').length,
    failed: tickets.filter(t => t.syncStatus === 'error').length,
    lastSync: syncLogs.length > 0 ? syncLogs[0].completedAt || syncLogs[0].startedAt : undefined
  };

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchQuery || 
      ticket.jiraKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && !ticket.isDeleted;
  });

  // Get unique values for filters
  const uniqueStatuses = [...new Set(tickets.map(t => t.status))].filter(Boolean);
  const uniquePriorities = [...new Set(tickets.map(t => t.priority))].filter(Boolean);

  const fetchTickets = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}/jira-tickets`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch Jira tickets",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch Jira tickets",
        variant: "destructive"
      });
    }
  };

  const fetchSyncLogs = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}/jira-sync-logs`);
      if (response.ok) {
        const data = await response.json();
        setSyncLogs(data);
      }
    } catch (error) {
      console.error("Error fetching sync logs:", error);
    }
  };

  const testJiraConnection = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}/jira-test-connection`, {
        method: 'POST'
      });
      const data = await response.json();
      setConnectionStatus(data.connected ? 'connected' : 'error');
      
      if (!data.connected) {
        toast({
          title: "Connection Failed",
          description: data.message || "Unable to connect to Jira",
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error("Error testing connection:", error);
    }
  };

  const handleSync = async (syncType: 'manual' | 'incremental' | 'full' = 'manual') => {
    if (!selectedProject || syncing) return;

    setSyncing(true);
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}/jira-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: syncType })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Sync Completed",
          description: `${data.processed} tickets processed, ${data.created} created, ${data.updated} updated`,
        });
        
        // Refresh data
        await Promise.all([fetchTickets(), fetchSyncLogs()]);
      } else {
        toast({
          title: "Sync Failed",
          description: data.error || data.message || "Failed to sync Jira tickets",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error syncing tickets:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync Jira tickets",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'highest':
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'lowest':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus?.includes('done') || lowerStatus?.includes('resolved') || lowerStatus?.includes('closed')) {
      return 'bg-green-100 text-green-800';
    } else if (lowerStatus?.includes('progress') || lowerStatus?.includes('review')) {
      return 'bg-blue-100 text-blue-800';
    } else if (lowerStatus?.includes('todo') || lowerStatus?.includes('open') || lowerStatus?.includes('new')) {
      return 'bg-gray-100 text-gray-800';
    }
    return 'bg-purple-100 text-purple-800';
  };

  const getIssueTypeColor = (issueType: string) => {
    switch (issueType?.toLowerCase()) {
      case 'bug':
        return 'bg-red-100 text-red-800';
      case 'story':
      case 'user story':
        return 'bg-green-100 text-green-800';
      case 'task':
        return 'bg-blue-100 text-blue-800';
      case 'epic':
        return 'bg-purple-100 text-purple-800';
      case 'sub-task':
      case 'subtask':
        return 'bg-cyan-100 text-cyan-800';
      case 'improvement':
        return 'bg-indigo-100 text-indigo-800';
      case 'new feature':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getSyncStatusIcon = (ticket: JiraTicket) => {
    const isStale = ticket.jiraUpdatedAt > ticket.lastSyncedAt;
    
    if (ticket.syncStatus === 'error') {
      return <XCircle className="h-4 w-4 text-red-500" title="Sync failed" />;
    } else if (ticket.syncStatus === 'pending') {
      return <Clock className="h-4 w-4 text-yellow-500" title="Sync pending" />;
    } else if (isStale) {
      return <RefreshCw className="h-4 w-4 text-orange-500" title="Updates available" />;
    } else {
      return <CheckCircle className="h-4 w-4 text-green-500" title="Synced" />;
    }
  };

  // Helper function to parse Jira description JSON to readable text
  const parseJiraDescription = (description: string): string => {
    if (!description) return '';
    
    try {
      const parsed = JSON.parse(description);
      if (parsed.type === 'doc' && parsed.content) {
        return extractTextFromContent(parsed.content);
      }
    } catch {
      // If it's not JSON, return as is
      return description;
    }
    
    return description;
  };

  const extractTextFromContent = (content: any[]): string => {
    let text = '';
    
    for (const item of content) {
      if (item.type === 'paragraph' && item.content) {
        for (const textItem of item.content) {
          if (textItem.type === 'text') {
            text += textItem.text;
          } else if (textItem.type === 'hardBreak') {
            text += ' ';
          }
        }
        text += ' ';
      }
    }
    
    return text.trim();
  };

  // Get test cases covering a specific Jira ticket
  const getTestCasesForTicket = (jiraKey: string): TestCase[] => {
    return testCases.filter(tc => 
      tc.jiraTicketIds && tc.jiraTicketIds.includes(jiraKey)
    );
  };

  // Check if a Jira ticket is covered by any test suite's coverage field
  const isTicketInSuiteCoverage = (jiraKey: string): boolean => {
    return testSuites.some(suite => 
      suite.coverage && suite.coverage.toLowerCase().includes(jiraKey.toLowerCase())
    );
  };

  // Get coverage status for a ticket
  const getCoverageStatus = (jiraKey: string): 'covered' | 'planned' | 'uncovered' => {
    const testCaseCoverage = getTestCasesForTicket(jiraKey);
    const suiteCoverage = isTicketInSuiteCoverage(jiraKey);
    
    if (testCaseCoverage.length > 0) {
      return 'covered';
    } else if (suiteCoverage) {
      return 'planned';
    } else {
      return 'uncovered';
    }
  };

  // Handle AI coverage generation
  const handleGenerateAICoverage = async (ticket: JiraTicket) => {
    setSelectedTicketForCoverage(ticket);
    setIsGeneratingCoverage(true);
    setAiCoverageDialogOpen(true);
    
    try {
      const response = await fetch('/api/ai/generate-jira-coverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject?.id,
          jiraKey: ticket.jiraKey,
          summary: ticket.summary,
          description: parseJiraDescription(ticket.description)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCoverageProposal(data.proposal);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate AI coverage suggestions",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error generating AI coverage:", error);
      toast({
        title: "Error", 
        description: "Failed to generate AI coverage suggestions",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingCoverage(false);
    }
  };

  // Handle creating test case in selected suite
  const handleCreateTestCase = async (option: AICoverageOption) => {
    if (!selectedProject || !selectedTicketForCoverage || !coverageProposal) return;
    
    try {
      let suiteId = option.suiteId;
      
      // Create new suite if needed
      if (option.type === 'new') {
        const suiteResponse = await fetch('/api/test-suites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: option.suiteName,
            description: option.suiteDescription,
            projectArea: 'General',
            priority: 'medium',
            type: 'functional',
            status: 'active',
            coverage: `JIRA_TICKETS: ${selectedTicketForCoverage.jiraKey}`,
            aiGenerated: true,
            projectId: selectedProject.id
          })
        });
        
        if (!suiteResponse.ok) {
          throw new Error('Failed to create test suite');
        }
        
        const newSuite = await suiteResponse.json();
        suiteId = newSuite.id;
      }
      
      // Create test case
      const testCaseResponse = await fetch('/api/test-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: coverageProposal.testCaseTitle,
          description: coverageProposal.testCaseDescription,
          preconditions: 'System is accessible and preconditions are met',
          steps: [],
          expectedResults: 'Test validates the specified functionality',
          priority: 'medium',
          severity: 'normal',
          status: 'draft',
          suiteId: suiteId,
          aiGenerated: true,
          automatable: false,
          automationStatus: 'not-automated',
          testData: {},
          projectId: selectedProject.id
        })
      });
      
      if (!testCaseResponse.ok) {
        throw new Error('Failed to create test case');
      }
      
      const newTestCase = await testCaseResponse.json();
      
      // Link to Jira ticket
      await fetch('/api/test-case-jira-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCaseId: newTestCase.id,
          jiraTicketKey: selectedTicketForCoverage.jiraKey,
          projectId: selectedProject.id,
          linkType: 'covers'
        })
      });
      
      toast({
        title: "Success",
        description: `Test case created in ${option.suiteName}`,
      });
      
      setAiCoverageDialogOpen(false);
      setCoverageProposal(null);
      setSelectedTicketForCoverage(null);
      
    } catch (error) {
      console.error("Error creating test case:", error);
      toast({
        title: "Error",
        description: "Failed to create test case",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTickets(), fetchSyncLogs(), testJiraConnection()]);
      setLoading(false);
    };

    if (selectedProject) {
      loadData();
    }
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Jira Tickets</h1>
          <p className="text-muted-foreground">Please select a project to view Jira tickets.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading Jira tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Jira Tickets</h1>
          <p className="text-muted-foreground">
            Manage and sync Jira tickets for {selectedProject.name}
          </p>
        </div>
      </div>

      {/* Sync Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Sync Status
                {connectionStatus === 'connected' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {connectionStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                {syncStats.lastSync 
                  ? `Last sync: ${format(new Date(syncStats.lastSync), 'PPp')}`
                  : 'No sync performed yet'
                }
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => testJiraConnection()}
                disabled={syncing}
              >
                Test Connection
              </Button>
              <Button 
                onClick={() => handleSync('incremental')} 
                disabled={syncing}
                className="flex items-center gap-2"
              >
                {syncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{syncStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tickets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncStats.synced}</div>
              <div className="text-sm text-muted-foreground">Synced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{syncStats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{syncStats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {uniquePriorities.map(priority => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {tickets.length === 0 
                  ? "No Jira tickets found. Try syncing to fetch tickets from Jira."
                  : "No tickets match your search criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono">
                        {ticket.jiraKey}
                      </Badge>
                      {ticket.issueType && (
                        <Badge className={getIssueTypeColor(ticket.issueType)}>
                          {ticket.issueType}
                        </Badge>
                      )}
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      {getSyncStatusIcon(ticket)}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{ticket.summary}</h3>
                    
                    {ticket.description && (
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {(() => {
                          const parsed = parseJiraDescription(ticket.description);
                          return parsed.substring(0, 200) + (parsed.length > 200 ? '...' : '');
                        })()}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {ticket.assignee && (
                        <span>Assignee: {ticket.assignee}</span>
                      )}
                      {ticket.reporter && (
                        <span>Reporter: {ticket.reporter}</span>
                      )}
                      <span>Updated: {format(new Date(ticket.jiraUpdatedAt), 'MMM d, yyyy')}</span>
                    </div>
                    
                    {ticket.labels && ticket.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ticket.labels.slice(0, 5).map((label, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                        {ticket.labels.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{ticket.labels.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {(() => {
                      const coverageStatus = getCoverageStatus(ticket.jiraKey);
                      const coveringTestCases = getTestCasesForTicket(ticket.jiraKey);
                      
                      return (
                        <div className="text-right">
                          <TooltipProvider>
                            {/* Coverage Badge with Tooltip */}
                            <div className="flex items-center justify-end mb-2">
                              {coverageStatus === 'covered' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="inline-flex">
                                      <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-help">
                                        {coveringTestCases.length} test{coveringTestCases.length > 1 ? 's' : ''}
                                      </Badge>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="max-w-xs">
                                    <div className="text-sm">
                                      <div className="font-medium mb-1">Test Cases Covering {ticket.jiraKey}:</div>
                                      <div className="space-y-1">
                                        {coveringTestCases.map((testCase, index) => (
                                          <div key={testCase.id} className="text-xs border-b border-gray-200 last:border-b-0 pb-1 last:pb-0">
                                            <div className="font-medium">{testCase.title}</div>
                                            <div className="text-gray-600 truncate">{testCase.description}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {coverageStatus === 'planned' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="inline-flex">
                                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 cursor-help">
                                        planned
                                      </Badge>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="max-w-xs">
                                    <div className="text-sm">
                                      <div className="font-medium mb-1">Planned Coverage for {ticket.jiraKey}:</div>
                                      <div className="text-xs">
                                        This ticket is listed in test suite coverage fields, indicating tests are planned but not yet created.
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {coverageStatus === 'uncovered' && (
                                <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200">
                                  no coverage
                                </Badge>
                              )}
                            </div>

                            {/* AI Coverage Button (only show if uncovered) */}
                            {coverageStatus === 'uncovered' && (
                              <Button 
                                size="sm" 
                                className="w-full text-xs bg-blue-900 hover:bg-blue-800 text-white border-blue-900"
                                onClick={() => handleGenerateAICoverage(ticket)}
                              >
                                <Brain className="h-3 w-3 mr-1" />
                                AI Coverage
                              </Button>
                            )}
                          </TooltipProvider>
                        </div>
                      );
                    })()}
                    
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={`${selectedProject.jiraUrl}/browse/${ticket.jiraKey}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View in Jira
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Test Case Details Dialog */}
      <TestCaseDetailsDialog
        isOpen={testCaseDetailOpen}
        onOpenChange={setTestCaseDetailOpen}
        testCase={selectedTestCase}
        onUpdate={() => {
          // Refresh test cases if needed
        }}
      />

      {/* AI Coverage Dialog */}
      <Dialog open={aiCoverageDialogOpen} onOpenChange={setAiCoverageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Test Coverage Analysis</DialogTitle>
            <DialogDescription>
              {selectedTicketForCoverage && (
                <>Analyzing coverage options for <strong>{selectedTicketForCoverage.jiraKey}</strong>: {selectedTicketForCoverage.summary}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {isGeneratingCoverage ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-muted-foreground">
                  Analyzing existing test suites and generating coverage recommendations...
                </p>
              </div>
            ) : coverageProposal ? (
              <div className="space-y-6">
                {/* Proposed Test Case */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Proposed Test Case</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Title:</span>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{coverageProposal.testCaseTitle}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{coverageProposal.testCaseDescription}</p>
                    </div>
                  </div>
                </div>

                {/* Coverage Options */}
                <div className="space-y-4">
                  <h4 className="font-medium">Choose where to create this test case:</h4>
                  {coverageProposal.options.map((option, index) => (
                    <div 
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={option.type === 'new' ? 'default' : 'outline'}>
                              {option.type === 'new' ? 'New Suite' : 'Existing Suite'}
                            </Badge>
                            <h5 className="font-medium">{option.suiteName}</h5>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{option.suiteDescription}</p>
                          <p className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded italic">
                            {option.reasoning}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleCreateTestCase(option)}
                          className="ml-4"
                        >
                          Create
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to generate coverage recommendations</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}