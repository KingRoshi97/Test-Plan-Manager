import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Loader2, FolderTree, Download, Pencil, Check, X } from "lucide-react";
import type { WorkspaceInfo } from "@shared/schema";

interface EnrichedAssembly {
  id: string;
  projectName: string | null;
  state: string;
  kitPath: string | null;
  hasApp: boolean;
  hasManifest: boolean;
  exportName: string | null;
  revision: number;
}

function triggerDownload(assemblyId: string, filename?: string) {
  const url = `/api/assemblies/${assemblyId}/download${filename ? `?file=${encodeURIComponent(filename)}` : ""}`;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "agent_kit.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function InlineRename({
  assemblyId,
  currentName,
  fallbackName,
}: {
  assemblyId: string;
  currentName: string | null;
  fallbackName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentName || fallbackName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const renameMutation = useMutation({
    mutationFn: async (newName: string) => {
      return apiRequest(`/api/assemblies/${assemblyId}`, {
        method: "PATCH",
        body: JSON.stringify({ exportName: newName }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
      toast({ title: "Renamed", description: "Export name updated." });
      setEditing(false);
    },
    onError: (err: Error) => {
      toast({ title: "Rename failed", description: err.message, variant: "destructive" });
    },
  });

  const displayName = currentName || fallbackName;

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === displayName) {
      setEditing(false);
      setDraft(displayName);
      return;
    }
    renameMutation.mutate(trimmed);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft(displayName);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-sm max-w-[260px]"
          disabled={renameMutation.isPending}
          data-testid={`input-rename-${assemblyId}`}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSave}
          disabled={renameMutation.isPending}
          data-testid={`button-save-rename-${assemblyId}`}
        >
          {renameMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCancel}
          disabled={renameMutation.isPending}
          data-testid={`button-cancel-rename-${assemblyId}`}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium" data-testid={`text-export-display-name-${assemblyId}`}>
        {displayName}
      </span>
      {!currentName && (
        <span className="text-xs text-muted-foreground" data-testid={`text-auto-indicator-${assemblyId}`}>(auto)</span>
      )}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          setDraft(displayName);
          setEditing(true);
        }}
        data-testid={`button-edit-name-${assemblyId}`}
      >
        <Pencil className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export default function ExportPage() {
  const [exportingId, setExportingId] = useState<string | null>(null);

  const { data: workspaces = [], isLoading: wsLoading } = useQuery<WorkspaceInfo[]>({
    queryKey: ["/api/workspaces"],
  });

  const { data: assemblies = [] } = useQuery<EnrichedAssembly[]>({
    queryKey: ["/api/assemblies"],
  });

  const exportMutation = useMutation({
    mutationFn: async (assemblyId: string) => {
      setExportingId(assemblyId);
      const response = await apiRequest(`/api/assemblies/${assemblyId}/export`, {
        method: "POST",
        body: JSON.stringify({ format: "zip" }),
      });
      return response;
    },
    onSuccess: async (data: any, assemblyId: string) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });

      if (data.status === "success") {
        const zipFilename = data.zipPath ? data.zipPath.split("/").pop() : undefined;
        toast({ title: "Export completed", description: "Starting download..." });
        setTimeout(() => triggerDownload(assemblyId, zipFilename), 500);
      } else {
        toast({
          title: "Export completed with issues",
          description: data.stderr?.slice(0, 200) || "The package step did not succeed.",
          variant: "destructive",
        });
      }
      setExportingId(null);
    },
    onError: (err: Error) => {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
      setExportingId(null);
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
            const isExporting = exportingId === assembly?.id && exportMutation.isPending;

            return (
              <Card key={ws.projectName} data-testid={`card-export-${ws.projectName}`}>
                <CardContent className="flex items-center gap-3 flex-wrap py-4">
                  <FolderTree className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    {assembly ? (
                      <InlineRename
                        assemblyId={assembly.id}
                        currentName={assembly.exportName}
                        fallbackName={ws.projectName}
                      />
                    ) : (
                      <p className="text-sm font-medium" data-testid={`text-export-name-${ws.projectName}`}>
                        {ws.projectName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5" data-testid={`text-project-name-${ws.projectName}`}>
                      {ws.projectName}
                      {assembly && assembly.revision > 1 && (
                        <span className="ml-1">rev {assembly.revision}</span>
                      )}
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
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {assembly?.state === "exported" && (
                      <>
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-transparent" data-testid={`badge-exported-${ws.projectName}`}>Exported</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => triggerDownload(assembly.id)}
                          data-testid={`button-download-${ws.projectName}`}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </>
                    )}
                    {canExport && assembly?.id ? (
                      <Button
                        size="sm"
                        onClick={() => exportMutation.mutate(assembly.id)}
                        disabled={isExporting}
                        data-testid={`button-export-${ws.projectName}`}
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                        {assembly?.state === "exported" ? "Re-export" : "Export"}
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
