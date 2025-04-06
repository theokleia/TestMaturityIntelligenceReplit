import { AppLayout } from "@/components/layout/app-layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, ClipboardCheck, AlertCircle } from "lucide-react";
import { ATMFCard, ATMFCardHeader } from "@/components/design-system/atmf-card";
import { StatusBadge } from "@/components/design-system/status-badge";
import { TabView } from "@/components/design-system/tab-view";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { ProgressBar } from "@/components/design-system/progress-bar";
import { PageContainer, PageHeader, PageContent } from "@/components/design-system/page-container";

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

const inProgressAssessments = [
  {
    id: 2,
    name: "DevOps Testing Practices Assessment",
    dimensionName: "DevOps & CI/CD Integration",
    startedDate: "2025-04-01",
    progress: 45,
    status: "in-progress"
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

  // Define tab content separately
  const upcomingContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {upcomingAssessments.map(assessment => (
        <ATMFCard key={assessment.id} neonBorder="blue">
          {/* Card content remains the same */}
          <ATMFCardHeader 
            title={assessment.name}
            description={assessment.dimensionName}
            action={<StatusBadge variant="assessment" status={assessment.status} />}
            icon={
              <IconWrapper color="blue" size="lg" className="shrink-0">
                <Calendar className="w-6 h-6" />
              </IconWrapper>
            }
          />
        </ATMFCard>
      ))}
    </div>
  );

  const inProgressContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {inProgressAssessments.map(assessment => (
        <ATMFCard key={assessment.id} neonBorder="teal">
          {/* Card content remains the same */}
          <ATMFCardHeader 
            title={assessment.name}
            description={assessment.dimensionName}
            action={<StatusBadge variant="assessment" status={assessment.status} />}
            icon={
              <IconWrapper color="teal" size="lg" className="shrink-0">
                <ClipboardCheck className="w-6 h-6" />
              </IconWrapper>
            }
          />
        </ATMFCard>
      ))}
    </div>
  );
  
  const completedContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {completedAssessments.map(assessment => (
        <ATMFCard key={assessment.id} neonBorder="purple">
          <ATMFCardHeader 
            title={assessment.name}
            description={assessment.dimensionName}
            action={<StatusBadge variant="assessment" status={assessment.status} />}
            icon={
              <IconWrapper color="purple" size="lg" className="shrink-0">
                <CheckCircle className="w-6 h-6" />
              </IconWrapper>
            }
          />
          <div className="p-5">
            <div className="mb-4">
              <ProgressBar 
                value={assessment.score} 
                max={100} 
                color="purple" 
                size="md" 
                showLabel={true}
                label="Maturity Score" 
              />
            </div>
            <div className="text-sm flex justify-between text-atmf-muted">
              <span>Level: {assessment.level}</span>
              <span>Completed: {assessment.completedDate}</span>
            </div>
          </div>
        </ATMFCard>
      ))}
    </div>
  );

  const tabs = [
    { id: "upcoming", label: "Upcoming", content: upcomingContent },
    { id: "in-progress", label: "In Progress", content: inProgressContent },
    { id: "completed", label: "Completed", content: completedContent }
  ];

  return (
    <AppLayout>
      <PageContainer withPadding className="py-8">
        <PageHeader 
          title="Maturity Assessments"
          description="Evaluate your testing practices using the Adaptive Testing Maturity Framework"
          actions={
            <Button className="flex items-center space-x-2">
              <ClipboardCheck className="w-4 h-4" />
              <span>Start New Assessment</span>
            </Button>
          }
        />
        
        <PageContent>
          <TabView 
            tabs={tabs} 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            variant="underline"
          />
          
          {activeTab === "upcoming" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {upcomingAssessments.map(assessment => (
                <ATMFCard key={assessment.id} neonEffect="blue">
                  <ATMFCardHeader
                    title={assessment.name}
                    description={assessment.dimensionName}
                    action={<StatusBadge status={assessment.status} variant="assessment" />}
                  />
                  <div className="p-6">
                    <div className="flex items-center text-sm text-text-muted mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Scheduled for {assessment.scheduledDate}</span>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <Button variant="outline" className="w-full">
                      Begin Assessment
                    </Button>
                  </div>
                </ATMFCard>
              ))}
              
              <ATMFCard className="border-dashed flex flex-col items-center justify-center p-6 h-[220px]">
                <IconWrapper color="primary" size="lg" className="mb-4">
                  <ClipboardCheck className="w-5 h-5" />
                </IconWrapper>
                <p className="text-center text-text-muted mb-4">Schedule a new assessment for any dimension</p>
                <Button variant="outline">Schedule Assessment</Button>
              </ATMFCard>
            </div>
          )}
          
          {activeTab === "in-progress" && (
            <div className="flex items-center justify-center border rounded-lg border-dashed p-8 h-64 mt-6">
              <div className="text-center">
                <IconWrapper color="warning" size="lg" className="mx-auto mb-4">
                  <AlertCircle className="w-5 h-5" />
                </IconWrapper>
                <p className="text-text-muted">No assessments currently in progress</p>
                <Button variant="outline" className="mt-4">Start New Assessment</Button>
              </div>
            </div>
          )}
          
          {activeTab === "completed" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {completedAssessments.map(assessment => (
                <ATMFCard key={assessment.id} neonEffect="blue">
                  <ATMFCardHeader
                    title={assessment.name}
                    description={assessment.dimensionName}
                    action={<StatusBadge status={assessment.status} variant="assessment" />}
                  />
                  <div className="p-6">
                    <div className="flex items-center text-sm text-text-muted mb-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span>Completed on {assessment.completedDate}</span>
                    </div>
                    <div className="flex items-center text-sm font-medium mb-4">
                      <span className="mr-2">Current Level:</span>
                      <StatusBadge status={assessment.level} variant="assessment" />
                    </div>
                    <ProgressBar 
                      value={assessment.score} 
                      max={100} 
                      color="blue" 
                      size="sm"
                      showLabel
                      label={`Maturity Score: ${assessment.score}%`}
                    />
                  </div>
                  <div className="px-6 pb-6">
                    <Button variant="outline" className="w-full">View Details</Button>
                  </div>
                </ATMFCard>
              ))}
            </div>
          )}
        </PageContent>
      </PageContainer>
    </AppLayout>
  );
}