import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabViewProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'outlined';
  className?: string;
}

export function TabView({ tabs, activeTab, onChange, variant = 'underline', className }: TabViewProps) {
  const getTabStyles = (tab: TabItem) => {
    const isActive = tab.id === activeTab;
    
    switch (variant) {
      case 'underline':
        return cn(
          "px-6 py-3 font-medium relative inline-flex items-center justify-center",
          isActive ? "text-primary" : "text-text-muted hover:text-white/80"
        );
      case 'pills':
        return cn(
          "px-4 py-2 rounded-md font-medium flex items-center justify-center",
          isActive 
            ? "bg-primary/20 text-primary"
            : "text-text-muted hover:bg-white/5 hover:text-white/80"
        );
      case 'outlined':
        return cn(
          "px-4 py-2 rounded-md font-medium border flex items-center justify-center",
          isActive 
            ? "border-primary text-primary"
            : "border-transparent text-text-muted hover:border-white/10 hover:text-white/80"
        );
      default:
        return "";
    }
  };

  return (
    <div 
      className={cn(
        variant === 'underline' ? "border-b border-white/10" : "flex space-x-2",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={getTabStyles(tab)}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
          {variant === 'underline' && tab.id === activeTab && (
            <div
              className="absolute bottom-0 left-0 w-full bg-primary"
              style={{ height: "2px" }}
            />
          )}
        </button>
      ))}
    </div>
  );
}