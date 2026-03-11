import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Package,
  Download,
  FolderOpen,
  FileJson,
  Loader2,
  CheckCircle2,
  Archive,
  Layers,
  ChevronDown,
  ChevronRight,
  Hash,
  Clock,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { GlassPanel } from "../components/ui/glass-panel";
import { MetricCard } from "../components/ui/metric-card";
import { StatusChip } from "../components/ui/status-chip";
import type { Assembly } from "../../../shared/schema";

interface BuildableRun {
  runId: string;
  status: string;
  completedAt: string | null;
  startedAt: string;
  hasKit: boolean;
  hasBuild: boolean;
  buildStatus: string | null;
  kitVersion: string | null;
  systemVersion: string | null;
  kitFileCount: number | null;
  sha: string | null;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

function AssemblyCard({ assembly }: { assembly: Assembly }) {
  const [, setLocation] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<"kit" | "build" | null>(null);

  const { data: runsData, isLoading: runsLoading, error: runsError } = useQuery<{ runs: BuildableRun[] }>({
    queryKey: [`/api/assemblies/${assembly.id}/runs/buildable`],
    queryFn: () => apiRequest(`/api/assemblies/${assembly.id}/runs/buildable`),
  });

  const runs = runsData?.runs ?? [];
  const activeRun = runs.find((r) => r.runId === selectedRunId) ?? runs[0] ?? null;
  const hasMultipleRuns = runs.length > 1;

  async function handleDownload(type: "kit" | "build") {
    if (!activeRun) return;
    setDownloading(type);
    try {
      const baseUrl =
        type === "kit"
          ? `/api/assemblies/${assembly.id}/kit`
          : `/api/assemblies/${assembly.id}/build/download`;
      const url = `${baseUrl}?runId=${activeRun.runId}`;

      const response = await fetch(url);
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Download failed" }));
        throw new Error(err.error || "Download failed");
      }
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const safeName = assembly.projectName.replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = type === "kit" ? `${safeName}_kit.zip` : `${safeName}_build.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed";
      toast.error(msg);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <GlassPanel solid glow="green" className="p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-[hsl(var(--card-foreground))]">
            {assembly.projectName}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            {activeRun && (
              <code className="font-mono-tech text-xs px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
                {activeRun.runId}
              </code>
            )}
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              Completed {formatDate(activeRun?.completedAt ?? (assembly.updatedAt as unknown as string))}
            </span>
          </div>
        </div>
        <StatusChip variant="success" label="completed" />
      </div>

      {runsLoading ? (
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Loading versions…
        </div>
      ) : runsError ? (
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--status-failure))] py-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          Failed to load versions
        </div>
      ) : runs.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] py-2">
          <Package className="w-3.5 h-3.5" />
          No exportable versions found
        </div>
      ) : (
        <>
          {hasMultipleRuns && (
            <div className="mb-4">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              >
                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <Layers className="w-3.5 h-3.5" />
                {runs.length} versions available
              </button>

              {expanded && (
                <div className="mt-2 space-y-1.5 ml-5">
                  {runs.map((run) => (
                    <button
                      key={run.runId}
                      onClick={() => setSelectedRunId(run.runId)}
                      className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-md text-xs transition-all ${
                        activeRun?.runId === run.runId
                          ? "bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.3)]"
                          : "bg-[hsl(var(--muted)/0.5)] hover:bg-[hsl(var(--muted))] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                        <span className="font-mono-tech text-[hsl(var(--foreground))]">{run.runId}</span>
                        {run.runId === runs[0]?.runId && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] font-medium">
                            latest
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          {run.hasKit && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--status-success)/0.12)] text-[hsl(var(--status-success))]">
                              kit
                            </span>
                          )}
                          {run.hasBuild && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--status-processing)/0.12)] text-[hsl(var(--status-processing))]">
                              build
                            </span>
                          )}
                        </div>
                        <span className="text-[hsl(var(--muted-foreground))]">
                          {formatDate(run.completedAt)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeRun && (
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-[hsl(var(--muted)/0.5)]">
                <Clock className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[hsl(var(--muted-foreground))]">Completed</span>
                <span className="font-mono-tech text-[hsl(var(--foreground))] ml-auto">{formatDate(activeRun.completedAt)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-[hsl(var(--muted)/0.5)]">
                <Package className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[hsl(var(--muted-foreground))]">Kit</span>
                <span className={`ml-auto ${activeRun.hasKit ? "text-[hsl(var(--status-success))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                  {activeRun.hasKit ? "Available" : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-[hsl(var(--muted)/0.5)]">
                <Archive className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[hsl(var(--muted-foreground))]">Build</span>
                <span className={`ml-auto ${activeRun.hasBuild ? "text-[hsl(var(--status-processing))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                  {activeRun.hasBuild ? (activeRun.buildStatus || "Ready") : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-[hsl(var(--muted)/0.5)]">
                <Shield className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[hsl(var(--muted-foreground))]">Status</span>
                <StatusChip variant="success" label={activeRun.status} size="sm" />
              </div>
            </div>
          )}

          {activeRun && (activeRun.kitVersion || activeRun.systemVersion || activeRun.kitFileCount || activeRun.sha) && (
            <div className="mb-4 p-3 rounded-md bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--glass-border))]">
              <h4 className="text-xs font-medium mb-2 text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Kit Metadata
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {activeRun.kitVersion && (
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))]">Kit Version</span>
                    <div className="font-mono-tech text-[hsl(var(--foreground))] mt-0.5">{activeRun.kitVersion}</div>
                  </div>
                )}
                {activeRun.systemVersion && (
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))]">System Version</span>
                    <div className="font-mono-tech text-[hsl(var(--foreground))] mt-0.5">{activeRun.systemVersion}</div>
                  </div>
                )}
                {activeRun.kitFileCount != null && (
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))]">File Count</span>
                    <div className="font-mono-tech text-[hsl(var(--foreground))] mt-0.5">{activeRun.kitFileCount}</div>
                  </div>
                )}
                {activeRun.sha && (
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))]">SHA Integrity</span>
                    <div className="font-mono-tech text-[hsl(var(--foreground))] mt-0.5 truncate" title={activeRun.sha}>
                      {activeRun.sha.length > 12 ? `${activeRun.sha.slice(0, 12)}…` : activeRun.sha}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h4 className="text-xs font-medium mb-2 text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
              Kit Contents
            </h4>
            <div className="flex flex-wrap gap-2">
              {["kit_manifest.json", "entrypoint.json", "version_stamp.json"].map((file) => (
                <div
                  key={file}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--foreground))]"
                >
                  <FileJson className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                  <span className="font-mono-tech">{file}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex gap-2 pt-2 border-t border-[hsl(var(--glass-border))]">
        <button
          onClick={() => setLocation("/files")}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-[hsl(var(--glass-border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
        >
          <FolderOpen className="w-4 h-4" />
          Browse Artifacts
        </button>
        <button
          onClick={() => handleDownload("kit")}
          disabled={!activeRun?.hasKit || downloading === "kit"}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {downloading === "kit" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download Kit
        </button>
        {activeRun?.hasBuild && (
          <button
            onClick={() => handleDownload("build")}
            disabled={downloading === "build"}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-[hsl(var(--status-processing)/0.3)] text-[hsl(var(--status-processing))] hover:bg-[hsl(var(--status-processing)/0.1)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {downloading === "build" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
            Download Build
          </button>
        )}
      </div>
    </GlassPanel>
  );
}

export default function ExportPage() {
  const { data: assemblies = [], isLoading, error } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    queryFn: () => apiRequest("/api/assemblies"),
  });

  const completedAssemblies = assemblies.filter((a) => a.status === "completed");
  const totalAssemblies = completedAssemblies.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <GlassPanel glow="cyan" className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Export</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Download completed assembly kits and build exports
            </p>
          </div>
          <StatusChip
            variant={totalAssemblies > 0 ? "success" : "neutral"}
            label={totalAssemblies > 0 ? `${totalAssemblies} ready` : "none ready"}
          />
        </div>
      </GlassPanel>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={CheckCircle2}
          label="Completed Assemblies"
          value={totalAssemblies}
          accent={totalAssemblies > 0 ? "green" : "default"}
          subtitle="ready for export"
        />
        <MetricCard
          icon={Package}
          label="Kits Available"
          value={isLoading ? "—" : totalAssemblies}
          accent="cyan"
          subtitle="agent kit packages"
        />
        <MetricCard
          icon={Archive}
          label="Builds Exported"
          value={isLoading ? "—" : completedAssemblies.filter(a => a.runId).length}
          accent="amber"
          subtitle="with build artifacts"
        />
        <MetricCard
          icon={Download}
          label="Export Formats"
          value={2}
          accent="violet"
          subtitle="kit + build zip"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : error ? (
        <GlassPanel solid className="p-6">
          <div className="flex items-center gap-3 text-[hsl(var(--status-failure))]">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">Failed to load assemblies</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                {(error as Error).message || "An unexpected error occurred"}
              </p>
            </div>
          </div>
        </GlassPanel>
      ) : completedAssemblies.length === 0 ? (
        <GlassPanel solid className="p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-[hsl(var(--muted-foreground))]" />
          <p className="font-medium text-[hsl(var(--foreground))]">No completed assemblies</p>
          <p className="text-sm mt-1 text-[hsl(var(--muted-foreground))]">
            Run a pipeline to generate exportable kits
          </p>
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          {completedAssemblies.map((assembly) => (
            <AssemblyCard key={assembly.id} assembly={assembly} />
          ))}
        </div>
      )}
    </div>
  );
}
