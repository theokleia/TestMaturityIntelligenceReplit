import { Switch, Route, Redirect } from "wouter";
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
import ATMF from "@/pages/atmf";
import Projects from "@/pages/projects";
import Settings from "@/pages/settings";
import ProjectHealth from "@/pages/project-health";
import TestFetch from "@/pages/test-fetch";
import AuthPage from "@/pages/auth-page";
import Documenter from "@/pages/documenter";
import Layout from "@/components/layout/layout";
import { ProjectProvider } from "@/context/ProjectContext";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Router component for application routes
function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/assessments" component={Assessments} />
      <ProtectedRoute path="/ai-insights" component={AiInsights} />
      <ProtectedRoute path="/test-management" component={TestManagement} />
      <ProtectedRoute path="/test-execution" component={TestExecutionRefactored} />
      <ProtectedRoute path="/test-execution-old" component={TestExecution} />
      <ProtectedRoute path="/projects" component={Projects} />
      <ProtectedRoute path="/project-health" component={ProjectHealth} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/design-system" component={DesignSystem} />
      <ProtectedRoute path="/documenter" component={Documenter} />
      <ProtectedRoute path="/atmf" component={ATMF} />
      {/* Redirect old documentation path to new ATMF path */}
      <Route path="/documentation">
        {() => <Redirect to="/atmf" />}
      </Route>
      <ProtectedRoute path="/test-fetch" component={TestFetch} />
      {/* Auth route is public */}
      <Route path="/auth" component={AuthPage} />
      {/* Catch-all route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// App content with conditional layout
function AppContent() {
  const { user, isLoading } = useAuth();

  // If loading, show minimal loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated, render the router directly (no layout)
  if (!user) {
    return <Router />;
  }

  // If authenticated, wrap content in layout
  return (
    <ProjectProvider>
      <Layout>
        <Router />
      </Layout>
    </ProjectProvider>
  );
}

// Main App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;