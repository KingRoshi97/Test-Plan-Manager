import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent } from "@/components/kit/GlassCard";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "wouter";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] w-full flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-lg">
            <GlassCardContent className="pt-8 pb-8 text-center">
              <div className="rounded-full bg-destructive/10 p-4 mb-6 inline-flex">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-2" data-testid="text-error-title">Something went wrong</h1>
              <p className="text-muted-foreground mb-4" data-testid="text-error-description">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              {this.state.error && (
                <div className="mb-6 p-3 bg-muted/50 rounded-lg text-left">
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  data-testid="button-refresh"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
                <Link href="/assemblies">
                  <Button onClick={this.handleReset} data-testid="button-go-home">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Assemblies
                  </Button>
                </Link>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
