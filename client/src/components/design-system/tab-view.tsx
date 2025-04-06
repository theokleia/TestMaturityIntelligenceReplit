import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/colors";

interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  color?: string;
  badge?: number | string;
}

interface TabViewProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'outlined' | 'minimal';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  neonEffect?: boolean;
}

export function TabView({ 
  tabs, 
  activeTab, 
  onChange, 
  variant = 'underline', 
  className,
  size = 'md',
  fullWidth = false,
  neonEffect = false
}: TabViewProps) {
  // Size styles for tabs
  const sizeStyles = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };
  
  // Padding based on size and variant
  const getPadding = () => {
    if (variant === 'minimal') return "";
    
    switch (size) {
      case 'sm': return variant === 'underline' ? "px-3 py-2" : "px-2 py-1";
      case 'md': return variant === 'underline' ? "px-6 py-3" : "px-4 py-2";
      case 'lg': return variant === 'underline' ? "px-8 py-4" : "px-6 py-3";
      default: return "";
    }
  };
  
  const getTabStyles = (tab: TabItem) => {
    const isActive = tab.id === activeTab;
    const padding = getPadding();
    const tabColor = tab.color || "var(--neon-blue)";
    
    // Base styles shared across variants
    const baseStyles = cn(
      "font-medium transition-all duration-200 relative",
      sizeStyles[size],
      padding,
      fullWidth && "flex-grow text-center",
      isActive ? 
        "text-atmf-blue" : 
        "text-atmf-muted hover:text-atmf-secondary"
    );
    
    switch (variant) {
      case 'underline':
        return cn(
          baseStyles,
          "inline-flex items-center justify-center",
          isActive && neonEffect && "neon-text-blue"
        );
      case 'pills':
        return cn(
          baseStyles,
          "flex items-center justify-center rounded-md",
          isActive 
            ? "bg-black/40 text-atmf-blue border border-blue-800/30"
            : "hover:bg-black/20 hover:border-white/5 border border-transparent"
        );
      case 'outlined':
        return cn(
          baseStyles,
          "flex items-center justify-center rounded-md border",
          isActive 
            ? "border-blue-700/50 text-atmf-blue"
            : "border-white/5 hover:border-white/10"
        );
      case 'minimal':
        return cn(
          baseStyles,
          "flex items-center justify-center py-1",
          isActive 
            ? "text-atmf-blue font-semibold"
            : "text-atmf-muted"
        );
      default:
        return "";
    }
  };

  return (
    <div 
      className={cn(
        variant === 'underline' ? "border-b border-white/5" : "flex space-x-1",
        variant === 'minimal' && "space-x-4",
        fullWidth && "w-full",
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
          {tab.badge && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1 rounded-full bg-black/40 text-xs font-medium">
              {tab.badge}
            </span>
          )}
          {variant === 'underline' && tab.id === activeTab && (
            <div
              className={cn(
                "absolute bottom-0 left-0 w-full",
                neonEffect ? "h-[3px] tab-indicator" : "h-[2px] bg-blue-500"
              )}
            />
          )}
        </button>
      ))}
    </div>
  );
}