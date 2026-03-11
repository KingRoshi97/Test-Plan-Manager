import {
  Monitor, Tablet, Smartphone, RefreshCw, RotateCcw,
  ExternalLink, Copy, Loader2
} from "lucide-react";
import { StatusChip, type StatusVariant } from "../ui/status-chip";
import { GlassPanel } from "../ui/glass-panel";

type PreviewStatusKind = "none" | "building" | "preparing" | "ready" | "failed" | "expired";
type PreviewDeviceMode = "desktop" | "tablet" | "mobile";

interface PreviewToolbarProps {
  status: PreviewStatusKind;
  runId?: string | null;
  previewUrl?: string | null;
  deviceMode: PreviewDeviceMode;
  onSetDeviceMode: (mode: PreviewDeviceMode) => void;
  onRefreshState: () => void;
  onReloadFrame: () => void;
  onOpenExternal: () => void;
  onCopyLink: () => void;
  busy?: boolean;
}

const statusBadgeMap: Record<PreviewStatusKind, { variant: StatusVariant; label: string; pulse?: boolean }> = {
  none: { variant: "neutral", label: "No Preview" },
  building: { variant: "processing", label: "Building", pulse: true },
  preparing: { variant: "warning", label: "Preparing", pulse: true },
  ready: { variant: "success", label: "Ready" },
  failed: { variant: "failure", label: "Failed" },
  expired: { variant: "intelligence", label: "Expired" },
};

const deviceModes: { mode: PreviewDeviceMode; icon: typeof Monitor; label: string }[] = [
  { mode: "desktop", icon: Monitor, label: "Desktop" },
  { mode: "tablet", icon: Tablet, label: "Tablet" },
  { mode: "mobile", icon: Smartphone, label: "Mobile" },
];

export function PreviewToolbar({
  status,
  runId,
  previewUrl,
  deviceMode,
  onSetDeviceMode,
  onRefreshState,
  onReloadFrame,
  onOpenExternal,
  onCopyLink,
  busy,
}: PreviewToolbarProps) {
  const badge = statusBadgeMap[status];

  return (
    <GlassPanel solid className="px-3 py-2">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <Monitor className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Preview</span>
          <StatusChip variant={badge.variant} label={badge.label} pulse={badge.pulse} size="sm" />
          {runId && (
            <span className="text-[10px] font-mono-tech text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded">
              {runId}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 mx-2">
          <div className="flex items-center rounded-md bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-mono-tech text-[hsl(var(--muted-foreground))] truncate">
            {previewUrl || "No preview URL"}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center rounded-md border border-[hsl(var(--border))] overflow-hidden mr-2">
            {deviceModes.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => onSetDeviceMode(mode)}
                title={label}
                className={`p-1.5 transition-colors ${
                  deviceMode === mode
                    ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          <button
            onClick={onRefreshState}
            title="Refresh status"
            disabled={busy}
            className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onReloadFrame}
            title="Reload iframe"
            className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenExternal}
            title="Open in new tab"
            className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onCopyLink}
            title="Copy link"
            className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}
