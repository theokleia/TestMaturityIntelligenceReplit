import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MaturityLevel, MaturityDimension, Metric, Recommendation } from "@shared/schema";
import { PageContainer } from "@/components/design-system/page-container";
import { MaturityCard } from "@/components/dashboard/maturity-card";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { InsightCard } from "@/components/dashboard/insight-card";
import { AiRecommendation, AiAnalysisCard } from "@/components/dashboard/ai-recommendation";
import { InteractiveMindmap } from "@/components/dashboard/interactive-mindmap";
import { MaturityRoadmap } from "@/components/dashboard/maturity-roadmap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [activeDimension, setActiveDimension] = useState<number>(1); // Default to first dimension
  const [activeSecondaryTab, setActiveSecondaryTab] = useState<string>("maturity"); // Default to maturity levels
  
  // Fetch maturity dimensions
  const { data: dimensions } = useQuery<MaturityDimension[]>({
    queryKey: ['/api/dimensions'],
  });
  
  // Fetch maturity levels for the active dimension
  const { data: levels } = useQuery<MaturityLevel[]>({
    queryKey: ['/api/levels', { dimensionId: activeDimension }],
    enabled: !!activeDimension,
  });
  
  // Fetch metrics
  const { data: metricsData } = useQuery<Metric[]>({
    queryKey: ['/api/metrics'],
  });
  
  // Fetch recommendations
  const { data: recommendationsData } = useQuery<Recommendation[]>({
    queryKey: ['/api/recommendations'],
  });

  const activeDimensionData = dimensions?.find(d => d.id === activeDimension);
  
  return (
    <PageContainer
      title="ATMF Dashboard"
      subtitle="Track and improve your testing maturity across all dimensions"
      withPadding
    >  
      {/* Dimension Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-white/10">
          {dimensions?.map((dimension) => (
            <button
              key={dimension.id}
              className={`px-6 py-3 font-medium relative inline-flex items-center justify-center ${
                dimension.id === activeDimension
                  ? "text-primary"
                  : "text-text-muted"
              }`}
              onClick={() => setActiveDimension(dimension.id)}
            >
              {dimension.name}
              {dimension.id === activeDimension && (
                <div
                  className="tab-indicator absolute bottom-0 left-0 w-full"
                  style={{ backgroundColor: dimension.color || "var(--primary)", height: "2px" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
        
      {/* Dimension Content */}
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-heading font-bold mb-2">
            {activeDimensionData?.name || "Loading..."}
          </h2>
          <p className="text-text-muted">
            {activeDimensionData?.description || "Loading dimension details..."}
          </p>
        </div>
        
        {/* Secondary Tabs */}
        <div className="mb-8">
          <div className="flex space-x-6 text-sm">
            <button 
              className={`px-1 py-2 font-medium border-b-2 ${
                activeSecondaryTab === "maturity" 
                  ? "text-primary border-primary" 
                  : "text-text-muted border-transparent"
              }`}
              onClick={() => setActiveSecondaryTab("maturity")}
            >
              Maturity Levels
            </button>
            <button 
              className={`px-1 py-2 font-medium border-b-2 ${
                activeSecondaryTab === "recommendations" 
                  ? "text-primary border-primary" 
                  : "text-text-muted border-transparent"
              }`}
              onClick={() => setActiveSecondaryTab("recommendations")}
            >
              Recommendations
            </button>
            <button 
              className={`px-1 py-2 font-medium border-b-2 ${
                activeSecondaryTab === "mindmap" 
                  ? "text-primary border-primary" 
                  : "text-text-muted border-transparent"
              }`}
              onClick={() => setActiveSecondaryTab("mindmap")}
            >
              Interactive Mindmap
            </button>
          </div>
        </div>
        
        {/* Maturity Levels */}
        {activeSecondaryTab === "maturity" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels?.map((level) => (
              <MaturityCard 
                key={level.id} 
                level={level} 
                isHighlighted={level.level === 3} // Highlight level 3 as in the design
              />
            ))}
          </div>
        )}
        
        {/* AI Recommendations */}
        {activeSecondaryTab === "recommendations" && (
          <div>
            <div className="glassmorphism rounded-2xl p-6 mb-6 border border-primary-purple/20 neon-border-purple">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-[#8A56FF]/20 flex items-center justify-center flex-shrink-0">
                  <i className="bx bx-bulb text-lg text-[#8A56FF]"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-heading font-bold mb-2">AI Recommendation</h3>
                  <p className="text-text-muted text-sm mb-3">Based on your recent test results, consider implementing automated regression tests for your API endpoints to improve coverage.</p>
                  <div className="flex items-center space-x-3">
                    <Button className="px-3 py-1.5 rounded-lg bg-[#8A56FF]/20 text-[#8A56FF] text-sm">Implement</Button>
                    <Button variant="secondary" className="px-3 py-1.5 rounded-lg bg-white/5 text-text-muted text-sm">Dismiss</Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glassmorphism rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-heading font-bold mb-4">Test Prioritization</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-[#2FFFAA]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="bx bx-check text-[#2FFFAA]"></i>
                    </div>
                    <span className="ml-2 text-sm">Prioritize API integration tests</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-[#FFBB3A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="bx bx-time text-[#FFBB3A]"></i>
                    </div>
                    <span className="ml-2 text-sm">Focus on payment processing module</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-text-muted/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="bx bx-minus text-text-muted"></i>
                    </div>
                    <span className="ml-2 text-sm">Reduce redundant UI tests</span>
                  </li>
                </ul>
              </div>
              
              <div className="glassmorphism rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-heading font-bold mb-4">Defect Prediction</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Authentication Module</span>
                    <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-1/4 bg-[#2FFFAA] rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Processing</span>
                    <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-[#FF4A6B] rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Profile</span>
                    <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-2/4 bg-[#FFBB3A] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Interactive Mindmap */}
        {activeSecondaryTab === "mindmap" && (
          <InteractiveMindmap />
        )}
      </div>
      
      {/* Metrics Overview */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold">Metrics Overview</h2>
          <Button variant="link" className="text-sm text-primary flex items-center">
            View All
            <i className="bx bx-chevron-right ml-1"></i>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metricsData?.slice(0, 3).map((metric) => (
            <MetricsCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
      
      {/* AI Insights */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold">AI-Generated Insights</h2>
          <Button variant="link" className="text-sm text-primary flex items-center">
            View All
            <i className="bx bx-chevron-right ml-1"></i>
          </Button>
        </div>
        
        {recommendationsData?.slice(0, 1).map((insight) => (
          <InsightCard 
            key={insight.id} 
            insight={insight} 
            type="teal"
            className="mb-6" 
          />
        ))}
      </div>
      
      {/* Maturity Roadmap */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold">Maturity Planning</h2>
          <Button variant="link" className="text-sm text-primary flex items-center">
            Export Plan
            <i className="bx bx-download ml-1"></i>
          </Button>
        </div>
        
        {dimensions && dimensions.length > 0 && (
          <MaturityRoadmap dimensions={dimensions} />
        )}
      </div>
      </PageContainer>
  );
}
