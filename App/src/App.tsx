import { Switch, Route } from "wouter";
import { AppSidebar } from "./components/app-sidebar";
import DashboardPage from "./pages/dashboard";
import NewAssemblyPage from "./pages/new-assembly";
import AssemblyPage from "./pages/assembly";
import FilesPage from "./pages/files";
import HealthPage from "./pages/health";
import LogsPage from "./pages/logs";
import DocInventoryPage from "./pages/doc-inventory";
import ExportPage from "./pages/export";
import FeaturesPage from "./pages/features";
import FeatureDetailPage from "./pages/feature-detail";
import SystemLibraryPage from "./pages/system-library";
import OrchestrationLibraryPage from "./pages/orchestration-library";
import GatesLibraryPage from "./pages/gates-library";
import PolicyLibraryPage from "./pages/policy-library";

export default function App() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/new" component={NewAssemblyPage} />
          <Route path="/assembly/:id" component={AssemblyPage} />
          <Route path="/features" component={FeaturesPage} />
          <Route path="/features/:id" component={FeatureDetailPage} />
          <Route path="/files" component={FilesPage} />
          <Route path="/health" component={HealthPage} />
          <Route path="/logs" component={LogsPage} />
          <Route path="/system" component={SystemLibraryPage} />
          <Route path="/orchestration" component={OrchestrationLibraryPage} />
          <Route path="/gates" component={GatesLibraryPage} />
          <Route path="/policy" component={PolicyLibraryPage} />
          <Route path="/docs" component={DocInventoryPage} />
          <Route path="/export" component={ExportPage} />
          <Route>
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Page not found</p>
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  );
}
