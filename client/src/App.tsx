import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Assessments from "@/pages/assessments";
import AiInsights from "@/pages/ai-insights";
import TestManagement from "@/pages/test-management";
import TestExecution from "@/pages/test-execution";
import TestExecutionRefactored from "@/pages/test-execution-refactored";
import DesignSystem from "@/pages/design-system";
import Documentation from "@/pages/documentation";
import Projects from "@/pages/projects";
import Settings from "@/pages/settings";
import ProjectHealth from "@/pages/project-health";
import TestFetch from "@/pages/test-fetch";
import AuthPage from "@/pages/auth-page";
import Layout from "@/components/layout/layout";
import { ProjectProvider } from "@/context/ProjectContext";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/assessments" component={Assessments} />
      <ProtectedRoute path="/ai-insights" component={AiInsights} />
      <ProtectedRoute path="/test-management" component={TestManagement} />
      {/* Using the refactored component for the main test execution route */}
      <ProtectedRoute path="/test-execution" component={TestExecutionRefactored} />
      {/* Keeping the old route for reference until we're sure the refactored version works properly */}
      <ProtectedRoute path="/test-execution-old" component={TestExecution} />
      <ProtectedRoute path="/projects" component={Projects} />
      <ProtectedRoute path="/project-health" component={ProjectHealth} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/design-system" component={DesignSystem} />
      <ProtectedRoute path="/documentation" component={Documentation} />
      <ProtectedRoute path="/test-fetch" component={TestFetch} />
      {/* Auth route is public */}
      <Route path="/auth" component={AuthPage} />
      {/* Additional routes go here */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProjectProvider>
          <Layout>
            <Router />
          </Layout>
        </ProjectProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
