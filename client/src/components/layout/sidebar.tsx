import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { glassmorphismStyles } from "@/lib/glassmorphism";

// Define navigation item structure
interface NavigationItem {
  title: string;
  path: string;
  icon: string;
  badge?: number | string;
}

export function Sidebar() {
  const [location] = useLocation();
  
  // Navigation items definition
  const navigationItems: NavigationItem[] = [
    {
      title: "Dashboard",
      path: "/",
      icon: "bx-home-alt",
    },
    {
      title: "Assessments",
      path: "/assessments",
      icon: "bx-clipboard",
      badge: 3,
    },
    {
      title: "Test Management",
      path: "/test-management",
      icon: "bx-test-tube",
    },
    {
      title: "AI Insights",
      path: "/ai-insights",
      icon: "bx-bulb",
      badge: "New",
    },
    {
      title: "Documentation",
      path: "/documentation",
      icon: "bx-book-alt",
    },
    {
      title: "Settings",
      path: "/settings",
      icon: "bx-cog",
    },
  ];

  return (
    <div className={cn(
      "w-64 border-r border-white/5 flex flex-col h-screen",
      glassmorphismStyles.light,
    )}>
      {/* Logo area */}
      <div className="h-14 flex items-center px-6 border-b border-white/5">
        <span className="text-xl font-heading font-bold tracking-tight text-primary neon-text-blue">
          ATMosFera
        </span>
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <div
                  className={cn(
                    "flex items-center py-2 px-4 rounded-lg text-sm font-medium transition-colors relative group cursor-pointer",
                    location === item.path
                      ? "text-primary bg-primary/10"
                      : "text-text-muted hover:text-text-light hover:bg-white/5"
                  )}
                >
                  <i className={cn("bx", item.icon, "text-lg mr-3")}></i>
                  <span>{item.title}</span>
                  
                  {/* Badge */}
                  {item.badge && (
                    <span className={cn(
                      "ml-auto text-xs py-0.5 px-2 rounded-full",
                      typeof item.badge === "number"
                        ? "bg-primary/20 text-primary"
                        : "bg-[#2FFFAA]/20 text-[#2FFFAA]"
                    )}>
                      {item.badge}
                    </span>
                  )}
                  
                  {/* Active indicator */}
                  {location === item.path && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User area */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <i className="bx bx-user text-lg text-primary"></i>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Alice Johnson</p>
            <p className="text-xs text-text-muted truncate">Test Manager</p>
          </div>
          <button className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-light rounded-full hover:bg-white/5">
            <i className="bx bx-log-out text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
}