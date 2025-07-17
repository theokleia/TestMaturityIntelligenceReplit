/**
 * AI Assessments Page
 * Comprehensive AI readiness assessment system with three-tab layout
 */

import { useState, useEffect } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  PlayCircle, 
  RefreshCw,
  TrendingUp,
  Target,
  CheckSquare,
  Square,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AssessmentResult {
  id: number;
  assessmentType: string;
  readinessScore: number;
  analysis: string;
  strengths: string[];
  recommendations: string[];
  status: string;
  createdAt: string;
}

interface ActionItem {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  estimatedImpact: number;
  assignedTo?: number;
  completedAt?: string;
  createdAt: string;
}

interface AssessmentSummary {
  overallReadinessScore: number;
  assessments: Record<string, AssessmentResult>;
  actionItems: {
    total: number;
    open: number;
    completed: number;
    completionRate: number;
  };
}

const assessmentTypes = [
  {
    key: 'project_definition',
    title: 'Project Definition',
    description: 'Analyzes project settings, integrations, and knowledge completeness',
    icon: Target
  },
  {
    key: 'ai_coverage',
    title: 'AI Coverage',
    description: 'Evaluates ability to generate detailed test cases from requirements',
    icon: CheckCircle
  },
  {
    key: 'ai_execution',
    title: 'AI Execution',
    description: 'Assesses automated browser test execution capabilities',
    icon: PlayCircle
  },
  {
    key: 'ai_automation',
    title: 'AI Automation',
    description: 'Reviews automation potential and ROI recommendations',
    icon: RefreshCw
  },
  {
    key: 'documentation',
    title: 'Documentation',
    description: 'Evaluates readiness for AI document generation',
    icon: TrendingUp
  }
];

