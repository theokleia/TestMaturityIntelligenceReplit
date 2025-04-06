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
      <div className="flex min-h-screen bg-atmf-main bg-dashboard-gradient text-atmf-primary">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Container */}
        <div className="flex flex-col flex-1">
          {/* Topbar always included */}
          <Topbar title={pageTitle} actions={pageActions} />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          
          {/* AI Assistant Bubble */}
          <AIAssistantBubble contextPath={location} />
          
          {/* Whisper Assistant */}
          <WhisperAssistant />
        </div>
      </div>
    </LayoutContext.Provider>
  );
}

export default Layout;