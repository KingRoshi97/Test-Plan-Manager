import { Switch, Route, Redirect } from "wouter";
import { AppShell } from "./components/layout/AppShell";
import DashboardPage from "./pages/dashboard";
import AssembliesPage from "./pages/assemblies";
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
import IntakeLibraryPage from "./pages/intake-library";
import CanonicalLibraryPage from "./pages/canonical-library";
import StandardsLibraryPage from "./pages/standards-library";
import TemplatesLibraryPage from "./pages/templates-library";
import PlanningLibraryPage from "./pages/planning-library";
import VerificationLibraryPage from "./pages/verification-library";
import KitLibraryPage from "./pages/kit-library";
import TelemetryLibraryPage from "./pages/telemetry-library";
import AuditLibraryPage from "./pages/audit-library";
import OpsLibraryPage from "./pages/ops-library";
import KnowledgeLibraryPage from "./pages/knowledge-library";
import MaintenancePage from "./pages/maintenance";
import KnowledgeDashboardPage from "./pages/knowledge-dashboard";
import CertificationPage from "./pages/certification";
import AnalyticsEnginePage from "./pages/analytics-engine";
import LibraryControlCenterPage from "./pages/library-control";
import BuildQualityPage from "./pages/build-quality";

export default function App() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/library-control" component={LibraryControlCenterPage} />
        <Route path="/knowledge"><Redirect to="/knowledge-library" /></Route>
        <Route path="/assemblies" component={AssembliesPage} />
        <Route path="/runs"><Redirect to="/assemblies" /></Route>
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
        <Route path="/canonical" component={CanonicalLibraryPage} />
        <Route path="/standards" component={StandardsLibraryPage} />
        <Route path="/templates-library" component={TemplatesLibraryPage} />
        <Route path="/planning-library" component={PlanningLibraryPage} />
        <Route path="/verification-library" component={VerificationLibraryPage} />
        <Route path="/kit-library" component={KitLibraryPage} />
        <Route path="/telemetry-library" component={TelemetryLibraryPage} />
        <Route path="/audit-library" component={AuditLibraryPage} />
        <Route path="/ops" component={OpsLibraryPage} />
        <Route path="/knowledge-library" component={KnowledgeLibraryPage} />
        <Route path="/maintenance" component={MaintenancePage} />
        <Route path="/analytics" component={AnalyticsEnginePage} />
        <Route path="/intake-library" component={IntakeLibraryPage} />
        <Route path="/docs" component={DocInventoryPage} />
        <Route path="/certification/:certRunId" component={CertificationPage} />
        <Route path="/certification" component={CertificationPage} />
        <Route path="/build-quality" component={BuildQualityPage} />
        <Route path="/export" component={ExportPage} />
        <Route>
          <div className="flex items-center justify-center h-full">
            <p className="text-[hsl(var(--muted-foreground))]">Page not found</p>
          </div>
        </Route>
      </Switch>
    </AppShell>
  );
}
