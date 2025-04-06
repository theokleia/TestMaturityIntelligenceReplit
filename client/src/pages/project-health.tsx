import Layout from "@/components/layout/layout";
import { PageContainer } from "@/components/design-system/page-container";
import { ProjectHealthDashboard } from "@/components/dashboards/project-health-dashboard";
import { AnimatedInsightsSidebar } from "@/components/dashboards/animated-insights-sidebar";
import { Button } from "@/components/ui/button";
import { useProject } from "@/context/ProjectContext";
import { BarChart3, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProjectHealthPage() {
  const { selectedProject, projects } = useProject();
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  
  // If no project is selected but projects exist, auto-select the first one
  useEffect(() => {
    // Check localStorage first
    const storedProjectId = localStorage.getItem('selectedProjectId');
    
    if (storedProjectId) {
      console.log("Found stored project ID:", storedProjectId);
    } else if (projects && projects.length > 0 && !selectedProject) {
      console.log("No project selected but projects exist, auto-refreshing");
      // Force a page reload after a short delay to ensure context updates properly
      const timer = setTimeout(() => {
        window.location.reload();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [selectedProject, projects]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    
    // Show toast notification
    toast({
      title: "Refreshing health data",
      description: "Updating project metrics and status indicators...",
      duration: 1500
    });
    
    // Simulate refresh - in a real app this would trigger an API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  return (
    <Layout>
      <PageContainer
        title="Project Health"
        subtitle="Monitor project quality, performance and risk factors in real-time"
        breadcrumb={selectedProject ? [
          { label: "Projects", href: "/projects" },
          { label: selectedProject.name, href: "#" },
          { label: "Health Dashboard", href: "/project-health" }
        ] : undefined}
        actions={
          <Button
            variant="outline"
            className="border-white/10 hover:bg-atmf-card hover:border-white/20 flex gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </Button>
        }
      >
        <div className="space-y-6">
          <ProjectHealthDashboard />
          
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Additional content can be added here in the future */}
          </div>
        </div>
      </PageContainer>
      
      {/* Animated Insights Sidebar */}
      {selectedProject && <AnimatedInsightsSidebar />}
    </Layout>
  );
}