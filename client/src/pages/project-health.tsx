import Layout from "@/components/layout/layout";
import { PageContainer } from "@/components/design-system/page-container";
import { ProjectHealthDashboard } from "@/components/dashboards/project-health-dashboard";
import { Button } from "@/components/ui/button";
import { useProject } from "@/context/ProjectContext";
import { BarChart3, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function ProjectHealthPage() {
  const { selectedProject } = useProject();
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setRefreshing(true);
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
    </Layout>
  );
}