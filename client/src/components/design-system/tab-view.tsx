import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

interface TabViewProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
  tabsClassName?: string; 
  contentClassName?: string;
  onChange?: (tabId: string) => void;
}

/**
 * TabView component for displaying tabbed content following the ATMF design system
 */
export function TabView({
  tabs,
  defaultTab,
  className,
  tabsClassName,
  contentClassName,
  onChange
}: TabViewProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || (tabs.length > 0 ? tabs[0].id : ""));
  
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };
  
  // Find the active tab object
  const activeTabData = tabs.find(tab => tab.id === activeTab);
  
  return (
    <div className={cn("flex flex-col w-full", className)}>
      {/* Tab Navigation */}
      <div className={cn("flex border-b border-divider-color gap-6", tabsClassName)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "px-4 py-2 font-medium transition-colors",
              tab.id === activeTab 
                ? "tab-active" 
                : "text-text-muted hover:text-text-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className={cn("mt-6", contentClassName)}>
        {activeTabData?.content}
      </div>
    </div>
  );
}