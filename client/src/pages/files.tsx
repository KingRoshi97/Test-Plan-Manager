import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatSize } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FolderTree,
  FileText,
  ChevronRight,
  ArrowLeft,
  ArrowUp,
  Loader2,
} from "lucide-react";
import type { WorkspaceInfo, FileEntry, FileContent } from "@shared/schema";

export default function FilesPage() {
  const { data: workspaces = [] } = useQuery<WorkspaceInfo[]>({
    queryKey: ["/api/workspaces"],
  });

  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const { data: entries = [], isLoading: loadingEntries } = useQuery<FileEntry[]>({
    queryKey: ["/api/files/browse", currentPath],
    queryFn: () => fetch(`/api/files/browse?path=${encodeURIComponent(currentPath!)}`).then(r => r.json()),
    enabled: !!currentPath,
  });

  const { data: fileContent, isLoading: loadingFile } = useQuery<FileContent>({
    queryKey: ["/api/files/read", selectedFile],
    queryFn: () => fetch(`/api/files/read?path=${encodeURIComponent(selectedFile!)}`).then(r => r.json()),
    enabled: !!selectedFile,
  });

  const ws = workspaces.find(w => w.projectName === selectedWorkspace);
  const wsRoot = ws?.path || "";

  const selectWorkspace = (w: WorkspaceInfo) => {
    setSelectedWorkspace(w.projectName);
    setCurrentPath(w.path);
    setSelectedFile(null);
  };

  const navigateTo = (entry: FileEntry) => {
    if (entry.type === "directory") {
      setCurrentPath(entry.path);
      setSelectedFile(null);
    } else {
      setSelectedFile(entry.path);
    }
  };

  const navigateUp = () => {
    if (!currentPath || currentPath === wsRoot) return;
    const parent = currentPath.split("/").slice(0, -1).join("/");
    setCurrentPath(parent);
    setSelectedFile(null);
  };

  const goBack = () => {
    setSelectedWorkspace(null);
    setCurrentPath(null);
    setSelectedFile(null);
  };

  if (workspaces.length === 0) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Files</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderTree className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No workspaces yet. Create an assembly and run a pipeline to generate one.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedWorkspace) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Files</h2>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm" data-testid="text-select-workspace">Select Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {workspaces.map((w) => (
              <Button
                key={w.projectName}
                variant="ghost"
                onClick={() => selectWorkspace(w)}
                className="w-full justify-start gap-3"
                size="lg"
                data-testid={`button-workspace-${w.projectName}`}
              >
                <FolderTree className="w-5 h-5 text-primary" />
                <span className="font-medium">{w.projectName}</span>
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const breadcrumb = currentPath?.replace(wsRoot, selectedWorkspace) || selectedWorkspace;

  return (
    <div className="p-6 h-[calc(100vh-3.5rem)]">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={goBack} data-testid="button-back-workspaces">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold">{selectedWorkspace}</h2>
        <span className="text-xs text-muted-foreground truncate ml-2">{breadcrumb}</span>
      </div>

      <div className="flex gap-4 h-[calc(100%-3rem)]">
        <Card className="w-80 shrink-0 flex flex-col">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 py-2 px-3">
            {currentPath !== wsRoot && (
              <Button variant="ghost" size="sm" onClick={navigateUp} data-testid="button-navigate-up">
                <ArrowUp className="w-3.5 h-3.5" />
                Up
              </Button>
            )}
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-0">
              {loadingEntries ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : entries.length === 0 ? (
                <div className="flex items-center justify-center gap-1.5 py-4 text-muted-foreground">
                  <FolderTree className="w-3.5 h-3.5" />
                  <p className="text-xs">Empty directory</p>
                </div>
              ) : (
                <div className="py-1">
                  {entries.map((entry) => (
                    <button
                      key={entry.path}
                      onClick={() => navigateTo(entry)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors hover-elevate ${
                        selectedFile === entry.path ? "bg-primary/15" : ""
                      }`}
                      data-testid={`file-entry-${entry.name}`}
                    >
                      {entry.type === "directory"
                        ? <FolderTree className="w-4 h-4 shrink-0 text-primary" />
                        : <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />}
                      <span className="truncate">{entry.name}</span>
                      {entry.type === "file" && entry.size !== undefined && (
                        <span className="text-xs ml-auto shrink-0 text-muted-foreground">
                          {formatSize(entry.size)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        <Card className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0 py-2 px-4 border-b">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium truncate text-primary" data-testid="text-filename">
                  {selectedFile.split("/").pop()}
                </span>
                {fileContent && (
                  <span className="text-xs ml-auto text-muted-foreground">
                    {formatSize(fileContent.size)}
                  </span>
                )}
              </CardHeader>
              <ScrollArea className="flex-1">
                <CardContent className="pt-4">
                  {loadingFile ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  ) : fileContent ? (
                    <pre
                      className="text-xs whitespace-pre-wrap font-mono"
                      data-testid="text-file-content"
                    >
                      {fileContent.content}
                    </pre>
                  ) : null}
                </CardContent>
              </ScrollArea>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1">
              <p className="text-sm text-muted-foreground">Select a file to view its contents</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
