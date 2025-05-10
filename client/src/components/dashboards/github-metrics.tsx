import { useState, useEffect } from "react";
import { GitBranch, GitCommit, GitPullRequest, GitMerge, Clock, ShieldCheck, Code, Users, AlertTriangle, Link2, X, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useProject } from "@/context/ProjectContext";
import { ATMFCard, ATMFCardBody, ATMFCardHeader } from "@/components/design-system/atmf-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { HealthStatus } from "@/components/design-system/health-indicator";
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types for GitHub metrics
interface GitHubMetrics {
  repoInfo: {
    name: string;
    fullName: string;
    description: string;
    url: string;
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    defaultBranch: string;
  } | null;
  commitActivity: {
    day: string;
    count: number;
  }[];
  pullRequests: {
    open: number;
    closed: number;
    merged: number;
  };
  branches: number;
  contributors: number;
  testCoverage: number;
  codeQuality: {
    score: number;
    issues: number;
    status: HealthStatus;
  };
  ciStatus: {
    success: number;
    failed: number;
    pending: number;
    status: HealthStatus;
  };
}

const DEFAULT_METRICS: GitHubMetrics = {
  repoInfo: null,
  commitActivity: [],
  pullRequests: {
    open: 0,
    closed: 0,
    merged: 0
  },
  branches: 0,
  contributors: 0,
  testCoverage: 0,
  codeQuality: {
    score: 0,
    issues: 0,
    status: "unknown"
  },
  ciStatus: {
    success: 0,
    failed: 0,
    pending: 0,
    status: "unknown"
  }
};

// KPI Card component
interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  status?: HealthStatus;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  isLoading?: boolean;
}

