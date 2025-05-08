import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackUI?: ReactNode;
  onReset?: () => void;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to an error reporting service
    console.error(`Error in ${this.props.name || "component"}:`, error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallbackUI) {
        return this.props.fallbackUI;
      }

      return (
        <Card className="border-destructive/20 bg-destructive/5 w-full max-w-xl mx-auto my-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Something went wrong</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                An error occurred in {this.props.name || "this component"}. You can try
                reloading the component or refreshing the page.
              </p>
              {this.state.error && (
                <div className="text-xs bg-secondary/50 p-2 rounded-md overflow-auto max-h-32">
                  <p className="font-mono">{this.state.error.toString()}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" size="sm" onClick={this.resetError}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}