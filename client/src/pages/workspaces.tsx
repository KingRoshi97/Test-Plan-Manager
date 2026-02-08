import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  FolderOpen,
  Trash2,
  CheckCircle2,
  XCircle,
  HardDrive,
  AlertTriangle,
} from "lucide-react";

interface WorkspaceInfo {
  path: string;
  projectName: string;
  exists: boolean;
  hasManifest: boolean;
  hasRegistry: boolean;
  hasDomains: boolean;
  hasApp: boolean;
}

export default function WorkspacesPage() {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: workspaces = [], isLoading, isError } = useQuery<WorkspaceInfo[]>({
    queryKey: ["/api/workspaces"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (projectName: string) => {
      return apiRequest(`/api/workspaces/${encodeURIComponent(projectName)}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_data, projectName) => {
      toast({ title: "Workspace deleted", description: `${projectName} has been removed.` });
      setConfirmDelete(null);
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
    },
    onError: () => {
      toast({ title: "Failed to delete workspace", variant: "destructive" });
    },
  });

  const existingWorkspaces = workspaces.filter(w => w.exists);
  const orphanedWorkspaces = workspaces.filter(w => !w.exists);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24" data-testid="loading-workspaces">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2" data-testid="error-workspaces">
        <AlertTriangle className="w-6 h-6 text-destructive" />
        <p className="text-sm text-muted-foreground">Failed to load workspaces.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto" data-testid="workspaces-page">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold" data-testid="text-workspaces-title">
            Workspaces
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {existingWorkspaces.length} workspace{existingWorkspaces.length !== 1 ? "s" : ""} on disk
          </p>
        </div>
      </div>

      <Card data-testid="card-workspaces-list">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Active Workspaces ({existingWorkspaces.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {existingWorkspaces.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6" data-testid="text-no-workspaces">
              No workspaces found.
            </p>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-2">
                {existingWorkspaces.map((ws) => (
                  <div
                    key={ws.projectName}
                    className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-md border flex-wrap"
                    data-testid={`workspace-row-${ws.projectName}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FolderOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate" data-testid={`workspace-name-${ws.projectName}`}>
                          {ws.projectName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {ws.path}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <StatusIndicator label="Registry" active={ws.hasRegistry} testId={`ws-registry-${ws.projectName}`} />
                      <StatusIndicator label="Domains" active={ws.hasDomains} testId={`ws-domains-${ws.projectName}`} />
                      <StatusIndicator label="App" active={ws.hasApp} testId={`ws-app-${ws.projectName}`} />

                      {confirmDelete === ws.projectName ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(ws.projectName)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-confirm-delete-ws-${ws.projectName}`}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Confirm"
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setConfirmDelete(null)}
                            data-testid={`button-cancel-delete-ws-${ws.projectName}`}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setConfirmDelete(ws.projectName)}
                          data-testid={`button-delete-ws-${ws.projectName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {orphanedWorkspaces.length > 0 && (
        <Card data-testid="card-orphaned-workspaces">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Orphaned Records ({orphanedWorkspaces.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              These workspace records exist in the database but the files have been removed from disk.
            </p>
            <div className="space-y-1">
              {orphanedWorkspaces.map((ws) => (
                <div
                  key={ws.projectName}
                  className="flex items-center justify-between gap-2 py-1.5 px-2 rounded text-xs flex-wrap"
                  data-testid={`orphan-row-${ws.projectName}`}
                >
                  <span className="text-muted-foreground truncate">{ws.projectName}</span>
                  <Button
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(ws.projectName)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-cleanup-orphan-${ws.projectName}`}
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusIndicator({ label, active, testId }: { label: string; active: boolean; testId: string }) {
  return (
    <div className="flex items-center gap-1" title={`${label}: ${active ? "present" : "missing"}`} data-testid={testId}>
      {active ? (
        <CheckCircle2 className="w-3 h-3 text-green-500" />
      ) : (
        <XCircle className="w-3 h-3 text-gray-400" />
      )}
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
