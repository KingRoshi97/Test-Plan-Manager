import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useLocation } from "wouter";
import { Package, Download, FolderOpen, FileJson } from "lucide-react";
import type { Assembly } from "../../../shared/schema";

const kitFiles = ["kit_manifest.json", "entrypoint.json", "version_stamp.json"];

export default function ExportPage() {
  const [, setLocation] = useLocation();

  const { data: assemblies = [], isLoading } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    queryFn: () => apiRequest("/api/assemblies"),
  });

  const completedAssemblies = assemblies.filter((a) => a.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>Export</h1>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Download completed assembly kits</p>
      </div>

      {isLoading ? (
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Loading assemblies...</p>
      ) : completedAssemblies.length === 0 ? (
        <div className="text-center py-12 rounded-lg border" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}>
          <Package className="w-12 h-12 mx-auto mb-3" style={{ color: "hsl(var(--muted-foreground))" }} />
          <p className="font-medium" style={{ color: "hsl(var(--foreground))" }}>No completed assemblies</p>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Run a pipeline to generate exportable kits
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedAssemblies.map((assembly) => (
            <div
              key={assembly.id}
              className="rounded-lg border p-5"
              style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: "hsl(var(--card-foreground))" }}>
                    {assembly.projectName}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    {assembly.runId && (
                      <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}>
                        {assembly.runId}
                      </code>
                    )}
                    <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Completed {new Date(assembly.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                  completed
                </span>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2" style={{ color: "hsl(var(--foreground))" }}>Kit Contents</h4>
                <div className="flex flex-wrap gap-2">
                  {kitFiles.map((file) => (
                    <div
                      key={file}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md"
                      style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
                    >
                      <FileJson className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary))" }} />
                      {file}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                {assembly.runId && (
                  <>
                    <button
                      onClick={() => setLocation("/files")}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border transition-colors hover:opacity-80"
                      style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                    >
                      <FolderOpen className="w-4 h-4" />
                      Browse Artifacts
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors hover:opacity-90"
                      style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                    >
                      <Download className="w-4 h-4" />
                      Download Kit
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
