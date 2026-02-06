import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Fragment } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  FileJson,
  Activity,
} from "lucide-react";
import type { WorkspaceInfo } from "@shared/schema";

interface StatusData {
  projectName: string;
  modules: Record<string, Record<string, string>>;
  stages: string[];
  registryFiles: Record<string, boolean>;
  activeBuild: unknown;
  hasManifest: boolean;
  hasDomains: boolean;
  hasApp: boolean;
  statusSource?: string;
}

export default function StatusPage() {
  const [projectName, setProjectName] = useState("my-project");
  const [selectedProject, setSelectedProject] = useState("");

  const { data: workspaces = [] } = useQuery<WorkspaceInfo[]>({
    queryKey: ["/api/workspaces"],
  });

  const { data: statusData, isLoading, refetch } = useQuery<StatusData>({
    queryKey: ["/api/status", selectedProject],
    queryFn: async () => {
      if (!selectedProject) return null;
      const res = await fetch(`/api/status/${selectedProject}`);
      return res.json();
    },
    enabled: !!selectedProject,
  });

  const loadStatus = () => {
    setSelectedProject(projectName);
  };

  const stageLabels: Record<string, string> = {
    generate: "Gen",
    seed: "Seed",
    draft: "Draft",
    review: "Review",
    verify: "Verify",
    lock: "Lock",
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-status-header">Status</h2>
        <p className="text-sm text-muted-foreground mt-1">View module completion and system health for a workspace.</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="max-w-xs"
              placeholder="Project name"
              data-testid="input-status-project"
            />
            <Button onClick={loadStatus} disabled={!projectName || isLoading} data-testid="button-load-status">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              <span className="ml-2">Load Status</span>
            </Button>
            {selectedProject && (
              <Button variant="ghost" size="icon" onClick={() => refetch()} data-testid="button-refresh-status">
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
          {workspaces.length > 0 && (
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {workspaces.map((ws) => (
                <Button
                  key={ws.projectName}
                  variant={projectName === ws.projectName ? "default" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setProjectName(ws.projectName);
                    setSelectedProject(ws.projectName);
                  }}
                  data-testid={`button-ws-${ws.projectName}`}
                >
                  {ws.projectName}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {statusData && !isLoading && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-sm">Module Pipeline Status</CardTitle>
                <Badge variant="secondary" className="no-default-active-elevate" data-testid="badge-status-source">
                  {statusData.statusSource === "database" ? "from database" : "from files"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Stage completion for each module in {statusData.projectName}</p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="min-w-[600px]">
                  <div className="grid gap-0" style={{ gridTemplateColumns: `140px repeat(${statusData.stages.length}, 1fr)` }}>
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1.5 border-b">Module</div>
                    {statusData.stages.map((stage) => (
                      <div key={stage} className="text-xs font-medium text-muted-foreground px-2 py-1.5 text-center border-b">
                        {stageLabels[stage] || stage}
                      </div>
                    ))}

                    {Object.entries(statusData.modules).map(([mod, stages]) => (
                      <Fragment key={mod}>
                        <div className="text-xs px-2 py-1.5 font-medium border-b truncate" data-testid={`module-${mod}`}>
                          {mod}
                        </div>
                        {statusData.stages.map((stage) => {
                          const val = stages[stage] || "pending";
                          return (
                            <div key={`${mod}-${stage}`} className="flex items-center justify-center py-1.5 border-b" data-testid={`cell-${mod}-${stage}`}>
                              {val === "done" ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                              ) : val === "partial" ? (
                                <Clock className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
                              ) : val === "error" ? (
                                <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30" />
                              )}
                            </div>
                          );
                        })}
                      </Fragment>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Registry Artifacts</CardTitle>
              <p className="text-xs text-muted-foreground">Which report/data files exist in this workspace</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(statusData.registryFiles).map(([file, exists]) => (
                  <div
                    key={file}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-xs"
                    data-testid={`registry-${file}`}
                  >
                    {exists ? (
                      <FileJson className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
                    ) : (
                      <FileJson className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={exists ? "" : "text-muted-foreground/60"}>{file.replace('.json', '')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Workspace Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Badge variant={statusData.hasManifest ? "success" : "secondary"} className="no-default-active-elevate">
                  manifest {statusData.hasManifest ? "present" : "missing"}
                </Badge>
                <Badge variant={statusData.hasDomains ? "success" : "secondary"} className="no-default-active-elevate">
                  domains {statusData.hasDomains ? "present" : "missing"}
                </Badge>
                <Badge variant={statusData.hasApp ? "success" : "secondary"} className="no-default-active-elevate">
                  app {statusData.hasApp ? "present" : "missing"}
                </Badge>
                <Badge variant={statusData.activeBuild ? "success" : "secondary"} className="no-default-active-elevate">
                  active build {statusData.activeBuild ? "set" : "not set"}
                </Badge>
              </div>
              {statusData.activeBuild ? (
                <div className="mt-3 rounded-md p-3 bg-muted text-xs">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(statusData.activeBuild, null, 2)}</pre>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
