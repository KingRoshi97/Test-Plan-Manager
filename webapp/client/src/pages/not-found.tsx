import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent } from "@/components/kit";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center">
      <GlassCard className="w-full max-w-md mx-4">
        <GlassCardContent className="pt-8 pb-8 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-6 inline-flex">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2" data-testid="text-404-title">Page Not Found</h1>
          <p className="text-muted-foreground mb-6" data-testid="text-404-description">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => window.history.back()} data-testid="button-go-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Link href="/assemblies">
              <Button data-testid="button-go-home">
                <Home className="h-4 w-4 mr-2" />
                View Assemblies
              </Button>
            </Link>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
