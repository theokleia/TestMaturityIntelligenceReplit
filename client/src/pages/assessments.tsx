import { AppLayout } from "@/components/layout/app-layout";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ClipboardCheck, CheckCircle, AlertCircle } from "lucide-react";

// Sample assessment data - in a real app this would come from an API call
const upcomingAssessments = [
  {
    id: 1,
    name: "Quarterly Automation Intelligence Review",
    dimensionName: "Automation Intelligence",
    scheduledDate: "2025-04-15",
    status: "scheduled"
  },
  {
    id: 2,
    name: "Dev-Test Collaboration Assessment",
    dimensionName: "Development-Testing Synergy",
    scheduledDate: "2025-04-25",
    status: "scheduled"
  }
];

const completedAssessments = [
  {
    id: 3,
    name: "Baseline Automation Assessment",
    dimensionName: "Automation Intelligence",
    completedDate: "2025-03-10",
    score: 65,
    level: "Integration",
    status: "completed"
  },
  {
    id: 4,
    name: "AI-Quality Engineering Benchmark",
    dimensionName: "AI-Augment Quality Engineering",
    completedDate: "2025-02-20",
    score: 48,
    level: "Foundation",
    status: "completed"
  }
];

export default function Assessments() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6 p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Maturity Assessments</h1>
            <p className="text-muted-foreground mt-1">Evaluate your testing practices using the Adaptive Testing Maturity Framework</p>
          </div>
          <Button className="flex items-center space-x-2">
            <ClipboardCheck className="w-4 h-4" />
            <span>Start New Assessment</span>
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingAssessments.map(assessment => (
                <Card key={assessment.id} className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-white/20">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{assessment.name}</span>
                      {getStatusBadge(assessment.status)}
                    </CardTitle>
                    <CardDescription>{assessment.dimensionName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Scheduled for {assessment.scheduledDate}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Begin Assessment
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6 h-[220px]">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                </div>
                <p className="text-center text-muted-foreground mb-4">Schedule a new assessment for any dimension</p>
                <Button variant="outline">Schedule Assessment</Button>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="in-progress" className="mt-6">
            <div className="flex items-center justify-center border rounded-lg border-dashed p-8 h-64">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No assessments currently in progress</p>
                <Button variant="outline" className="mt-4">Start New Assessment</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedAssessments.map(assessment => (
                <Card key={assessment.id} className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-white/20">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{assessment.name}</span>
                      {getStatusBadge(assessment.status)}
                    </CardTitle>
                    <CardDescription>{assessment.dimensionName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span>Completed on {assessment.completedDate}</span>
                    </div>
                    <div className="flex items-center text-sm font-medium mb-4">
                      <span className="mr-2">Current Level:</span>
                      <Badge variant="outline" className="font-normal">{assessment.level}</Badge>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${assessment.score}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <span>Maturity Score: {assessment.score}%</span>
                      <span>Next Level: {assessment.score >= 80 ? "100%" : "80%"}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}