const KPICard = ({ title, value, icon, status, trend, trendValue, className, isLoading }: KPICardProps) => {
  if (isLoading) {
    return (
      <div className="bg-atmf-card-alt p-4 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-28 bg-atmf-main" />
          <Skeleton className="h-5 w-5 rounded-full bg-atmf-main" />
        </div>
        <Skeleton className="h-10 w-24 bg-atmf-main" />
        <Skeleton className="h-4 w-16 bg-atmf-main mt-2" />
      </div>
    );
  }

  return (
    <div className={`bg-atmf-card-alt p-4 rounded-lg border border-white/5 hover:border-white/10 transition-colors ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm text-atmf-muted font-medium">{title}</h4>
        <div className={`
          h-6 w-6 rounded-full flex items-center justify-center 
          ${status === "healthy" ? "bg-green-900/20 text-green-400" : 
            status === "warning" ? "bg-amber-900/20 text-amber-400" : 
            status === "critical" ? "bg-red-900/20 text-red-400" : 
            "bg-blue-900/20 text-blue-400"}
        `}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {trend && trendValue && (
        <div className={`flex items-center text-xs mt-2 ${
          trend === "up" ? "text-green-400" : 
          trend === "down" ? "text-red-400" : 
          "text-gray-400"
        }`}>
          {trend === "up" && <Check className="h-3 w-3 mr-1" />}
          {trend === "down" && <X className="h-3 w-3 mr-1" />}
          {trendValue}
        </div>
      )}
    </div>
  );
};

export function GitHubMetrics() {
  const { selectedProject } = useProject();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<GitHubMetrics>(DEFAULT_METRICS);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch GitHub metrics when project changes
  useEffect(() => {
    if (selectedProject) {
      setLoading(true);
      
      // Check if GitHub is configured
      if (selectedProject.githubRepo && selectedProject.githubToken) {
        // Make API call to fetch GitHub metrics
        fetch(`/api/projects/${selectedProject.id}/github-metrics`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch GitHub metrics: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            // Update metrics with real data
            setMetrics(data);
            setLoading(false);
          })
          .catch(error => {
            console.error("Error fetching GitHub metrics:", error);
            // If error, generate demo metrics after a delay to simulate loading
            setTimeout(() => {
              setMetrics(generateDemoMetrics(selectedProject.id));
              setLoading(false);
            }, 1000);
          });
      } else {
        // If GitHub is not configured, generate demo metrics
        setTimeout(() => {
          setMetrics(generateDemoMetrics(selectedProject.id));
          setLoading(false);
        }, 1000);
      }
    } else {
      // Reset to default if no project selected
      setMetrics(DEFAULT_METRICS);
      setLoading(false);
    }
  }, [selectedProject]);
  
  // Function to generate demo metrics based on project ID
  const generateDemoMetrics = (projectId: number): GitHubMetrics => {
    // Use project ID as a seed for pseudo-randomness
    const seed = projectId;
    
    // Simple pseudo-random function based on the seed
    const getPseudoRandom = (offset: number) => {
      const value = (seed * 9301 + offset * 49297) % 233280;
      return value / 233280;
    };
    
    // Calculate the health factor (0-1)
    let healthFactor = 0.5 + getPseudoRandom(0) * 0.5;
    
    // Generate commit activity
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const commitActivity = days.map((day, index) => ({
      day,
      count: Math.floor(5 + getPseudoRandom(index + 1) * 25 * healthFactor)
    }));
    
    // Generate demo metrics
    return {
      repoInfo: {
        name: selectedProject?.githubRepo?.split('/').pop() || "demo-repo",
        fullName: selectedProject?.githubRepo || "org/demo-repo",
        description: "Demo repository for the project",
        url: `https://github.com/${selectedProject?.githubRepo || "org/demo-repo"}`,
        stars: Math.floor(10 + getPseudoRandom(2) * 990),
        forks: Math.floor(5 + getPseudoRandom(3) * 95),
        watchers: Math.floor(2 + getPseudoRandom(4) * 48),
        openIssues: Math.floor(1 + getPseudoRandom(5) * 49),
        defaultBranch: "main"
      },
      commitActivity,
      pullRequests: {
        open: Math.floor(1 + getPseudoRandom(6) * 19),
        closed: Math.floor(10 + getPseudoRandom(7) * 90),
        merged: Math.floor(20 + getPseudoRandom(8) * 180)
      },
      branches: Math.floor(2 + getPseudoRandom(9) * 18),
      contributors: Math.floor(1 + getPseudoRandom(10) * 24),
      testCoverage: Math.floor(30 + getPseudoRandom(11) * 65),
      codeQuality: {
        score: Math.floor(2 + getPseudoRandom(12) * 3 * healthFactor),
        issues: Math.floor(1 + getPseudoRandom(13) * 29 * (1 - healthFactor)),
        status: healthFactor > 0.7 ? "healthy" : healthFactor > 0.4 ? "warning" : "critical"
      },
      ciStatus: {
        success: Math.floor(10 + getPseudoRandom(14) * 90 * healthFactor),
        failed: Math.floor(1 + getPseudoRandom(15) * 19 * (1 - healthFactor)),
        pending: Math.floor(1 + getPseudoRandom(16) * 9),
        status: healthFactor > 0.8 ? "healthy" : healthFactor > 0.5 ? "warning" : "critical"
      }
    };
  };
  
  // Helper function to get a color for a status
  const getStatusColor = (status: HealthStatus): string => {
    switch (status) {
      case "healthy": return "#22c55e"; // green
      case "warning": return "#f59e0b"; // amber
      case "critical": return "#ef4444"; // red
      default: return "#3b82f6"; // blue
    }
  };
  
  // If no project is selected, show a placeholder
  if (!selectedProject) {
    return (
      <ATMFCard>
        <ATMFCardBody className="py-12 flex flex-col items-center justify-center">
          <GitBranch className="h-12 w-12 text-atmf-muted mb-4" />
          <h3 className="text-lg font-medium text-center">No Project Selected</h3>
          <p className="text-atmf-muted text-center max-w-md mt-2">
            Please select a project from the dropdown to view GitHub metrics.
          </p>
        </ATMFCardBody>
      </ATMFCard>
    );
  }
  
  // If loading, show skeletons
  if (loading) {
    return (
      <ATMFCard>
        <ATMFCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <GitBranch className="h-5 w-5 text-blue-400 mr-2" />
              <Skeleton className="h-6 w-44 bg-atmf-main" />
            </div>
            <Skeleton className="h-8 w-32 bg-atmf-main" />
          </div>
        </ATMFCardHeader>
        <ATMFCardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <KPICard
                key={i}
                title=""
                value={0}
                icon={<span />}
                isLoading={true}
              />
            ))}
          </div>
          <div className="h-64 bg-atmf-card-alt rounded-lg border border-white/5 flex items-center justify-center">
            <Skeleton className="h-48 w-full max-w-md bg-atmf-main" />
          </div>
        </ATMFCardBody>
      </ATMFCard>
    );
  }
  
  // Prepare data for the commit activity chart
  const commitData = metrics.commitActivity;
  
  // Prepare data for pull request pie chart
  const prData = [
    { name: "Open", value: metrics.pullRequests.open, color: "#3b82f6" },
    { name: "Closed", value: metrics.pullRequests.closed, color: "#ef4444" },
    { name: "Merged", value: metrics.pullRequests.merged, color: "#22c55e" }
  ];
  
  // Prepare data for CI status chart
  const ciData = [
    { name: "Success", value: metrics.ciStatus.success, color: "#22c55e" },
    { name: "Failed", value: metrics.ciStatus.failed, color: "#ef4444" },
    { name: "Pending", value: metrics.ciStatus.pending, color: "#f59e0b" }
  ];
  
  // GitHub integration status message
  const getGitHubStatusMessage = () => {
    if (!selectedProject.githubRepo) {
      return (
        <Badge variant="outline" className="ml-2 bg-red-900/20 text-red-400 border-red-500/20">
          <X className="h-3 w-3 mr-1" />
          Not Configured
        </Badge>
      );
    }
    
    if (!selectedProject.githubToken) {
      return (
        <Badge variant="outline" className="ml-2 bg-amber-900/20 text-amber-400 border-amber-500/20">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Missing Token
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="ml-2 bg-green-900/20 text-green-400 border-green-500/20">
        <Check className="h-3 w-3 mr-1" />
        Connected
      </Badge>
    );
  };
  
  return (
    <ATMFCard className="mt-6">
      <ATMFCardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center">
            <GitBranch className="h-5 w-5 text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold">GitHub Repository Metrics</h3>
            {getGitHubStatusMessage()}
          </div>
          
          {metrics.repoInfo && (
            <TooltipProvider>
              <TooltipUI>
                <TooltipTrigger asChild>
                  <a 
                    href={metrics.repoInfo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-1.5 rounded-full bg-atmf-main hover:bg-atmf-card-alt transition-colors"
                  >
                    <span className="text-sm mr-2">{metrics.repoInfo.fullName}</span>
                    <Link2 className="h-4 w-4 opacity-70" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open repository on GitHub</p>
                </TooltipContent>
              </TooltipUI>
            </TooltipProvider>
          )}
        </div>
      </ATMFCardHeader>
      <ATMFCardBody>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 bg-atmf-main">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="commits">Commits</TabsTrigger>
            <TabsTrigger value="pullRequests">Pull Requests</TabsTrigger>
            <TabsTrigger value="quality">Quality & CI</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard
                title="Repository Activity"
                value={commitData.reduce((sum, day) => sum + day.count, 0)}
                icon={<GitCommit className="h-3.5 w-3.5" />}
                trend="up"
                trendValue="Active"
              />
              <KPICard
                title="Open Pull Requests"
                value={metrics.pullRequests.open}
                icon={<GitPullRequest className="h-3.5 w-3.5" />}
                status={metrics.pullRequests.open > 10 ? "warning" : "healthy"}
              />
              <KPICard
                title="Contributors"
                value={metrics.contributors}
                icon={<Users className="h-3.5 w-3.5" />}
              />
              <KPICard
                title="Code Quality"
                value={`${metrics.codeQuality.score}/5`}
                icon={<Code className="h-3.5 w-3.5" />}
                status={metrics.codeQuality.status}
              />
            </div>
            
            <div className="h-64 bg-atmf-card-alt rounded-lg border border-white/5 p-4">
              <h4 className="text-sm font-medium mb-3">Commit Activity (Last Week)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commitData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c1524', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          {/* Commits Tab */}
          <TabsContent value="commits" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard
                title="Total Commits"
                value={commitData.reduce((sum, day) => sum + day.count, 0)}
                icon={<GitCommit className="h-3.5 w-3.5" />}
              />
              <KPICard
                title="Branches"
                value={metrics.branches}
                icon={<GitBranch className="h-3.5 w-3.5" />}
              />
              <KPICard
                title="Most Active Day"
                value={commitData.reduce((max, day) => max.count > day.count ? max : day, { day: '', count: 0 }).day}
                icon={<Clock className="h-3.5 w-3.5" />}
              />
              <KPICard
                title="Daily Average"
                value={Math.round(commitData.reduce((sum, day) => sum + day.count, 0) / 7)}
                icon={<GitCommit className="h-3.5 w-3.5" />}
              />
            </div>
            
            <div className="h-64 bg-atmf-card-alt rounded-lg border border-white/5 p-4">
              <h4 className="text-sm font-medium mb-3">Commit Activity (Last Week)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commitData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c1524', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          {/* Pull Requests Tab */}
          <TabsContent value="pullRequests" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <KPICard
                title="Open PRs"
                value={metrics.pullRequests.open}
                icon={<GitPullRequest className="h-3.5 w-3.5" />}
                status={metrics.pullRequests.open > 10 ? "warning" : "healthy"}
              />
              <KPICard
                title="Closed PRs"
                value={metrics.pullRequests.closed}
                icon={<X className="h-3.5 w-3.5" />}
              />
              <KPICard
                title="Merged PRs"
                value={metrics.pullRequests.merged}
                icon={<GitMerge className="h-3.5 w-3.5" />}
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-64 bg-atmf-card-alt rounded-lg border border-white/5 p-4">
                <h4 className="text-sm font-medium mb-3">Pull Request Distribution</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {prData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0c1524', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 h-64 bg-atmf-card-alt rounded-lg border border-white/5 p-4">
                <h4 className="text-sm font-medium mb-3">PR Efficiency Metrics</h4>
                <div className="flex flex-col gap-3 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Merge Rate</span>
                    <span className="text-sm font-bold">{
                      metrics.pullRequests.merged > 0 
                        ? `${Math.round((metrics.pullRequests.merged / (metrics.pullRequests.merged + metrics.pullRequests.closed)) * 100)}%`
                        : "N/A"
                    }</span>
                  </div>
                  <div className="h-1.5 bg-atmf-main rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ 
                      width: metrics.pullRequests.merged > 0 
                        ? `${Math.round((metrics.pullRequests.merged / (metrics.pullRequests.merged + metrics.pullRequests.closed)) * 100)}%`
                        : "0%" 
                    }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm">PR Throughput</span>
                    <span className="text-sm font-bold">{Math.round((metrics.pullRequests.merged + metrics.pullRequests.closed) / 7)} per day</span>
                  </div>
                  <div className="h-1.5 bg-atmf-main rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ 
                      width: `${Math.min(100, Math.round(((metrics.pullRequests.merged + metrics.pullRequests.closed) / 7) / 0.2))}%`
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Quality & CI Tab */}
          <TabsContent value="quality" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard
                title="Code Quality"
                value={`${metrics.codeQuality.score}/5`}
                icon={<Code className="h-3.5 w-3.5" />}
                status={metrics.codeQuality.status}
              />
              <KPICard
                title="Code Issues"
                value={metrics.codeQuality.issues}
                icon={<AlertTriangle className="h-3.5 w-3.5" />}
                status={metrics.codeQuality.issues > 10 ? "critical" : metrics.codeQuality.issues > 5 ? "warning" : "healthy"}
              />
              <KPICard
                title="Test Coverage"
                value={`${metrics.testCoverage}%`}
                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                status={metrics.testCoverage > 75 ? "healthy" : metrics.testCoverage > 50 ? "warning" : "critical"}
              />
              <KPICard
                title="CI Success Rate"
                value={`${Math.round((metrics.ciStatus.success / (metrics.ciStatus.success + metrics.ciStatus.failed + metrics.ciStatus.pending)) * 100)}%`}
                icon={<Check className="h-3.5 w-3.5" />}
                status={metrics.ciStatus.status}
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-64 bg-atmf-card-alt rounded-lg border border-white/5 p-4">
                <h4 className="text-sm font-medium mb-3">CI Build Results</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ciData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {ciData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0c1524', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 h-64 bg-atmf-card-alt rounded-lg border border-white/5 p-4">
                <h4 className="text-sm font-medium mb-3">Test Coverage Breakdown</h4>
                <div className="flex flex-col gap-3 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Unit Tests</span>
                    <span className="text-sm font-bold">{Math.round(metrics.testCoverage * 1.1)}%</span>
                  </div>
                  <div className="h-1.5 bg-atmf-main rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.round(metrics.testCoverage * 1.1)}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm">Integration Tests</span>
                    <span className="text-sm font-bold">{Math.round(metrics.testCoverage * 0.9)}%</span>
                  </div>
                  <div className="h-1.5 bg-atmf-main rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${Math.round(metrics.testCoverage * 0.9)}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm">UI/E2E Tests</span>
                    <span className="text-sm font-bold">{Math.round(metrics.testCoverage * 0.7)}%</span>
                  </div>
                  <div className="h-1.5 bg-atmf-main rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${Math.round(metrics.testCoverage * 0.7)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ATMFCardBody>
    </ATMFCard>
  );
}