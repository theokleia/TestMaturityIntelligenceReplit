import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Assessments from "@/pages/assessments";
import AiInsights from "@/pages/ai-insights";
import TestManagement from "@/pages/test-management";
import DesignSystem from "@/pages/design-system";
import Documentation from "@/pages/documentation";
import Projects from "@/pages/projects";
import Settings from "@/pages/settings";
import ProjectHealth from "@/pages/project-health";
import TestFetch from "@/pages/test-fetch";
import Layout from "@/components/layout/layout";
import { ProjectProvider } from "@/context/ProjectContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/assessments" component={Assessments} />
      <Route path="/ai-insights" component={AiInsights} />
      <Route path="/test-management" component={TestManagement} />
      <Route path="/projects" component={Projects} />
      <Route path="/project-health" component={ProjectHealth} />
      <Route path="/settings" component={Settings} />
      <Route path="/design-system" component={DesignSystem} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/test-fetch" component={TestFetch} />
      {/* Additional routes go here */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <Layout>
          <Router />
        </Layout>
      </ProjectProvider>
    </QueryClientProvider>
  );
}

export default App;
