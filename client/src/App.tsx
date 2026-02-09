import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardPage from "@/pages/dashboard";
import FilesPage from "@/pages/files";
import NewAssemblyPage from "@/pages/new-assembly";
import AssemblyPage from "@/pages/assembly";
import HealthPage from "@/pages/health";
import LogsPage from "@/pages/logs";
import ExportPage from "@/pages/export";
import TestsPage from "@/pages/tests";
import WorkspacesPage from "@/pages/workspaces";
import DocInventoryPage from "@/pages/doc-inventory";
import FeaturesPage from "@/pages/features";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/new" component={NewAssemblyPage} />
      <Route path="/assembly/:id" component={AssemblyPage} />
      <Route path="/workspaces" component={WorkspacesPage} />
      <Route path="/files" component={FilesPage} />
      <Route path="/health" component={HealthPage} />
      <Route path="/logs" component={LogsPage} />
      <Route path="/export" component={ExportPage} />
      <Route path="/tests" component={TestsPage} />
      <Route path="/docs" component={DocInventoryPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "14rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 min-w-0">
                <header className="flex items-center gap-2 p-2 border-b h-14 shrink-0 sticky top-0 z-50 bg-background">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
