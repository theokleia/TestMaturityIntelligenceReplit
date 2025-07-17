import { useQuery } from "@tanstack/react-query";
import { Metric } from "@shared/schema";
import { PageContainer } from "@/components/design-system/page-container";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, TrendingUp, Clock } from "lucide-react";
import { useProject } from "@/context/ProjectContext";

export default function Dashboard() {
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id;
  
  // Fetch AI Assessment Summary
  const { data: aiSummary } = useQuery({
    queryKey: [`/api/ai-assessments/${projectId}/summary`],
    enabled: !!projectId,
  });

  // Fetch Action Items
  const { data: actionItems = [] } = useQuery({
    queryKey: [`/api/ai-assessments/${projectId}/action-items`],
    enabled: !!projectId,
  });

  // Fetch metrics
  const { data: metricsData } = useQuery<Metric[]>({
    queryKey: ['/api/metrics', { projectId }],
  });

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  
  if (!selectedProject) {
    return (
      <PageContainer
        title="Dashboard"
        subtitle="Project overview and AI readiness insights"
        withPadding
      >
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No Project Selected</h2>
          <p className="text-muted-foreground">Please select a project to view the dashboard.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Project overview and AI readiness insights"
      withPadding
    >
      {/* AI Readiness Summary */}
      {aiSummary && (
        <div className="space-y-6 mb-12">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AI Readiness Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getReadinessColor(aiSummary.overallReadinessScore)}`}>
                    {aiSummary.overallReadinessScore}%
                  </div>
                  <div className="text-muted-foreground">Overall AI Readiness</div>
                </div>
                
                <div className="space-y-2">
                  {aiSummary.assessments?.map((assessment: any) => {
                    const readinessScore = assessment.readinessScore || 0;
                    return (
                      <div key={assessment.type} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{assessment.type.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={readinessScore} className="w-20" />
                          <span className={`text-sm font-medium ${getReadinessColor(readinessScore)}`}>
                            {readinessScore}%
                          </span>
                        </div>
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
                    {aiSummary.actionItems?.completionRate || 0}%
                  </div>
                  <div className="text-muted-foreground">Completion Rate</div>
                </div>
                
                <Progress value={aiSummary.actionItems?.completionRate || 0} className="w-full" />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Items</span>
                    <span className="font-medium">{aiSummary.actionItems?.total || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Open/In Progress</span>
                    <span className="font-medium text-orange-600">{aiSummary.actionItems?.open || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed</span>
                    <span className="font-medium text-green-600">{aiSummary.actionItems?.completed || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Assessment Results */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessment Results</CardTitle>
              <CardDescription>
                Latest AI readiness assessments and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {aiSummary.recentAssessments?.slice(0, 3).map((assessment: any) => (
                  <div key={assessment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{assessment.type.replace('_', ' ')}</h4>
                      <div className={`text-lg font-semibold ${getReadinessColor(assessment.readinessScore)}`}>
                        {assessment.readinessScore}%
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {assessment.analysis}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Completed Action Items */}
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
                  .filter((item: any) => item.status === 'completed')
                  .slice(0, 5)
                  .map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium text-blue-900">{item.title}</div>
                        <div className="text-sm text-blue-700">
                          Completed {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'recently'}
                        </div>
                      </div>
                    </div>
                  ))}
                {actionItems.filter((item: any) => item.status === 'completed').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>No completed action items yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Metrics Overview */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Metrics Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metricsData?.map((metric) => (
            <MetricsCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}