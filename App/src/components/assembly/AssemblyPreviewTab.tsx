import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { PreviewToolbar } from "./PreviewToolbar";
import { PreviewViewport } from "./PreviewViewport";
import type { PreviewDeviceMode, PreviewFrameState } from "./PreviewViewport";
import { PreviewMetaPanel } from "./PreviewMetaPanel";
import { PreviewStateCard } from "./PreviewStateCard";

type PreviewStatusKind =
  | "none"
  | "building"
  | "preparing"
  | "ready"
  | "failed"
  | "expired"
  | "uncompiled"
  | "compiling";

interface AssemblyPreviewStatus {
  status: PreviewStatusKind;
  runId?: string | null;
  buildStatus?: string | null;
  previewUrl?: string | null;
  entryUrl?: string | null;
  updatedAt?: string | null;
  generatedAt?: string | null;
  expiresAt?: string | null;
  embeddable?: boolean;
  environment?: string | null;
  error?: string | null;
  compileProgress?: string | null;
  compileError?: string | null;
}

interface AssemblyPreviewTabProps {
  assemblyId: number;
  runId?: string | null;
  pipelineStatus?: string | null;
}

export function AssemblyPreviewTab({ assemblyId, runId, pipelineStatus }: AssemblyPreviewTabProps) {
  const [deviceMode, setDeviceMode] = useState<PreviewDeviceMode>("desktop");
  const [reloadNonce, setReloadNonce] = useState(0);
  const [frameState, setFrameState] = useState<PreviewFrameState>("idle");
  const queryClient = useQueryClient();

  const shouldPoll = (data: AssemblyPreviewStatus | undefined) => {
    if (!data) return false;
    if (data.status === "building" || data.status === "preparing" || data.status === "compiling") return true;
    if (pipelineStatus === "running") return true;
    return false;
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<AssemblyPreviewStatus>({
    queryKey: ["/api/assemblies", assemblyId, "preview"],
    queryFn: async () => {
      const res = await fetch(`/api/assemblies/${assemblyId}/preview`);
      if (!res.ok) throw new Error(`Failed to fetch preview status: ${res.status}`);
      return res.json();
    },
    refetchInterval: (query) => shouldPoll(query.state.data) ? 2000 : false,
    enabled: !!assemblyId,
  });

  const compileMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/assemblies/${assemblyId}/preview/compile`, { method: "POST" });
      if (!res.ok) throw new Error(`Failed to start compilation: ${res.status}`);
      return res.json();
    },
    onSuccess: () => {
      toast.success("Compilation started");
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", assemblyId, "preview"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to start compilation");
    },
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "axion-compile-preview") {
        compileMutation.mutate();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [compileMutation]);

  const handleRefreshState = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleReloadFrame = useCallback(() => {
    setFrameState("loading");
    setReloadNonce((n) => n + 1);
  }, []);

  const handleOpenExternal = useCallback(() => {
    if (data?.previewUrl) {
      window.open(data.previewUrl, "_blank");
    }
  }, [data?.previewUrl]);

  const handleCopyLink = useCallback(() => {
    if (data?.previewUrl) {
      const fullUrl = `${window.location.origin}${data.previewUrl}`;
      navigator.clipboard.writeText(fullUrl).then(
        () => toast.success("Preview link copied to clipboard"),
        () => toast.error("Failed to copy link"),
      );
    }
  }, [data?.previewUrl]);

  const handleFrameLoad = useCallback(() => {
    setFrameState("ready");
  }, []);

  const handleFrameError = useCallback(() => {
    setFrameState("error");
  }, []);

  const handleCompile = useCallback(() => {
    compileMutation.mutate();
  }, [compileMutation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  if (isError) {
    return (
      <PreviewStateCard
        variant="failed"
        title="Failed to Load Preview"
        description={error instanceof Error ? error.message : "An unexpected error occurred while loading the preview status."}
        actions={
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        }
      />
    );
  }

  const status = data?.status ?? "none";

  if (status === "none") {
    return (
      <PreviewStateCard
        variant="none"
        title="No Preview Available"
        description="Run the pipeline and complete a build to generate a preview of this assembly's output."
      />
    );
  }

  if (status === "building") {
    return (
      <>
        <PreviewToolbar
          status={status}
          runId={data?.runId}
          previewUrl={data?.previewUrl}
          deviceMode={deviceMode}
          onSetDeviceMode={setDeviceMode}
          onRefreshState={handleRefreshState}
          onReloadFrame={handleReloadFrame}
          onOpenExternal={handleOpenExternal}
          onCopyLink={handleCopyLink}
          busy={isFetching}
        />
        <PreviewStateCard
          variant="building"
          title="Building Preview"
          description="The build is in progress. The preview will appear automatically when the build completes."
        />
      </>
    );
  }

  if (status === "preparing") {
    return (
      <>
        <PreviewToolbar
          status={status}
          runId={data?.runId}
          previewUrl={data?.previewUrl}
          deviceMode={deviceMode}
          onSetDeviceMode={setDeviceMode}
          onRefreshState={handleRefreshState}
          onReloadFrame={handleReloadFrame}
          onOpenExternal={handleOpenExternal}
          onCopyLink={handleCopyLink}
          busy={isFetching}
        />
        <PreviewStateCard
          variant="preparing"
          title="Preparing Preview"
          description="The build is complete. Preparing the preview environment..."
        />
      </>
    );
  }

  if (status === "compiling") {
    return (
      <>
        <PreviewToolbar
          status={status}
          runId={data?.runId}
          previewUrl={data?.previewUrl}
          deviceMode={deviceMode}
          onSetDeviceMode={setDeviceMode}
          onRefreshState={handleRefreshState}
          onReloadFrame={handleReloadFrame}
          onOpenExternal={handleOpenExternal}
          onCopyLink={handleCopyLink}
          busy={isFetching}
        />
        <PreviewStateCard
          variant="compiling"
          title="Compiling Project"
          description={data?.compileProgress || "Installing dependencies and building the project..."}
        />
      </>
    );
  }

  if (status === "uncompiled") {
    return (
      <div className="space-y-3">
        <PreviewToolbar
          status={status}
          runId={data?.runId}
          previewUrl={data?.previewUrl}
          deviceMode={deviceMode}
          onSetDeviceMode={setDeviceMode}
          onRefreshState={handleRefreshState}
          onReloadFrame={handleReloadFrame}
          onOpenExternal={handleOpenExternal}
          onCopyLink={handleCopyLink}
          busy={isFetching}
        />
        {data?.compileError && (
          <GlassPanel glow="red" solid className="p-4">
            <p className="text-sm text-[hsl(var(--status-failure))] font-medium mb-1">Previous compilation failed</p>
            <pre className="text-xs text-[hsl(var(--muted-foreground))] font-mono-tech whitespace-pre-wrap max-h-32 overflow-y-auto">{data.compileError}</pre>
          </GlassPanel>
        )}
        <div className="grid grid-cols-[1fr_280px] gap-3">
          <GlassPanel solid className="p-0 overflow-hidden">
            <iframe
              src={data?.previewUrl || ""}
              className="w-full min-h-[70vh] border-0"
              style={{ backgroundColor: "#0c1222" }}
              onLoad={handleFrameLoad}
            />
          </GlassPanel>
          <div className="space-y-3">
            <GlassPanel glow="amber" solid className="p-4 text-center">
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
                This project contains uncompiled source code.
              </p>
              <button
                onClick={handleCompile}
                disabled={compileMutation.isPending}
                className="px-5 py-2.5 rounded-md bg-gradient-to-r from-cyan-500 to-cyan-400 text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {compileMutation.isPending ? "Starting..." : "Compile & Preview"}
              </button>
            </GlassPanel>
            <PreviewMetaPanel
              assemblyId={assemblyId}
              data={data ?? null}
              frameState={frameState}
            />
          </div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <>
        <PreviewToolbar
          status={status}
          runId={data?.runId}
          previewUrl={data?.previewUrl}
          deviceMode={deviceMode}
          onSetDeviceMode={setDeviceMode}
          onRefreshState={handleRefreshState}
          onReloadFrame={handleReloadFrame}
          onOpenExternal={handleOpenExternal}
          onCopyLink={handleCopyLink}
          busy={isFetching}
        />
        <PreviewStateCard
          variant="failed"
          title="Build Failed"
          description={data?.error || "The build failed. Check the build tab for details."}
          actions={
            <button
              onClick={handleRefreshState}
              className="px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Refresh Status
            </button>
          }
        />
      </>
    );
  }

  if (status === "expired") {
    return (
      <>
        <PreviewToolbar
          status={status}
          runId={data?.runId}
          previewUrl={data?.previewUrl}
          deviceMode={deviceMode}
          onSetDeviceMode={setDeviceMode}
          onRefreshState={handleRefreshState}
          onReloadFrame={handleReloadFrame}
          onOpenExternal={handleOpenExternal}
          onCopyLink={handleCopyLink}
          busy={isFetching}
        />
        <PreviewStateCard
          variant="expired"
          title="Preview Expired"
          description="This preview has expired. Rebuild the assembly to generate a new preview."
        />
      </>
    );
  }

  if (data?.embeddable === false) {
    return (
      <>
        <PreviewToolbar
          status={status}
          runId={data?.runId}
          previewUrl={data?.previewUrl}
          deviceMode={deviceMode}
          onSetDeviceMode={setDeviceMode}
          onRefreshState={handleRefreshState}
          onReloadFrame={handleReloadFrame}
          onOpenExternal={handleOpenExternal}
          onCopyLink={handleCopyLink}
          busy={isFetching}
        />
        <PreviewStateCard
          variant="nonEmbeddable"
          title="Cannot Embed Preview"
          description="This preview cannot be displayed inline. Use the button below to open it in a new tab."
          actions={
            <button
              onClick={handleOpenExternal}
              className="px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Open in New Tab
            </button>
          }
        />
      </>
    );
  }

  if (status === "ready" && !data?.previewUrl) {
    return (
      <PreviewStateCard
        variant="none"
        title="No Preview Available"
        description={data?.error || "Build completed but no previewable files were found in the output."}
      />
    );
  }

  if (frameState === "error") {
    return (
      <>
        <PreviewToolbar
          status={status}
          runId={data?.runId}
          previewUrl={data?.previewUrl}
          deviceMode={deviceMode}
          onSetDeviceMode={setDeviceMode}
          onRefreshState={handleRefreshState}
          onReloadFrame={handleReloadFrame}
          onOpenExternal={handleOpenExternal}
          onCopyLink={handleCopyLink}
          busy={isFetching}
        />
        <PreviewStateCard
          variant="loadError"
          title="Preview Load Error"
          description="The preview failed to load in the embedded viewer."
          actions={
            <>
              <button
                onClick={handleReloadFrame}
                className="px-4 py-2 rounded-md border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm font-medium hover:bg-[hsl(var(--accent))] transition-colors"
              >
                Retry
              </button>
              <button
                onClick={handleOpenExternal}
                className="px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Open in New Tab
              </button>
            </>
          }
        />
      </>
    );
  }

  return (
    <div className="space-y-3">
      <PreviewToolbar
        status={status}
        runId={data?.runId}
        previewUrl={data?.previewUrl}
        deviceMode={deviceMode}
        onSetDeviceMode={setDeviceMode}
        onRefreshState={handleRefreshState}
        onReloadFrame={handleReloadFrame}
        onOpenExternal={handleOpenExternal}
        onCopyLink={handleCopyLink}
        busy={isFetching}
      />
      <div className="grid grid-cols-[1fr_280px] gap-3">
        <GlassPanel solid className="p-3 overflow-hidden">
          <PreviewViewport
            status={status}
            previewUrl={data?.previewUrl || ""}
            deviceMode={deviceMode}
            reloadNonce={reloadNonce}
            embeddable={data?.embeddable}
            onFrameLoad={handleFrameLoad}
            onFrameError={handleFrameError}
          />
        </GlassPanel>
        <PreviewMetaPanel
          assemblyId={assemblyId}
          data={data ?? null}
          frameState={frameState}
        />
      </div>
    </div>
  );
}
