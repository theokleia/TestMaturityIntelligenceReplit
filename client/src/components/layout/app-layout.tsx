import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  hideHeader?: boolean;
}

export function AppLayout({ children, pageTitle = "ATMF Insight Navigator", hideHeader = false }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {!hideHeader && <Header title={pageTitle} />}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}