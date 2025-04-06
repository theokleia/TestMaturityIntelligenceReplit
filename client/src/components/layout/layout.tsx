import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import Topbar from "./topbar";
import { cn } from "@/lib/utils";
import { AIAssistantBubble } from "@/components/ai/assistant-bubble";
import { WhisperAssistant } from "@/components/ai/whisper-assistant";
import { useLocation } from "wouter";

interface LayoutContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  pageActions: ReactNode;
  setPageActions: (actions: ReactNode) => void;
  currentPath: string;
}

// Create context for sharing page title and actions with Topbar
const LayoutContext = createContext<LayoutContextType>({
  pageTitle: "",
  setPageTitle: () => {},
  pageActions: null,
  setPageActions: () => {},
  currentPath: ""
});

export const useLayout = () => useContext(LayoutContext);

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout component that provides consistent app structure with sidebar
 * navigation, topbar, and proper background styling
 */
export function Layout({ children }: LayoutProps) {
  const [pageTitle, setPageTitle] = useState<string>("");
  const [pageActions, setPageActions] = useState<ReactNode>(null);
  const [location] = useLocation();
  
  return (
    <LayoutContext.Provider value={{ 
      pageTitle, 
      setPageTitle, 
      pageActions, 
      setPageActions,
      currentPath: location
    }}>
      <div className="min-h-screen bg-atmf-main bg-dashboard-gradient text-atmf-primary">
        {/* Sidebar - now positioned with fixed position in its own component */}
        <Sidebar />
        
        {/* Topbar - now positioned with fixed position in its own component */}
        <Topbar title={pageTitle} actions={pageActions} />
        
        {/* Main Content Container - adjusted with proper margins to account for fixed sidebar and topbar */}
        <div className="ml-64 pt-14 min-h-screen">
          {/* Main Content */}
          <main className="h-full overflow-y-auto">
            {children}
          </main>
        </div>
        
        {/* AI Assistant Bubble */}
        <AIAssistantBubble contextPath={location} />
        
        {/* Whisper Assistant */}
        <WhisperAssistant />
      </div>
    </LayoutContext.Provider>
  );
}

export default Layout;