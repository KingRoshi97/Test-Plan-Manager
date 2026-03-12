import { RefreshCw, Download, GitCompare, Timer } from "lucide-react";

interface AnalyticsToolbarProps {
  window: string;
  onWindowChange: (w: string) => void;
  granularity: string;
  onGranularityChange: (g: string) => void;
  compareEnabled: boolean;
  onCompareChange: (c: boolean) => void;
  autoRefresh: boolean;
  onAutoRefreshChange: (a: boolean) => void;
  onRefresh: () => void;
  onExportCsv: () => void;
  loading?: boolean;
}

const WINDOWS = [
  { value: "live", label: "Live" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

const GRANULARITIES = [
  { value: "1h", label: "1h" },
  { value: "1d", label: "1d" },
  { value: "7d", label: "7d" },
];

export function AnalyticsToolbar({
  window: selectedWindow,
  onWindowChange,
  granularity,
  onGranularityChange,
  compareEnabled,
  onCompareChange,
  autoRefresh,
  onAutoRefreshChange,
  onRefresh,
  onExportCsv,
  loading,
}: AnalyticsToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center bg-[hsl(var(--muted)/0.3)] rounded-lg p-0.5">
        {WINDOWS.map((w) => (
          <button
            key={w.value}
            onClick={() => onWindowChange(w.value)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              selectedWindow === w.value
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      <div className="flex items-center bg-[hsl(var(--muted)/0.3)] rounded-lg p-0.5">
        {GRANULARITIES.map((g) => (
          <button
            key={g.value}
            onClick={() => onGranularityChange(g.value)}
            className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
              granularity === g.value
                ? "bg-[hsl(var(--primary)/0.7)] text-[hsl(var(--primary-foreground))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => onCompareChange(!compareEnabled)}
        className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
          compareEnabled
            ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
            : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] border border-transparent hover:border-[hsl(var(--border)/0.5)]"
        }`}
        title="Compare to previous period"
      >
        <GitCompare className="w-3 h-3" />
        Compare
      </button>

      <button
        onClick={() => onAutoRefreshChange(!autoRefresh)}
        className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
          autoRefresh
            ? "bg-[hsl(var(--status-success)/0.15)] text-[hsl(var(--status-success))] border border-[hsl(var(--status-success)/0.3)]"
            : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] border border-transparent hover:border-[hsl(var(--border)/0.5)]"
        }`}
        title="Auto-refresh"
      >
        <Timer className="w-3 h-3" />
        {autoRefresh ? "Auto" : "Auto"}
      </button>

      <button
        onClick={onExportCsv}
        className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] border border-transparent hover:border-[hsl(var(--border)/0.5)] transition-all"
        title="Export CSV"
      >
        <Download className="w-3 h-3" />
        CSV
      </button>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.3)] transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
