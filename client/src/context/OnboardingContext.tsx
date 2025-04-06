import { 
  ReactNode, 
  createContext, 
  useContext, 
  useState, 
  useEffect 
} from "react";
import Joyride, { CallBackProps, Step, STATUS } from "react-joyride";
import { useToast } from "@/hooks/use-toast";

interface OnboardingContextType {
  startTour: (tourName: string) => void;
  endTour: () => void;
  isTouring: boolean;
  completeTour: (tourName: string) => void;
  isTourComplete: (tourName: string) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

// Define tour steps for different sections
const tours: Record<string, Step[]> = {
  dashboard: [
    {
      target: "#maturity-card",
      content: "This card shows your current maturity level across key dimensions. Click to view detailed assessments.",
      disableBeacon: true,
      placement: "bottom",
    },
    {
      target: "#health-indicators",
      content: "Visual indicators show the health of your testing practices. Green is healthy, yellow needs attention, and red indicates critical issues.",
      placement: "bottom",
    },
    {
      target: "#metrics-chart",
      content: "Track your progress over time with these interactive metrics. Hover over data points for more details.",
      placement: "right",
    },
    {
      target: "#mindmap",
      content: "The ATMF Mindmap visualizes your testing ecosystem. Explore connections between different aspects of your testing strategy.",
      placement: "left",
    },
    {
      target: ".ai-assistant-button",
      content: "Need help? The AI assistant can provide context-specific guidance and answer your questions about testing practices.",
      placement: "left",
    }
  ],
  projectHealth: [
    {
      target: "#health-overview",
      content: "This dashboard provides a comprehensive view of your project's testing health.",
      disableBeacon: true,
      placement: "bottom",
    },
    {
      target: "#health-metrics",
      content: "These metrics show key performance indicators for your testing processes.",
      placement: "bottom",
    },
    {
      target: "#trend-analysis",
      content: "Track improvements over time with trend analysis charts.",
      placement: "right",
    }
  ],
  testManagement: [
    {
      target: "#test-suites-table",
      content: "View and manage your test suites here. Click on a suite to see its test cases.",
      disableBeacon: true,
      placement: "bottom",
    },
    {
      target: "#create-test-button",
      content: "Create new test cases or suites with this button.",
      placement: "bottom",
    },
    {
      target: "#ai-generate-button",
      content: "Let AI help you generate test cases based on your requirements.",
      placement: "left",
    }
  ],
  projectSelector: [
    {
      target: "#project-selector",
      content: "Switch between different projects using this dropdown. All data will be filtered to the selected project.",
      disableBeacon: true,
      placement: "bottom",
    },
    {
      target: "#create-project-button",
      content: "Create a new project to manage a separate testing initiative.",
      placement: "right",
    }
  ]
};

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [run, setRun] = useState(false);
  const [tourName, setTourName] = useState("");
  const { toast } = useToast();

  // Use local storage to track completed tours
  const [completedTours, setCompletedTours] = useState<string[]>(() => {
    const saved = localStorage.getItem("atmf-completed-tours");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("atmf-completed-tours", JSON.stringify(completedTours));
  }, [completedTours]);

  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    
    // Tour is finished
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as STATUS)) {
      setRun(false);
      
      if (status === STATUS.FINISHED) {
        // Mark the tour as completed
        completeTour(tourName);
        
        toast({
          title: "Tour completed!",
          description: "You've completed the tour. You can restart it anytime from the help menu.",
        });
      }
    }
  };

  // Start a tour
  const startTour = (name: string) => {
    if (tours[name]) {
      setTourName(name);
      setSteps(tours[name]);
      setRun(true);
    } else {
      console.error(`Tour "${name}" not found`);
    }
  };

  // End the current tour
  const endTour = () => {
    setRun(false);
  };

  // Mark a tour as completed
  const completeTour = (name: string) => {
    if (!completedTours.includes(name)) {
      setCompletedTours([...completedTours, name]);
    }
  };

  // Check if a tour is already completed
  const isTourComplete = (name: string): boolean => {
    return completedTours.includes(name);
  };

  return (
    <OnboardingContext.Provider 
      value={{ 
        startTour, 
        endTour, 
        isTouring: run,
        completeTour,
        isTourComplete
      }}
    >
      <Joyride
        steps={steps}
        run={run}
        continuous
        showProgress
        showSkipButton
        styles={{
          options: {
            primaryColor: "#3451B2",
            backgroundColor: "#0D0F21",
            textColor: "#FFFFFF",
            arrowColor: "#0D0F21",
            overlayColor: "rgba(0, 0, 0, 0.7)"
          },
          tooltip: {
            borderRadius: '8px',
            fontSize: '14px',
          },
          buttonNext: {
            backgroundColor: "#3451B2",
            fontSize: '14px',
          },
          buttonBack: {
            color: "#FFFFFF",
            fontSize: '14px',
          },
          buttonClose: {
            color: "#FFFFFF",
          }
        }}
        callback={handleJoyrideCallback}
        disableScrolling
        disableOverlayClose
        floaterProps={{
          disableAnimation: false,
        }}
      />
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};