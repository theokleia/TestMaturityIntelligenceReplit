import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout component that provides consistent app structure with sidebar
 * navigation and proper background styling
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-atmf-main bg-dashboard-gradient text-atmf-primary">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default Layout;