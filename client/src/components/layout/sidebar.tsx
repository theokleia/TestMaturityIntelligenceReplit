import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";
import { useCallback } from "react";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

export function Sidebar() {
  const [location] = useLocation();
  
  const navItems: NavItem[] = [
    { path: "/", label: "Dashboard", icon: "bx-home-alt" },
    { path: "/assessments", label: "Assessments", icon: "bx-clipboard" },
    { path: "/ai-insights", label: "AI Insights", icon: "bx-bulb" },
    { path: "/metrics", label: "Metrics", icon: "bx-bar-chart-alt-2" },
    { path: "/analytics", label: "Analytics", icon: "bx-line-chart" },
    { path: "/knowledge-base", label: "Knowledge Base", icon: "bx-book" },
  ];
  
  const isActive = useCallback(
    (path: string) => location === path,
    [location]
  );

  return (
    <aside className="w-56 h-full flex-shrink-0 flex flex-col glassmorphism border-r border-white/5">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <i className="bx bx-atom text-xl text-primary"></i>
          </div>
          <h1 className="ml-3 text-xl font-heading font-bold text-white">ATMF</h1>
        </div>
      </div>
      
      <nav className="flex-1 py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-1">
              <Link href={item.path}>
                <a className={cn(
                  "nav-link flex items-center px-4 py-3 rounded-lg transition-colors group",
                  isActive(item.path) 
                    ? "text-white" 
                    : "text-text-muted hover:text-white hover:bg-white/5"
                )}>
                  <i className={cn(
                    `bx ${item.icon} nav-icon text-xl mr-3`,
                    isActive(item.path) 
                      ? "text-primary" 
                      : "text-text-muted group-hover:text-primary"
                  )}></i>
                  <span>{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-medium">
            TR
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Tecla Reitzi</p>
            <p className="text-xs text-text-muted">teclareitzi@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
