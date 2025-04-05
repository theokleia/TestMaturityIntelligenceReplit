import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { glassmorphismStyles } from "@/lib/glassmorphism";
import { useState } from "react";
import type { Assessment, AssessmentTemplate } from "@shared/schema";

export default function Assessments() {
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  
  const { data: assessments, isLoading: loadingAssessments } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
    staleTime: 60000,
  });
  
  const { data: templates, isLoading: loadingTemplates } = useQuery<AssessmentTemplate[]>({
    queryKey: ["/api/assessment-templates"],
    staleTime: 60000,
  });
  
  // Get upcoming assessments (status = scheduled)
  const upcomingAssessments = assessments?.filter(a => a.status === "scheduled") || [];
  
  // Get completed assessments
  const completedAssessments = assessments?.filter(a => a.status === "completed") || [];
  
  // Get in-progress assessments
  const inProgressAssessments = assessments?.filter(a => a.status === "in_progress") || [];
  
  // Format date from ISO string
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get badge style based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600/20 text-green-500 hover:bg-green-600/30 border-green-500/30">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-600/20 text-blue-500 hover:bg-blue-600/30 border-blue-500/30">In Progress</Badge>;
      case "scheduled":
        return <Badge className="bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 border-yellow-500/30">Scheduled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Assessments" />
        
        <div className="flex-1 flex flex-col overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Assessments</h1>
              <p className="text-text-muted">Manage and track maturity assessments</p>
            </div>
            
            <div>
              <Button className="bg-primary hover:bg-primary/90">
                <i className="bx bx-plus mr-2"></i>
                New Assessment
              </Button>
            </div>
          </div>
          
          <Tabs 
            defaultValue="upcoming" 
            className="mb-6"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="bg-transparent border-b border-white/10 p-0 h-12">
              <TabsTrigger
                value="upcoming"
                className={cn(
                  "h-12 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none",
                  "data-[state=inactive]:text-text-muted"
                )}
              >
                Upcoming
                {upcomingAssessments.length > 0 && (
                  <span className="ml-2 bg-primary/20 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                    {upcomingAssessments.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="inProgress"
                className={cn(
                  "h-12 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none",
                  "data-[state=inactive]:text-text-muted"
                )}
              >
                In Progress
                {inProgressAssessments.length > 0 && (
                  <span className="ml-2 bg-blue-500/20 text-blue-500 text-xs font-medium px-2 py-0.5 rounded-full">
                    {inProgressAssessments.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className={cn(
                  "h-12 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none",
                  "data-[state=inactive]:text-text-muted"
                )}
              >
                Completed
                {completedAssessments.length > 0 && (
                  <span className="ml-2 bg-green-500/20 text-green-500 text-xs font-medium px-2 py-0.5 rounded-full">
                    {completedAssessments.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className={cn(
                  "h-12 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none",
                  "data-[state=inactive]:text-text-muted"
                )}
              >
                Templates
                {templates && templates.length > 0 && (
                  <span className="ml-2 bg-purple-500/20 text-purple-500 text-xs font-medium px-2 py-0.5 rounded-full">
                    {templates.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-6">
              {loadingAssessments ? (
                <div className="flex justify-center py-8">
                  <div className="spinner"></div>
                </div>
              ) : upcomingAssessments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingAssessments.map(assessment => (
                    <Card 
                      key={assessment.id} 
                      className={cn(
                        "border-0",
                        glassmorphismStyles.card
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl">{assessment.name}</CardTitle>
                          {getStatusBadge(assessment.status)}
                        </div>
                        <CardDescription>
                          Scheduled for {assessment.scheduledDate ? formatDate(assessment.scheduledDate) : "N/A"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm mb-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-text-muted">Dimension:</span>
                            <span className="font-medium">
                              {assessment.dimensionId === 1 ? "Automation Intelligence" : 
                               assessment.dimensionId === 2 ? "Development-Testing Synergy" : 
                               assessment.dimensionId === 3 ? "AI-Augmented QE" : 
                               assessment.dimensionId === 4 ? "Continuous Quality" : 
                               `Dimension ${assessment.dimensionId}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Template:</span>
                            <span className="font-medium">
                              {templates?.find(t => t.id === assessment.templateId)?.name || `Template ${assessment.templateId}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" className="flex-1">
                            <i className="bx bx-calendar mr-1"></i>
                            Reschedule
                          </Button>
                          <Button className="flex-1 bg-primary hover:bg-primary/90">
                            <i className="bx bx-play mr-1"></i>
                            Start
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-background/20 inline-flex p-4 rounded-full mb-4">
                    <i className="bx bx-calendar text-3xl text-text-muted"></i>
                  </div>
                  <h3 className="text-xl font-medium mb-2">No upcoming assessments</h3>
                  <p className="text-text-muted mb-4">Schedule an assessment to start measuring your team's maturity</p>
                  <Button className="bg-primary hover:bg-primary/90">
                    <i className="bx bx-plus mr-2"></i>
                    Schedule Assessment
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="inProgress" className="mt-6">
              {loadingAssessments ? (
                <div className="flex justify-center py-8">
                  <div className="spinner"></div>
                </div>
              ) : inProgressAssessments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgressAssessments.map(assessment => (
                    <Card 
                      key={assessment.id} 
                      className={cn(
                        "border-0",
                        glassmorphismStyles.card
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl">{assessment.name}</CardTitle>
                          {getStatusBadge(assessment.status)}
                        </div>
                        <CardDescription>
                          Started on {assessment.createdAt ? formatDate(assessment.createdAt) : "N/A"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm mb-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-text-muted">Dimension:</span>
                            <span className="font-medium">
                              {assessment.dimensionId === 1 ? "Automation Intelligence" : 
                               assessment.dimensionId === 2 ? "Development-Testing Synergy" : 
                               assessment.dimensionId === 3 ? "AI-Augmented QE" : 
                               assessment.dimensionId === 4 ? "Continuous Quality" : 
                               `Dimension ${assessment.dimensionId}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Template:</span>
                            <span className="font-medium">
                              {templates?.find(t => t.id === assessment.templateId)?.name || `Template ${assessment.templateId}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button className="flex-1 bg-primary hover:bg-primary/90">
                            <i className="bx bx-edit mr-1"></i>
                            Continue
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-background/20 inline-flex p-4 rounded-full mb-4">
                    <i className="bx bx-edit text-3xl text-text-muted"></i>
                  </div>
                  <h3 className="text-xl font-medium mb-2">No assessments in progress</h3>
                  <p className="text-text-muted mb-4">Start an assessment to begin the evaluation process</p>
                  <Button className="bg-primary hover:bg-primary/90">
                    <i className="bx bx-plus mr-2"></i>
                    New Assessment
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-6">
              {loadingAssessments ? (
                <div className="flex justify-center py-8">
                  <div className="spinner"></div>
                </div>
              ) : completedAssessments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedAssessments.map(assessment => (
                    <Card 
                      key={assessment.id} 
                      className={cn(
                        "border-0",
                        glassmorphismStyles.card
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl">{assessment.name}</CardTitle>
                          {getStatusBadge(assessment.status)}
                        </div>
                        <CardDescription>
                          Completed on {assessment.completedDate ? formatDate(assessment.completedDate) : "N/A"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm mb-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-text-muted">Dimension:</span>
                            <span className="font-medium">
                              {assessment.dimensionId === 1 ? "Automation Intelligence" : 
                               assessment.dimensionId === 2 ? "Development-Testing Synergy" : 
                               assessment.dimensionId === 3 ? "AI-Augmented QE" : 
                               assessment.dimensionId === 4 ? "Continuous Quality" : 
                               `Dimension ${assessment.dimensionId}`}
                            </span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-text-muted">Template:</span>
                            <span className="font-medium">
                              {templates?.find(t => t.id === assessment.templateId)?.name || `Template ${assessment.templateId}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Score:</span>
                            <span className="font-medium">{assessment.scorePercent || 0}%</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" className="flex-1">
                            <i className="bx bx-file mr-1"></i>
                            View Report
                          </Button>
                          <Button className="flex-1 bg-primary hover:bg-primary/90">
                            <i className="bx bx-share mr-1"></i>
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-background/20 inline-flex p-4 rounded-full mb-4">
                    <i className="bx bx-check-circle text-3xl text-text-muted"></i>
                  </div>
                  <h3 className="text-xl font-medium mb-2">No completed assessments</h3>
                  <p className="text-text-muted mb-4">Complete an assessment to see your results here</p>
                  <Button className="bg-primary hover:bg-primary/90">
                    <i className="bx bx-plus mr-2"></i>
                    New Assessment
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="templates" className="mt-6">
              {loadingTemplates ? (
                <div className="flex justify-center py-8">
                  <div className="spinner"></div>
                </div>
              ) : templates && templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map(template => (
                    <Card 
                      key={template.id} 
                      className={cn(
                        "border-0",
                        glassmorphismStyles.card
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl">{template.name}</CardTitle>
                          <Badge className="bg-purple-600/20 text-purple-500 hover:bg-purple-600/30 border-purple-500/30">
                            Template
                          </Badge>
                        </div>
                        <CardDescription>
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm mb-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-text-muted">Dimension:</span>
                            <span className="font-medium">
                              {template.dimensionId === 1 ? "Automation Intelligence" : 
                               template.dimensionId === 2 ? "Development-Testing Synergy" : 
                               template.dimensionId === 3 ? "AI-Augmented QE" : 
                               template.dimensionId === 4 ? "Continuous Quality" : 
                               `Dimension ${template.dimensionId}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Questions:</span>
                            <span className="font-medium">
                              {(template.criteria as any[])?.length || 0} questions
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" className="flex-1">
                            <i className="bx bx-edit mr-1"></i>
                            Edit
                          </Button>
                          <Button className="flex-1 bg-primary hover:bg-primary/90">
                            <i className="bx bx-play mr-1"></i>
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-background/20 inline-flex p-4 rounded-full mb-4">
                    <i className="bx bx-clipboard text-3xl text-text-muted"></i>
                  </div>
                  <h3 className="text-xl font-medium mb-2">No assessment templates</h3>
                  <p className="text-text-muted mb-4">Create a template to standardize your assessment process</p>
                  <Button className="bg-primary hover:bg-primary/90">
                    <i className="bx bx-plus mr-2"></i>
                    Create Template
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}