import { ReactNode } from "react";
import { GlassPanel } from "../ui/glass-panel";

type PreviewStatusKind =
  | "none"
  | "building"
  | "preparing"
  | "ready"
  | "failed"
  | "expired"
  | "loadError"
  | "nonEmbeddable";

type PreviewFrameState = "idle" | "loading" | "ready" | "error";

interface AssemblyPreviewStatus {
  status: PreviewStatusKind;
  runId?: string | null;
  buildStatus?: string | null;
  previewUrl?: string | null;
  entryUrl?: string | null;
  updatedAt?: string | null;
  generatedAt?: string | null;
  embeddable?: boolean;
  environment?: string | null;
  error?: string | null;
  expiresAt?: string | null;
}

interface PreviewMetaPanelProps {
  assemblyId: number;
  data: AssemblyPreviewStatus | null;
  frameState: PreviewFrameState;
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[hsl(var(--muted-foreground))] text-xs">{label}</span>
      <span className="text-[hsl(var(--foreground))] text-xs text-right font-mono-tech truncate max-w-[200px]">
        {value ?? "—"}
      </span>
    </div>
  );
}

function MetaSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <GlassPanel solid className="p-3">
      <h4 className="text-system-label mb-2">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </GlassPanel>
  );
}

function formatTimestamp(val: string | null | undefined): string {
  if (!val) return "—";
  return new Date(val).toLocaleString();
}

export function PreviewMetaPanel({ assemblyId, data, frameState }: PreviewMetaPanelProps) {
  return (
    <div className="space-y-3">
      <MetaSection title="Source">
        <MetaRow label="Assembly" value={`#${assemblyId}`} />
        <MetaRow label="Run" value={data?.runId ?? "—"} />
        <MetaRow label="Status" value={data?.status ?? "—"} />
        <MetaRow label="Build Status" value={data?.buildStatus ?? "—"} />
      </MetaSection>

      <MetaSection title="Preview Target">
        <MetaRow label="URL" value={data?.previewUrl ?? "—"} />
        <MetaRow label="Entry URL" value={data?.entryUrl ?? "—"} />
        <MetaRow label="Embeddable" value={data?.embeddable === true ? "Yes" : data?.embeddable === false ? "No" : "—"} />
        <MetaRow label="Environment" value={data?.environment ?? "—"} />
      </MetaSection>

      <MetaSection title="Timing">
        <MetaRow label="Generated" value={formatTimestamp(data?.generatedAt)} />
        <MetaRow label="Updated" value={formatTimestamp(data?.updatedAt)} />
        <MetaRow label="Expires" value={formatTimestamp(data?.expiresAt)} />
      </MetaSection>

      <MetaSection title="Diagnostics">
        <MetaRow label="Frame State" value={frameState} />
        <MetaRow label="Error" value={data?.error ?? "—"} />
      </MetaSection>
    </div>
  );
}
