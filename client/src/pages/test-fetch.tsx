import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { PageContainer } from "@/components/design-system/page-container";
import { ATMFCard, ATMFCardHeader, ATMFCardBody, ATMFCardFooter } from "@/components/design-system/atmf-card";
import { Button } from "@/components/ui/button";
import { Project } from "@/context/ProjectContext";

export default function TestFetch() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Projects data:", data);
        setProjects(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(`Error fetching projects: ${err?.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const refreshProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Refreshed projects data:", data);
      setProjects(data);
      setError(null);
    } catch (err: any) {
      console.error("Error refreshing projects:", err);
      setError(`Error refreshing projects: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <PageContainer 
        title="API Test" 
        subtitle="Testing direct API fetch for projects"
        actions={
          <Button onClick={refreshProjects} disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh Projects"}
          </Button>
        }
      >
        <ATMFCard>
          <ATMFCardHeader>
            <h2 className="text-xl font-bold">Projects Data</h2>
          </ATMFCardHeader>
          <ATMFCardBody>
            {isLoading ? (
              <div className="text-center py-4">Loading projects...</div>
            ) : error ? (
              <div className="text-red-500 py-4">{error}</div>
            ) : projects.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-atmf-muted mb-2">Found {projects.length} projects:</div>
                <pre className="bg-slate-900/50 p-4 rounded-md overflow-auto max-h-[400px] text-xs">
                  {JSON.stringify(projects, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center py-4">No projects found</div>
            )}
          </ATMFCardBody>
          <ATMFCardFooter>
            <div className="text-sm text-atmf-muted">
              This page directly fetches from the API without using context
            </div>
          </ATMFCardFooter>
        </ATMFCard>
      </PageContainer>
    </Layout>
  );
}