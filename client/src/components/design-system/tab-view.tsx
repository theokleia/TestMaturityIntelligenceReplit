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
  activeTab?: string;  // For controlled component usage
  variant?: "underline" | "pills" | "tabs"; // Style variant
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
  activeTab: controlledActiveTab,
  variant = "underline",
  className,
  tabsClassName,
  contentClassName,
  onChange
}: TabViewProps) {
  // Internal state for uncontrolled component
  const [internalActiveTab, setInternalActiveTab] = useState<string>(
    defaultTab || (tabs.length > 0 ? tabs[0].id : "")
  );
  
  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledActiveTab !== undefined;
  const currentActiveTab = isControlled ? controlledActiveTab : internalActiveTab;
  
  useEffect(() => {
    if (defaultTab && !isControlled) {
      setInternalActiveTab(defaultTab);
    }
  }, [defaultTab, isControlled]);
  
  const handleTabChange = (tabId: string) => {
    if (!isControlled) {
      setInternalActiveTab(tabId);
    }
    if (onChange) {
      onChange(tabId);
    }
  };
  
  // Find the active tab object
  const activeTabData = tabs.find(tab => tab.id === currentActiveTab);
  
  // Determine the styling based on the variant
  const getTabStyles = (isActive: boolean) => {
    switch (variant) {
      case "pills":
        return isActive 
          ? "bg-primary/10 text-primary rounded-md" 
          : "text-text-muted hover:text-text-primary hover:bg-primary/5 rounded-md";
      case "tabs":
        return isActive 
          ? "bg-card text-primary border-t border-x border-divider-color rounded-t-md -mb-px" 
          : "text-text-muted hover:text-text-primary";
      case "underline":
      default:
        return isActive 
          ? "tab-active border-b-2 border-primary text-primary" 
          : "text-text-muted hover:text-text-primary border-b-2 border-transparent";
    }
  };
  
  return (
    <div className={cn("flex flex-col w-full", className)}>
      {/* Tab Navigation */}
      <div className={cn(
        "flex gap-2", 
        variant === "underline" && "border-b border-divider-color",
        tabsClassName
      )}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "px-4 py-2 font-medium transition-colors",
              getTabStyles(tab.id === currentActiveTab)
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