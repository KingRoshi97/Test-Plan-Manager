import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Loader2, CheckCircle2, XCircle, FolderTree } from "lucide-react";
import type { WorkspaceInfo, ReleaseGateReport } from "@shared/schema";

interface HealthResponse {
  status: string;
  timestamp: string;
}

export default function HealthPage() {
  const { data: health, isLoading: healthLoading } = useQuery<HealthResponse>({
    queryKey: ["/api/health"],
  });

  const { data: releaseGate, isLoading: gateLoading } = useQuery<ReleaseGateReport | null>({
    queryKey: ["/api/release-gate"],
  });

  const { data: workspaces = [], isLoading: wsLoading } = useQuery<WorkspaceInfo[]>({
    queryKey: ["/api/workspaces"],
  });

  const isLoading = healthLoading || gateLoading || wsLoading;

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto" data-testid="health-page-loading">
        <div className="flex items-center gap-2 mb-6">
          <HeartPulse className="w-5 h-5" />
          <h2 className="text-lg font-semibold">System Health</h2>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto" data-testid="health-page">
      <div className="flex items-center gap-2">
        <HeartPulse className="w-5 h-5" />
        <h2 className="text-lg font-semibold" data-testid="text-health-header">System Health</h2>
      </div>

      <Card data-testid="card-api-health">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm">API Status</CardTitle>
          {health?.status === "ok" ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" data-testid="icon-health-ok" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" data-testid="icon-health-error" />
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${health?.status === "ok" ? "bg-green-500" : "bg-red-500"}`}
              data-testid="indicator-api-status"
            />
            <span className="text-sm font-medium" data-testid="text-api-status">
              {health?.status === "ok" ? "Healthy" : "Unhealthy"}
            </span>
            {health?.timestamp && (
              <span className="text-xs text-muted-foreground ml-auto" data-testid="text-api-timestamp">
                {new Date(health.timestamp).toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-workspaces">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm">Workspaces</CardTitle>
          <Badge variant="secondary" data-testid="badge-workspace-count">{workspaces.length}</Badge>
        </CardHeader>
        <CardContent>
          {workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FolderTree className="w-8 h-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground" data-testid="text-no-workspaces">No workspaces detected</p>
            </div>
          ) : (
            <div className="space-y-2" data-testid="workspace-list">
              {workspaces.map((ws) => (
                <div
                  key={ws.projectName}
                  className="flex items-center gap-2 flex-wrap py-1.5 border-b last:border-b-0"
                  data-testid={`workspace-row-${ws.projectName}`}
                >
                  <span className="text-sm font-medium" data-testid={`text-workspace-name-${ws.projectName}`}>
                    {ws.projectName}
                  </span>
                  <div className="flex items-center gap-1 ml-auto flex-wrap">
                    {ws.hasManifest && <Badge variant="outline" className="text-xs" data-testid={`badge-manifest-${ws.projectName}`}>Manifest</Badge>}
                    {ws.hasRegistry && <Badge variant="outline" className="text-xs" data-testid={`badge-registry-${ws.projectName}`}>Registry</Badge>}
                    {ws.hasDomains && <Badge variant="outline" className="text-xs" data-testid={`badge-domains-${ws.projectName}`}>Domains</Badge>}
                    {ws.hasApp && <Badge variant="outline" className="text-xs" data-testid={`badge-app-${ws.projectName}`}>App</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-release-gate">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm">Release Gate</CardTitle>
          {releaseGate ? (
            releaseGate.passed ? (
              <Badge variant="success" data-testid="badge-gate-passed">Passed</Badge>
            ) : (
              <Badge variant="error" data-testid="badge-gate-failed">Failed</Badge>
            )
          ) : (
            <Badge variant="secondary" data-testid="badge-gate-unavailable">N/A</Badge>
          )}
        </CardHeader>
        <CardContent>
          {releaseGate ? (
            <div className="space-y-2">
              <div className="flex items-center gap-4 flex-wrap text-sm">
                <span data-testid="text-gate-checks">
                  <span className="text-muted-foreground">Checks:</span>{" "}
                  <span className="font-medium">{releaseGate.checks?.length ?? 0}</span>
                </span>
                <span data-testid="text-gate-duration">
                  <span className="text-muted-foreground">Duration:</span>{" "}
                  <span className="font-medium">
                    {releaseGate.duration_ms < 1000
                      ? releaseGate.duration_ms + "ms"
                      : (releaseGate.duration_ms / 1000).toFixed(1) + "s"}
                  </span>
                </span>
                {releaseGate.generated_at && (
                  <span data-testid="text-gate-timestamp">
                    <span className="text-muted-foreground">Last run:</span>{" "}
                    <span className="font-medium">{new Date(releaseGate.generated_at).toLocaleString()}</span>
                  </span>
                )}
              </div>
              {releaseGate.failures && releaseGate.failures.length > 0 && (
                <div className="mt-2 space-y-1" data-testid="gate-failures">
                  {releaseGate.failures.map((f, i) => (
                    <div key={i} className="text-xs text-red-600 dark:text-red-400" data-testid={`text-failure-${i}`}>
                      {f.check_id}: {f.summary}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground" data-testid="text-gate-not-available">
              No release gate report available. Run a release check to generate one.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
