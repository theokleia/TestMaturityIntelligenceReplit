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
                
                <div className="space-y-3">
                  {/* Individual Assessment Types */}
                  {[
                    { key: 'project_definition', label: 'Project Definition', score: aiSummary.assessmentScores?.project_definition || 0 },
                    { key: 'ai_coverage', label: 'AI Coverage', score: aiSummary.assessmentScores?.ai_coverage || 0 },
                    { key: 'ai_execution', label: 'AI Assisted Execution', score: aiSummary.assessmentScores?.ai_execution || 0 },
                    { key: 'ai_automation', label: 'AI Automation', score: aiSummary.assessmentScores?.ai_automation || 0 },
                    { key: 'documentation', label: 'Documentation Readiness', score: aiSummary.assessmentScores?.documentation || 0 }
                  ].map((assessment) => (
                    <div key={assessment.key} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{assessment.label}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={assessment.score} className="w-24" />
                        <span className={`text-sm font-semibold min-w-[3rem] text-right ${getReadinessColor(assessment.score)}`}>
                          {assessment.score}%
                        </span>
                      </div>
                    </div>
                  ))}
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