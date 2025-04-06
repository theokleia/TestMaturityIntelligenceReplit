import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PageBackground } from "@/components/design-system/background";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="glassmorphism rounded-xl border border-white/10 w-full max-w-lg p-8 mx-4 neon-border-blue text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
          <i className="bx bx-error-circle text-4xl text-primary"></i>
        </div>
        
        <h1 className="text-3xl font-heading font-bold mb-3 neon-text-blue">
          404 Page Not Found
        </h1>
        
        <p className="text-text-muted mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex justify-center">
          <Link href="/">
            <Button className="btn-atmf-accent px-6 py-2.5">
              <i className="bx bx-home mr-2"></i>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
