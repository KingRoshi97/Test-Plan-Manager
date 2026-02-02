import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/kit";
import { AppShell } from "@/app/AppShell";
import NotFound from "@/pages/not-found";
import Create from "@/pages/create";
import Assemblies from "@/pages/assemblies";
import AssemblyDetail from "@/pages/assembly-detail";
import Settings from "@/pages/settings";
import ApiDocs from "@/pages/api-docs";
import Ops from "@/pages/ops";
import { useEffect } from "react";

function RedirectTo({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  return null;
}

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={() => <RedirectTo to="/create" />} />
        <Route path="/create" component={Create} />
        <Route path="/assemblies" component={Assemblies} />
        <Route path="/assemblies/:id" component={AssemblyDetail} />
        <Route path="/runs" component={() => <RedirectTo to="/assemblies" />} />
        <Route path="/runs/:id">
          {(params) => <RedirectTo to={`/assemblies/${params.id}`} />}
        </Route>
        <Route path="/settings" component={Settings} />
        <Route path="/docs" component={ApiDocs} />
        <Route path="/ops" component={Ops} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Router />
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
