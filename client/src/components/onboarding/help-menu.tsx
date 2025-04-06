import { 
  HelpCircle, 
  Info, 
  Home, 
  LineChart,
  ListTodo, 
  Users, 
  PlayCircle,
  CheckCircle2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useOnboarding } from "@/context/OnboardingContext";

export function HelpMenu() {
  const [location] = useLocation();
  const { startTour, isTourComplete } = useOnboarding();

  // Determine available tours based on current location
  const getAvailableTours = () => {
    const allTours = [
      {
        id: "dashboard",
        name: "Dashboard Tour",
        path: "/",
        icon: Home,
        available: location === "/"
      },
      {
        id: "projectHealth",
        name: "Project Health Tour",
        path: "/project-health",
        icon: LineChart,
        available: location.includes("/project-health")
      },
      {
        id: "testManagement",
        name: "Test Management Tour",
        path: "/test-management",
        icon: ListTodo,
        available: location.includes("/test-management")
      },
      {
        id: "projectSelector",
        name: "Project Selector Tour",
        path: "",
        icon: Users,
        available: true // Available on all pages
      }
    ];

    return allTours;
  };

  const tours = getAvailableTours();
  
  const handleStartTour = (tourId: string, path: string) => {
    // If tour is for another page, navigate there first
    if (path && location !== path) {
      window.location.href = path;
      // Store the tour to start in localStorage
      localStorage.setItem("atmf-pending-tour", tourId);
    } else {
      // Start tour immediately if we're on the right page
      startTour(tourId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-atmf-main"
        >
          <HelpCircle className="h-5 w-5 text-atmf-muted" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-atmf-card border-atmf-main">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">Help & Onboarding</p>
            <p className="text-xs text-atmf-muted">
              Take guided tours of ATMosFera features
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-atmf-main/50" />
        {tours.filter(tour => tour.available).map((tour) => (
          <DropdownMenuItem
            key={tour.id}
            className="cursor-pointer flex items-center justify-between"
            onClick={() => handleStartTour(tour.id, tour.path)}
          >
            <div className="flex items-center gap-2">
              <tour.icon className="h-4 w-4 text-blue-400" />
              <span>{tour.name}</span>
            </div>
            {isTourComplete(tour.id) ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <PlayCircle className="h-4 w-4 text-atmf-muted" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-atmf-main/50" />
        <DropdownMenuItem className="cursor-pointer" asChild>
          <a 
            href="https://github.com/your-repo/atmf-guide" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2"
          >
            <Info className="h-4 w-4 text-atmf-muted" />
            <span>Documentation</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}