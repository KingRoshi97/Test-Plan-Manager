import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Loader2, FolderTree } from "lucide-react";
import type { WorkspaceInfo } from "@shared/schema";

interface EnrichedAssembly {
  id: string;
  projectName: string | null;
  state: string;
  kitPath: string | null;
  hasApp: boolean;
  hasManifest: boolean;
}

export default function ExportPage() {
  const { data: workspaces = [], isLoading: wsLoading } = useQuery<WorkspaceInfo[]>({
    queryKey: ["/api/workspaces"],
  });

  const { data: assemblies = [] } = useQuery<EnrichedAssembly[]>({
    queryKey: ["/api/assemblies"],
  });

  const exportMutation = useMutation({
    mutationFn: (assemblyId: string) =>
      apiRequest(`/api/assemblies/${assemblyId}/export`, {
        method: "POST",
        body: JSON.stringify({ format: "zip" }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
      toast({ title: "Export completed successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    },
  });

  const getAssemblyForWorkspace = (projectName: string) => {
    return assemblies.find((a) => a.projectName === projectName);
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto" data-testid="export-page">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5" />
        <h2 className="text-lg font-semibold" data-testid="text-export-header">Kit Export</h2>
      </div>

      {wsLoading ? (
        <div className="flex items-center justify-center py-16" data-testid="loading-export">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : workspaces.length === 0 ? (
        <Card data-testid="empty-export">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderTree className="w-12 h-12 text-primary/20 mb-4" />
            <h3 className="text-base font-medium mb-1">No workspaces available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create an assembly and run a pipeline to generate workspaces for export.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3" data-testid="export-list">
          {workspaces.map((ws) => {
            const assembly = getAssemblyForWorkspace(ws.projectName);
            const canExport = ws.hasApp || ws.hasManifest;

            return (
              <Card key={ws.projectName} data-testid={`card-export-${ws.projectName}`}>
                <CardContent className="flex items-center gap-3 flex-wrap py-4">
                  <FolderTree className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" data-testid={`text-export-name-${ws.projectName}`}>
                      {ws.projectName}
                    </p>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {ws.hasManifest && <Badge variant="outline" className="text-xs">Manifest</Badge>}
                      {ws.hasApp && <Badge variant="outline" className="text-xs">App</Badge>}
                      {ws.hasRegistry && <Badge variant="outline" className="text-xs">Registry</Badge>}
                      {ws.hasDomains && <Badge variant="outline" className="text-xs">Domains</Badge>}
                    </div>
                    {assembly?.kitPath && (
                      <p className="text-xs text-muted-foreground mt-1 truncate" data-testid={`text-kit-path-${ws.projectName}`}>
                        Kit: {assembly.kitPath}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {assembly?.state === "exported" && (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-transparent" data-testid={`badge-exported-${ws.projectName}`}>Exported</Badge>
                    )}
                    {canExport && assembly?.id ? (
                      <Button
                        size="sm"
                        onClick={() => exportMutation.mutate(assembly.id)}
                        disabled={exportMutation.isPending}
                        data-testid={`button-export-${ws.projectName}`}
                      >
                        {exportMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                        Export
                      </Button>
                    ) : !canExport ? (
                      <span className="text-xs text-muted-foreground" data-testid={`text-no-export-${ws.projectName}`}>
                        No app or manifest
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground" data-testid={`text-no-assembly-${ws.projectName}`}>
                        No assembly linked
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
