import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, ExternalLink, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
                        {ticket.description.substring(0, 200)}
                        {ticket.description.length > 200 && '...'}
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
    </div>
  );
}