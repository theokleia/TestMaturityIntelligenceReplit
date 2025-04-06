import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, LineChart, ListTodo, AlarmClock } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const { startTour } = useOnboarding();

  useEffect(() => {
    // Check if this is the user's first visit
    const hasVisitedBefore = localStorage.getItem("atmf-has-visited");
    
    if (!hasVisitedBefore) {
      // Show the welcome dialog after a short delay (allows page to load)
      const timer = setTimeout(() => {
        setOpen(true);
        // Mark that the user has visited before
        localStorage.setItem("atmf-has-visited", "true");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const startDashboardTour = () => {
    setOpen(false);
    // Short delay to allow dialog to close before starting tour
    setTimeout(() => {
      startTour("dashboard");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] bg-atmf-card border-atmf-card-alt">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="h-14 w-14 rounded-full bg-blue-600/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <DialogTitle className="text-xl text-center">Welcome to ATMosFera</DialogTitle>
          <DialogDescription className="text-center text-atmf-muted">
            Your AI-powered test management platform
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <p className="text-center">
            ATMosFera helps you manage, track, and optimize your testing processes
            with insights powered by the Adaptive Testing Maturity Framework.
          </p>
          
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-atmf-main p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="h-5 w-5 text-blue-400" />
                <span className="font-medium">Test Maturity</span>
              </div>
              <p className="text-sm text-atmf-muted">
                Assess and improve your testing practices with guided maturity assessments
              </p>
            </div>
            
            <div className="bg-atmf-main p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <LineChart className="h-5 w-5 text-green-400" />
                <span className="font-medium">Analytics</span>
              </div>
              <p className="text-sm text-atmf-muted">
                Track key metrics and visualize your testing health
              </p>
            </div>
            
            <div className="bg-atmf-main p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ListTodo className="h-5 w-5 text-purple-400" />
                <span className="font-medium">Test Management</span>
              </div>
              <p className="text-sm text-atmf-muted">
                Create, organize and execute test cases efficiently
              </p>
            </div>
            
            <div className="bg-atmf-main p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlarmClock className="h-5 w-5 text-amber-400" />
                <span className="font-medium">Automation</span>
              </div>
              <p className="text-sm text-atmf-muted">
                Boost productivity with AI-assisted test generation
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-blue-800 text-atmf-text hover:bg-blue-800/20"
          >
            Skip tour
          </Button>
          <Button 
            onClick={startDashboardTour}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Take a tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}