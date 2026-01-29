import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Create from "@/pages/create";
import Assemblies from "@/pages/assemblies";
import ApiDocs from "@/pages/api-docs";
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
    <Switch>
      <Route path="/" component={() => <RedirectTo to="/create" />} />
      <Route path="/create" component={Create} />
      <Route path="/assemblies" component={Assemblies} />
      <Route path="/runs" component={() => <RedirectTo to="/assemblies" />} />
      <Route path="/docs" component={ApiDocs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
