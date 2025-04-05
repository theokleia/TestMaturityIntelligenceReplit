import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  Activity, 
  Aperture, 
  BellRing, 
  Bolt, 
  Calendar, 
  Hourglass, 
  Pipette, 
  Zap 
} from "lucide-react";
import { ATMFCard, ATMFCardHeader } from "@/components/design-system/atmf-card";
import { TabView } from "@/components/design-system/tab-view";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { ProgressBar } from "@/components/design-system/progress-bar";
import { 
  PageContainer, 
  PageHeader, 
  PageBody, 
  PageSection 
} from "@/components/design-system/page-container";

// Define interfaces for data structures
interface Recommendation {
  id: string;
  title: string;
  description: string;
  recommendations: string[];
  icon: React.ReactNode;
  color: "blue" | "purple" | "teal";
  type?: string;
}

interface TestRisk {
  area: string;
  level: "High" | "Medium" | "Low";
}

interface TestFile {
  name: string;
}

interface ActivityItem {
  id: string;
  title: string;
  module: string;
  timestamp?: string;
}

interface LearningProgress {
  area: string;
  progress: number;
}

// Key Insights Tab Component
function KeyInsightsTab() {
  const keyInsights: Recommendation[] = [
    {
      id: "1",
      title: "Test Coverage Gap Analysis",
      description: "AI has detected potential gaps in your automation test coverage based on recent code changes.",
      recommendations: [
        "Increase test coverage for user authentication flows",
        "Add UI regression tests for the recently updated dashboard components"
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "blue"
    },
    {
      id: "2",
      title: "Shift-Left Opportunity",
      description: "Based on your development workflow patterns, there are opportunities to implement testing earlier.",
      recommendations: [
        "Integrate API contract testing before implementation",
        "Add unit test templates to your code generation process"
      ],
      icon: <Aperture className="w-6 h-6" />,
      color: "purple"
    },
    {
      id: "3",
      title: "Defect Prediction",
      description: "Based on historical data, the following areas are likely to experience issues in the next release.",
      recommendations: [
        "Focus testing efforts on the payment processing module",
        "Add exploratory testing sessions for the user profile features"
      ],
      icon: <BellRing className="w-6 h-6" />,
      color: "purple"
    },
    {
      id: "4",
      title: "Pipeline Performance",
      description: "Your test pipeline efficiency could be improved to reduce overall build times.",
      recommendations: [
        "Parallelize integration test execution",
        "Implement test selection for faster feedback loops"
      ],
      icon: <Pipette className="w-6 h-6" />,
      color: "teal"
    }
  ];
  
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {keyInsights.map((insight) => (
        <ATMFCard 
          key={insight.id} 
          neonEffect={insight.color}
          className="relative overflow-hidden"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 opacity-50 hover:opacity-100"
            onClick={() => {
              toast({
                title: "Info",
                description: `Marked "${insight.title}" as read`,
              });
            }}
          >
            <span className="sr-only">Mark as read</span>
            <Activity className="h-4 w-4" />
          </Button>
          
          <ATMFCardHeader
            icon={
              <IconWrapper color={insight.color} size="md">
                {insight.icon}
              </IconWrapper>
            }
            title={insight.title}
            description={insight.description}
          />
          
          <div className="px-6 pb-4">
            <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
            <ul className="space-y-2">
              {insight.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-text-muted pl-4 border-l border-primary/30">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="px-6 pb-6">
            <Button 
              variant="outline" 
              className="w-full justify-center"
              onClick={() => {
                toast({
                  title: "Action",
                  description: `Applied recommendations for "${insight.title}"`,
                });
              }}
            >
              Apply Recommendations
            </Button>
          </div>
        </ATMFCard>
      ))}
    </div>
  );
}

// Predictions Tab Component
function PredictionsTab() {
  const flakiness: TestFile[] = [
    { name: "UserAuth.test.js" },
    { name: "DataProcessing.test.js" },
    { name: "ApiIntegration.test.js" }
  ];
  
  const risks: TestRisk[] = [
    { area: "Payment module", level: "Medium" },
    { area: "User profile features", level: "High" },
    { area: "Reporting module", level: "Low" }
  ];
  
  const { toast } = useToast();
  
  const getLevelColor = (level: string): "success" | "warning" | "danger" | "muted" => {
    switch(level) {
      case "High": return "danger";
      case "Medium": return "warning";
      case "Low": return "success";
      default: return "muted";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ATMFCard neonEffect="blue">
          <ATMFCardHeader
            title="Test Flakiness Prediction"
          />
          <div className="px-6 pb-4">
            <p className="text-sm text-text-muted mb-4">Based on execution patterns, these tests are likely to become flaky:</p>
            
            <div className="space-y-2">
              {flakiness.map((file, idx) => (
                <div key={idx} className="p-2 rounded bg-black/20 text-sm font-mono">
                  {file.name}
                </div>
              ))}
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <Button 
              variant="outline" 
              className="w-full justify-center"
              onClick={() => {
                toast({
                  title: "Action",
                  description: "Prioritized flaky tests for refactoring",
                });
              }}
            >
              Prioritize Refactoring
            </Button>
          </div>
        </ATMFCard>
        
        <ATMFCard neonEffect="purple">
          <ATMFCardHeader
            title="Release Risk Assessment"
          />
          <div className="px-6 pb-4">
            <p className="text-sm text-text-muted mb-4">The upcoming release has the following risk profile:</p>
            
            <div className="space-y-3">
              {risks.map((risk, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm">{risk.area}</span>
                  <IconWrapper color={getLevelColor(risk.level)} size="xs">
                    <span className="text-xs font-medium px-1">
                      {risk.level} risk
                    </span>
                  </IconWrapper>
                </div>
              ))}
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <Button 
              variant="outline" 
              className="w-full justify-center"
              onClick={() => {
                toast({
                  title: "Action",
                  description: "Generated mitigation plan for high-risk areas",
                });
              }}
            >
              Generate Mitigation Plan
            </Button>
          </div>
        </ATMFCard>
      </div>
      
      <ATMFCard neonEffect="teal">
        <ATMFCardHeader
          title="Long-term Trend Prediction"
        />
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center h-40 bg-black/20 rounded-lg">
            <div className="text-center text-text-muted">
              <IconWrapper color="muted" size="lg" className="mx-auto mb-2">
                <Calendar className="h-6 w-6" />
              </IconWrapper>
              <p>Trend visualization coming soon</p>
            </div>
          </div>
        </div>
      </ATMFCard>
    </div>
  );
}

// Activity Tab Component
function ActivityTab() {
  const activities: ActivityItem[] = [
    { id: "1", title: "Generated New Insight", module: "Test Coverage Analysis", timestamp: "2 hours ago" },
    { id: "2", title: "Updated Prediction Model", module: "Defect Prediction", timestamp: "1 day ago" },
    { id: "3", title: "Detected New Pattern", module: "Pipeline Optimization", timestamp: "3 days ago" }
  ];
  
  const learningProgress: LearningProgress[] = [
    { area: "Test Pattern Recognition", progress: 78 },
    { area: "Defect Prediction Accuracy", progress: 65 },
    { area: "Code Quality Analysis", progress: 42 }
  ];

  return (
    <div className="space-y-6">
      <ATMFCard>
        <ATMFCardHeader
          title="AI System Activity"
        />
        <div className="px-6 pb-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex justify-between items-center py-3 border-b border-white/10">
                <div>
                  <h4 className="font-medium">{activity.title}</h4>
                  <p className="text-sm text-text-muted">Module: {activity.module}</p>
                </div>
                
                <div className="flex gap-3 items-center">
                  <span className="text-xs text-text-muted">{activity.timestamp}</span>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Hourglass className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="px-6 pb-6">
          <Button 
            variant="outline" 
            className="w-full justify-center"
          >
            View All Activity
          </Button>
        </div>
      </ATMFCard>
      
      <ATMFCard>
        <ATMFCardHeader
          title="AI Learning Progress"
        />
        <div className="px-6 pb-6">
          <div className="space-y-6">
            {learningProgress.map((item, idx) => (
              <div key={idx}>
                <ProgressBar
                  value={item.progress}
                  max={100}
                  color={idx % 3 === 0 ? "blue" : idx % 3 === 1 ? "purple" : "teal"}
                  size="sm"
                  showLabel
                  label={item.area}
                />
              </div>
            ))}
          </div>
        </div>
      </ATMFCard>
    </div>
  );
}

// Main AI Insights Page Component
export default function AiInsights() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("key-insights");
  
  const tabs = [
    { id: "key-insights", label: "Key Insights" },
    { id: "predictions", label: "Predictions" },
    { id: "activity", label: "Recent Activity" }
  ];
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Refreshed",
        description: "AI insights have been updated with the latest data",
      });
    }, 1500);
  };

  return (
    <AppLayout>
      <PageContainer withPadding className="py-8">
        <PageHeader 
          title="AI Insights"
          description="AI-powered analytics and recommendations to enhance your testing maturity"
          actions={
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <div className="spinner mr-2 h-4 w-4"></div>
                  Refreshing...
                </>
              ) : (
                <>Refresh Insights</>
              )}
            </Button>
          }
        />
        
        <PageBody>
          <TabView 
            tabs={tabs} 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            variant="underline"
          />
          
          <div className="mt-6">
            {activeTab === "key-insights" && <KeyInsightsTab />}
            {activeTab === "predictions" && <PredictionsTab />}
            {activeTab === "activity" && <ActivityTab />}
          </div>
        </PageBody>
      </PageContainer>
    </AppLayout>
  );
}