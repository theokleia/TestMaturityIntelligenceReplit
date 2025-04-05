import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { AppLayout } from "@/components/layout/app-layout";
import { LucideActivity, LucideAperture, LucideBellRing, LucideBolt, LucideCalendar, LucideHourglass, LucidePipette, LucideZap } from "lucide-react";

// Define interfaces for data structures
interface Recommendation {
  id: string;
  title: string;
  description: string;
  recommendations: string[];
  icon: React.ReactNode;
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
      icon: <LucideZap className="w-6 h-6 text-blue-400" />
    },
    {
      id: "2",
      title: "Shift-Left Opportunity",
      description: "Based on your development workflow patterns, there are opportunities to implement testing earlier.",
      recommendations: [
        "Integrate API contract testing before implementation",
        "Add unit test templates to your code generation process"
      ],
      icon: <LucideAperture className="w-6 h-6 text-purple-400" />
    },
    {
      id: "3",
      title: "Defect Prediction",
      description: "Based on historical data, the following areas are likely to experience issues in the next release.",
      recommendations: [
        "Focus testing efforts on the payment processing module",
        "Add exploratory testing sessions for the user profile features"
      ],
      icon: <LucideBellRing className="w-6 h-6 text-indigo-400" />
    },
    {
      id: "4",
      title: "Pipeline Performance",
      description: "Your test pipeline efficiency could be improved to reduce overall build times.",
      recommendations: [
        "Parallelize integration test execution",
        "Implement test selection for faster feedback loops"
      ],
      icon: <LucidePipette className="w-6 h-6 text-blue-300" />
    }
  ];
  
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {keyInsights.map((insight) => (
        <div 
          key={insight.id} 
          className="p-6 rounded-xl glassmorphism flex flex-col relative overflow-hidden"
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
            <LucideActivity className="h-4 w-4" />
          </Button>
          
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              {insight.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">{insight.title}</h3>
              <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
            </div>
          </div>
          
          <div className="mt-2">
            <h4 className="text-sm font-medium text-gray-200 mb-2">Recommendations:</h4>
            <ul className="space-y-2">
              {insight.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-gray-300 pl-4 border-l border-blue-500/30">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-auto pt-4">
            <Button 
              variant="outline" 
              className="w-full justify-center bg-black/20 border-white/10 hover:bg-black/30"
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
        </div>
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
  
  const getLevelColor = (level: string) => {
    switch(level) {
      case "High": return "text-red-400";
      case "Medium": return "text-yellow-400";
      case "Low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-xl glassmorphism flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Test Flakiness Prediction</h3>
          <p className="text-sm text-gray-300 mb-4">Based on execution patterns, these tests are likely to become flaky:</p>
          
          <div className="space-y-2 flex-1">
            {flakiness.map((file, idx) => (
              <div key={idx} className="p-2 rounded bg-black/20 text-sm text-blue-100 font-mono">
                {file.name}
              </div>
            ))}
          </div>
          
          <div className="mt-auto pt-4">
            <Button 
              variant="outline" 
              className="w-full justify-center bg-black/20 border-white/10 hover:bg-black/30"
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
        </div>
        
        <div className="p-6 rounded-xl glassmorphism flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Release Risk Assessment</h3>
          <p className="text-sm text-gray-300 mb-4">The upcoming release has the following risk profile:</p>
          
          <div className="space-y-3 flex-1">
            {risks.map((risk, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm text-gray-200">{risk.area}</span>
                <span className={`text-sm font-medium ${getLevelColor(risk.level)}`}>
                  {risk.level} risk
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-auto pt-4">
            <Button 
              variant="outline" 
              className="w-full justify-center bg-black/20 border-white/10 hover:bg-black/30"
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
        </div>
      </div>
      
      <div className="p-6 rounded-xl glassmorphism">
        <h3 className="text-lg font-semibold text-white mb-4">Long-term Trend Prediction</h3>
        
        <div className="flex items-center justify-center h-40 bg-black/20 rounded-lg">
          <div className="text-center text-gray-400">
            <LucideCalendar className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p>Trend visualization coming soon</p>
          </div>
        </div>
      </div>
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
      <div className="p-6 rounded-xl glassmorphism">
        <h3 className="text-lg font-semibold text-white mb-4">AI System Activity</h3>
        
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex justify-between items-center py-3 border-b border-white/10">
              <div>
                <h4 className="font-medium text-white">{activity.title}</h4>
                <p className="text-sm text-gray-400">Module: {activity.module}</p>
              </div>
              
              <div className="flex gap-3 items-center">
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <LucideHourglass className="h-4 w-4" />
                  <span className="sr-only">View details</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            className="w-full justify-center bg-black/20 border-white/10 hover:bg-black/30"
          >
            View All Activity
          </Button>
        </div>
      </div>
      
      <div className="p-6 rounded-xl glassmorphism">
        <h3 className="text-lg font-semibold text-white mb-4">AI Learning Progress</h3>
        
        <div className="space-y-6">
          {learningProgress.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">{item.area}</span>
                <span className="text-sm text-gray-400">{item.progress}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main AI Insights Page Component
export default function AiInsights() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Header title="AI Insights" className="mb-1" />
            <p className="text-gray-400 text-sm">
              AI-powered analytics and recommendations to enhance your testing maturity
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-black/20 border-white/10 hover:bg-black/30"
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
        </div>
        
        <Tabs defaultValue="key-insights" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md mb-6">
            <TabsTrigger value="key-insights">Key Insights</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="key-insights" className="mt-0">
            <KeyInsightsTab />
          </TabsContent>
          
          <TabsContent value="predictions" className="mt-0">
            <PredictionsTab />
          </TabsContent>
          
          <TabsContent value="activity" className="mt-0">
            <ActivityTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}