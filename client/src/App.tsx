import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Assessments from "@/pages/assessments";
import AiInsights from "@/pages/ai-insights";
import TestManagement from "@/pages/test-management";
import DesignSystem from "@/pages/design-system";
import { PageBackground } from "@/components/design-system/background";

// Layout component that includes the app's main background and navigation
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageBackground variant="default">
      {/* Navigation could be added here */}
      <div className="min-h-screen">
        {children}
      </div>
    </PageBackground>
  );
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/assessments" component={Assessments} />
        <Route path="/ai-insights" component={AiInsights} />
        <Route path="/test-management" component={TestManagement} />
        <Route path="/design-system" component={DesignSystem} />
        {/* Additional routes go here */}
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
