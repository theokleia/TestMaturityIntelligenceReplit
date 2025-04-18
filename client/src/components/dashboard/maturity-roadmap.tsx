import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMaturityRoadmap } from "@/hooks/use-ai-recommendations";
import { Spinner } from "@/components/ui/ui-spinner";
import type { MaturityDimension } from "@shared/schema";
import { useProject } from "@/context/ProjectContext";

interface MaturityRoadmapProps {
  dimensions: MaturityDimension[];
  className?: string;
}

export function MaturityRoadmap({ dimensions, className }: MaturityRoadmapProps) {
  const [selectedDimension, setSelectedDimension] = useState<number>(dimensions[0]?.id || 1);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id;
  
  const { data: roadmapData, isLoading, error } = useMaturityRoadmap(selectedDimension, currentLevel, projectId);
  
  const handleDimensionChange = (dimensionId: string) => {
    setSelectedDimension(parseInt(dimensionId));
  };

  return (
    <div className={`glassmorphism rounded-2xl border border-white/5 overflow-hidden ${className}`}>
      <div className="p-6 border-b border-white/5">
        <h2 className="text-xl font-heading font-bold">Maturity Roadmap</h2>
        <p className="text-text-muted mt-1">Plan your journey to higher maturity</p>
      </div>
      
      <div className="px-6 py-4 border-b border-white/5">
        <Tabs 
          defaultValue={selectedDimension.toString()} 
          onValueChange={handleDimensionChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 mb-6">
            {dimensions.map((dimension) => (
              <TabsTrigger 
                key={dimension.id} 
                value={dimension.id.toString()}
                className={`text-sm font-medium px-3 py-2 rounded-lg data-[state=active]:text-white`}
                style={{
                  '--tab-accent': dimension.color || '#8A56FF',
                } as React.CSSProperties}
              >
                {dimension.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {dimensions.map((dimension) => (
            <TabsContent key={dimension.id} value={dimension.id.toString()} className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{dimension.name}</h3>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Button
                      key={level}
                      variant={currentLevel === level ? "default" : "outline"}
                      className={`h-8 w-8 p-0 rounded-full ${
                        currentLevel === level 
                          ? `bg-[${dimension.color || '#8A56FF'}] hover:bg-[${dimension.color || '#8A56FF'}]/90` 
                          : 'bg-background'
                      }`}
                      onClick={() => setCurrentLevel(level)}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : error ? (
                <div className="text-center py-10 text-destructive">
                  <p>Unable to load roadmap.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : !roadmapData?.levels.length ? (
                <div className="text-center py-10 text-text-muted">
                  <p>No roadmap data available for this dimension.</p>
                </div>
              ) : (
                <div className="space-y-6 mt-6">
                  {roadmapData.levels.map((level) => (
                    <div key={level.level} className="relative">
                      <div className="flex items-start gap-4">
                        <div 
                          className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 font-medium"
                          style={{ backgroundColor: `${dimension.color || '#8A56FF'}20`, color: dimension.color || '#8A56FF' }}
                        >
                          {level.level}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-md font-bold mb-1">{level.name}</h4>
                          <p className="text-sm text-text-muted mb-2">{level.description}</p>
                          
                          <div className="pl-2 border-l-2 border-dashed border-white/10 mt-4 space-y-2">
                            {level.keyInitiatives.map((initiative, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <i className="bx bx-check-circle text-primary text-lg mt-0.5"></i>
                                <span className="text-sm">{initiative}</span>
                              </div>
                            ))}
                            <div className="flex items-center gap-2 text-xs text-text-muted mt-2">
                              <i className="bx bx-time"></i>
                              <span>Estimated timeframe: {level.estimatedTimeframe}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      <div className="p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-md font-bold">Need a customized roadmap?</h4>
            <p className="text-sm text-text-muted">Get a tailored maturity plan for your specific context</p>
          </div>
          <Button 
            className="rounded-lg bg-blue-500/20 text-white hover:bg-blue-500/30 border border-blue-500/30"
          >
            <i className="bx bx-customize mr-2"></i>
            Customize Roadmap
          </Button>
        </div>
      </div>
    </div>
  );
}