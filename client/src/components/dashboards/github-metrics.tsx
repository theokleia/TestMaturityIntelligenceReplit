import { useProject } from "@/context/ProjectContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Loader2, AlertTriangle, GitBranch, GitPullRequestIcon, Users, Code } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface LanguageData {
  [key: string]: number;
}

interface GitHubRepoInfo {
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  defaultBranch: string;
}

interface CommitActivity {
  day: string;
  count: number;
}

interface PullRequestsData {
  open: number;
  closed: number;
  merged: number;
}

interface CodeQualityData {
  score: number;
  issues: number;
  status: "healthy" | "warning" | "critical";
}

interface CIStatusData {
  success: number;
  failed: number;
  pending: number;
  status: "healthy" | "warning" | "critical";
}

interface GitHubMetricsData {
  repoInfo: GitHubRepoInfo;
  languages: LanguageData;
  commitActivity: CommitActivity[];
  pullRequests: PullRequestsData;
  branches: number;
  contributors: number;
  testCoverage: number;
  codeQuality: CodeQualityData;
  ciStatus: CIStatusData;
}

// Map of language names to colors
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  Java: "#b07219",
  CSharp: "#178600",
  Ruby: "#701516",
  Go: "#00ADD8",
  PHP: "#4F5D95",
  Rust: "#dea584",
  Swift: "#ffac45",
  Kotlin: "#F18E33",
  Dart: "#00B4AB",
  // Add more languages and colors as needed
  // Default colors for other languages
  Other: "#cccccc"
};

// Helper function to get a color for a language
function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] || LANGUAGE_COLORS.Other;
}

