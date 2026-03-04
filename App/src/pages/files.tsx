import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Folder, File, ArrowLeft, ChevronRight, Home } from "lucide-react";

interface FileEntry {
  name: string;
  type: "directory" | "file";
  path: string;
}

interface FileContent {
  path: string;
  content: string;
}

export default function FilesPage() {
  const [currentDir, setCurrentDir] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const { data: entries = [], isLoading } = useQuery<FileEntry[]>({
    queryKey: ["/api/files", currentDir],
    queryFn: () => apiRequest(`/api/files?dir=${encodeURIComponent(currentDir)}`),
  });

  const { data: fileContent, isLoading: fileLoading } = useQuery<FileContent>({
    queryKey: ["/api/files/content", selectedFile],
    queryFn: () => apiRequest(`/api/files/${selectedFile}`),
    enabled: !!selectedFile,
  });

  const breadcrumbs = currentDir ? currentDir.split("/").filter(Boolean) : [];

  function goUp() {
    const parts = currentDir.split("/").filter(Boolean);
    parts.pop();
    setCurrentDir(parts.join("/"));
    setSelectedFile(null);
  }

  function navigateTo(dir: string) {
    setCurrentDir(dir);
    setSelectedFile(null);
  }

  function navigateToBreadcrumb(index: number) {
    const parts = currentDir.split("/").filter(Boolean);
    setCurrentDir(parts.slice(0, index + 1).join("/"));
    setSelectedFile(null);
  }

  function isJson(filename: string) {
    return filename.endsWith(".json");
  }

  function formatContent(content: string, filename: string) {
    if (isJson(filename)) {
      try {
        return JSON.stringify(JSON.parse(content), null, 2);
      } catch {
        return content;
      }
    }
    return content;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>File Browser</h1>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Browse pipeline run artifacts</p>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => { setCurrentDir(""); setSelectedFile(null); }}
          className="flex items-center gap-1 hover:underline"
          style={{ color: "hsl(var(--primary))" }}
        >
          <Home className="w-4 h-4" />
          runs
        </button>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
            <button
              onClick={() => navigateToBreadcrumb(i)}
              className="hover:underline"
              style={{ color: "hsl(var(--primary))" }}
            >
              {crumb}
            </button>
          </span>
        ))}
      </div>

      {currentDir && (
        <button
          onClick={goUp}
          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border"
          style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}>
          <h2 className="text-lg font-semibold mb-3" style={{ color: "hsl(var(--card-foreground))" }}>
            {currentDir || "Root"}
          </h2>
          {isLoading ? (
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>No files found</p>
          ) : (
            <div className="space-y-1">
              {entries
                .sort((a, b) => {
                  if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
                  return a.name.localeCompare(b.name);
                })
                .map((entry) => (
                  <button
                    key={entry.path}
                    onClick={() => {
                      if (entry.type === "directory") {
                        navigateTo(entry.path);
                      } else {
                        setSelectedFile(entry.path);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm hover:opacity-80 transition-colors ${
                      selectedFile === entry.path ? "ring-2" : ""
                    }`}
                    style={{
                      background: selectedFile === entry.path ? "hsl(var(--accent))" : "transparent",
                      color: "hsl(var(--foreground))",
                    }}
                  >
                    {entry.type === "directory" ? (
                      <Folder className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--primary))" }} />
                    ) : (
                      <File className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
                    )}
                    <span className="truncate">{entry.name}</span>
                    {entry.type === "directory" && (
                      <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="rounded-lg border p-4" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}>
            <h2 className="text-lg font-semibold mb-3 truncate" style={{ color: "hsl(var(--card-foreground))" }}>
              {selectedFile.split("/").pop()}
            </h2>
            {fileLoading ? (
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Loading...</p>
            ) : fileContent?.content ? (
              <pre
                className="text-xs overflow-auto max-h-[600px] p-3 rounded-md whitespace-pre-wrap break-words"
                style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
              >
                {formatContent(fileContent.content, selectedFile)}
              </pre>
            ) : (
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Unable to load file content</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
