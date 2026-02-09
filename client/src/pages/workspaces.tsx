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
  Folder,
  Trash2,
  CheckCircle2,
  XCircle,
  HardDrive,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  File,
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

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  size?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

function FileTreeItem({
  node,
  depth,
  expandedDirs,
  onToggle,
}: {
  node: FileTreeNode;
  depth: number;
  expandedDirs: Set<string>;
  onToggle: (path: string) => void;
}) {
  const isDir = node.type === "directory";
  const isExpanded = expandedDirs.has(node.path);

  return (
    <div>
      <button
        className="flex items-center gap-1.5 w-full text-left py-0.5 hover-elevate rounded-md px-1"
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => isDir && onToggle(node.path)}
        data-testid={`tree-node-${node.path}`}
      >
        {isDir ? (
          isExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
        ) : (
          <span className="w-3" />
        )}
        {isDir ? (
          isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        ) : (
          <File className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="truncate text-xs">{node.name}</span>
        {!isDir && node.size != null && (
          <span className="text-[10px] text-muted-foreground/60 ml-auto shrink-0">{formatFileSize(node.size)}</span>
        )}
      </button>
      {isDir && isExpanded && node.children?.map(child => (
        <FileTreeItem key={child.path} node={child} depth={depth + 1} expandedDirs={expandedDirs} onToggle={onToggle} />
      ))}
    </div>
  );
}

function WorkspaceFileTree({ projectName }: { projectName: string }) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const { data: fileTree, isLoading } = useQuery<FileTreeNode[]>({
    queryKey: ["/api/workspace-tree", projectName],
    queryFn: async () => {
      const res = await fetch(`/api/workspace-tree/${encodeURIComponent(projectName)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.tree || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!fileTree || fileTree.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4" data-testid={`ws-empty-tree-${projectName}`}>
        No files found.
      </p>
    );
  }

  return (
    <div className="text-sm font-mono space-y-0.5 pt-2 pb-1" data-testid={`ws-file-tree-${projectName}`}>
      {fileTree.map(node => (
        <FileTreeItem
          key={node.path}
          node={node}
          depth={0}
          expandedDirs={expandedDirs}
          onToggle={(path) => {
            setExpandedDirs(prev => {
              const next = new Set(prev);
              if (next.has(path)) next.delete(path);
              else next.add(path);
              return next;
            });
          }}
        />
      ))}
    </div>
  );
}

export default function WorkspacesPage() {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());

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
      setExpandedWorkspaces(prev => {
        const next = new Set(prev);
        next.delete(projectName);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
    },
    onError: () => {
      toast({ title: "Failed to delete workspace", variant: "destructive" });
    },
  });

  function toggleWorkspaceExpand(projectName: string) {
    setExpandedWorkspaces(prev => {
      const next = new Set(prev);
      if (next.has(projectName)) next.delete(projectName);
      else next.add(projectName);
      return next;
    });
  }

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
          <h2 className="text-lg font-semibold flex items-center gap-2" data-testid="text-workspaces-title">
            <FolderOpen className="w-5 h-5" />
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
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-2">
                {existingWorkspaces.map((ws) => {
                  const isExpanded = expandedWorkspaces.has(ws.projectName);
                  return (
                    <div
                      key={ws.projectName}
                      className="rounded-md border"
                      data-testid={`workspace-row-${ws.projectName}`}
                    >
                      <div className="flex items-center justify-between gap-3 py-2.5 px-3 flex-wrap">
                        <button
                          className="flex items-center gap-3 min-w-0 flex-1 text-left hover-elevate rounded-md py-1 px-1"
                          onClick={() => toggleWorkspaceExpand(ws.projectName)}
                          data-testid={`button-expand-ws-${ws.projectName}`}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <FolderOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate" data-testid={`workspace-name-${ws.projectName}`}>
                              {ws.projectName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {ws.path}
                            </div>
                          </div>
                        </button>
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

                      {isExpanded && (
                        <div className="border-t px-3 pb-2">
                          <WorkspaceFileTree projectName={ws.projectName} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {orphanedWorkspaces.length > 0 && (
        <Card data-testid="card-orphaned-workspaces" style={{ backgroundColor: 'hsl(var(--warning-tint))' }}>
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
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-gray-400" />
      )}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