// Helper function to process language data for visualization
function processLanguageData(languages: LanguageData) {
  // Calculate total bytes
  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  
  // Convert to percentage and format for charts
  return Object.entries(languages).map(([name, bytes]) => ({
    name,
    value: bytes,
    percentage: parseFloat(((bytes / totalBytes) * 100).toFixed(1))
  }));
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "healthy":
      return <Badge variant="default" className="bg-green-600">Healthy</Badge>;
    case "warning":
      return <Badge variant="secondary" className="bg-yellow-500 text-black">Warning</Badge>;
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export function GitHubMetrics() {
  const { selectedProject } = useProject();
  const [chartData, setChartData] = useState<any[]>([]);
  
  const { data: metrics, isLoading, error } = useQuery<GitHubMetricsData>({
    queryKey: ["/api/projects", selectedProject?.id, "github-metrics"],
    queryFn: async ({ queryKey }) => {
      if (!selectedProject) throw new Error("No project selected");
      const response = await fetch(`/api/projects/${selectedProject.id}/github-metrics`);
      if (!response.ok) {
        throw new Error("Failed to fetch GitHub metrics");
      }
      return response.json();
    },
    enabled: !!selectedProject,
    refetchOnWindowFocus: false,
    retry: 1
  });
  
  useEffect(() => {
    if (metrics && metrics.languages) {
      setChartData(processLanguageData(metrics.languages));
    }
  }, [metrics]);
  
  if (isLoading) {
    return (
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle>GitHub Repository Metrics</CardTitle>
          <CardDescription>Loading GitHub repository data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !metrics) {
    return (
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle>GitHub Repository Metrics</CardTitle>
          <CardDescription>Repository information and activity metrics from GitHub</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="bg-opacity-20">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error loading GitHub metrics</AlertTitle>
            <AlertDescription>
              {error ? (error as Error).message : "GitHub integration is not configured or data is unavailable."}
              {selectedProject && !selectedProject.githubRepo && "Please configure GitHub integration in Settings."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  const { repoInfo, languages, commitActivity, pullRequests, branches, codeQuality, ciStatus, testCoverage } = metrics;
  
  return (
    <Card className="relative overflow-hidden shadow-md bg-[#151934] border-blue-900/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="h-5 w-5 fill-current">
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          GitHub Repository Metrics
        </CardTitle>
        <CardDescription className="text-blue-200">
          {repoInfo.fullName} - {repoInfo.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Repository Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col p-3 bg-[#1e2445] rounded-md border border-blue-900/30">
            <span className="text-blue-300 text-sm">Stars</span>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="h-4 w-4 fill-yellow-400">
                <path fillRule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"></path>
              </svg>
              <span className="text-xl font-semibold text-white">{repoInfo.stars}</span>
            </div>
          </div>
          
          <div className="flex flex-col p-3 bg-[#1e2445] rounded-md border border-blue-900/30">
            <span className="text-blue-300 text-sm">Forks</span>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="h-4 w-4 fill-blue-400">
                <path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
              </svg>
              <span className="text-xl font-semibold text-white">{repoInfo.forks}</span>
            </div>
          </div>
          
          <div className="flex flex-col p-3 bg-[#1e2445] rounded-md border border-blue-900/30">
            <span className="text-blue-300 text-sm">Open Issues</span>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="h-4 w-4 fill-green-400">
                <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
                <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"></path>
              </svg>
              <span className="text-xl font-semibold text-white">{repoInfo.openIssues}</span>
            </div>
          </div>
          
          <div className="flex flex-col p-3 bg-[#1e2445] rounded-md border border-blue-900/30">
            <span className="text-blue-300 text-sm">Branches</span>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-purple-400" />
              <span className="text-xl font-semibold text-white">{branches}</span>
            </div>
          </div>
        </div>
        
        {/* Language Distribution */}
        <div className="p-4 bg-[#1e2445] rounded-md border border-blue-900/30">
          <h3 className="text-white font-medium mb-3">Languages</h3>
          
          {chartData.length > 0 ? (
            <>
              {/* Language Bar */}
              <div className="relative h-8 w-full rounded-md overflow-hidden mb-4">
                {chartData.map((lang, index) => {
                  // Calculate the width based on percentage
                  const prevWidths = chartData
                    .slice(0, index)
                    .reduce((acc, curr) => acc + curr.percentage, 0);
                  
                  return (
                    <div
                      key={lang.name}
                      className="absolute top-0 h-full"
                      style={{
                        backgroundColor: getLanguageColor(lang.name),
                        width: `${lang.percentage}%`,
                        left: `${prevWidths}%`
                      }}
                      title={`${lang.name}: ${lang.percentage}%`}
                    />
                  );
                })}
              </div>
              
              {/* Language Legend */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {chartData.map(lang => (
                  <div key={lang.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getLanguageColor(lang.name) }}
                    />
                    <span className="text-white text-sm">{lang.name} {lang.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-blue-300">
              No language data available
            </div>
          )}
        </div>
        
        {/* Two-column layout for charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Commit Activity */}
          <div className="bg-[#1e2445] p-4 rounded-md border border-blue-900/30">
            <h3 className="text-white font-medium mb-3">Commit Activity</h3>
            
            {commitActivity && commitActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={commitActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c2f48" />
                  <XAxis dataKey="day" stroke="#8a94a6" />
                  <YAxis stroke="#8a94a6" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#151934', 
                      borderColor: '#1e2445',
                      color: 'white' 
                    }} 
                  />
                  <Bar dataKey="count" fill="#3182ce" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[200px] text-blue-300">
                No commit data available
              </div>
            )}
          </div>
          
          {/* Pull Requests */}
          <div className="bg-[#1e2445] p-4 rounded-md border border-blue-900/30">
            <h3 className="text-white font-medium mb-3">Pull Requests</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-900/20 p-3 rounded-md">
                <div className="text-sm text-blue-300">Open</div>
                <div className="text-xl font-semibold text-white">{pullRequests.open}</div>
              </div>
              <div className="bg-blue-900/20 p-3 rounded-md">
                <div className="text-sm text-blue-300">Closed</div>
                <div className="text-xl font-semibold text-white">{pullRequests.closed}</div>
              </div>
              <div className="bg-blue-900/20 p-3 rounded-md">
                <div className="text-sm text-blue-300">Merged</div>
                <div className="text-xl font-semibold text-white">{pullRequests.merged}</div>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Open', value: pullRequests.open, color: '#3182ce' },
                    { name: 'Closed', value: pullRequests.closed, color: '#e53e3e' },
                    { name: 'Merged', value: pullRequests.merged, color: '#805ad5' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  labelLine={false}
                >
                  {[
                    { name: 'Open', color: '#3182ce' },
                    { name: 'Closed', color: '#e53e3e' },
                    { name: 'Merged', color: '#805ad5' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#151934', 
                    borderColor: '#1e2445',
                    color: 'white' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Quality Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Test Coverage */}
          <div className="bg-[#1e2445] p-4 rounded-md border border-blue-900/30">
            <h3 className="text-white font-medium mb-2">Test Coverage</h3>
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold text-white">{testCoverage}%</div>
              <Code className="text-blue-400" />
            </div>
            <div className="w-full h-2 bg-blue-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${testCoverage}%` }}
              />
            </div>
          </div>
          
          {/* Code Quality */}
          <div className="bg-[#1e2445] p-4 rounded-md border border-blue-900/30">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-medium">Code Quality</h3>
              <StatusBadge status={codeQuality.status} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{codeQuality.score}/5</div>
                <div className="text-blue-300 text-sm">{codeQuality.issues} issues found</div>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star}
                    className={`w-5 h-5 ${star <= codeQuality.score ? 'text-yellow-400' : 'text-gray-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
          
          {/* CI Status */}
          <div className="bg-[#1e2445] p-4 rounded-md border border-blue-900/30">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-medium">CI Status</h3>
              <StatusBadge status={ciStatus.status} />
            </div>
            <div className="mb-3">
              <div className="flex gap-4">
                <div>
                  <div className="text-sm text-blue-300">Success</div>
                  <div className="text-lg font-semibold text-green-500">{ciStatus.success}%</div>
                </div>
                <div>
                  <div className="text-sm text-blue-300">Failed</div>
                  <div className="text-lg font-semibold text-red-500">{ciStatus.failed}%</div>
                </div>
                <div>
                  <div className="text-sm text-blue-300">Pending</div>
                  <div className="text-lg font-semibold text-yellow-500">{ciStatus.pending}%</div>
                </div>
              </div>
            </div>
            <div className="w-full h-2 bg-blue-900/30 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-green-500" 
                style={{ width: `${ciStatus.success}%` }}
              />
              <div 
                className="h-full bg-red-500" 
                style={{ width: `${ciStatus.failed}%` }}
              />
              <div 
                className="h-full bg-yellow-500" 
                style={{ width: `${ciStatus.pending}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Repository Link */}
        <div className="pt-2">
          <a
            href={repoInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            View repository on GitHub
          </a>
        </div>
      </CardContent>
    </Card>
  );
}