export default function AIAssessmentsPage() {
  const { selectedProject } = useProjectContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("assessments");
  const [assessments, setAssessments] = useState<Record<string, AssessmentResult>>({});
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [summary, setSummary] = useState<AssessmentSummary | null>(null);
  const [runningAssessments, setRunningAssessments] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch assessment data
  const fetchAssessments = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      
      // Fetch summary which includes latest assessments
      const summaryResponse = await fetch(`/api/ai-assessments/${selectedProject.id}/summary`);
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
        setAssessments(summaryData.assessments);
      }

      // Fetch action items
      const actionItemsResponse = await fetch(`/api/ai-assessments/${selectedProject.id}/action-items`);
      if (actionItemsResponse.ok) {
        const actionItemsData = await actionItemsResponse.json();
        setActionItems(actionItemsData);
      }
    } catch (error) {
      console.error('Error fetching assessment data:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [selectedProject]);

  // Run assessment
  const runAssessment = async (assessmentType: string) => {
    if (!selectedProject) return;

    setRunningAssessments(prev => new Set(prev).add(assessmentType));

    try {
      const response = await fetch('/api/ai-assessments/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          assessmentType,
          runBy: 1 // TODO: Use actual user ID from auth
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Assessment Complete",
          description: `${assessmentType.replace('_', ' ')} assessment completed with ${result.readinessScore}% readiness`,
        });
        
        // Refresh data
        await fetchAssessments();
      } else {
        throw new Error('Assessment failed');
      }
    } catch (error) {
      console.error('Error running assessment:', error);
      toast({
        title: "Assessment Failed",
        description: "Failed to run assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRunningAssessments(prev => {
        const next = new Set(prev);
        next.delete(assessmentType);
        return next;
      });
    }
  };

  // Update action item status
  const updateActionItem = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/ai-assessments/action-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await fetchAssessments();
        toast({
          title: "Action Item Updated",
          description: `Action item marked as ${status}`,
        });
      }
    } catch (error) {
      console.error('Error updating action item:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update action item",
        variant: "destructive",
      });
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  if (!selectedProject) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No Project Selected</h2>
          <p className="text-muted-foreground">Please select a project to view AI assessments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Readiness Assessments</h1>
          <p className="text-muted-foreground mt-2">
            Analyze your project's readiness for AI-assisted development workflows
          </p>
        </div>
        
        {summary && (
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getReadinessColor(summary.overallReadinessScore)}`}>
                  {summary.overallReadinessScore}%
                </div>
                <div className="text-sm text-muted-foreground">Overall Readiness</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessments">AI Assessments</TabsTrigger>
          <TabsTrigger value="action-items">
            Action Items
            {actionItems.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {actionItems.filter(item => item.status === 'open' || item.status === 'in_progress').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assessmentTypes.map((type) => {
              const assessment = assessments[type.key];
              const isRunning = runningAssessments.has(type.key);
              const IconComponent = type.icon;

              return (
                <Card key={type.key} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <IconComponent className="h-5 w-5 text-primary" />
                      {assessment && (
                        <div className={`text-lg font-semibold ${getReadinessColor(assessment.readinessScore)}`}>
                          {assessment.readinessScore}%
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {assessment && (
                      <>
                        <Progress value={assessment.readinessScore} className="w-full" />
                        
                        {assessment.strengths.length > 0 && (
                          <div>
                            <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                            <ul className="text-sm space-y-1">
                              {assessment.strengths.slice(0, 2).map((strength, index) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {assessment.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium text-amber-700 mb-2">Key Recommendations</h4>
                            <ul className="text-sm space-y-1">
                              {assessment.recommendations.slice(0, 2).map((rec, index) => (
                                <li key={index} className="flex items-start">
                                  <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Last run: {new Date(assessment.createdAt).toLocaleDateString()}
                        </div>
                      </>
                    )}

                    <Button 
                      onClick={() => runAssessment(type.key)}
                      disabled={isRunning}
                      className="w-full"
                      variant={assessment ? "outline" : "default"}
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {assessment ? 'Re-run Assessment' : 'Run Assessment'}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="action-items" className="space-y-6">
          <div className="space-y-4">
            {actionItems.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Action Items</h3>
                  <p className="text-muted-foreground">
                    Run assessments to generate actionable recommendations.
                  </p>
                </CardContent>
              </Card>
            ) : (
              actionItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Main content area */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg leading-tight pr-4">{item.title}</h3>
                          <div className="flex gap-2 flex-shrink-0">
                            <Badge className={`${getPriorityColor(item.priority)} text-xs font-medium`}>
                              {item.priority}
                            </Badge>
                            <Badge className={`${getStatusColor(item.status)} text-xs font-medium`}>
                              {item.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Full description with proper formatting */}
                        <div className="mb-4">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                        </div>
                        
                        {/* Footer with metadata and actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-medium">
                              {item.category}
                            </span>
                            <span className="flex items-center gap-1 text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Impact: {item.estimatedImpact}/10
                            </span>
                            {item.completedAt && (
                              <span className="text-green-600 font-medium">
                                ✓ Completed {new Date(item.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          {item.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateActionItem(item.id, 'completed')}
                              className="flex items-center gap-2 text-green-700 border-green-200 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          {summary && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Readiness Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getReadinessColor(summary.overallReadinessScore)}`}>
                        {summary.overallReadinessScore}%
                      </div>
                      <div className="text-muted-foreground">Overall AI Readiness</div>
                    </div>
                    
                    <div className="space-y-2">
                      {assessmentTypes.map((type) => {
                        const assessment = summary.assessments[type.key];
                        return (
                          <div key={type.key} className="flex justify-between items-center">
                            <span className="text-sm">{type.title}</span>
                            <span className={`font-medium ${assessment ? getReadinessColor(assessment.readinessScore) : 'text-muted-foreground'}`}>
                              {assessment ? `${assessment.readinessScore}%` : 'Not run'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Action Items Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">
                        {summary.actionItems.completionRate}%
                      </div>
                      <div className="text-muted-foreground">Completion Rate</div>
                    </div>
                    
                    <Progress value={summary.actionItems.completionRate} className="w-full" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Items</span>
                        <span className="font-medium">{summary.actionItems.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Open/In Progress</span>
                        <span className="font-medium text-orange-600">{summary.actionItems.open}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Completed</span>
                        <span className="font-medium text-green-600">{summary.actionItems.completed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Completed Action Items</CardTitle>
                  <CardDescription>
                    Recently completed improvements to AI readiness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {actionItems
                      .filter(item => item.status === 'completed')
                      .slice(0, 5)
                      .map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Completed {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'recently'}
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {actionItems.filter(item => item.status === 'completed').length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        No completed action items yet. Complete assessments and action items to see progress here.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}